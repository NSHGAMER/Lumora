import { useResource } from '../../hooks/useResource';
import { useState } from 'react';
import { Sparkles, CalendarDays, Bell, Users } from 'lucide-react';
import { useAuth } from '../../auth';
import { campusApi } from '../../api/campus';
import type { ActiveTab, SystemRole } from '../../types';
import { Panel, Feedback, ResourceStatus, buttonClass } from '../portal/PortalUI';

export function CommandCenterView({ onOpenJSR, onSelectTab }: { role: SystemRole; onOpenJSR: (query?: string) => void; onSelectTab: (tab: ActiveTab) => void }) {
  const { user } = useAuth();
  const summary = useResource(campusApi.summary);
  const notifications = useResource(campusApi.notifications);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  async function markRead(id: string) {
    setBusy(id); setError('');
    try { await campusApi.mutate(`/campus/notifications/${encodeURIComponent(id)}/read`, {}, 'PATCH'); notifications.reload(); summary.reload(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update notification'); }
    finally { setBusy(''); }
  }
  return <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
    <div className="glass-panel rounded-2xl p-6 flex flex-wrap justify-between gap-4 items-center">
      <div><p className="text-cyan-300 font-mono text-xs uppercase tracking-widest">{user?.role} portal · Campus Optimising System</p>
        <h1 className="text-3xl sm:text-4xl font-heading mt-2">Welcome back, <span className="text-gradient-cyan">{user?.name}</span></h1>
        <p className="text-slate-400 mt-2">Your campus information, in one place.</p></div>
      <button className={buttonClass} onClick={() => onOpenJSR()}><Sparkles className="inline w-4 mr-2" />Ask JSR</button>
    </div>
    <ResourceStatus {...summary} />
    {summary.data && <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[
      ['Scheduled sessions', summary.data.scheduled_sessions], ['Announcements', summary.data.announcements],
      ['Calendar events', summary.data.events], ['Unread notifications', summary.data.unread_notifications],
    ].map(([label, value]) => <div key={label} className="glass-panel rounded-2xl p-6"><p className="text-slate-400 text-sm">{label}</p><p className="text-4xl font-heading text-cyan-200 mt-2">{value}</p></div>)}</div>}
    <div className="grid md:grid-cols-2 gap-6">
      <Panel title="Campus workspace"><div className="flex flex-wrap gap-3">
        <button className={buttonClass} onClick={() => onSelectTab('academics')}><CalendarDays className="inline w-4 mr-2" />My timetable</button>
        <button className={buttonClass} onClick={() => onSelectTab('campus')}><Users className="inline w-4 mr-2" />Directory & notices</button>
        <button className={buttonClass} onClick={() => onSelectTab('account')}>Account settings</button>
      </div><p className="text-sm text-slate-400">{summary.data?.published_at ? `Last timetable publication: ${new Date(summary.data.published_at).toLocaleString()}` : 'No timetable has been published yet.'}</p>
        <p className="text-xs text-slate-500">Email, SMS, WhatsApp and telephone delivery are not configured. Campus notifications appear here.</p>
      </Panel>
      <Panel title="Notifications"><ResourceStatus {...notifications} /><Feedback error={error} />
        {notifications.data?.length === 0 && <p className="text-slate-400">You’re all caught up. New campus notifications will appear here.</p>}
        <ul className="space-y-3">{notifications.data?.map(item => <li key={item._id} className={`rounded-xl p-4 border ${item.read ? 'border-white/5' : 'border-cyan-400/30 bg-cyan-500/5'}`}>
          <h3 className="font-semibold"><Bell className="inline w-4 mr-2" />{item.title}</h3><p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{item.body}</p>
          <time className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</time>
          {!item.read && <button disabled={busy === item._id} onClick={() => void markRead(item._id)} className={`${buttonClass} block mt-2`}>{busy === item._id ? 'Saving…' : 'Mark as read'}</button>}
        </li>)}</ul>
      </Panel>
    </div>
  </div>;
}
