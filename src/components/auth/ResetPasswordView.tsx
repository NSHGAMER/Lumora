import type { ActiveTab } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../auth';
import { buttonClass } from '../portal/PortalUI';

export function ResetPasswordView({ onSelectTab }: { onSelectTab: (tab: ActiveTab) => void }) {
  const { user } = useAuth();
  return <div className="pt-28 pb-20 px-4 max-w-xl mx-auto">
    <GlassCard interactive={false} glowColor="cyan" className="p-8 space-y-5">
      <h1 className="text-3xl font-heading">Password recovery</h1>
      <p className="text-slate-300">Self-service recovery is not configured. Contact your institution’s IT administrator through an established institutional channel to verify your identity. No recovery request has been submitted and no password has been changed.</p>
      <p className="text-slate-400">If you know your current password, sign in and change it in Account settings.</p>
      <button className={buttonClass} onClick={() => onSelectTab(user ? 'account' : 'login')}>{user ? 'Open Account settings' : 'Return to Sign in'}</button>
    </GlassCard>
  </div>;
}
