import { useResource } from '../../hooks/useResource';
import { useCallback, useState } from 'react';
import { useAuth } from '../../auth';
import { directoryApi } from '../../api/directory';
import type { DirectoryEntry, DirectoryProfileUpdate } from '../../api/types';
import { Panel, Field, Feedback, ResourceStatus, inputClass, buttonClass } from '../portal/PortalUI';

export function DirectoryPanel() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DirectoryEntry>();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => directoryApi.list({ query: search, department, page }), [search, department, page]);
  const directory = useResource(load);
  const departments = useResource(directoryApi.getDepartments);
  async function save(updates: DirectoryProfileUpdate) {
    if (!editing) return;
    setBusy(true); setError(''); setMessage('');
    try { await directoryApi.updateById(editing.id, updates); setEditing(undefined); setMessage('Directory profile saved.'); directory.reload(); departments.reload(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to save profile'); }
    finally { setBusy(false); }
  }
  return <Panel title="Campus directory">
    <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); setSearch(query); setPage(1); }}>
      <Field label="Search campus members"><input className={inputClass} value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or institutional identifier" /></Field>
      <Field label="Department"><select className={inputClass} value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }}><option value="">All departments</option>{departments.data?.map(d => <option key={d}>{d}</option>)}</select></Field>
      <button className={buttonClass}>Search</button>
    </form><ResourceStatus {...directory} /><Feedback error={error || departments.error} message={message} />
    {editing && <ProfileEditor key={editing.id} entry={editing} busy={busy} save={save} cancel={() => setEditing(undefined)} />}
    {directory.data?.items.length === 0 && <p className="text-slate-400">No campus members match your search.</p>}
    <div className="grid md:grid-cols-2 gap-4">{directory.data?.items.map(p => <article key={p.id} className="border border-white/10 rounded-xl p-4 space-y-2">
      <h3 className="font-semibold text-cyan-200">{p.full_name}</h3><p className="text-sm capitalize">{p.role} · {p.department}</p>
      {p.title && <p className="text-sm">{p.title}</p>}{p.office_location && <p className="text-sm text-slate-400">Office: {p.office_location}{p.phone_extension && ` · Ext. ${p.phone_extension}`}</p>}
      {p.bio && <p className="text-sm text-slate-400 whitespace-pre-wrap">{p.bio}</p>}
      <a className="text-sm text-cyan-300 break-all" href={`mailto:${p.institutional_email}`}>{p.institutional_email}</a>
      {(p.id === user?.id || user?.role === 'admin' || user?.role === 'management') && <button className={`${buttonClass} block`} onClick={() => setEditing(p)}>Edit profile</button>}
    </article>)}</div>
    {directory.data && <div className="flex gap-3 items-center"><button className={buttonClass} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span className="text-sm">Page {page} · {directory.data.total} members</span><button className={buttonClass} disabled={page * directory.data.page_size >= directory.data.total} onClick={() => setPage(p => p + 1)}>Next</button></div>}
  </Panel>;
}

export function ProfileEditor({ entry, save, busy, cancel }: { entry: DirectoryEntry; save: (data: DirectoryProfileUpdate) => void; busy: boolean; cancel: () => void }) {
  const [profile, setProfile] = useState<DirectoryProfileUpdate>({ department: entry.department, title: entry.title || '', office_location: entry.office_location || '', phone_extension: entry.phone_extension || '', bio: entry.bio || '' });
  return <form className="p-4 border border-cyan-400/20 rounded-xl space-y-3" onSubmit={e => { e.preventDefault(); save(profile); }}><h3>Edit {entry.full_name}</h3><div className="grid sm:grid-cols-2 gap-3">{(['department', 'title', 'office_location', 'phone_extension', 'bio'] as const).map(key => <Field key={key} label={key.replaceAll('_', ' ')}><input className={inputClass} required={key === 'department'} maxLength={key === 'bio' ? 500 : key === 'phone_extension' ? 50 : 100} value={profile[key] || ''} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} /></Field>)}</div><div className="flex gap-3"><button disabled={busy} className={buttonClass}>{busy ? 'Saving…' : 'Save profile'}</button><button type="button" className={buttonClass} onClick={cancel}>Cancel</button></div></form>;
}
