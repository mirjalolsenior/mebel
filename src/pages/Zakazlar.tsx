
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { fmtNumber } from '../lib'

type Row = {
  id: number
  tovar_turi: string
  raqami: string
  qancha_oldi: number
  qancha_berdi: number
  qancha_qoldi: number
  qachon_berish_kerak: string | null
  created_at: string
}

function scheduleReminder(dateStr: string | null, title: string){
  if(!dateStr) return
  const due = new Date(dateStr)
  const now = new Date()
  const oneDayMs = 24*60*60*1000
  const when = due.getTime() - oneDayMs - now.getTime()
  if (when > 0 && 'Notification' in window) {
    Notification.requestPermission().then(p=>{
      if(p==='granted'){
        setTimeout(()=>{
          new Notification('Eslatma: ertaga topshirish', { body: title })
        }, when)
      }
    })
  }
}

export function Zakazlar({ isAdmin }: { isAdmin: boolean }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ tovar_turi: '', raqami: '', qancha_oldi: '', qancha_berdi: '', qachon_berish_kerak: '' })

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('zakazlar').select('*').order('id', { ascending: false })
    if (error) alert(error.message)
    setRows((data as Row[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('zakazlar-ch')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'zakazlar' }, load)
    .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function add() {
    const payload = {
      tovar_turi: form.tovar_turi,
      raqami: form.raqami,
      qancha_oldi: Number(form.qancha_oldi || 0),
      qancha_berdi: Number(form.qancha_berdi || 0),
      qachon_berish_kerak: form.qachon_berish_kerak || null
    }
    const { error } = await supabase.from('zakazlar').insert(payload)
    if (error) alert(error.message); else {
      scheduleReminder(payload.qachon_berish_kerak, payload.tovar_turi + ' #' + payload.raqami)
      setForm({ tovar_turi: '', raqami: '', qancha_oldi: '', qancha_berdi: '', qachon_berish_kerak: '' })
      new Notification('Yangi zakaz', { body: payload.tovar_turi + ' #' + payload.raqami })
    }
  }

  async function del(id:number){
    if(!isAdmin) return alert('Admin kerak')
    if(!confirm('O\'chirish?')) return;
    const { error } = await supabase.from('zakazlar').delete().eq('id', id)
    if (error) alert(error.message)
  }

  return (
    <div className="space-y-4">
      <div className="card grid sm:grid-cols-5 gap-3">
        <div><label className="label">Tovar turi</label><input className="input" value={form.tovar_turi} onChange={e=>setForm({...form,tovar_turi:e.target.value})}/></div>
        <div><label className="label">Raqami</label><input className="input" value={form.raqami} onChange={e=>setForm({...form,raqami:e.target.value})}/></div>
        <div><label className="label">Qancha oldi (ta)</label><input className="input" type="number" value={form.qancha_oldi} onChange={e=>setForm({...form,qancha_oldi:e.target.value})}/></div>
        <div><label className="label">Qancha berdi (mln)</label><input className="input" type="number" value={form.qancha_berdi} onChange={e=>setForm({...form,qancha_berdi:e.target.value})}/></div>
        <div><label className="label">Qachon berish kerak</label><input className="input" type="date" value={form.qachon_berish_kerak} onChange={e=>setForm({...form,qachon_berish_kerak:e.target.value})}/></div>
        <div className="sm:col-span-5"><button className="btn btn-primary" onClick={add}>Qo'shish</button></div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? 'Yuklanmoqda...' : rows.map(r => (
          <div key={r.id} className="card space-y-1">
            <div className="flex justify-between"><b>{r.tovar_turi} #{r.raqami}</b><span className="opacity-60">#{r.id}</span></div>
            <div className="text-sm">Oldi: <b>{fmtNumber(r.qancha_oldi)}</b> ta</div>
            <div className="text-sm">Berdi: <b>{fmtNumber(r.qancha_berdi)}</b> mln</div>
            <div className="text-sm">Qoldi: <b>{fmtNumber(r.qancha_qoldi)}</b></div>
            {r.qachon_berish_kerak && <div className="text-sm">Berish sanasi: <b>{new Date(r.qachon_berish_kerak).toLocaleDateString('uz-UZ')}</b></div>}
            {isAdmin && <button className="btn btn-danger mt-2" onClick={()=>del(r.id)}>O'chirish</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
