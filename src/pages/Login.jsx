import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

export default function Login() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else nav('/dashboard')
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address first'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`
    })
    if (error) setError(error.message)
    else setMessage('Password reset email sent! Check your inbox.')
  }

  const inp = { width:'100%',padding:'12px 14px',borderRadius:'8px',border:'1px solid rgba(246,54,118,0.2)',fontSize:'14px',background:'rgba(255,255,255,0.05)',outline:'none',marginTop:'6px',color:'#FFFFFF',fontFamily:'DM Sans,sans-serif' }

  return (
    <div style={{background:'#0A0000',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'20px 24px',borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="md" />
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(246,54,118,0.15)',borderRadius:'16px',padding:'36px 32px',width:'100%',maxWidth:'400px'}}>
          <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'24px',fontWeight:900,color:'#FFFFFF',marginBottom:'6px',letterSpacing:'-0.5px'}}>WELCOME BACK</div>
          <div style={{fontSize:'13px',color:'#757070',marginBottom:'28px',fontFamily:'DM Sans,sans-serif'}}>Sign in to your My Referi account</div>
          {error && <div style={{background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',color:'#F63676',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
          {message && <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',color:'#10B981',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px'}}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'11px',fontWeight:700,color:'#757070',display:'block',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>Email</label>
              <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div style={{marginBottom:'8px'}}>
              <label style={{fontSize:'11px',fontWeight:700,color:'#757070',display:'block',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>Password</label>
              <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <div style={{textAlign:'right',marginBottom:'20px'}}>
              <button type="button" onClick={handleForgotPassword} style={{background:'none',border:'none',color:'#757070',fontSize:'12px',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} style={{width:'100%',padding:'14px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase',opacity:loading?0.7:1}}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>
            No account? <Link to="/signup" style={{color:'#F63676',fontWeight:600}}>Sign up free</Link>
          </div>
        </div>
      </div>
      <div style={{textAlign:'center',padding:'16px',fontSize:'11px',color:'rgba(117,112,112,0.5)',fontFamily:'DM Sans,sans-serif'}}>
        © 2026 Arena Complex LLC · My Referi by Areya
      </div>
    </div>
  )
}