import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'

const SPORTS = ['Tennis','Padel','Pickleball','Basketball','Soccer','Volleyball','Beach Tennis','Beach Volleyball','Baseball']

export default function Landing() {
  const nav = useNavigate()
  return (
    <div style={{background:'#0A0000',minHeight:'100vh'}}>
      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid rgba(246,54,118,0.15)'}}>
        <Logo size="md" />
        <button onClick={()=>nav('/login')} style={{background:'transparent',border:'1px solid rgba(246,54,118,0.4)',borderRadius:'8px',padding:'8px 18px',fontSize:'13px',fontWeight:700,color:'#F63676',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',cursor:'pointer'}}>
          SIGN IN
        </button>
      </nav>

      {/* HERO */}
      <div style={{padding:'60px 24px 40px',textAlign:'center',maxWidth:'520px',margin:'0 auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'20px',padding:'5px 16px',fontSize:'10px',fontWeight:700,color:'#F63676',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'24px',fontFamily:'Montserrat,sans-serif'}}>
          🏆 REFEREE MARKETPLACE
        </div>

        <h1 style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(36px,8vw,58px)',fontWeight:900,color:'#FFFFFF',lineHeight:1.05,letterSpacing:'-2px',marginBottom:'24px'}}>
          YOUR MATCH.<br/><span style={{color:'#F63676'}}>YOUR REF.</span><br/>LIVE.
        </h1>

        {/* 4 PILLARS */}
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'8px',marginBottom:'24px'}}>
          {[['🧑‍⚖️','Book a Ref'],['📊','Live Scoreboard'],['🎾','Find a Game'],['🏆','Ref Leaderboard']].map(([icon,label])=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'6px 14px',fontSize:'11px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>
              {icon} {label}
            </div>
          ))}
        </div>

        {/* SUBTITLE */}
        <p style={{color:'#757070',fontSize:'15px',lineHeight:1.7,marginBottom:'36px',fontFamily:'DM Sans,sans-serif'}}>
          Book a ref for your next match, or become one and get paid to watch the sports you love — while fans follow every point live, anywhere in the world.
        </p>

        {/* BUTTONS */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px',maxWidth:'300px',margin:'0 auto'}}>
          <button onClick={()=>nav('/signup')} style={{background:'#F63676',color:'#FFFFFF',border:'none',borderRadius:'10px',padding:'15px 24px',fontSize:'14px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase',cursor:'pointer'}}>
            GET STARTED FREE
          </button>
          <button onClick={()=>nav('/login')} style={{background:'transparent',color:'#FFFFFF',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'14px 24px',fontSize:'14px',fontWeight:600,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>
            I Have an Account
          </button>
        </div>
      </div>

      {/* STRIPE BAR */}
      <div style={{display:'flex',height:'4px',margin:'0 24px 0'}}>
        <div style={{flex:1,background:'#F63676'}}></div>
        <div style={{flex:1,background:'#757070'}}></div>
        <div style={{flex:1,background:'#EDFF00'}}></div>
      </div>

      {/* SPORTS STRIP */}
      <div style={{display:'flex',justifyContent:'center',gap:'8px',flexWrap:'wrap',padding:'20px 24px',borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        {SPORTS.map(s=><span key={s} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'6px 14px',fontSize:'12px',fontWeight:600,color:'#757070',fontFamily:'Montserrat,sans-serif'}}>{s}</span>)}
      </div>

      {/* HOW IT WORKS */}
      <div style={{padding:'50px 24px 0',maxWidth:'480px',margin:'0 auto'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'10px',fontWeight:700,color:'#F63676',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px'}}>HOW IT WORKS</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'26px',fontWeight:900,color:'#FFFFFF',marginBottom:'28px',letterSpacing:'-0.5px'}}>THREE SIMPLE STEPS</div>
        {[
          ['01','For Players','Post your match, pick your sport and location. A nearby ref gets notified instantly and accepts in seconds.','#F63676'],
          ['02','For Referees','Turn on Available Mode. Accept a nearby match. Show up, score it live through the app, and get paid — it\'s that simple.','#757070'],
          ['03','For Fans & Viewers','Get a shareable link. Anyone in the world can follow every point live on their phone — no account needed.','#EDFF00'],
        ].map(([n,t,d,c])=>(
          <div key={n} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'20px',display:'flex',gap:'16px',marginBottom:'12px',alignItems:'flex-start'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'28px',fontWeight:900,color:c,lineHeight:1,flexShrink:0,width:'40px'}}>{n}</div>
            <div>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'14px',fontWeight:800,color:'#FFFFFF',marginBottom:'6px'}}>{t}</div>
              <div style={{fontSize:'13px',color:'#757070',lineHeight:1.5,fontFamily:'DM Sans,sans-serif'}}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* LEADERBOARD SECTION */}
      <div style={{margin:'40px 24px',background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',borderRadius:'20px',padding:'32px 24px',border:'1px solid rgba(246,54,118,0.2)',textAlign:'center',maxWidth:'480px',marginLeft:'auto',marginRight:'auto'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'10px',fontWeight:700,color:'#EDFF00',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px'}}>🏆 THE REFEREE LEADERBOARD</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,color:'#FFFFFF',marginBottom:'16px',letterSpacing:'-0.5px'}}>
          Ref more. Earn more.<br/><span style={{color:'#F63676'}}>Rank higher.</span>
        </div>
        <p style={{color:'#757070',fontSize:'13px',lineHeight:1.7,marginBottom:'24px',fontFamily:'DM Sans,sans-serif'}}>
          Every match you score earns you points. The more you ref, the higher you climb. Top-ranked refs get priority bookings, more matches, and more cash. Who's #1 in your city?
        </p>
        <div style={{display:'flex',justifyContent:'center',gap:'16px',marginBottom:'24px'}}>
          {[['🥇','Elite Ref','50+ matches'],['🥈','Pro Ref','20+ matches'],['🥉','Rising Ref','5+ matches']].map(([medal,title,sub])=>(
            <div key={title} style={{textAlign:'center'}}>
              <div style={{fontSize:'28px',marginBottom:'6px'}}>{medal}</div>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'11px',fontWeight:800,color:'#FFFFFF'}}>{title}</div>
              <div style={{fontSize:'10px',color:'#757070