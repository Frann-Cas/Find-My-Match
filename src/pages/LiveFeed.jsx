import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

const sportEmoji = {Tennis:'🎾',Padel:'🏓',Pickleball:'🏓',Basketball:'🏀',Soccer:'⚽',Volleyball:'🏐','Beach Tennis':'🎾','Beach Volleyball':'🏐',Baseball:'⚾'}
const statusStyle = {
  open:{bg:'rgba(237,255,0,0.1)',color:'#EDFF00',label:'UPCOMING'},
  confirmed:{bg:'rgba(139,92,246,0.1)',color:'#8B5CF6',label:'STARTING SOON'},
  live:{bg:'rgba(246,54,118,0.1)',color:'#F63676',label:'🔴 LIVE'},
  finished:{bg:'rgba(117,112,112,0.1)',color:'#757070',label:'FINISHED'},
}

export default function LiveFeed() {
  const nav = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(()=>{
    fetchMatches()
    const sub = supabase.channel('live-feed')
      .on('postgres_changes',{event:'*',schema:'public',table:'matches'},()=>fetchMatches())
      .subscribe()
    return ()=>supabase.removeChannel(sub)
  },[])

  async function fetchMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*, profiles!matches_host_id_fkey(full_name), referee:profiles!matches_referee_id_fkey(full_name), live_scores(*)')
      .eq('is_public', true)
      .in('status', ['open','confirmed','live','finished'])
      .order('created_at', { ascending: false })
      .limit(50)
    setMatches(data||[])
    setLoading(false)
  }

  const filtered = filter === 'all' ? matches : matches.filter(m=>m.status===filter)

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <button onClick={()=>nav('/login')} style={{background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'8px',padding:'6px 14px',fontSize:'11px',fontWeight:700,color:'#F63676',fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>JOIN FREE</button>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'20px 16px 24px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>LIVE <span style={{color:'#F63676'}}>FEED</span></div>
        <div style={{fontSize:'12px',color:'#757070',marginTop:'4px',fontFamily:'DM Sans,sans-serif'}}>Live matches happening right now · Join to book refs</div>
      </div>

      <div style={{display:'flex',gap:'8px',padding:'16px',overflowX:'auto'}}>
        {[['all','All'],['live','🔴 Live'],['confirmed','Starting Soon'],['open','Upcoming'],['finished','Finished']].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{padding:'7px 14px',borderRadius:'8px',border:`1px solid ${filter===id?'#F63676':'rgba(255,255,255,0.06)'}`,background:filter===id?'rgba(246,54,118,0.1)':'transparent',color:filter===id?'#F63676':'#757070',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif',cursor:'pointer',whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:'0 16px 80px'}}>
        {loading ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontFamily:'DM Sans,sans-serif'}}>Loading matches...</div>
        : filtered.length === 0 ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontFamily:'DM Sans,sans-serif'}}>No matches found</div>
        : filtered.map(m=>{
          const ss = statusStyle[m.status]||statusStyle.open
          const isLive = m.status==='live'
          return (
            <div key={m.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'16px',padding:'16px',border:`1px solid ${isLive?'rgba(246,54,118,0.2)':'rgba(255,255,255,0.06)'}`,marginBottom:'12px',cursor:isLive?'pointer':'default'}} onClick={()=>isLive&&m.viewer_token&&nav(`/live/${m.viewer_token}`)}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(246,54,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>{sportEmoji[m.sport]||'🏆'}</div>
                  <div>
                    <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{m.title}</div>
                    <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{m.sport} · {m.location}</div>
                  </div>
                </div>
                <div style={{background:ss.bg,color:ss.color,fontSize:'9px',fontWeight:800,padding:'4px 10px',borderRadius:'20px',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',whiteSpace:'nowrap'}}>{ss.label}</div>
              </div>

              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontSize:'12px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{m.team1_name} vs {m.team2_name}</div>
                {m.referee&&<div style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>🧑‍⚖️ {m.referee.full_name}</div>}
              </div>

              {isLive && m.live_scores?.[0] && (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginTop:'12px',padding:'12px',background:'rgba(246,54,118,0.08)',borderRadius:'10px',border:'1px solid rgba(246,54,118,0.15)'}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'32px',fontWeight:900,color:'#FFFFFF'}}>{m.live_scores[0].score1}</div>
                    <div style={{fontSize:'10px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{m.team1_name}</div>
                  </div>
                  <div style={{fontSize:'14px',color:'rgba(255,255,255,0.2)',fontWeight:700}}>VS</div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'32px',fontWeight:900,color:'#FFFFFF'}}>{m.live_scores[0].score2}</div>
                    <div style={{fontSize:'10px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{m.team2_name}</div>
                  </div>
                </div>
              )}

              {isLive && m.viewer_token && (
                <button onClick={()=>nav(`/live/${m.viewer_token}`)} style={{width:'100%',marginTop:'10px',padding:'10px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'12px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase',cursor:'pointer'}}>
                  WATCH LIVE →
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#0A0000',borderTop:'1px solid rgba(246,54,118,0.1)',padding:'12px 16px',display:'flex',gap:'8px',zIndex:90}}>
        <button onClick={()=>nav('/signup')} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>JOIN FREE</button>
        <button onClick={()=>nav('/leaderboard')} style={{flex:1,padding:'12px',borderRadius:'10px',border:'1px solid rgba(246,54,118,0.3)',background:'transparent',color:'#F63676',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>🏆 LEADERBOARD</button>
      </div>
    </div>
  )
}