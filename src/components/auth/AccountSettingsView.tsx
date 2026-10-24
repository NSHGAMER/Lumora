import { useResource } from '../../hooks/useResource';
import { useState } from 'react';
import { useAuth, ProtectedRoute } from '../../auth';
import { campusApi } from '../../api/campus';
import { directoryApi } from '../../api/directory';
import type { DirectoryProfileUpdate } from '../../api/types';
import type { ActiveTab } from '../../types';
import { ProfileEditor } from '../campus/DirectoryPanel';
import { Panel, Field, Feedback, ResourceStatus, inputClass, buttonClass } from '../portal/PortalUI';

function AccountContent({ onSelectTab }: { onSelectTab: (tab: ActiveTab) => void }) {
  const { user, logout } = useAuth();
  const profile = useResource(directoryApi.getMe);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  async function save(data: DirectoryProfileUpdate) {
    setBusy(true); setError(''); setMessage('');
    try { profile.setData(await directoryApi.updateMe(data)); setEditing(false); setMessage('Profile saved to your campus directory.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to save profile'); }
    finally { setBusy(false); }
  }
  return <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto space-y-6"><div className="flex flex-wrap gap-4 justify-between"><div><h1 className="font-heading text-4xl">Account settings</h1><p className="text-slate-400 mt-2">{user?.name} · {user?.role}</p></div><button className={buttonClass} onClick={async () => { try { await logout(); onSelectTab('home'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign out. Please retry.'); } }}>Sign out</button></div><Feedback error={error} message={message} />
    <Panel title="Institutional profile"><ResourceStatus {...profile} />{profile.data && <><p>{profile.data.institutional_email}</p><p className="text-sm text-slate-400">{profile.data.institutional_id} · {profile.data.department}</p>{editing ? <ProfileEditor entry={profile.data} busy={busy} save={save} cancel={() => setEditing(false)} /> : <button className={buttonClass} onClick={() => setEditing(true)}>Edit directory profile</button>}</>}</Panel>
    <Panel title="Change password"><p className="text-sm text-slate-400">Changing your password revokes refresh sessions. Existing access tokens expire within their configured lifetime. You will be signed out after saving.</p>
      <form className="space-y-3" onSubmit={async e => {
        e.preventDefault(); const form = e.currentTarget; const values = new FormData(form); setError(''); setMessage('');
        if (values.get('new_password') !== values.get('confirmation')) { setError('New passwords do not match'); return; }
        setBusy(true);
        try { await campusApi.mutate('/auth/password', { current_password: values.get('current_password'), new_password: values.get('new_password') }); form.reset(); await logout(); onSelectTab('login'); }
        catch (err) { setError(err instanceof Error ? err.message : 'Unable to change password'); }
        finally { setBusy(false); }
      }}>
        <Field label="Current password"><input type="password" name="current_password" autoComplete="current-password" required className={inputClass} /></Field>
        <Field label="New password"><input type="password" name="new_password" minLength={8} maxLength={128} autoComplete="new-password" required className={inputClass} /></Field>
        <Field label="Confirm new password"><input type="password" name="confirmation" minLength={8} maxLength={128} autoComplete="new-password" required className={inputClass} /></Field>
        <button disabled={busy} className={buttonClass}>{busy ? 'Saving…' : 'Change password and sign out'}</button>
      </form>
    </Panel>
  </div>;
}
export function AccountSettingsView({ onSelectTab }: { onSelectTab: (tab: ActiveTab) => void }) {
  return <ProtectedRoute onSelectTab={onSelectTab}><AccountContent onSelectTab={onSelectTab} /></ProtectedRoute>;
}
