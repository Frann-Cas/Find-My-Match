import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatches } from '../hooks/useMatches'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐'}
const statusStyle = {
  open:{bg:'#FFF8E7',color:'#B45309',label:'Open'},
  confirmed:{bg:'#EEF2FF',color:'var(--purple)',label:'Confirmed'},
  live:{bg:'rgba(239,68,68,0.1)',color:'var(--red)',label:'🔴 Live'},
  finished:{bg:'#F0FDF4',color:'#15803D',label:'Finished'},
  canceled:{bg:'#F8FAFC',color:'var(--slate)',label:'Canceled'},
}

function MatchCard({ match }) {
  const nav = useNavigate()
  const ss = statusStyle[match.status] || statusStyle.open
  const isLive = match.status === 'live'
  return (
    <div onClick={()=>isLive && nav(`/score/${match.id}`)} style={{background:'var(--white)',borderRadius:'16px',padding:'16px',border:'1px solid var(--border)',marginBottom:'10px',cursor:isLive?'pointer':'default'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{sportEmoji[match.sport]||'🏆'}</div>
          <div>
            <div style={{fontSize:'14px',fontWeight:700}}>{match.title}</div>
            <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>{match.sport} · {match.location}</div>
          </div>
        </div>
        <div style={{background:ss.bg,color:ss.color,fontSize:'10px',fontWeight:700,padding:'4px 10px',borderRadius:'20px',letterSpacing:'0.5px'}}>{ss.label}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid var(--border)'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'var(--green)'}}>{match.pay_rate ? `$${match.pay_rate}` : ''}</div>
        <div style={{fontSize:'11px',color:'var(--slate)'}}>{match.team1_name} vs {match.team2_name}</div>
      </div>
      {match.live_scores?.[0] && isLive && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'16px',marginTop:'12px',padding:'10px',background:'var(--green-pale)',borderRadius:'10px'}}>
          <span style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800}}>{match.live_scores[0].score1}</span>
          <span style={{fontSize:'12px',color:'var(--slate)'}}>vs</span>
          <span style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800}}>{match.live_scores[0].score2}</span>
        </div>
      )}
      {isLive && match.viewer_token && (
        <div style={{marginTop:'10px',padding:'8px 12px',background:'#F0FDF4',borderRadius:'8px',fontSize:'11px',color:'#15803D',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span>Share live link</span>
          <span style={{fontFamily:'monospace',fontSize:'10px'}}>{`${import.meta.env.VITE_APP_URL||''}/live/${match.viewer_token}`}</span>
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
    <div style={{maxWidth:'480px',margin:'0 auto',minHeight:'100vh',background:'var(--bg)'}}>
      {/* Topbar */}
      <div style={{background:'var(--navy)',padding:'0 16px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:800,color:'#fff'}}>Find<span style={{color:'var(--green)'}}>My</span>Match</div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'10px',fontWeight:600,color:'var(--green)',background:'rgba(0,201,123,0.15)',padding:'3px 8px',borderRadius:'20px',textTransform:'uppercase',letterSpacing:'0.5px'}}>{profile?.role}</div>
          <button onClick={signOut} style={{background:'transparent',border:'none',color:'#64748B',fontSize:'12px',fontWeight:600}}>Sign out</button>
        </div>
      </div>

      {/* Header */}
      <div style={{background:'var(--navy)',padding:'20px 16px 28px'}}>
        <div style={{fontSize:'12px',color:'#64748B',marginBottom:'4px'}}>Good to see you,</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800,color:'#fff'}}>{profile?.full_name?.split(' ')[0]} <span style={{color:'var(--green)'}}>{profile?.full_name?.split(' ').slice(1).join(' ')}</span></div>
      </div>

      <div style={{padding:'16px 16px 80px'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
          <div style={{background:'var(--white)',borderRadius:'14px',padding:'16px',border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800}}>{matches.length}</div>
            <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>Total Matches</div>
          </div>
          <div style={{background:'var(--white)',borderRadius:'14px',padding:'16px',border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,color:'var(--green)'}}>{liveCount}</div>
            <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>Active / Live</div>
          </div>
        </div>

        {/* Create button */}
        <button onClick={()=>nav('/create-match')} style={{width:'100%',padding:'15px',borderRadius:'14px',border:'none',background:'var(--green)',color:'var(--navy)',fontSize:'15px',fontWeight:700,marginBottom:'24px',letterSpacing:'-0.2px'}}>
          + Create Match Request
        </button>

        {/* Matches */}
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'12px'}}>Your Matches</div>
        {loading ? <div style={{textAlign:'center',color:'var(--slate)',padding:'40px',fontSize:'14px'}}>Loading matches...</div>
          : matches.length === 0 ? <div style={{textAlign:'center',color:'var(--slate)',padding:'40px',fontSize:'14px'}}>No matches yet. Create your first one!</div>
          : matches.map(m => <MatchCard key={m.id} match={m} />)}
      </div>

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'var(--white)',borderTop:'1px solid var(--border)',display:'flex',padding:'8px 0 12px',zIndex:90}}>
        {[['🏠','Home',()=>{}],['➕','Create',()=>nav('/create-match')],['⚙️','Admin',()=>nav('/admin')]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'10px',fontWeight:600,color:'var(--slate)'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
