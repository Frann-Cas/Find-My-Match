import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatches } from '../hooks/useMatches'
import { Logo } from '../components/Logo'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐'}
const statusStyle = {
  open:{bg:'rgba(237,255,0,0.1)',color:'#EDFF00',border:'rgba(237,255,0,0.3)',label:'OPEN'},
  confirmed:{bg:'rgba(139,92,246,0.1)',color:'#8B5CF6',border:'rgba(139,92,246,0.3)',label:'CONFIRMED'},
  live:{bg:'rgba(246,54,118,0.1)',color:'#F63676',border:'rgba(246,54,118,0.3)',label:'🔴 LIVE'},
  finished:{bg:'rgba(16,185,129,0.1)',color:'#10B981',border:'rgba(16,185,129,0.3)',label:'FINISHED'},
}

function MatchCard({ match }) {
  const nav = useNavigate()
  const ss = statusStyle[match.status] || statusStyle.open
  return (
    <div onClick={()=>match.status==='live'&&nav(`/score/${match.id}`)} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'16px',marginBottom:'10px',cursor:match.status==='live'?'pointer':'default'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(246,54,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{sportEmoji[match.sport]||'🏆'}</div>
          <div>
            <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{match.title}</div>
            <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{match.sport} · {match.location}</div>
          </div>
        </div>
        <div style={{background:ss.bg,border:`1px solid ${ss.border}`,color:ss.color,fontSize:'9px',fontWeight:800,padding:'4px 10px',borderRadius:'20px',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif'}}>{ss.label}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{fontSize:'14px',fontWeight:800,color:'#F63676',fontFamily:'Montserrat,sans-serif'}}>{match.pay_rate?`$${match.pay_rate}`:''}</div>
        <div style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{match.team1_name} vs {match.team2_name}</div>
      </div>
      {match.status==='live'&&match.live_scores?.[0]&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginTop:'12px',padding:'12px',background:'rgba(246,54,118,0.08)',borderRadius:'10px',border:'1px solid rgba(246,54,118,0.15)'}}>
          <span style={{fontFamily:'Montserrat,sans-serif',fontSize:'24px',fontWeight:900,color:'#FFFFFF'}}>{match.live_scores[0].score1}</span>
          <span style={{fontSize:'11px',color:'#757070',fontWeight:600}}>VS</span>
          <span style={{fontFamily:'Montserrat,sans-serif',fontSize:'24px',fontWeight:900,color:'#FFFFFF'}}>{match.live_scores[0].score2}</span>
        </div>
      )}
      {match.status==='live'&&match.viewer_token&&(
        <div style={{marginTop:'10px',padding:'8px 12px',background:'rgba(237,255,0,0.05)',borderRadius:'8px',fontSize:'11px',color:'#EDFF00',border:'1px solid rgba(237,255,0,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:'DM Sans,sans-serif'}}>
          <span>📤 Share live link</span>
          <span style={{fontFamily:'monospace',fontSize:'10px',opacity:0.7}}>{`${import.meta.env.VITE_APP_URL||''}/live/${match.viewer_token}`}</span>
        </div>
      )}
    </div>
  )
}

export default function PlayerDash() {
  const { profile, signOut } = useAuth()
  const { matches, loading } = useMatches()
  const nav = useNavigate()
  const liveCount = matches.filter(m=>m.status==='live'||m.status==='confirmed').length

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',minHeight:'100vh',background:'#0A0000'}}>
      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'9px',fontWeight:800,color:'#F63676',background:'rgba(246,54,118,0.1)',padding:'3px 8px',borderRadius:'20px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',border:'1px solid rgba(246,54,118,0.2)'}}>{profile?.role}</div>
          <button onClick={signOut} style={{background:'transparent',border:'none',color:'#757070',fontSize:'12px',fontWeight:600,fontFamily:'DM Sans,sans-serif'}}>Sign out</button>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'24px 16px 32px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontSize:'11px',color:'#757070',marginBottom:'4px',fontFamily:'Montserrat,sans-serif',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase'}}>Good to see you,</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'26px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>{profile?.full_name?.split(' ')[0]} <span style={{color:'#F63676'}}>{profile?.full_name?.split(' ').slice(1).join(' ')}</span></div>
      </div>

      <div style={{padding:'16px 16px 80px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
          <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color:'#FFFFFF'}}>{matches.length}</div>
            <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>Total Matches</div>
          </div>
          <div style={{background:'rgba(246,54,118,0.08)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(246,54,118,0.15)'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color:'#F63676'}}>{liveCount}</div>
            <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>Active / Live</div>
          </div>
        </div>

        <button onClick={()=>nav('/create-match')} style={{width:'100%',padding:'15px',borderRadius:'12px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,marginBottom:'24px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>
          + POST MATCH REQUEST
        </button>

        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Your Matches</div>
        {loading ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontSize:'14px'}}>Loading...</div>
          : matches.length === 0 ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontSize:'14px',fontFamily:'DM Sans,sans-serif'}}>No matches yet. Post your first one!</div>
          : matches.map(m=><MatchCard key={m.id} match={m} />)}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#0A0000',borderTop:'1px solid rgba(246,54,118,0.1)',display:'flex',padding:'8px 0 14px',zIndex:90}}>
        {[['🏠','Home',()=>{}],['➕','Create',()=>nav('/create-match')],['⚙️','Admin',()=>nav('/admin')]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'9px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
