
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import { Tovarlar } from './pages/Tovarlar'
import { Zakazlar } from './pages/Zakazlar'
import { Mijozlar } from './pages/Mijozlar'
import { DoimiyMijozlar } from './pages/DoimiyMijozlar'

type Tab = 'tovarlar' | 'zakazlar' | 'doimiy' | 'mijozlar' | 'admin'

export function App() {
  const [tab, setTab] = useState<Tab>('tovarlar')
  const [dark, setDark] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminInput, setAdminInput] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    const stored = localStorage.getItem('dark')
    if (stored) setDark(stored === '1')
  }, [])

  function checkAdmin() {
    if (adminInput === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAdmin(true)
    } else {
      alert('Parol noto\'g\'ri!')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sherdor Mebel</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost" onClick={() => setDark(d => !d)}>
            {dark ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <nav className="flex gap-2 flex-wrap">
        <button className={`btn ${tab==='tovarlar'?'btn-primary':''}`} onClick={()=>setTab('tovarlar')}>Tovarlar</button>
        <button className={`btn ${tab==='zakazlar'?'btn-primary':''}`} onClick={()=>setTab('zakazlar')}>Zakazlar</button>
        <button className={`btn ${tab==='doimiy'?'btn-primary':''}`} onClick={()=>setTab('doimiy')}>Doimiy mijozlar</button>
        <button className={`btn ${tab==='mijozlar'?'btn-primary':''}`} onClick={()=>setTab('mijozlar')}>Mijozlar</button>
        <button className={`btn ${tab==='admin'?'btn-primary':''}`} onClick={()=>setTab('admin')}>Admin</button>
      </nav>

      {tab === 'tovarlar' && <Tovarlar isAdmin={isAdmin} />}
      {tab === 'zakazlar' && <Zakazlar isAdmin={isAdmin} />}
      {tab === 'doimiy' && <DoimiyMijozlar isAdmin={isAdmin} />}
      {tab === 'mijozlar' && <Mijozlar isAdmin={isAdmin} />}

      {tab === 'admin' && (
        <div className="card space-y-3">
          {isAdmin ? (
            <div>
              <p className="mb-2">Admin paneliga xush kelibsiz. Endi o'chirish/tahrirlash mumkin.</p>
              <button className="btn btn-danger" onClick={()=>{setIsAdmin(false);}}>Chiqish</button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="label">Parol</label>
              <input className="input" type="password" value={adminInput} onChange={e=>setAdminInput(e.target.value)} placeholder="sherzod" />
              <button className="btn btn-primary" onClick={checkAdmin}>Kirish</button>
            </div>
          )}
        </div>
      )}

      <footer className="opacity-60 text-sm text-center">© {new Date().getFullYear()} Sherdor Mebel</footer>
    </div>
  )
}
