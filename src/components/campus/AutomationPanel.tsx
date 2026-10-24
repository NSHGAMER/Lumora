import { useResource } from '../../hooks/useResource';
import { useState } from 'react';
import { campusApi } from '../../api/campus';
import type { Workflow } from '../../api/campus';
import { Panel, Field, Feedback, ResourceStatus, inputClass, buttonClass } from '../portal/PortalUI';

export function AutomationPanel() {
  const resource = useResource(campusApi.automation);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(workflow?: Workflow, when = '') {
    setBusy(true); setError('');
    try {
      if (workflow) {
        await campusApi.mutate(`/automation/workflows/${workflow._id}`, { name: workflow.name, trigger: workflow.trigger, action: 'notify', enabled: !workflow.enabled, max_attempts: workflow.max_attempts, run_at: workflow.run_at || null, title: workflow.title || 'Campus notification', body: workflow.body || 'Review your campus updates.', roles: workflow.roles || ['student', 'faculty'] }, 'PUT');
      } else {
        await campusApi.mutate('/automation/workflows', { name, trigger: 'scheduled', action: 'notify', enabled: true, max_attempts: 3, run_at: new Date(when).toISOString(), title: name, body, roles: ['student', 'faculty', 'admin', 'management', 'staff'] });
        setName(''); setBody('');
      }
      resource.reload();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save workflow'); }
    finally { setBusy(false); }
  }
  const heartbeat = resource.data?.worker?.heartbeat;
  return <Panel title="Campus automation"><ResourceStatus {...resource} /><Feedback error={error} />
    <p className="text-sm text-slate-400">{heartbeat ? `Last worker heartbeat: ${new Date(heartbeat).toLocaleString()}` : 'No worker heartbeat recorded. Start the configured automation worker to deliver queued notifications.'}</p>
    <button className={buttonClass} onClick={resource.reload}>Refresh execution history</button>
    <details><summary className="cursor-pointer text-cyan-200">Schedule an academic reminder</summary><form className="space-y-3 mt-3" onSubmit={e => { e.preventDefault(); void save(undefined, String(new FormData(e.currentTarget).get('run_at') || '')); }}>
      <Field label="Reminder title"><input required minLength={3} maxLength={100} className={inputClass} value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Deliver at (your local timezone)"><input required type="datetime-local" className={inputClass} name="run_at" /></Field>
      <Field label="Message to campus members"><textarea required minLength={5} maxLength={1000} className={inputClass} value={body} onChange={e => setBody(e.target.value)} /></Field>
      <button disabled={busy} className={buttonClass}>{busy ? 'Saving…' : 'Schedule reminder'}</button>
    </form></details>
    <ul className="space-y-3">{resource.data?.workflows.map(w => <li className="border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 justify-between" key={w._id}><span>{w.name}<small className="block text-slate-400">{w.trigger} · {w.enabled ? 'Enabled' : 'Disabled'}</small></span><button disabled={busy} className={buttonClass} onClick={() => void save(w)}>{w.enabled ? 'Disable' : 'Enable'}</button></li>)}</ul>
    <h3 className="font-semibold">Execution history</h3>{resource.data?.runs.length === 0 && <p className="text-slate-400">No executions yet.</p>}
    <ul className="space-y-2">{resource.data?.runs.map(r => <li className="text-sm border-b border-white/10 py-2 break-all" key={r._id}><span className="text-cyan-200">{r.status}</span> · {r.attempts} attempts{r.delivered !== undefined && ` · ${r.delivered} recipients`}{r.error && ` · ${r.error}`}<small className="block text-slate-500">{r._id}</small></li>)}</ul>
  </Panel>;
}
