import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveScore } from '../hooks/useLiveScore'
import { useMatches } from '../hooks/useMatches'
import { supabase } from '../lib/supabase'

const TEAM_SPORTS = ['Basketball','Soccer','Volleyball']
const PERIODS_TEAM = ['Q1','Q2','Q3','Q4','H1','H2','OT']
const PERIODS_RACKET = ['Set 1','Set 2','Set 3','Tiebreak']
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

export default function LiveScoring() {
  const { matchId } = useParams()
  const nav = useNavigate()
  const [match, setMatch] = useState(null)
  const { score, events, updateScore } = useLiveScore(matchId)
  const { finishMatch } = useMatches()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('matches').select('*').eq('id', matchId).single().then(({data})=>setMatch(data))
  }, [matchId])

  if (!match || !score) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--slate)',fontSize:'14px'}}>Loading match...</div>

  const isTeam = TEAM_SPORTS.includes(match.sport)
  const viewerUrl = `${APP_URL}/live/${match.viewer_token}`
  const periods = isTeam ? PERIODS_TEAM : PERIODS_RACKET

  async function adj(team, delta) {
    const key = team === 1 ? 'score1' : 'score2'
    const cur = team === 1 ? score.score1 : score.score2
    const newVal = Math.max(0, cur + delta)
    const teamName = team === 1 ? match.team1_name : match.team2_name
    await updateScore({ [key]: newVal }, `${teamName}: ${newVal} ${delta > 0 ? '(+1)' : '(-1)'}`)
  }

  async function setPeriod(p) {
    await updateScore({ current_period: p }, `Period changed to ${p}`)
  }

  async function handleFinish() {
    const winner = score.score1 > score.score2 ? match.team1_name : score.score2 > score.score1 ? match.team2_name : 'Draw'
    await finishMatch(matchId, winner)
    nav('/referee')
  }

  function copyLink() {
    navigator.clipboard.writeText(viewerUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
  }

  const ScoreControl = ({ team, score: s }) => (
    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
      <button onClick={()=>adj(team,-1)} style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg)',fontSize:'18px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--slate)'}}>−</button>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:isTeam?'48px':'38px',fontWeight:800,width:isTeam?'64px':'52px',textAlign:'center',lineHeight:1}}>{s}</div>
      <button onClick={()=>adj(team,1)} style={{width:'32px',height:'32px',borderRadius:'8px',border:'none',background:'var(--green)',fontSize:'18px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--navy)'}}>+</button>
    </div>
  )

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'var(--bg)',minHeight:'100vh'}}>
      {/* Topbar */}
      <div style={{background:'var(--navy)',padding:'0 16px',height:'56px',display:'flex',alignItems:'center',gap:'12px',position:'sticky',top:0,zIndex:100}}>
        <button onClick={()=>nav('/referee')} style={{background:'rgba(255,255,255,0.08)',border:'none',color:'#fff',width:'36px',height:'36px',borderRadius:'10px',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:800,color:'#fff'}}>Live Scoring</div>
        <div style={{marginLeft:'auto',fontSize:'10px',fontWeight:700,color:'var(--red)',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'20px',padding:'4px 10px',animation:'pulse 2s infinite'}}>🔴 LIVE</div>
      </div>

      {/* Match header */}
      <div style={{background:'linear-gradient(135deg,var(--navy) 0%,#0D1B3E 100%)',padding:'20px 16px 24px'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:800,color:'#fff',marginBottom:'4px'}}>{match.title}</div>
        <div style={{fontSize:'12px',color:'#64748B'}}>{match.sport} · {match.location}</div>
      </div>

      {/* Share link */}
      <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',background:'var(--green-pale)',borderBottom:'1px solid rgba(0,201,123,0.2)'}}>
        <div style={{flex:1}}>
          <div style={{fontSize:'11px',fontWeight:700,color:'var(--green-dark)',marginBottom:'2px'}}>📤 Viewer link</div>
          <div style={{fontSize:'10px',color:'var(--slate)',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{viewerUrl}</div>
        </div>
        <button onClick={copyLink} style={{padding:'6px 14px',borderRadius:'8px',background:copied?'var(--green-dark)':'var(--green)',border:'none',fontSize:'12px',fontWeight:700,color:'var(--navy)',flexShrink:0,transition:'background .2s'}}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Scoreboard */}
      <div style={{background:'var(--white)',borderRadius:'20px',margin:'16px',padding:'20px',border:'1px solid var(--border)',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        {[{name:match.team1_name,sub:'Home',team:1,s:score.score1},{name:match.team2_name,sub:'Away',team:2,s:score.score2}].map(t=>(
          <div key={t.team} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:t.team===1?'1px solid var(--border)':'none'}}>
            <div>
              <div style={{fontSize:'16px',fontWeight:700}}>{t.name}</div>
              <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>{t.sub}</div>
            </div>
            <ScoreControl team={t.team} score={t.s} />
          </div>
        ))}
      </div>

      {/* Sets (racket sports) */}
      {!isTeam && score.sets && (
        <div style={{padding:'0 16px 12px'}}>
          <div style={{fontSize:'11px',fontWeight:700,color:'var(--slate)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'8px'}}>Sets</div>
          <div style={{display:'flex',gap:'8px'}}>
            {(Array.isArray(score.sets)?score.sets:[]).map((set,i)=>(
              <div key={i} style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'10px',padding:'8px 12px',textAlign:'center',flex:1}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:800}}>{set.s1}–{set.s2}</div>
                <div style={{fontSize:'9px',color:'var(--slate)',marginTop:'2px'}}>Set {i+1}</div>
              </div>
            ))}
            <div style={{background:'var(--green-pale)',border:'1px solid var(--green)',borderRadius:'10px',padding:'8px 12px',textAlign:'center',flex:1}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:800}}>{score.score1}–{score.score2}</div>
              <div style={{fontSize:'9px',color:'var(--green)',marginTop:'2px'}}>Current</div>
            </div>
          </div>
        </div>
      )}

      {/* Period */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'0 16px 12px',padding:'12px 14px',background:'var(--white)',borderRadius:'12px',border:'1px solid var(--border)'}}>
        <div>
          <div style={{fontSize:'11px',fontWeight:600,color:'var(--slate)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Period</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:800,color:'var(--navy)'}}>{score.current_period||'Start'}</div>
        </div>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'flex-end'}}>
          {periods.slice(0,4).map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:'5px 10px',borderRadius:'8px',border:`1px solid ${score.current_period===p?'var(--navy)':'var(--border)'}`,background:score.current_period===p?'var(--navy)':'var(--white)',color:score.current_period===p?'var(--white)':'var(--navy)',fontSize:'11px',fontWeight:700,transition:'all .2s'}}>{p}</button>
          ))}
        </div>
      </div>

      {/* Recent events */}
      <div style={{padding:'0 16px 12px'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:700,marginBottom:'10px'}}>Recent Updates</div>
        {events.slice(0,4).map(e=>(
          <div key={e.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',color:'var(--slate)',width:'40px',flexShrink:0}}>{new Date(e.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            <div style={{fontSize:'13px',color:'var(--navy)',fontWeight:500}}>{e.description}</div>
          </div>
        ))}
      </div>

      {/* End match */}
      <div style={{padding:'0 16px 30px'}}>
        <button onClick={handleFinish} style={{width:'100%',padding:'14px',borderRadius:'12px',border:'none',background:'var(--navy)',color:'var(--white)',fontSize:'15px',fontWeight:700}}>
          🏁 End Match
        </button>
      </div>
    </div>
  )
}
