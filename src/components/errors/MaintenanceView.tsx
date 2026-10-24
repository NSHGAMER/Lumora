import type { ActiveTab } from '../../types';
import { apiFetch } from '../../api/client';
import { useResource } from '../../hooks/useResource';
import { Panel, ResourceStatus, buttonClass } from '../portal/PortalUI';

type Health = {status: string; timestamp: string; services: Record<string, string>};
const loadHealth = () => apiFetch<Health>('/api/v1/health', {skipAuth: true});
export function MaintenanceView({onSelectTab}: {onSelectTab: (tab: ActiveTab) => void}) {
  const health = useResource(loadHealth);
  return <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto space-y-5">
    <h1 className="text-4xl font-heading">Service status</h1>
    <Panel title="Live API health"><ResourceStatus {...health} />
      {health.data && <><p>API report: {health.data.status}</p><dl>{Object.entries(health.data.services).map(([name, state]) => <div key={name} className="flex justify-between py-2 border-b border-white/10"><dt>{name}</dt><dd>{state}</dd></div>)}</dl><p className="text-sm text-slate-400">Checked {new Date(health.data.timestamp).toLocaleString()}. Worker execution history is available to administrators in Campus workspace. AI availability is checked when a question is submitted.</p></>}
      <button className={buttonClass} onClick={health.reload}>Check service status</button>
    </Panel>
    <button className={buttonClass} onClick={() => onSelectTab('home')}>Return to Lumora</button>
  </div>;
}
