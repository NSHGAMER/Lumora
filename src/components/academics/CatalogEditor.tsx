import { useResource } from '../../hooks/useResource';
import { useState } from 'react';
import type { Catalog } from '../../api/campus';
import { directoryApi } from '../../api/directory';
import { Panel, Field, ResourceStatus, inputClass, buttonClass } from '../portal/PortalUI';

async function loadPeople() {
  const result = await directoryApi.list({ page_size: 100 });
  for (let page = 2; result.items.length < result.total; page++) {
    const next = await directoryApi.list({ page_size: 100, page });
    if (!next.items.length) break;
    result.items.push(...next.items);
  }
  return result;
}
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const newId = () => crypto.randomUUID();

export function CatalogEditor({ initial, save, busy }: { initial: Catalog; save: (catalog: Catalog) => void; busy: boolean }) {
  const [catalog, setCatalog] = useState<Catalog>(() => structuredClone(initial));
  const people = useResource(loadPeople);
  function update<K extends keyof Catalog>(key: K, value: Catalog[K]) { setCatalog(previous => ({ ...previous, [key]: value })); }
  const classOptions = catalog.classes.map(c => <option key={c.id} value={c.id}>{c.name} · {c.semester} · {c.section}</option>);
  const facultyOptions = people.data?.items.filter(p => p.role === 'faculty').map(p => <option key={p.id} value={p.id}>{p.full_name}</option>);
  return <Panel title="Academic catalog">
    <p className="text-sm text-slate-400">Configure classes, periods and real faculty allocations. Saving clears the current draft; the published timetable remains available until you publish a replacement.</p>
    <ResourceStatus {...people} />
    <form className="space-y-5" onSubmit={e => { e.preventDefault(); if (window.confirm('Save catalog and clear the draft? The published timetable will remain visible.')) save(catalog); }}>
      <fieldset disabled={busy} className="space-y-5">
        <details open><summary className="cursor-pointer text-cyan-200">Classes & semesters</summary><div className="space-y-3 mt-3">
          {catalog.classes.map((c, i) => <div key={c.id} className="grid sm:grid-cols-4 gap-2">
            {(['name', 'semester', 'section'] as const).map(key => <Field key={key} label={key}><input required className={inputClass} value={c[key]} onChange={e => update('classes', catalog.classes.map((x, n) => n === i ? { ...x, [key]: e.target.value } : x))} /></Field>)}
            <button type="button" className={buttonClass} onClick={() => update('classes', catalog.classes.filter((_, n) => i !== n))}>Remove class</button>
          </div>)}
          <button type="button" className={buttonClass} onClick={() => update('classes', [...catalog.classes, { id: newId(), name: '', semester: '', section: '' }])}>Add class</button>
        </div></details>
        <details><summary className="cursor-pointer text-cyan-200">Rooms</summary><div className="space-y-3 mt-3">
          {catalog.rooms.map((r, i) => <div key={r.id} className="grid sm:grid-cols-3 gap-2">
            <Field label="Room name"><input required className={inputClass} value={r.name} onChange={e => update('rooms', catalog.rooms.map((x, n) => i === n ? { ...x, name: e.target.value } : x))} /></Field>
            <Field label="Room type"><select className={inputClass} value={r.kind} onChange={e => update('rooms', catalog.rooms.map((x, n) => i === n ? { ...x, kind: e.target.value as 'lecture' | 'lab' } : x))}><option value="lecture">Lecture</option><option value="lab">Laboratory</option></select></Field>
            <button type="button" className={buttonClass} onClick={() => update('rooms', catalog.rooms.filter((_, n) => n !== i))}>Remove room</button>
          </div>)}
          <button type="button" className={buttonClass} onClick={() => update('rooms', [...catalog.rooms, { id: newId(), name: '', kind: 'lecture' }])}>Add room</button>
        </div></details>
        <details><summary className="cursor-pointer text-cyan-200">Periods (in chronological order)</summary><div className="space-y-3 mt-3">
          {catalog.periods.map((p, i) => <div key={p.id} className="grid sm:grid-cols-3 gap-2">
            {(['start', 'end'] as const).map(key => <Field key={key} label={`Period ${i + 1} ${key}`}><input required type="time" className={inputClass} value={p[key]} onChange={e => update('periods', catalog.periods.map((x, n) => i === n ? { ...x, [key]: e.target.value } : x))} /></Field>)}
            <button type="button" className={buttonClass} onClick={() => update('periods', catalog.periods.filter((_, n) => n !== i))}>Remove period</button>
          </div>)}
          <button type="button" className={buttonClass} onClick={() => update('periods', [...catalog.periods, { id: newId(), start: '', end: '' }])}>Add period</button>
        </div></details>
        <details><summary className="cursor-pointer text-cyan-200">Faculty & availability</summary><div className="space-y-4 mt-3">
          {catalog.teachers.map((t, i) => <div key={i} className="border border-white/10 rounded-xl p-3 space-y-3">
            <div className="grid sm:grid-cols-3 gap-2"><Field label="Faculty"><select required className={inputClass} value={t.user_id} onChange={e => update('teachers', catalog.teachers.map((x, n) => i === n ? { ...x, user_id: e.target.value } : x))}><option value="">Select faculty</option>{facultyOptions}</select></Field>
              <Field label="Maximum periods/week"><input required type="number" min={1} max={72} className={inputClass} value={t.max_periods} onChange={e => update('teachers', catalog.teachers.map((x, n) => i === n ? { ...x, max_periods: Number(e.target.value) } : x))} /></Field>
              <button type="button" className={buttonClass} onClick={() => update('teachers', catalog.teachers.filter((_, n) => n !== i))}>Remove allocation</button></div>
            <details><summary className="text-sm text-slate-300">Mark unavailable periods</summary><div className="overflow-x-auto"><table className="text-xs mt-2"><thead><tr><th>Day</th>{catalog.periods.map((p, n) => <th className="p-2" key={p.id}>{n + 1}</th>)}</tr></thead><tbody>{days.map(day => <tr key={day}><th className="text-left pr-3">{day}</th>{catalog.periods.map((p, period) => <td className="p-2" key={p.id}><input type="checkbox" aria-label={`${day} period ${period + 1} unavailable`} checked={t.unavailable.some(s => s.day === day && s.period === period)} onChange={e => update('teachers', catalog.teachers.map((x, n) => n === i ? { ...x, unavailable: e.target.checked ? [...x.unavailable, { day, period }] : x.unavailable.filter(s => !(s.day === day && s.period === period)) } : x))} /></td>)}</tr>)}</tbody></table></div></details>
          </div>)}
          <button type="button" className={buttonClass} onClick={() => update('teachers', [...catalog.teachers, { user_id: '', max_periods: 24, unavailable: [] }])}>Add faculty allocation</button>
          <p className="text-xs text-slate-500">The selector lists the first 100 directory members. Provision faculty accounts through the administrator account panel.</p>
        </div></details>
        <details><summary className="cursor-pointer text-cyan-200">Subjects & consecutive labs</summary><div className="space-y-4 mt-3">
          {catalog.subjects.map((s, i) => <div key={s.id} className="border border-white/10 rounded-xl p-3 grid sm:grid-cols-3 gap-3">
            <Field label="Subject"><input required className={inputClass} value={s.name} onChange={e => update('subjects', catalog.subjects.map((x, n) => i === n ? { ...x, name: e.target.value } : x))} /></Field>
            <Field label="Class"><select required className={inputClass} value={s.class_id} onChange={e => update('subjects', catalog.subjects.map((x, n) => i === n ? { ...x, class_id: e.target.value } : x))}><option value="">Select class</option>{classOptions}</select></Field>
            <Field label="Faculty"><select required className={inputClass} value={s.teacher_id} onChange={e => update('subjects', catalog.subjects.map((x, n) => i === n ? { ...x, teacher_id: e.target.value } : x))}><option value="">Select faculty</option>{facultyOptions}</select></Field>
            {(['weekly_periods', 'block_size'] as const).map(key => <Field key={key} label={key === 'block_size' ? 'Consecutive periods per session' : 'Periods per week'}><input required type="number" min={1} max={key === 'block_size' ? 4 : 30} className={inputClass} value={s[key]} onChange={e => update('subjects', catalog.subjects.map((x, n) => i === n ? { ...x, [key]: Number(e.target.value) } : x))} /></Field>)}
            <Field label="Type"><select className={inputClass} value={s.kind} onChange={e => update('subjects', catalog.subjects.map((x, n) => i === n ? { ...x, kind: e.target.value as 'lecture' | 'lab' } : x))}><option value="lecture">Lecture</option><option value="lab">Laboratory</option></select></Field>
            <button type="button" className={buttonClass} onClick={() => update('subjects', catalog.subjects.filter((_, n) => n !== i))}>Remove subject</button>
          </div>)}
          <button type="button" className={buttonClass} onClick={() => update('subjects', [...catalog.subjects, { id: newId(), name: '', class_id: '', teacher_id: '', weekly_periods: 2, block_size: 1, kind: 'lecture' }])}>Add subject</button>
        </div></details>
        <details><summary className="cursor-pointer text-cyan-200">Student enrollment</summary><div className="space-y-3 mt-3">
          {catalog.enrollments.map((s, i) => <div key={i} className="grid sm:grid-cols-3 gap-3"><Field label="Student"><select required className={inputClass} value={s.user_id} onChange={e => update('enrollments', catalog.enrollments.map((x, n) => i === n ? { ...x, user_id: e.target.value } : x))}><option value="">Select student</option>{people.data?.items.filter(p => p.role === 'student').map(p => <option key={p.id} value={p.id}>{p.full_name} · {p.institutional_id}</option>)}</select></Field>
            <Field label="Class"><select required className={inputClass} value={s.class_id} onChange={e => update('enrollments', catalog.enrollments.map((x, n) => i === n ? { ...x, class_id: e.target.value } : x))}><option value="">Select class</option>{classOptions}</select></Field>
            <button type="button" className={buttonClass} onClick={() => update('enrollments', catalog.enrollments.filter((_, n) => n !== i))}>Remove enrollment</button></div>)}
          <button type="button" className={buttonClass} onClick={() => update('enrollments', [...catalog.enrollments, { user_id: '', class_id: '' }])}>Enroll student</button>
        </div></details>
        <button className={buttonClass}>{busy ? 'Saving…' : 'Save academic catalog'}</button>
      </fieldset>
    </form>
  </Panel>;
}
