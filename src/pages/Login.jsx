import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn({ email, password })
    if (error) { setError(error.message); setLoading(false) }
  }

  const inp = { width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1px solid var(--border)',fontSize:'14px',background:'var(--bg)',outline:'none',marginTop:'6px' }
  const lbl = { fontSize:'12px',fontWeight:600,color:'var(--navy)',display:'block' }

  return (
    <div style={{background:'var(--navy)',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800,color:'#fff'}}>Find<span style={{color:'var(--green)'}}>My</span>Match</div>
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
        <div style={{background:'var(--white)',borderRadius:'20px',padding:'32px 28px',width:'100%',maxWidth:'400px',border:'1px solid var(--border)'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'24px',fontWeight:800,marginBottom:'6px'}}>Welcome back 👋</div>
          <div style={{fontSize:'14px',color:'var(--slate)',marginBottom:'28px'}}>Sign in to your account</div>
          {error && <div style={{background:'#FEF2F2',color:'var(--red)',padding:'10px 14px',borderRadius:'10px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'16px'}}><label style={lbl}>Email<input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label></div>
            <div style={{marginBottom:'20px'}}><label style={lbl}>Password<input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label></div>
            <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',borderRadius:'12px',border:'none',background:'var(--green)',color:'var(--navy)',fontSize:'15px',fontWeight:700,opacity:loading?0.7:1}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'var(--slate)'}}>
            No account? <Link to="/signup" style={{color:'var(--green)',fontWeight:600}}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
