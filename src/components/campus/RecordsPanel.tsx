import { useResource } from '../../hooks/useResource';
import { useState } from 'react';
import { useAuth } from '../../auth';
import { campusApi } from '../../api/campus';
import type { CampusRecord } from '../../api/campus';
import type { SystemRole } from '../../types';
import { Panel, Field, Feedback, ResourceStatus, inputClass, buttonClass } from '../portal/PortalUI';
const allRoles: SystemRole[] = ['student', 'faculty', 'admin', 'management', 'staff'];

export function RecordsPanel({ kind }: { kind: CampusRecord['kind'] }) {
  const { user } = useAuth();
  const records = useResource(campusApi.records);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [roles, setRoles] = useState<SystemRole[]>(allRoles);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function create(form: HTMLFormElement) {
    const values = new FormData(form);
    const starts = String(values.get('starts_at') || '');
    const ends = String(values.get('ends_at') || '');
    setBusy(true); setError(''); setMessage('');
    try {
      await campusApi.mutate('/campus/records', { kind, title, body, roles, approved,
        starts_at: starts ? new Date(starts).toISOString() : null, ends_at: ends ? new Date(ends).toISOString() : null });
      setTitle(''); setBody(''); setMessage('Campus record saved.'); records.reload();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create campus record'); }
    finally { setBusy(false); }
  }
  const items = records.data?.filter(r => r.kind === kind);
  return <Panel title={kind === 'announcement' ? 'Announcements & notices' : kind === 'event' ? 'Academic calendar' : 'Institutional knowledge'}>
    <ResourceStatus {...records} /><Feedback error={error} message={message} />
    {(user?.role === 'admin' || user?.role === 'management') && <details><summary className="text-cyan-200 cursor-pointer">Create {kind}</summary><form className="space-y-3 mt-4" onSubmit={e => { e.preventDefault(); void create(e.currentTarget); }}>
      <Field label="Title"><input required minLength={3} maxLength={160} className={inputClass} value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label={kind === 'document' ? 'Approved source text (plain text, up to 20,000 characters)' : 'Details'}><textarea required minLength={5} maxLength={20000} rows={5} className={inputClass} value={body} onChange={e => setBody(e.target.value)} /></Field>
      {kind === 'event' && <div className="grid sm:grid-cols-2 gap-3"><Field label="Starts (your local timezone)"><input required type="datetime-local" className={inputClass} name="starts_at" /></Field><Field label="Ends (optional)"><input type="datetime-local" className={inputClass} name="ends_at" /></Field></div>}
      <fieldset><legend className="text-sm text-slate-300 mb-2">Audience</legend><div className="flex flex-wrap gap-4">{allRoles.map(role => <label className="text-sm capitalize" key={role}><input type="checkbox" checked={roles.includes(role)} onChange={e => setRoles(previous => e.target.checked ? [...previous, role] : previous.filter(r => r !== role))} /> {role}</label>)}</div></fieldset>
      {kind === 'document' && <label className="block text-sm"><input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} /> I approve this source for JSR retrieval by the selected audience.</label>}
      <button disabled={busy || !roles.length} className={buttonClass}>{busy ? 'Saving…' : `Publish ${kind}`}</button>
    </form></details>}
    {!items?.length && !records.loading && !records.error && <p className="text-slate-400">No {kind === 'document' ? 'institutional documents' : `${kind}s`} are available for your role.</p>}
    <div className="space-y-4">{items?.map(r => <article key={r._id} className="border border-white/10 rounded-xl p-5"><h3 className="text-lg font-semibold text-cyan-200">{r.title}</h3>{r.starts_at && <p className="text-sm text-slate-400 mt-1">{new Date(r.starts_at).toLocaleString()}{r.ends_at && ` – ${new Date(r.ends_at).toLocaleString()}`}</p>}<p className="whitespace-pre-wrap text-slate-300 mt-3">{r.body}</p>{kind === 'document' && <p className="text-xs text-slate-500 mt-3">{r.approved ? 'Approved JSR source' : 'Not approved for JSR retrieval'}</p>}</article>)}</div>
  </Panel>;
}
