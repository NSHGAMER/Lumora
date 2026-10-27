import { useResource } from '../../hooks/useResource';
import { useState } from 'react';
import { useAuth } from '../../auth';
import { campusApi } from '../../api/campus';
import type { Timetable, TimetableSession } from '../../api/campus';
import { Panel, Feedback, ResourceStatus, inputClass, buttonClass } from '../portal/PortalUI';
import { CatalogEditor } from './CatalogEditor';
import { SessionEditor } from './SessionEditor';

export function AcademicsView({ onOpenJSR }: { onOpenJSR: (query?: string) => void }) {
  const { user } = useAuth();
  const resource = useResource(campusApi.timetable);
  const [day, setDay] = useState('week');
  const [classId, setClassId] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);
  const [editing, setEditing] = useState<TimetableSession>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const editor = user?.role === 'admin' || user?.role === 'management';
  const data = resource.data;
  async function mutate(path: string, body: object, method = 'POST', success = 'Saved successfully.') {
    if (!data) return;
    setBusy(true); setError(''); setMessage('');
    try { resource.setData(await campusApi.mutate<Timetable>(path, { ...body, revision: data.revision }, method)); setMessage(success); setEditing(undefined); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to save timetable'); }
    finally { setBusy(false); }
  }
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sessions = data?.sessions.filter(s => (day === 'week' || s.day === day) && (!classId || data.catalog.subjects.find(x => x.id === s.subject_id)?.class_id === classId))
    .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.period - b.period) || [];
  return <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><div><p className="font-mono text-xs text-cyan-300 uppercase">Academic workspace</p><h1 className="font-heading text-4xl mt-2">{editor ? 'Timetable management' : 'Your timetable'}</h1><p className="text-slate-400 mt-2">{editor ? 'Review drafts, resolve conflicts and publish campus schedules.' : 'Published classes assigned to your account.'}</p></div><button className={buttonClass} onClick={() => onOpenJSR('What is my published timetable?')}>Ask JSR about my timetable</button></div>
    <ResourceStatus {...resource} /><Feedback error={error} message={message} />
    {data && <>
      <Panel title={editor ? 'Draft timetable' : 'Published timetable'}>
        <p className="text-sm text-slate-400">{data.published_at ? `Published ${new Date(data.published_at).toLocaleString()}` : 'Not published yet.'} {data.has_unpublished_changes && 'There are unpublished draft changes.'}</p>
        <div className="flex flex-wrap gap-3"><label className="text-sm">View<select className={inputClass} value={day} onChange={e => setDay(e.target.value)}><option value="week">Full week</option>{days.map(d => <option key={d}>{d}</option>)}</select></label>
          <label className="text-sm">Class<select className={inputClass} value={classId} onChange={e => setClassId(e.target.value)}><option value="">All assigned classes</option>{data.catalog.classes.map(c => <option key={c.id} value={c.id}>{c.name} · {c.semester} · {c.section}</option>)}</select></label>
          <button disabled={busy} className={buttonClass} onClick={resource.reload}>Refresh</button>
          {editor && <><button disabled={busy || !classId} className={buttonClass} onClick={() => void mutate('/academics/generate', { class_id: classId }, 'POST', 'Conflict-free draft generated. Review before publication.')}>Generate selected class</button>
            <button disabled={busy || !data.sessions.length} className={buttonClass} onClick={() => { if (window.confirm('Publish this complete timetable to assigned faculty and students?')) void mutate('/academics/publish', {}, 'POST', 'Timetable published. Notification delivery is queued for the worker.'); }}>Publish timetable</button>
            <button className={buttonClass} onClick={() => setShowCatalog(v => !v)}>{showCatalog ? 'Hide catalog' : 'Manage catalog'}</button></>}
        </div>
        {!sessions.length && <p className="rounded-xl border border-dashed border-white/15 p-8 text-slate-400">{editor ? 'No sessions in this view. Configure the catalog, select a class and generate its draft.' : 'No published sessions are assigned to you. Ask your administrator to check enrollment or faculty allocations.'}</p>}
        {!!sessions.length && <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-slate-400 border-b border-white/10"><tr>{['Day', 'Time', 'Subject', 'Class', 'Faculty', 'Room', ''].map((h, i) => <th key={i} className="py-3 px-2">{h}</th>)}</tr></thead><tbody>{sessions.map(s => {
          const subject = data.catalog.subjects.find(x => x.id === s.subject_id);
          const group = data.catalog.classes.find(x => x.id === subject?.class_id);
          return <tr key={s.id} className="border-b border-white/5"><td className="p-3">{s.day}</td><td className="p-3 whitespace-nowrap">{data.catalog.periods[s.period]?.start}–{data.catalog.periods[s.period + (subject?.block_size || 1) - 1]?.end}</td><td className="p-3 text-cyan-200">{subject?.name}<span className="block text-xs text-slate-500">{subject?.kind}</span></td><td className="p-3">{group?.name} {group?.section}</td><td className="p-3">{data.faculty_names[subject?.teacher_id || ''] || 'Faculty'}</td><td className="p-3">{data.catalog.rooms.find(r => r.id === s.room_id)?.name}</td><td className="p-3">{(editor || user?.role === 'faculty') && <button className={buttonClass} onClick={() => setEditing(s)}>{editor ? 'Move' : 'Request change'}</button>}</td></tr>;
        })}</tbody></table></div>}
        {editing && <SessionEditor key={editing.id} session={editing} timetable={data} faculty={!editor} busy={busy} cancel={() => setEditing(undefined)} save={move => {
          if (editor) { const { reason: _reason, ...position } = move; void mutate(`/academics/sessions/${editing.id}`, position, 'PATCH'); }
          else void mutate('/academics/requests', { ...move, session_id: editing.id }, 'POST', 'Request submitted for administrative review.');
        }} />}
      </Panel>
      {editor && showCatalog && <CatalogEditor key={data.revision} initial={data.catalog} busy={busy} save={catalog => void mutate('/academics/catalog', { catalog }, 'PUT', 'Catalog saved. Generate new drafts before publishing.')} />}
      {!!data.requests.length && <Panel title="Change requests"><ul className="space-y-3">{data.requests.map(r => <li key={r.id} className="border border-white/10 p-4 rounded-xl"><p>{r.reason}</p><p className="text-sm text-slate-400">{r.day}, period {r.period + 1} · {r.status}</p>{editor && r.status === 'pending' && <div className="flex gap-2 mt-3">{['approved', 'rejected'].map(status => <button disabled={busy} key={status} className={buttonClass} onClick={() => void mutate(`/academics/requests/${r.id}`, { status }, 'PATCH', status === 'approved' ? 'Approved in draft. Publish to make the change visible.' : 'Request rejected.')}>{status === 'approved' ? 'Approve into draft' : 'Reject'}</button>)}</div>}</li>)}</ul></Panel>}
    </>}
  </div>;
}
