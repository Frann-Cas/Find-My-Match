import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { id:'player', icon:'🎯', label:'Player / Host', desc:'Book referees & host matches' },
  { id:'referee', icon:'🧑‍⚖️', label:'Referee', desc:'Earn by officiating matches' },
  { id:'viewer', icon:'👁', label:'Viewer', desc:'Follow matches live' },
  { id:'facility', icon:'🏟', label:'Facility Owner', desc:'Manage your venue & courts' },
]

export default function Signup() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ fullName:'', email:'', password:'', role:'player' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUp({ email:form.email, password:form.password, fullName:form.fullName, role:form.role })
    if (error) { setError(error.message); setLoading(false) }
    else nav(form.role === 'referee' ? '/referee' : '/dashboard')
  }

  const inp = { width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1px solid var(--border)',fontSize:'14px',background:'var(--bg)',outline:'none',marginTop:'6px' }
  const lbl = { fontSize:'12px',fontWeight:600,color:'var(--navy)',display:'block',marginBottom:'16px' }

  return (
    <div style={{background:'var(--navy)',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <nav style={{display:'flex',alignItems:'center',padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800,color:'#fff'}}>Find<span style={{color:'var(--green)'}}>My</span>Match</div>
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
        <div style={{background:'var(--white)',borderRadius:'20px',padding:'32px 28px',width:'100%',maxWidth:'420px',border:'1px solid var(--border)'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:800,marginBottom:'6px'}}>Create Account</div>
          <div style={{fontSize:'14px',color:'var(--slate)',marginBottom:'24px'}}>Choose your role to get started</div>
          {error && <div style={{background:'#FEF2F2',color:'var(--red)',padding:'10px 14px',borderRadius:'10px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={lbl}>Full Name<input style={inp} value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))} required placeholder="Alex Johnson" /></label>
            <label style={lbl}>Email<input style={inp} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required placeholder="you@example.com" /></label>
            <label style={lbl}>Password<input style={inp} type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required placeholder="Min. 8 characters" minLength={8} /></label>
            <div style={{fontSize:'12px',fontWeight:600,color:'var(--navy)',marginBottom:'10px'}}>I am a...</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'20px'}}>
              {ROLES.map(r=>(
                <div key={r.id} onClick={()=>setForm(f=>({...f,role:r.id}))} style={{border:`1.5px solid ${form.role===r.id?'var(--green)':'var(--border)'}`,borderRadius:'12px',padding:'12px 10px',cursor:'pointer',textAlign:'center',background:form.role===r.id?'var(--green-pale)':'var(--white)',transition:'all .2s'}}>
                  <div style={{fontSize:'22px',marginBottom:'4px'}}>{r.icon}</div>
                  <div style={{fontSize:'11px',fontWeight:700}}>{r.label}</div>
                  <div style={{fontSize:'10px',color:'var(--slate)',marginTop:'2px'}}>{r.desc}</div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',borderRadius:'12px',border:'none',background:'var(--green)',color:'var(--navy)',fontSize:'15px',fontWeight:700,opacity:loading?0.7:1}}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'var(--slate)'}}>
            Already have an account? <Link to="/login" style={{color:'var(--green)',fontWeight:600}}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
