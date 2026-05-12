import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatches } from '../hooks/useMatches'
import { Logo } from '../components/Logo'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { supabase } from '../lib/supabase'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const refIcon = new L.DivIcon({
  html: `<div style="background:#F63676;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #FFFFFF;box-shadow:0 2px 8px rgba(246,54,118,0.5)">🧑‍⚖️</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const playerIcon = new L.DivIcon({
  html: `<div style="background:#EDFF00;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #0A0000;box-shadow:0 2px 8px rgba(237,255,0,0.5)">📍</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

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
        <div>
          <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{match.title}</div>
          <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{match.sport} · {match.location}</div>
        </div>
        <div style={{background:ss.bg,border:`1px solid ${ss.border}`,color:ss.color,fontSize:'9px',fontWeight:800,padding:'4px 10px',borderRadius:'20px',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif'}}>{ss.label}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{fontSize:'14px',fontWeight:800,color:'#F63676',fontFamily:'Montserrat,sans-serif'}}>{match.pay_rate?`$${match.pay_rate}`:''}</div>
        <div style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{match.team1_name} vs {match.team2_name}</div>
      </div>
    </div>
  )
}

export default function PlayerDash() {
  const { profile, signOut } = useAuth()
  const { matches, loading } = useMatches()
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState('map')
  const [playerPos, setPlayerPos] = useState(null)
  const [availableRefs, setAvailableRefs] = useState([])
  const [locError, setLocError] = useState('')
  const liveCount = matches.filter(m=>m.status==='live'||m.status==='confirmed').length

  useEffect(()=>{
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setPlayerPos([pos.coords.latitude, pos.coords.longitude]),
        () => {
          setPlayerPos([18.4655, -66.1057])
          setLocError('Using default location — San Juan, PR')
        }
      )
    } else {
      setPlayerPos([18.4655, -66.1057])
    }
  }, [])

  useEffect(()=>{
    supabase.from('referee_profiles').select('*, profiles(full_name, avatar_url)').eq('available_mode', true).then(({data}) => setAvailableRefs(data||[]))
  }, [])

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <style>{`
        .leaflet-container { background: #1A000A; }
        .leaflet-popup-content-wrapper { background: #1A000A; border: 1px solid rgba(246,54,118,0.3); color: #FFFFFF; border-radius: 12px; }
        .leaflet-popup-tip { background: #1A000A; }
        .leaflet-popup-content { color: #FFFFFF; font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:1000,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'9px',fontWeight:800,color:'#F63676',background:'rgba(246,54,118,0.1)',padding:'3px 8px',borderRadius:'20px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'Montserrat,sans-serif',border:'1px solid rgba(246,54,118,0.2)'}}>{profile?.role}</div>
          <button onClick={signOut} style={{background:'transparent',border:'none',color:'#757070',fontSize:'12px',fontFamily:'DM Sans,sans-serif'}}>Sign out</button>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'20px 16px 24px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontSize:'11px',color:'#757070',marginBottom:'4px',fontFamily:'Montserrat,sans-serif',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase'}}>Good to see you,</div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'24px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>{profile?.full_name?.split(' ')[0]} <span style={{color:'#F63676'}}>{profile?.full_name?.split(' ').slice(1).join(' ')}</span></div>
      </div>

<div onClick={()=>setActiveTab('matches')} style={{background:'rgba(255,255,255,0.03)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.06)',cursor:'pointer'}}>
  <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color:'#FFFFFF'}}>{matches.length}</div>
  <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>Total Matches</div>
</div>
<div onClick={()=>setActiveTab('map')} style={{background:'rgba(246,54,118,0.08)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(246,54,118,0.15)',cursor:'pointer'}}>
  <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color:'#F63676'}}>{availableRefs.length}</div>
  <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>Refs Available Now</div>
</div>

      <div style={{padding:'16px',paddingBottom:'0'}}>
        <button onClick={()=>nav('/create-match')} style={{width:'100%',padding:'15px',borderRadius:'12px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>
          + POST MATCH REQUEST
<button onClick={()=>nav('/find-partner')} style={{width:'100%',padding:'15px',borderRadius:'12px',border:'1px solid rgba(246,54,118,0.3)',background:'transparent',color:'#F63676',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase',marginTop:'10px'}}>
  🎾 FIND MY PARTNER
</button>
        </button>
      </div>

      <div style={{display:'flex',gap:'8px',padding:'16px',paddingBottom:'0'}}>
        {[['map','🗺️ Live Map'],['matches','📋 My Matches']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'8px 16px',borderRadius:'8px',border:`1px solid ${activeTab===id?'#F63676':'rgba(255,255,255,0.06)'}`,background:activeTab===id?'rgba(246,54,118,0.1)':'transparent',color:activeTab===id?'#F63676':'#757070',fontSize:'11px',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif',cursor:'pointer'}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:'16px',paddingBottom:'80px'}}>
        {activeTab==='map' && (
          <>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'8px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Available Referees Near You</div>
            {locError && <div style={{fontSize:'11px',color:'#EDFF00',marginBottom:'8px',fontFamily:'DM Sans,sans-serif'}}>⚠️ {locError}</div>}
            {playerPos && (
              <div style={{borderRadius:'16px',overflow:'hidden',border:'1px solid rgba(246,54,118,0.2)',marginBottom:'16px'}}>
                <MapContainer center={playerPos} zoom={13} style={{height:'320px',width:'100%'}} zoomControl={true}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors'/>
                  <Marker position={playerPos} icon={playerIcon}>
                    <Popup>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontWeight:700,color:'#FFFFFF'}}>📍 You are here</div>
                        <div style={{fontSize:'12px',color:'#757070',marginTop:'4px'}}>{profile?.full_name}</div>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle center={playerPos} radius={3000} pathOptions={{color:'#F63676',fillColor:'#F63676',fillOpacity:0.05,weight:1,dashArray:'5,5'}}/>
                  {availableRefs.map(ref=>(
                    ref.latitude && ref.longitude && (
                      <Marker key={ref.id} position={[ref.latitude, ref.longitude]} icon={refIcon}>
                        <Popup>
                          <div style={{textAlign:'center',minWidth:'140px'}}>
                            <div style={{fontWeight:700,color:'#FFFFFF',fontSize:'14px'}}>{ref.profiles?.full_name}</div>
                            <div style={{fontSize:'11px',color:'#F63676',marginTop:'4px'}}>⭐ {ref.rating} · {ref.sports?.join(', ')}</div>
                            <div style={{fontSize:'11px',color:'#757070',marginTop:'2px'}}>${ref.hourly_rate}/match</div>
                            <button onClick={()=>nav('/create-match')} style={{marginTop:'8px',padding:'6px 12px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'11px',fontWeight:700,cursor:'pointer',width:'100%'}}>Book This Ref</button>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            )}
            {availableRefs.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'24px',textAlign:'center',border:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontSize:'24px',marginBottom:'8px'}}>🧑‍⚖️</div>
                <div style={{fontSize:'13px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>No referees available right now.</div>
                <div style={{fontSize:'11px',color:'#757070',marginTop:'4px',fontFamily:'DM Sans,sans-serif'}}>Post a match and we'll notify refs in your area!</div>
              </div>
            ) : availableRefs.map(ref=>(
              <div key={ref.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'14px',padding:'14px',border:'1px solid rgba(255,255,255,0.06)',marginBottom:'10px',display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'rgba(246,54,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',border:'1px solid rgba(246,54,118,0.2)',flexShrink:0}}>🧑‍⚖️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{ref.profiles?.full_name}</div>
                  <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>⭐ {ref.rating} · {ref.sports?.join(', ')}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'14px',fontWeight:800,color:'#EDFF00',fontFamily:'Montserrat,sans-serif'}}>${ref.hourly_rate}</div>
                  <div style={{fontSize:'10px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>per match</div>
                </div>
              </div>
            ))}
          </>
        )}
        {activeTab==='matches' && (
          <>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Your Matches</div>
            {loading ? <div style={{textAlign:'center',color:'#757070',padding:'40px'}}>Loading...</div>
              : matches.length === 0 ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontFamily:'DM Sans,sans-serif'}}>No matches yet. Post your first one!</div>
              : matches.map(m=><MatchCard key={m.id} match={m} />)}
          </>
        )}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#0A0000',borderTop:'1px solid rgba(246,54,118,0.1)',display:'flex',padding:'8px 0 14px',zIndex:90}}>
        {[['🗺️','Map',()=>setActiveTab('map')],['➕','Create',()=>nav('/create-match')],['⚙️','Admin',()=>nav('/admin')]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'9px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}