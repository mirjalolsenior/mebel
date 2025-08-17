
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { fmtNumber } from '../lib'

type Row = {
  id: number
  mijoz_nomi: string
  qancha_tovar_keltirdi: number
  qancha_lenta_urildi: number
  qancha_berdi: number
  qancha_qoldi: number
  created_at: string
}

function makeCrud(table: string){
  return function MijozlarComp({ isAdmin }: { isAdmin: boolean }){
    const [rows, setRows] = useState<Row[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ mijoz_nomi: '', qancha_tovar_keltirdi: '', qancha_lenta_urildi: '', qancha_berdi: '' })

    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from(table).select('*').order('id', { ascending: false })
      if (error) alert(error.message)
      setRows((data as Row[]) || [])
      setLoading(false)
    }

    useEffect(() => {
      load()
      const ch = supabase.channel(table+'-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table }, load)
      .subscribe()
      return () => { supabase.removeChannel(ch) }
    }, [])

    async function add() {
      const payload = {
        mijoz_nomi: form.mijoz_nomi,
        qancha_tovar_keltirdi: Number(form.qancha_tovar_keltirdi || 0),
        qancha_lenta_urildi: Number(form.qancha_lenta_urildi || 0),
        qancha_berdi: Number(form.qancha_berdi || 0),
      }
      const { error } = await supabase.from(table).insert(payload)
      if (error) alert(error.message); else {
        setForm({ mijoz_nomi: '', qancha_tovar_keltirdi: '', qancha_lenta_urildi: '', qancha_berdi: '' })
        new Notification('Yangi mijoz yozuvi', { body: payload.mijoz_nomi })
      }
    }

    async function del(id:number){
      if(!isAdmin) return alert('Admin kerak')
      if(!confirm('O\'chirish?')) return;
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) alert(error.message)
    }

    return (
      <div className="space-y-4">
        <div className="card grid sm:grid-cols-4 gap-3">
          <div><label className="label">Mijoz nomi</label><input className="input" value={form.mijoz_nomi} onChange={e=>setForm({...form,mijoz_nomi:e.target.value})}/></div>
          <div><label className="label">Qancha tovar keltirdi (ta)</label><input className="input" type="number" value={form.qancha_tovar_keltirdi} onChange={e=>setForm({...form,qancha_tovar_keltirdi:e.target.value})}/></div>
          <div><label className="label">Qancha lenta urildi (m)</label><input className="input" type="number" value={form.qancha_lenta_urildi} onChange={e=>setForm({...form,qancha_lenta_urildi:e.target.value})}/></div>
          <div><label className="label">Qancha berdi (mln)</label><input className="input" type="number" value={form.qancha_berdi} onChange={e=>setForm({...form,qancha_berdi:e.target.value})}/></div>
          <div className="sm:col-span-4"><button className="btn btn-primary" onClick={add}>Qo'shish</button></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? 'Yuklanmoqda...' : rows.map(r => (
            <div key={r.id} className="card space-y-1">
              <div className="flex justify-between"><b>{r.mijoz_nomi}</b><span className="opacity-60">#{r.id}</span></div>
              <div className="text-sm">Tovar keltirdi: <b>{fmtNumber(r.qancha_tovar_keltirdi)}</b> ta</div>
              <div className="text-sm">Lenta urildi: <b>{fmtNumber(r.qancha_lenta_urildi)}</b> m</div>
              <div className="text-sm">Berdi: <b>{fmtNumber(r.qancha_berdi)}</b> mln</div>
              <div className="text-sm">Qoldi: <b>{fmtNumber(r.qancha_qoldi)}</b></div>
              {isAdmin && <button className="btn btn-danger mt-2" onClick={()=>del(r.id)}>O'chirish</button>}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export const Mijozlar = makeCrud('mijozlar')
export const DoimiyMijozlar = makeCrud('doimiy_mijozlar')
