import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

const ROLES = [
  { id:'player', icon:'🎯', label:'Player / Host', desc:'Book refs & host matches' },
  { id:'referee', icon:'🧑‍⚖️', label:'Referee', desc:'Earn by officiating matches' },
  { id:'viewer', icon:'👁', label:'Viewer', desc:'Follow matches live' },
  { id:'facility', icon:'🏟', label:'Facility', desc:'Manage your venue & courts' },
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

  const inp = { width:'100%',padding:'12px 14px',borderRadius:'8px',border:'1px solid rgba(246,54,118,0.2)',fontSize:'14px',background:'rgba(255,255,255,0.05)',outline:'none',marginTop:'6px',color:'#FFFFFF',fontFamily:'DM Sans,sans-serif' }

  return (
    <div style={{background:'#0A0000',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'20px 24px',borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="md" />
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(246,54,118,0.15)',borderRadius:'16px',padding:'36px 32px',width:'100%',maxWidth:'420px'}}>
          <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'24px',fontWeight:900,color:'#FFFFFF',marginBottom:'6px',letterSpacing:'-0.5px'}}>CREATE ACCOUNT</div>
          <div style={{fontSize:'13px',color:'#757070',marginBottom:'24px',fontFamily:'DM Sans,sans-serif'}}>Choose your role to get started</div>
          {error && <div style={{background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',color:'#F63676',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {[['Full Name','text',form.fullName,v=>setForm(f=>({...f,fullName:v})),'Alex Johnson'],['Email','email',form.email,v=>setForm(f=>({...f,email:v})),'you@example.com'],['Password','password',form.password,v=>setForm(f=>({...f,password:v})),'Min. 8 characters']].map(([label,type,val,setter,ph])=>(
              <div key={label} style={{marginBottom:'14px'}}>
                <label style={{fontSize:'11px',fontWeight:700,color:'#757070',display:'block',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>{label}</label>
                <input style={inp} type={type} value={val} onChange={e=>setter(e.target.value)} required placeholder={ph} minLength={type==='password'?8:undefined} />
              </div>
            ))}
            <div style={{fontSize:'11px',fontWeight:700,color:'#757070',marginBottom:'10px',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>I am a...</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'20px'}}>
              {ROLES.map(r=>(
                <div key={r.id} onClick={()=>setForm(f=>({...f,role:r.id}))} style={{border:`1.5px solid ${form.role===r.id?'#F63676':'rgba(255,255,255,0.08)'}`,borderRadius:'10px',padding:'12px 10px',cursor:'pointer',textAlign:'center',background:form.role===r.id?'rgba(246,54,118,0.1)':'rgba(255,255,255,0.02)',transition:'all .2s'}}>
                  <div style={{fontSize:'22px',marginBottom:'4px'}}>{r.icon}</div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{r.label}</div>
                  <div style={{fontSize:'10px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{r.desc}</div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading} style={{width:'100%',padding:'14px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase',opacity:loading?0.7:1}}>
              {loading ? 'CREATING...' : 'CREATE ACCOUNT →'}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>
            Already have an account? <Link to="/login" style={{color:'#F63676',fontWeight:600}}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
