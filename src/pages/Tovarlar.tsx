
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { fmtNumber } from '../lib'

type Row = {
  id: number
  tovar_nomi: string
  qancha_oldi: number
  qancha_berdi: number
  qancha_qoldi: number
  created_at: string
}

export function Tovarlar({ isAdmin }: { isAdmin: boolean }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ tovar_nomi: '', qancha_oldi: '', qancha_berdi: '' })

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('tovarlar').select('*').order('id', { ascending: false })
    if (error) alert(error.message)
    setRows((data as Row[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase.channel('tovarlar-ch')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tovarlar' }, load)
    .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function add() {
    const oldi = Number(form.qancha_oldi || 0)
    const berdi = Number(form.qancha_berdi || 0)
    const { error } = await supabase.from('tovarlar').insert({ tovar_nomi: form.tovar_nomi, qancha_oldi: oldi, qancha_berdi: berdi })
    if (error) alert(error.message); else {
      setForm({ tovar_nomi: '', qancha_oldi: '', qancha_berdi: '' })
      new Notification('Yangi tovar qo\'shildi', { body: form.tovar_nomi })
    }
  }

  async function del(id:number){
    if(!isAdmin) return alert('Admin kerak');
    if(!confirm('O\'chirish?')) return;
    const { error } = await supabase.from('tovarlar').delete().eq('id', id)
    if (error) alert(error.message)
  }

  return (
    <div className="space-y-4">
      <div className="card grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Tovar nomi</label>
          <input className="input" value={form.tovar_nomi} onChange={e=>setForm({...form, tovar_nomi:e.target.value})} />
        </div>
        <div>
          <label className="label">Qancha oldi (ta)</label>
          <input className="input" type="number" value={form.qancha_oldi} onChange={e=>setForm({...form, qancha_oldi:e.target.value})} />
        </div>
        <div>
          <label className="label">Qancha berdi (mln)</label>
          <input className="input" type="number" value={form.qancha_berdi} onChange={e=>setForm({...form, qancha_berdi:e.target.value})} />
        </div>
        <div className="sm:col-span-3 flex gap-2">
          <button className="btn btn-primary" onClick={add}>Qo'shish</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? 'Yuklanmoqda...' : rows.map(r => (
          <div key={r.id} className="card space-y-1">
            <div className="flex justify-between"><b>{r.tovar_nomi}</b><span className="opacity-60">#{r.id}</span></div>
            <div className="text-sm">Oldi: <b>{fmtNumber(r.qancha_oldi)}</b> ta</div>
            <div className="text-sm">Berdi: <b>{fmtNumber(r.qancha_berdi)}</b> mln</div>
            <div className="text-sm">Qoldi: <b>{fmtNumber(r.qancha_qoldi)}</b></div>
            {isAdmin && <button className="btn btn-danger mt-2" onClick={()=>del(r.id)}>O'chirish</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
