import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatches, useOpenMatches } from '../hooks/useMatches'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐'}

export default function RefereeDash() {
  const { profile, signOut } = useAuth()
  const nav = useNavigate()
  const { matches, acceptMatch, startMatch } = useMatches()
  const { matches: openMatches, loading: openLoading, refresh } = useOpenMatches()
  const [available, setAvailable] = useState(false)
  const [earnings, setEarnings] = useState(0)
  const confirmedJobs = matches.filter(m=>m.referee_id===profile?.id&&(m.status==='confirmed'||m.status==='live'))

  useEffect(()=>{
    if(!profile?.id) return
    supabase.from('referee_profiles').select('available_mode,total_earnings').eq('user_id',profile.id).single().then(({data})=>{if(data){setAvailable(data.available_mode);setEarnings(data.total_earnings||0)}})
  },[profile?.id])

async function toggleAvailable(){
  const v=!available; setAvailable(v)
  if(v && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async pos => {
      await supabase.from('referee_profiles').upsert({
        user_id:profile.id,
        available_mode:true,
        latitude:pos.coords.latitude,
        longitude:pos.coords.longitude
      },{onConflict:'user_id'})
      refresh()
    }, async () => {
      await supabase.from('referee_profiles').upsert({user_id:profile.id,available_mode:true},{onConflict:'user_id'})
      refresh()
    })
  } else {
    await supabase.from('referee_profiles').upsert({user_id:profile.id,available_mode:v},{onConflict:'user_id'})
    if(v) refresh()
  }
}

  const card = {background:'rgba(255,255,255,0.03)',borderRadius:'16px',padding:'16px',border:'1px solid rgba(255,255,255,0.06)',marginBottom:'10px'}

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'9px',fontWeight:800,color:'#F63676',background:'rgba(246,54,118,0.1)',padding:'3px 8px',borderRadius:'20px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',border:'1px solid rgba(246,54,118,0.2)'}}>REFEREE</div>
          <button onClick={signOut} style={{background:'transparent',border:'none',color:'#757070',fontSize:'12px',fontFamily:'DM Sans,sans-serif'}}>Sign out</button>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'24px 16px 32px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontSize:'11px',color:'#757070',marginBottom:'4px',fontFamily:'Montserrat,sans-serif',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase'}}>Ready to work,</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'26px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>{profile?.full_name?.split(' ')[0]} <span style={{color:'#F63676'}}>{profile?.full_name?.split(' ').slice(1).join(' ')}</span></div>
      </div>

      <div style={{padding:'16px 16px 80px'}}>
        {/* Available toggle */}
        <div style={{background:available?'rgba(246,54,118,0.08)':'rgba(255,255,255,0.02)',borderRadius:'16px',padding:'20px',marginBottom:'16px',border:`1px solid ${available?'rgba(246,54,118,0.25)':'rgba(255,255,255,0.05)'}`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
            <div>
              <div style={{fontSize:'10px',fontWeight:800,color:'#757070',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px',fontFamily:'Montserrat,sans-serif'}}>Available Mode</div>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'16px',fontWeight:900,color:available?'#F63676':'#757070',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:available?'#F63676':'#757070',boxShadow:available?'0 0 0 3px rgba(246,54,118,0.2)':'none'}}></div>
                {available?'ONLINE — ACCEPTING JOBS':'OFFLINE'}
              </div>
            </div>
            <div onClick={toggleAvailable} style={{width:'46px',height:'26px',borderRadius:'13px',background:available?'#F63676':'rgba(255,255,255,0.1)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
              <div style={{position:'absolute',top:'3px',left:available?'23px':'3px',width:'20px',height:'20px',borderRadius:'50%',background:'white',transition:'left .2s'}}></div>
            </div>
          </div>
          <div style={{fontSize:'12px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{available?'You are visible to players. Open match requests appear below.':'Turn on to receive nearby match requests.'}</div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
          <div style={{background:'rgba(246,54,118,0.08)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(246,54,118,0.15)'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color:'#F63676'}}>{openMatches.length}</div>
            <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>Open Jobs</div>
          </div>
          <div style={{background:'rgba(237,255,0,0.05)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(237,255,0,0.1)'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color:'#EDFF00'}}>${earnings}</div>
            <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>Earned This Week</div>
          </div>
        </div>

        {/* Open requests */}
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Open Match Requests</div>
        {!available&&<div style={{padding:'14px',background:'rgba(237,255,0,0.05)',borderRadius:'10px',fontSize:'13px',color:'#EDFF00',marginBottom:'12px',border:'1px solid rgba(237,255,0,0.1)',fontFamily:'DM Sans,sans-serif'}}>Turn on Available Mode to see and accept requests.</div>}
        {available&&(openLoading?<div style={{textAlign:'center',color:'#757070',padding:'20px'}}>Loading...</div>
          :openMatches.length===0?<div style={{...card,textAlign:'center',color:'#757070',padding:'24px',fontSize:'13px',fontFamily:'DM Sans,sans-serif'}}>No open requests nearby right now</div>
          :openMatches.map(m=>(
            <div key={m.id} style={card}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'12px'}}>
                <div>
                  <div style={{fontSize:'10px',fontWeight:800,color:'#F63676',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif'}}>{sportEmoji[m.sport]} {m.sport}</div>
                  <div style={{fontSize:'15px',fontWeight:700,marginTop:'2px',color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{m.title}</div>
                </div>
                <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,color:'#EDFF00'}}>${m.pay_rate}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px'}}>
                {[['📍 Location',m.location],['👥 Teams',`${m.team1_name} vs ${m.team2_name}`],['🛎 Service',m.service==='full_referee'?'Full Referee':'Scorer Only'],['📅 When',m.scheduled_at?new Date(m.scheduled_at).toLocaleDateString():'TBD']].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:'10px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{k}</div><div style={{fontSize:'12px',fontWeight:600,marginTop:'2px',color:'#FFFFFF',fontFamily:'DM Sans,sans-serif'}}>{v}</div></div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <button onClick={()=>acceptMatch(m.id).then(()=>refresh())} style={{padding:'12px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontWeight:800,fontSize:'12px',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>✓ ACCEPT</button>
                <button style={{padding:'12px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#757070',fontWeight:600,fontSize:'12px',fontFamily:'Montserrat,sans-serif'}}>✕ Decline</button>
              </div>
            </div>
          )))}

        {/* Confirmed jobs */}
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',margin:'20px 0 12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>My Confirmed Jobs</div>
        {confirmedJobs.length===0
          ?<div style={{...card,textAlign:'center',color:'#757070',padding:'24px',fontSize:'13px',fontFamily:'DM Sans,sans-serif'}}>No confirmed jobs yet</div>
          :confirmedJobs.map(m=>(
            <div key={m.id} style={card}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(139,92,246,0.1)',borderRadius:'20px',padding:'4px 12px',fontSize:'10px',fontWeight:800,color:'#8B5CF6',marginBottom:'12px',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',border:'1px solid rgba(139,92,246,0.2)'}}>✓ CONFIRMED</div>
              <div style={{fontSize:'15px',fontWeight:700,marginBottom:'4px',color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{m.title}</div>
              <div style={{fontSize:'12px',color:'#757070',marginBottom:'14px',fontFamily:'DM Sans,sans-serif'}}>{sportEmoji[m.sport]} {m.sport} · {m.location}</div>
              {m.status==='confirmed'&&<button onClick={()=>startMatch(m.id).then(()=>nav(`/score/${m.id}`))} style={{width:'100%',padding:'13px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontWeight:800,fontSize:'12px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>🔴 START LIVE SCORING</button>}
              {m.status==='live'&&<button onClick={()=>nav(`/score/${m.id}`)} style={{width:'100%',padding:'13px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontWeight:800,fontSize:'12px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>🔴 CONTINUE SCORING</button>}
            </div>
          ))}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#0A0000',borderTop:'1px solid rgba(246,54,118,0.1)',display:'flex',padding:'8px 0 14px',zIndex:90}}>
        {[['🏠','Home',()=>{}],['🔴','Score',()=>confirmedJobs[0]&&nav(`/score/${confirmedJobs[0].id}`)],['⚙️','Admin',()=>nav('/admin')]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'9px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
