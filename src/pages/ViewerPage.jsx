import { useParams } from 'react-router-dom'
import { useMatchByToken } from '../hooks/useMatches'
import { useLiveScore } from '../hooks/useLiveScore'
import { Logo } from '../components/Logo'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐'}
const TEAM_SPORTS = ['Basketball','Soccer','Volleyball']

export default function ViewerPage() {
  const { token } = useParams()
  const { match, loading } = useMatchByToken(token)
  const { score, events } = useLiveScore(match?.id)

  if (loading) return (
    <div style={{background:'#0A0000',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#FFFFFF'}}>
        <div style={{display:'flex',gap:'4px',justifyContent:'center',marginBottom:'16px'}}>
          <div style={{width:'8px',height:'30px',background:'#F63676',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
          <div style={{width:'8px',height:'30px',background:'#757070',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
          <div style={{width:'8px',height:'30px',background:'#EDFF00',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
        </div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'14px',fontWeight:700,color:'#757070',letterSpacing:'1px'}}>LOADING MATCH...</div>
      </div>
    </div>
  )

  if (!match) return (
    <div style={{background:'#0A0000',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#FFFFFF',padding:'24px'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,marginBottom:'8px',color:'#FFFFFF'}}>MATCH NOT FOUND</div>
        <div style={{fontSize:'14px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>This link may be invalid or the match has ended.</div>
      </div>
    </div>
  )

  const isLive = match.status === 'live'
  const isTeam = TEAM_SPORTS.includes(match.sport)
  const leading = score ? (score.score1 > score.score2 ? 1 : score.score2 > score.score1 ? 2 : 0) : 0

  return (
    <div style={{background:'#0A0000',minHeight:'100vh',maxWidth:'480px',margin:'0 auto'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'20px 20px 28px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
          <span style={{fontSize:'16px'}}>{sportEmoji[match.sport]||'🏆'}</span>
          <span style={{fontSize:'10px',fontWeight:800,color:'#F63676',textTransform:'uppercase',letterSpacing:'1.5px',fontFamily:'Montserrat,sans-serif'}}>{match.sport}</span>
          {isLive && <span style={{fontSize:'9px',fontWeight:800,color:'#F63676',background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'20px',padding:'3px 10px',marginLeft:'4px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px'}}>● LIVE</span>}
          {match.status==='finished' && <span style={{fontSize:'9px',fontWeight:800,color:'#10B981',background:'rgba(16,185,129,0.1)',borderRadius:'20px',padding:'3px 10px',marginLeft:'4px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',border:'1px solid rgba(16,185,129,0.2)'}}>FINISHED</span>}
        </div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'20px',fontWeight:900,color:'#FFFFFF',marginBottom:'8px',letterSpacing:'-0.3px'}}>{match.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          <span style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>📍 {match.location}</span>
          {match.referee&&<span style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>🧑‍⚖️ {match.referee.full_name}</span>}
        </div>
      </div>

      {/* Live indicator */}
      {isLive && (
        <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'16px 16px 0',padding:'10px 14px',background:'rgba(246,54,118,0.06)',borderRadius:'10px',border:'1px solid rgba(246,54,118,0.15)'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#F63676',flexShrink:0}}></div>
          <div style={{fontSize:'11px',fontWeight:800,color:'#F63676',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px'}}>LIVE — Score updates automatically</div>
        </div>
      )}

      {/* Score card */}
      {score && (
        <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'20px',margin:'16px',padding:'24px 20px',border:'1px solid rgba(246,54,118,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'#757070',marginBottom:'10px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'0.5px'}}>{match.team1_name}</div>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'62px',fontWeight:900,color:leading===1?'#F63676':'#FFFFFF',lineHeight:1}}>{score.score1}</div>
              {leading===1&&<div style={{fontSize:'9px',color:'#F63676',fontWeight:800,marginTop:'6px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px'}}>LEADING</div>}
            </div>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'20px',fontWeight:900,color:'rgba(255,255,255,0.1)',padding:'0 12px'}}>VS</div>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'#757070',marginBottom:'10px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'0.5px'}}>{match.team2_name}</div>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'62px',fontWeight:900,color:leading===2?'#F63676':'#FFFFFF',lineHeight:1}}>{score.score2}</div>
              {leading===2&&<div style={{fontSize:'9px',color:'#F63676',fontWeight:800,marginTop:'6px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px'}}>LEADING</div>}
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'24px',paddingTop:'16px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'14px',fontWeight:800,color:'#FFFFFF'}}>{score.current_period||'—'}</div>
              <div style={{fontSize:'9px',color:'#757070',marginTop:'2px',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>Period</div>
            </div>
            {match.status==='finished'&&score.winner&&(
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'12px',fontWeight:800,color:'#EDFF00'}}>🏆 {score.winner}</div>
                <div style={{fontSize:'9px',color:'#757070',marginTop:'2px',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>Winner</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events log */}
      <div style={{padding:'0 16px 40px'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Match Updates</div>
        {events.length===0&&<div style={{textAlign:'center',color:'#757070',padding:'24px',fontSize:'13px',fontFamily:'DM Sans,sans-serif'}}>No updates yet</div>}
        {events.map(e=>(
          <div key={e.id} style={{display:'flex',gap:'12px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:'10px',color:'#757070',width:'42px',flexShrink:0,paddingTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{new Date(e.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'rgba(246,54,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,border:'1px solid rgba(246,54,118,0.15)'}}>
              {e.event_type==='score'?'⬆':e.event_type==='start'?'🟢':e.event_type==='end'?'🏁':'📌'}
            </div>
            <div style={{fontSize:'13px',color:'#FFFFFF',fontWeight:500,lineHeight:1.4,fontFamily:'DM Sans,sans-serif'}}>{e.description}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{textAlign:'center',padding:'20px',borderTop:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" showTagline={true} />
        <div style={{fontSize:'11px',color:'rgba(117,112,112,0.5)',marginTop:'8px',fontFamily:'DM Sans,sans-serif'}}>Powered by My Referi · Arena Complex LLC</div>
      </div>
    </div>
  )
}
