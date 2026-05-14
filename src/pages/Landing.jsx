import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'

const SPORTS = ['🎾 Tennis','🏓 Padel','🏓 Pickleball','🏀 Basketball','⚽ Soccer','🏐 Volleyball','🎾 Beach Tennis','🏐 Beach Volleyball','⚾ Baseball']

export default function Landing() {
  const nav = useNavigate()
  return (
    <div style={{background:'#0A0000',minHeight:'100vh'}}>
      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid rgba(246,54,118,0.15)'}}>
        <Logo size="md" showTagline={false} />
        <button onClick={()=>nav('/login')} style={{background:'transparent',border:'1px solid rgba(246,54,118,0.4)',borderRadius:'8px',padding:'8px 18px',fontSize:'13px',fontWeight:700,color:'#F63676',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px'}}>
          SIGN IN
        </button>
      </nav>

      {/* HERO */}
      <div style={{padding:'70px 24px 60px',textAlign:'center',maxWidth:'520px',margin:'0 auto',position:'relative'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'20px',padding:'5px 16px',fontSize:'10px',fontWeight:700,color:'#F63676',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'24px',fontFamily:'Montserrat,sans-serif'}}>
          🏆 REFEREE MARKETPLACE
        </div>
        <h1 style={{fontFamily:'Montserrat,sans-serif',fontSize:'clamp(36px,8vw,58px)',fontWeight:900,color:'#FFFFFF',lineHeight:1.05,letterSpacing:'-2px',marginBottom:'20px'}}>
          YOUR MATCH.<br/><span style={{color:'#F63676'}}>YOUR REF.</span><br/>LIVE.
        </h1>
        <p style={{color:'#757070',fontSize:'15px',lineHeight:1.7,marginBottom:'16px',fontFamily:'DM Sans,sans-serif'}}>
          Book certified referees on demand. Share live scores with anyone. Puerto Rico's first sports referee marketplace.
        </p>
        <p style={{color:'#EDFF00',fontSize:'13px',fontWeight:700,lineHeight:1.6,marginBottom:'40px',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.3px'}}>
          📊 Follow live scores in real time — or become a ref and earn fast cash at the matches you already love to watch.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:'12px',maxWidth:'280px',margin:'0 auto'}}>
          <button onClick={()=>nav('/signup')} style={{background:'#F63676',color:'#FFFFFF',border:'none',borderRadius:'10px',padding:'15px 24px',fontSize:'14px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>
            GET STARTED FREE
          </button>
          <button onClick={()=>nav('/login')} style={{background:'transparent',color:'#FFFFFF',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'14px 24px',fontSize:'14px',fontWeight:600,fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px'}}>
            I Have an Account
          </button>
        </div>
      </div>

      {/* STRIPE ACCENT */}
      <div style={{display:'flex',height:'4px',margin:'0 24px 40px'}}>
        <div style={{flex:1,background:'#F63676'}}></div>
        <div style={{flex:1,background:'#757070'}}></div>
        <div style={{flex:1,background:'#EDFF00'}}></div>
      </div>

      {/* SPORTS STRIP */}
      <div style={{display:'flex',justifyContent:'center',gap:'8px',flexWrap:'wrap',padding:'20px 24px',borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        {SPORTS.map(s=><span key={s} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'6px 14px',fontSize:'12px',fontWeight:600,color:'#757070',fontFamily:'Montserrat,sans-serif'}}>{s}</span>)}
      </div>

      {/* HOW IT WORKS */}
      <div style={{padding:'50px 24px 60px',maxWidth:'480px',margin:'0 auto'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'10px',fontWeight:700,color:'#F63676',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px'}}>HOW IT WORKS</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'26px',fontWeight:900,color:'#FFFFFF',marginBottom:'28px',letterSpacing:'-0.5px'}}>THREE SIMPLE STEPS</div>
        {[
          ['01','Post Your Match','Set your sport, time, location & pay rate. Your job goes live to certified referees nearby instantly.','#F63676'],
          ['02','Get Matched with a Ref','A certified referee accepts your job in seconds — someone who actually wants to be there and knows the game.','#757070'],
          ['03','Earn While You Watch','Refs get paid to officiate matches they enjoy. Follow live scores, share the link, and let anyone track every point in real time.','#EDFF00'],
        ].map(([n,t,d,c])=>(
          <div key={n} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'20px',display:'flex',gap:'16px',marginBottom:'12px',alignItems:'flex-start'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'28px',fontWeight:900,color:c,opacity:0.9,lineHeight:1,flexShrink:0,width:'40px'}}>{n}</div>
            <div>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'14px',fontWeight:800,color:'#FFFFFF',marginBottom:'6px',letterSpacing:'0.3px'}}>{t}</div>
              <div style={{fontSize:'13px',color:'#757070',lineHeight:1.5,fontFamily:'DM Sans,sans-serif'}}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'24px',textAlign:'center'}}>
        <Logo size="sm" showTagline={true} />
        <div style={{fontSize:'11px',color:'#757070',marginTop:'12px',fontFamily:'DM Sans,sans-serif'}}>© 2026 Arena Complex LLC · My Referi · Puerto Rico</div>
      </div>
    </div>
  )
}
