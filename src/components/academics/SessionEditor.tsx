import { useState } from 'react';
import type { Timetable, TimetableSession } from '../../api/campus';
import { Field, inputClass, buttonClass } from '../portal/PortalUI';

export function SessionEditor({ session, timetable, faculty, busy, save, cancel }: { session: TimetableSession; timetable: Timetable; faculty: boolean; busy: boolean; save: (move: { day: string; period: number; room_id: string; reason: string }) => void; cancel: () => void }) {
  const [day, setDay] = useState(session.day);
  const [period, setPeriod] = useState(session.period);
  const [room, setRoom] = useState(session.room_id);
  const [reason, setReason] = useState('');
  return <form className="space-y-4 border border-cyan-400/20 rounded-xl p-4" onSubmit={e => { e.preventDefault(); save({ day, period, room_id: room, reason }); }}>
    <h3 className="font-semibold">{faculty ? 'Request timetable change' : 'Move draft session'}</h3><div className="grid sm:grid-cols-3 gap-3">
      <Field label="Day"><select className={inputClass} value={day} onChange={e => setDay(e.target.value)}>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d}>{d}</option>)}</select></Field>
      <Field label="Starting period"><select className={inputClass} value={period} onChange={e => setPeriod(Number(e.target.value))}>{timetable.catalog.periods.map((p, i) => <option key={p.id} value={i}>{p.start}–{p.end}</option>)}</select></Field>
      <Field label="Room"><select className={inputClass} value={room} onChange={e => setRoom(e.target.value)}>{timetable.catalog.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
    </div>{faculty && <Field label="Reason"><textarea required minLength={8} maxLength={600} className={inputClass} value={reason} onChange={e => setReason(e.target.value)} /></Field>}
    <div className="flex gap-3"><button disabled={busy} className={buttonClass}>{busy ? 'Saving…' : faculty ? 'Submit request' : 'Save draft change'}</button><button type="button" className={buttonClass} onClick={cancel}>Cancel</button></div>
  </form>;
}
