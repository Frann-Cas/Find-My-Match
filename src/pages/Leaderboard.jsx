import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

const TIERS = {
  elite:{label:'Elite Ref',color:'#EDFF00',min:50},
  pro:{label:'Pro Ref',color:'#F63676',min:20},
  rising:{label:'Rising Ref',color:'#8B5CF6',min:5},
  rookie:{label:'Rookie',color:'#757070',min:0},
}

function getTier(matches) {
  if(matches>=50) return 'elite'
  if(matches>=20) return 'pro'
  if(matches>=5) return 'rising'
  return 'rookie'
}

export default function Leaderboard() {
  const nav = useNavigate()
  const [referees, setReferees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(()=>{
    fetchLeaderboard()
  },[])

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from('referee_profiles')
      .select('*, profiles(full_name, avatar_url, location)')
      .order('total_matches', { ascending: false })
    setReferees(data||[])
    setLoading(false)
  }

  const filtered = filter==='all' ? referees : referees.filter(r=>getTier(r.total_matches)===filter)

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <button onClick={()=>nav('/signup')} style={{background:'rgba(246,54,118,0.1)',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'8px',padding:'6px 14px',fontSize:'11px',fontWeight:700,color:'#F63676',fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>JOIN FREE</button>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'20px 16px 24px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>🏆 GLOBAL <span style={{color:'#F63676'}}>LEADERBOARD</span></div>
        <div style={{fontSize:'12px',color:'#757070',marginTop:'4px',fontFamily:'DM Sans,sans-serif'}}>The world's top refs — ranked by matches scored</div>
      </div>

      <!-- Tier legend -->
      <div style={{display:'flex',gap:'8px',padding:'16px',overflowX:'auto'}}>
        {[['all','All'],['elite','Elite'],['pro','Pro'],['rising','Rising'],['rookie','Rookie']].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{padding:'7px 14px',borderRadius:'8px',border:`1px solid ${filter===id?'#F63676':'rgba(255,255,255,0.06)'}`,background:filter===id?'rgba(246,54,118,0.1)':'transparent',color:filter===id?'#F63676':'#757070',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif',cursor:'pointer',whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:'0 16px 80px'}}>
        {loading ? <div style={{textAlign:'center',color:'#757070',padding:'40px'}}>Loading...</div>
        : filtered.length === 0 ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontFamily:'DM Sans,sans-serif'}}>No referees found</div>
        : filtered.map((ref,i)=>{
          const tier = getTier(ref.total_matches)
          const t = TIERS[tier]
          const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':null
          return (
            <div key={ref.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'14px',padding:'14px 16px',border:`1px solid ${i<3?t.color+'30':'rgba(255,255,255,0.06)'}`,marginBottom:'10px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{fontFamily:'Montserrat,sans-serif',fontSize:medal?'24px':'16px',fontWeight:900,color:t.color,width:'32px',textAlign:'center',flexShrink:0}}>
                {medal||`#${i+1}`}
              </div>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',background:`${t.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',border:`2px solid ${t.color}40`,flexShrink:0}}>
                🧑‍⚖️
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{ref.profiles?.full_name}</div>
                <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{ref.profiles?.location||'Global'} · ⭐ {ref.rating||'5.0'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'18px',fontWeight:900,color:t.color}}>{ref.total_matches||0}</div>
                <div style={{fontSize:'9px',color:'#757070',fontFamily:'DM Sans,sans-serif',textTransform:'uppercase',letterSpacing:'0.5px'}}>matches</div>
                <div style={{fontSize:'9px',fontWeight:800,color:t.color,fontFamily:'Montserrat,sans-serif',marginTop:'2px'}}>{t.label}</div>
              </div>
            </div>
          )
        })}

        <div style={{background:'rgba(246,54,118,0.05)',borderRadius:'14px',padding:'20px',border:'1px solid rgba(246,54,118,0.1)',marginTop:'16px',textAlign:'center'}}>
          <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'14px',fontWeight:900,color:'#FFFFFF',marginBottom:'6px'}}>Want to be on this list?</div>
          <div style={{fontSize:'12px',color:'#757070',marginBottom:'16px',fontFamily:'DM Sans,sans-serif'}}>Sign up as a referee and start scoring matches to climb the global rankings.</div>
          <button onClick={()=>nav('/signup')} style={{padding:'12px 24px',borderRadius:'10px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>JOIN AS REFEREE</button>
        </div>
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#0A0000',borderTop:'1px solid rgba(246,54,118,0.1)',padding:'12px 16px',display:'flex',gap:'8px',zIndex:90}}>
        <button onClick={()=>nav('/live-feed')} style={{flex:1,padding:'12px',borderRadius:'10px',border:'1px solid rgba(246,54,118,0.3)',background:'transparent',color:'#F63676',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>📺 LIVE FEED</button>
        <button onClick={()=>nav('/signup')} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>JOIN FREE</button>
      </div>
    </div>
  )
}