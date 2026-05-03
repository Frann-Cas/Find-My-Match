import { useParams } from 'react-router-dom'
import { useMatchByToken } from '../hooks/useMatches'
import { useLiveScore } from '../hooks/useLiveScore'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐'}
const TEAM_SPORTS = ['Basketball','Soccer','Volleyball']

export default function ViewerPage() {
  const { token } = useParams()
  const { match, loading } = useMatchByToken(token)
  const { score, events } = useLiveScore(match?.id)

  if (loading) return (
    <div style={{background:'var(--navy)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#fff'}}>
        <div style={{fontSize:'32px',marginBottom:'12px'}}>⏳</div>
        <div style={{fontSize:'16px',fontWeight:600}}>Loading match...</div>
      </div>
    </div>
  )

  if (!match) return (
    <div style={{background:'var(--navy)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#fff',padding:'24px'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800,marginBottom:'8px'}}>Match Not Found</div>
        <div style={{fontSize:'14px',color:'#64748B'}}>This link may be invalid or the match has ended.</div>
      </div>
    </div>
  )

  const isLive = match.status === 'live'
  const isTeam = TEAM_SPORTS.includes(match.sport)
  const leading = score ? (score.score1 > score.score2 ? 1 : score.score2 > score.score1 ? 2 : 0) : 0

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',maxWidth:'480px',margin:'0 auto'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,var(--navy) 0%,#0D1B3E 100%)',padding:'28px 20px 36px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
          <span style={{fontSize:'16px'}}>{sportEmoji[match.sport]||'🏆'}</span>
          <span style={{fontSize:'11px',fontWeight:700,color:'var(--green)',textTransform:'uppercase',letterSpacing:'1px'}}>{match.sport}</span>
          {isLive && <span style={{fontSize:'10px',fontWeight:700,color:'var(--red)',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'20px',padding:'3px 8px',marginLeft:'4px'}}>● LIVE</span>}
          {match.status==='finished' && <span style={{fontSize:'10px',fontWeight:700,color:'#15803D',background:'#F0FDF4',borderRadius:'20px',padding:'3px 8px',marginLeft:'4px'}}>Finished</span>}
          {match.status==='open'||match.status==='confirmed' && <span style={{fontSize:'10px',fontWeight:700,color:'#B45309',background:'#FFF8E7',borderRadius:'20px',padding:'3px 8px',marginLeft:'4px'}}>Upcoming</span>}
        </div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800,color:'#fff',marginBottom:'8px'}}>{match.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          <span style={{fontSize:'11px',color:'#64748B'}}>📍 {match.location}</span>
          {match.referee && <span style={{fontSize:'11px',color:'#64748B'}}>🧑‍⚖️ {match.referee.full_name}</span>}
        </div>
      </div>

      {/* Live indicator */}
      {isLive && (
        <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'16px 16px 0',padding:'10px 14px',background:'rgba(239,68,68,0.06)',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.15)'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--red)',flexShrink:0}}></div>
          <div style={{fontSize:'12px',fontWeight:700,color:'var(--red)'}}>LIVE — Score updates automatically</div>
        </div>
      )}

      {/* Score card */}
      {score && (
        <div style={{background:'var(--white)',borderRadius:'24px',margin:'16px',padding:'24px 20px',border:'1px solid var(--border)',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:'13px',fontWeight:700,color:'var(--slate)',marginBottom:'8px'}}>{match.team1_name}</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'56px',fontWeight:800,color:leading===1?'var(--green)':'var(--navy)',lineHeight:1}}>{score.score1}</div>
              {leading===1&&<div style={{fontSize:'10px',color:'var(--green)',fontWeight:700,marginTop:'4px'}}>LEADING</div>}
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800,color:'var(--border)',padding:'0 12px'}}>vs</div>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:'13px',fontWeight:700,color:'var(--slate)',marginBottom:'8px'}}>{match.team2_name}</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'56px',fontWeight:800,color:leading===2?'var(--green)':'var(--navy)',lineHeight:1}}>{score.score2}</div>
              {leading===2&&<div style={{fontSize:'10px',color:'var(--green)',fontWeight:700,marginTop:'4px'}}>LEADING</div>}
            </div>
          </div>
          {(score.current_period||score.sets) && (
            <div style={{display:'flex',justifyContent:'center',gap:'24px',paddingTop:'16px',borderTop:'1px solid var(--border)'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:'15px',fontWeight:800}}>{score.current_period||'—'}</div>
                <div style={{fontSize:'10px',color:'var(--slate)',marginTop:'2px'}}>Period</div>
              </div>
              {match.status==='finished'&&score.winner&&(
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:'13px',fontWeight:800,color:'var(--green)'}}>🏆 {score.winner}</div>
                  <div style={{fontSize:'10px',color:'var(--slate)',marginTop:'2px'}}>Winner</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Events log */}
      <div style={{padding:'0 16px 40px'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'12px'}}>Match Updates</div>
        {events.length === 0 && <div style={{textAlign:'center',color:'var(--slate)',padding:'24px',fontSize:'13px'}}>No updates yet</div>}
        {events.map(e=>(
          <div key={e.id} style={{display:'flex',gap:'12px',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',color:'var(--slate)',width:'42px',flexShrink:0,paddingTop:'2px'}}>{new Date(e.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0}}>
              {e.event_type==='score'?'⬆':e.event_type==='start'?'🟢':e.event_type==='end'?'🏁':'📌'}
            </div>
            <div style={{fontSize:'13px',color:'var(--navy)',fontWeight:500,lineHeight:1.4}}>{e.description}</div>
          </div>
        ))}
      </div>

      {/* Footer brand */}
      <div style={{textAlign:'center',padding:'20px',borderTop:'1px solid var(--border)',color:'var(--slate)',fontSize:'12px'}}>
        Powered by <strong style={{color:'var(--navy)'}}>FindMyMatch</strong>
      </div>
    </div>
  )
}
