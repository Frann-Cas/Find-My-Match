import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatches, useOpenMatches } from '../hooks/useMatches'
import { supabase } from '../lib/supabase'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐'}

export default function RefereeDash() {
  const { profile, signOut } = useAuth()
  const nav = useNavigate()
  const { matches, acceptMatch, startMatch } = useMatches()
  const { matches: openMatches, loading: openLoading, refresh } = useOpenMatches()
  const [available, setAvailable] = useState(false)
  const [earnings, setEarnings] = useState(0)

  const confirmedJobs = matches.filter(m=>m.referee_id===profile?.id && (m.status==='confirmed'||m.status==='live'))

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('referee_profiles').select('available_mode,total_earnings').eq('user_id', profile.id).single()
      .then(({ data }) => { if (data) { setAvailable(data.available_mode); setEarnings(data.total_earnings || 0) } })
  }, [profile?.id])

  async function toggleAvailable() {
    const newVal = !available
    setAvailable(newVal)
    await supabase.from('referee_profiles').upsert({ user_id: profile.id, available_mode: newVal }, { onConflict: 'user_id' })
    if (newVal) refresh()
  }

  async function handleAccept(matchId) {
    await acceptMatch(matchId)
    refresh()
  }

  const card = { background:'var(--white)',borderRadius:'16px',padding:'16px',border:'1px solid var(--border)',marginBottom:'10px' }

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'var(--bg)',minHeight:'100vh'}}>
      <div style={{background:'var(--navy)',padding:'0 16px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:800,color:'#fff'}}>Find<span style={{color:'var(--green)'}}>My</span>Match</div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'10px',fontWeight:600,color:'var(--green)',background:'rgba(0,201,123,0.15)',padding:'3px 8px',borderRadius:'20px',textTransform:'uppercase'}}>Referee</div>
          <button onClick={signOut} style={{background:'transparent',border:'none',color:'#64748B',fontSize:'12px',fontWeight:600}}>Sign out</button>
        </div>
      </div>

      <div style={{background:'var(--navy)',padding:'20px 16px 28px'}}>
        <div style={{fontSize:'12px',color:'#64748B',marginBottom:'4px'}}>Ready to work,</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:800,color:'#fff'}}>{profile?.full_name?.split(' ')[0]} <span style={{color:'var(--green)'}}>{profile?.full_name?.split(' ').slice(1).join(' ')}</span></div>
      </div>

      <div style={{padding:'16px 16px 80px'}}>
        {/* Available toggle */}
        <div style={{background:'var(--navy2)',borderRadius:'16px',padding:'20px',marginBottom:'16px',border:`1px solid ${available?'rgba(0,201,123,0.25)':'rgba(255,255,255,0.05)'}`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
            <div>
              <div style={{fontSize:'11px',fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'4px'}}>Available Mode</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:800,color:available?'var(--green)':'#64748B'}}>
                <span style={{display:'inline-block',width:'10px',height:'10px',borderRadius:'50%',background:available?'var(--green)':'#475569',marginRight:'8px',boxShadow:available?'0 0 0 3px rgba(0,201,123,0.2)':'none'}}></span>
                {available ? 'Online — Accepting Jobs' : 'Offline'}
              </div>
            </div>
            <div onClick={toggleAvailable} style={{width:'42px',height:'24px',borderRadius:'12px',background:available?'var(--green)':'#475569',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
              <div style={{position:'absolute',top:'3px',left:available?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'left .2s'}}></div>
            </div>
          </div>
          <div style={{fontSize:'12px',color:'#64748B'}}>{available ? 'You are visible to match hosts. Open requests appear below.' : 'Turn on to receive and accept nearby match requests.'}</div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
          <div style={{background:'var(--white)',borderRadius:'14px',padding:'16px',border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,color:'var(--green)'}}>{openMatches.length}</div>
            <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>Open Jobs</div>
          </div>
          <div style={{background:'var(--white)',borderRadius:'14px',padding:'16px',border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800}}>${earnings}</div>
            <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>Earned This Week</div>
          </div>
        </div>

        {/* Open requests */}
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'12px'}}>Open Match Requests</div>
        {!available && <div style={{padding:'16px',background:'#FFF8E7',borderRadius:'12px',fontSize:'13px',color:'#B45309',marginBottom:'12px'}}>Turn on Available Mode to see and accept requests.</div>}
        {available && (openLoading ? <div style={{textAlign:'center',color:'var(--slate)',padding:'20px'}}>Loading...</div>
          : openMatches.length === 0 ? <div style={{...card,textAlign:'center',color:'var(--slate)',padding:'24px',fontSize:'13px'}}>No open requests nearby right now</div>
          : openMatches.map(m=>(
            <div key={m.id} style={card}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'12px'}}>
                <div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'var(--green)',textTransform:'uppercase',letterSpacing:'0.5px'}}>{sportEmoji[m.sport]} {m.sport}</div>
                  <div style={{fontSize:'15px',fontWeight:700,marginTop:'2px'}}>{m.title}</div>
                </div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800,color:'var(--green)'}}>${m.pay_rate}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px'}}>
                {[['📍 Location',m.location],['👥 Teams',`${m.team1_name} vs ${m.team2_name}`],['🛎 Service',m.service==='full_referee'?'Full Referee':'Scoring Only'],['📅 When',m.scheduled_at?new Date(m.scheduled_at).toLocaleDateString():'TBD']].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:'11px',color:'var(--slate)'}}>{k}</div><div style={{fontSize:'12px',fontWeight:600,marginTop:'2px'}}>{v}</div></div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <button onClick={()=>handleAccept(m.id)} style={{padding:'11px',borderRadius:'10px',border:'none',background:'var(--green)',color:'var(--navy)',fontWeight:700,fontSize:'13px'}}>✓ Accept Job</button>
                <button style={{padding:'11px',borderRadius:'10px',border:'1px solid var(--border)',background:'transparent',color:'var(--slate)',fontWeight:600,fontSize:'13px'}}>✕ Decline</button>
              </div>
            </div>
          )))}

        {/* Confirmed jobs */}
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,margin:'20px 0 12px'}}>My Confirmed Jobs</div>
        {confirmedJobs.length === 0
          ? <div style={{...card,textAlign:'center',color:'var(--slate)',padding:'24px',fontSize:'13px'}}>No confirmed jobs yet</div>
          : confirmedJobs.map(m=>(
            <div key={m.id} style={card}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'#EEF2FF',borderRadius:'20px',padding:'5px 12px',fontSize:'11px',fontWeight:700,color:'var(--purple)',marginBottom:'12px'}}>✓ Confirmed</div>
              <div style={{fontSize:'15px',fontWeight:700,marginBottom:'4px'}}>{m.title}</div>
              <div style={{fontSize:'12px',color:'var(--slate)',marginBottom:'14px'}}>{sportEmoji[m.sport]} {m.sport} · {m.location}</div>
              {m.status === 'confirmed' && <button onClick={()=>startMatch(m.id).then(()=>nav(`/score/${m.id}`))} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'var(--red)',color:'white',fontWeight:700,fontSize:'13px'}}>🔴 Start Live Scoring</button>}
              {m.status === 'live' && <button onClick={()=>nav(`/score/${m.id}`)} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'var(--red)',color:'white',fontWeight:700,fontSize:'13px',animation:'pulse 2s infinite'}}>🔴 Continue Scoring</button>}
            </div>
          ))}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'var(--white)',borderTop:'1px solid var(--border)',display:'flex',padding:'8px 0 12px',zIndex:90}}>
        {[['🏠','Home',()=>{}],['🔴','Score',()=>confirmedJobs[0]&&nav(`/score/${confirmedJobs[0].id}`)],['⚙️','Admin',()=>nav('/admin')]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'10px',fontWeight:600,color:'var(--slate)'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
