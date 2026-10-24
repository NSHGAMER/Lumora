import { useState } from 'react';
import { useAuth } from '../../auth';
import { buttonClass } from '../portal/PortalUI';
import { DirectoryPanel } from './DirectoryPanel';
import { RecordsPanel } from './RecordsPanel';
import { AutomationPanel } from './AutomationPanel';
import { AccountsPanel } from './AccountsPanel';

export function CampusGridView({ onOpenJSR }: { onOpenJSR: (query?: string) => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('directory');
  const editor = user?.role === 'admin' || user?.role === 'management';
  const tabs = [['directory', 'Directory'], ['announcement', 'Announcements'], ['event', 'Calendar'], ['document', 'Knowledge'], ...(editor ? [['automation', 'Automation']] : []), ...(user?.role === 'admin' ? [['accounts', 'Accounts']] : [])];
  return <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-6"><div className="flex flex-wrap gap-4 justify-between"><div><p className="text-cyan-300 text-xs font-mono uppercase">Campus workspace</p><h1 className="text-4xl font-heading mt-2">People, knowledge & events</h1><p className="text-slate-400 mt-2">Institutional records available to your role.</p></div><button className={buttonClass} onClick={() => onOpenJSR('What campus announcements are available?')}>Ask JSR</button></div>
    <nav aria-label="Campus sections" className="flex flex-wrap gap-2">{tabs.map(([id, label]) => <button key={id} aria-pressed={tab === id} className={`${buttonClass} ${tab === id ? 'bg-cyan-500/25' : ''}`} onClick={() => setTab(id)}>{label}</button>)}</nav>
    {tab === 'directory' && <DirectoryPanel />}
    {(tab === 'announcement' || tab === 'event' || tab === 'document') && <RecordsPanel key={tab} kind={tab} />}
    {tab === 'automation' && editor && <AutomationPanel />}
    {tab === 'accounts' && user?.role === 'admin' && <AccountsPanel />}
  </div>;
}
