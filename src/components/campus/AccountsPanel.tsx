import { useState } from 'react';
import { campusApi } from '../../api/campus';
import { Panel, Field, Feedback, inputClass, buttonClass } from '../portal/PortalUI';

export function AccountsPanel() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <Panel title="Provision an institutional account"><Feedback error={error} message={message} />
    <p className="text-sm text-slate-400">Verify the person’s identity and share their initial password through an approved institutional channel.</p>
    <form className="grid sm:grid-cols-2 gap-3" onSubmit={async e => {
      e.preventDefault(); const form = e.currentTarget; const values = new FormData(form); setBusy(true); setError(''); setMessage('');
      try { await campusApi.mutate('/admin/users', Object.fromEntries(values)); form.reset(); setMessage('Account created. The user can now sign in.'); }
      catch (err) { setError(err instanceof Error ? err.message : 'Unable to provision account'); }
      finally { setBusy(false); }
    }}>
      <Field label="Full name"><input required name="full_name" minLength={2} className={inputClass} /></Field>
      <Field label="Institutional identifier"><input required name="institutional_id" minLength={3} className={inputClass} /></Field>
      <Field label="Institutional email"><input required type="email" name="institutional_email" className={inputClass} /></Field>
      <Field label="Role"><select name="role" className={inputClass}>{['student', 'faculty', 'staff', 'management', 'admin'].map(role => <option key={role}>{role}</option>)}</select></Field>
      <Field label="Initial password"><input required type="password" name="password" minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} /></Field>
      <button disabled={busy} className={buttonClass}>{busy ? 'Creating…' : 'Create account'}</button>
    </form>
  </Panel>;
}
