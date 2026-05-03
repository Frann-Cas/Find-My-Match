import { useNavigate } from 'react-router-dom'

const S = {
  wrap: { background:'var(--navy)', minHeight:'100vh' },
  nav: { display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.08)' },
  logo: { fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800,color:'#fff',letterSpacing:'-0.5px' },
  hero: { padding:'60px 24px 60px',textAlign:'center',maxWidth:'520px',margin:'0 auto' },
  tag: { display:'inline-block',background:'rgba(0,201,123,0.12)',border:'1px solid rgba(0,201,123,0.3)',borderRadius:'20px',padding:'5px 14px',fontSize:'11px',fontWeight:700,color:'var(--green)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'20px' },
  h1: { fontFamily:'Syne,sans-serif',fontSize:'clamp(34px,7vw,56px)',fontWeight:800,color:'#fff',lineHeight:1.1,letterSpacing:'-1.5px',marginBottom:'16px' },
  p: { color:'#94A3B8',fontSize:'16px',lineHeight:1.6,marginBottom:'36px' },
  btnG: { background:'var(--green)',color:'var(--navy)',border:'none',borderRadius:'12px',padding:'14px 28px',fontSize:'15px',fontWeight:700,width:'100%',marginBottom:'10px' },
  btnO: { background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',padding:'13px 28px',fontSize:'15px',fontWeight:600,width:'100%' },
  strip: { display:'flex',justifyContent:'center',gap:'8px',flexWrap:'wrap',padding:'24px',background:'rgba(255,255,255,0.03)',borderTop:'1px solid rgba(255,255,255,0.06)',borderBottom:'1px solid rgba(255,255,255,0.06)' },
  chip: { background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'6px 14px',fontSize:'12px',fontWeight:600,color:'#94A3B8' },
  steps: { padding:'40px 24px 60px',maxWidth:'480px',margin:'0 auto' },
  sLabel: { fontSize:'11px',fontWeight:700,color:'var(--green)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'8px' },
  sTitle: { fontFamily:'Syne,sans-serif',fontSize:'26px',fontWeight:700,color:'#fff',marginBottom:'24px' },
  step: { background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'18px',display:'flex',alignItems:'flex-start',gap:'14px',marginBottom:'12px' },
  stepNum: { width:'36px',height:'36px',borderRadius:'10px',background:'rgba(0,201,123,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:800,color:'var(--green)',flexShrink:0 },
  stepTitle: { fontSize:'14px',fontWeight:700,color:'#fff',marginBottom:'4px' },
  stepDesc: { fontSize:'12px',color:'#64748B',lineHeight:1.5 },
}

export default function Landing() {
  const nav = useNavigate()
  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>Find<span style={{color:'var(--green)'}}>My</span>Match</div>
        <button style={{...S.btnO,width:'auto',padding:'8px 18px',fontSize:'13px'}} onClick={()=>nav('/login')}>Sign In</button>
      </nav>
      <div style={S.hero}>
        <div style={S.tag}>🏆 Sports Marketplace</div>
        <h1 style={S.h1}>Book a <span style={{color:'var(--green)'}}>Referee</span> in Minutes</h1>
        <p style={S.p}>Connect with certified referees & live scorers instantly. Post a match, get confirmed, score live.</p>
        <div style={{maxWidth:'300px',margin:'0 auto'}}>
          <button style={S.btnG} onClick={()=>nav('/signup')}>Get Started Free</button>
          <button style={S.btnO} onClick={()=>nav('/login')}>I Have an Account</button>
        </div>
      </div>
      <div style={S.strip}>
        {['🎾 Tennis','🏓 Padel','🏀 Basketball','⚽ Soccer','🏐 Volleyball','🏓 Pickleball'].map(s=><span key={s} style={S.chip}>{s}</span>)}
      </div>
      <div style={S.steps}>
        <div style={S.sLabel}>How it works</div>
        <div style={S.sTitle}>Three simple steps</div>
        {[['1','Post Your Match','Set sport, time, location & pay. Goes live to referees instantly.'],['2','Referee Accepts','A certified ref nearby accepts. You get notified instantly.'],['3','Watch Live','Share a link. Anyone can follow every point in real time.']].map(([n,t,d])=>(
          <div key={n} style={S.step}>
            <div style={S.stepNum}>{n}</div>
            <div><div style={S.stepTitle}>{t}</div><div style={S.stepDesc}>{d}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
