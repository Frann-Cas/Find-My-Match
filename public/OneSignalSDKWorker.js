import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SPORTS = ['Tennis','Padel','Pickleball','Basketball','Soccer','Volleyball','Beach Tennis','Beach Volleyball']
const LEVELS = ['beginner','intermediate','advanced','pro']
const LEVEL_COLORS = {beginner:'#10B981',intermediate:'#EDFF00',advanced:'#F63676',pro:'#8B5CF6'}
const LEVEL_LABELS = {beginner:'Beginner',intermediate:'Intermediate',advanced:'Advanced',pro:'Pro'}

const playerIcon = (level) => new L.DivIcon({
  html: `<div style="background:${LEVEL_COLORS[level]||'#F63676'};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #0A0000;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🎾</div>`,
  className:'',iconSize:[36,36],iconAnchor:[18,18],
})

const lobbyIcon = new L.DivIcon({
  html: `<div style="background:#EDFF00;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #0A0000;box-shadow:0 2px 8px rgba(237,255,0,0.4)">🏟</div>`,
  className:'',iconSize:[40,40],iconAnchor:[20,20],
})

export default function FindPartner() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('map')
  const [playerPos, setPlayerPos] = useState([18.4655,-66.1057])
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [openLobbies, setOpenLobbies] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [showSetup, setShowSetup] = useState(false)
  const [showLobby, setShowLobby] = useState(false)
  const [setup, setSetup] = useState({sports:[],skill_level:'beginner',bio:''})
  const [lobby, setLobby] = useState({title:'',sport:'Padel',skill_level:'intermediate',location:'',scheduled_at:'',spots_total:4,notes:''})
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    navigator.geolocation?.getCurrentPosition(
      pos=>setPlayerPos([pos.coords.latitude,pos.coords.longitude]),
      ()=>{}
    )
    fetchData()
  },[])

  async function fetchData() {
    const [{data:pp},{data:players},{data:lobbies}] = await Promise.all([
      supabase.from('player_profiles').select('*').eq('user_id',profile?.id).single(),
      supabase.from('player_profiles').select('*,profiles(full_name)').eq('available_to_play',true),
      supabase.from('open_lobbies').select('*,profiles(full_name)').eq('status','open').order('created_at',{ascending:false}),
    ])
    if(pp){setMyProfile(pp);setAvailable(pp.available_to_play);setSetup({sports:pp.sports||[],skill_level:pp.skill_level||'beginner',bio:pp.bio||''})}
    else setShowSetup(true)
    setAvailablePlayers(players||[])
    setOpenLobbies(lobbies||[])
  }

  async function saveProfile() {
    setLoading(true)
    const {error} = await supabase.from('player_profiles').upsert({
      user_id:profile.id,...setup
    },{onConflict:'user_id'})
    if(!error){setMyProfile({...setup});setShowSetup(false)}
    setLoading(false)
  }

  async function toggleAvailable() {
    const v=!available; setAvailable(v)
    navigator.geolocation?.getCurrentPosition(async pos=>{
      await supabase.from('player_profiles').upsert({
        user_id:profile.id,available_to_play:v,
        latitude:pos.coords.latitude,longitude:pos.coords.longitude
      },{onConflict:'user_id'})
      fetchData()
    },async()=>{
      await supabase.from('player_profiles').upsert({user_id:profile.id,available_to_play:v},{onConflict:'user_id'})
      fetchData()
    })
  }

  async function createLobby(e) {
    e.preventDefault(); setLoading(true)
    navigator.geolocation?.getCurrentPosition(async pos=>{
      await supabase.from('open_lobbies').insert({
        host_id:profile.id,...lobby,
        latitude:pos.coords.latitude,longitude:pos.coords.longitude,
        scheduled_at:new Date(lobby.scheduled_at).toISOString()
      })
      setShowLobby(false); fetchData(); setLoading(false)
    },async()=>{
      await supabase.from('open_lobbies').insert({host_id:profile.id,...lobby,scheduled_at:new Date(lobby.scheduled_at).toISOString()})
      setShowLobby(false); fetchData(); setLoading(false)
    })
  }

  async function requestJoin(lobbyId) {
    await supabase.from('lobby_requests').insert({lobby_id:lobbyId,player_id:profile.id})
    alert('Request sent! The host will be notified.')
  }

  const inp = {width:'100%',padding:'11px 14px',borderRadius:'8px',border:'1px solid rgba(246,54,118,0.2)',fontSize:'14px',background:'rgba(255,255,255,0.05)',outline:'none',marginTop:'6px',color:'#FFFFFF',fontFamily:'DM Sans,sans-serif'}
  const sec = {background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.06)',marginBottom:'12px'}

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <style>{`
        .leaflet-container{background:#1A000A}
        .leaflet-popup-content-wrapper{background:#1A000A;border:1px solid rgba(246,54,118,0.3);color:#FFFFFF;border-radius:12px}
        .leaflet-popup-tip{background:#1A000A}
      `}</style>

      {/* Topbar */}
      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:1000,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <button onClick={()=>nav(-1)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#FFFFFF',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',fontFamily:'Montserrat,sans-serif',fontWeight:700}}>← BACK</button>
      </div>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'20px 16px 24px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>FIND MY <span style={{color:'#F63676'}}>PARTNER</span></div>
        <div style={{fontSize:'12px',color:'#757070',marginTop:'4px',fontFamily:'DM Sans,sans-serif'}}>Find players near you · Open lobbies · Play now</div>
      </div>

      {/* Setup popup */}
      {showSetup && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'#140008',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'400px'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'18px',fontWeight:900,color:'#FFFFFF',marginBottom:'6px'}}>SET UP YOUR PLAYER PROFILE</div>
            <div style={{fontSize:'12px',color:'#757070',marginBottom:'20px',fontFamily:'DM Sans,sans-serif'}}>Tell others who you are and your level</div>
            <div style={{marginBottom:'14px'}}>
              <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Your Sports</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {SPORTS.map(s=>(
                  <div key={s} onClick={()=>setSetup(f=>({...f,sports:f.sports.includes(s)?f.sports.filter(x=>x!==s):[...f.sports,s]}))} style={{padding:'6px 12px',borderRadius:'20px',border:`1px solid ${setup.sports.includes(s)?'#F63676':'rgba(255,255,255,0.1)'}`,background:setup.sports.includes(s)?'rgba(246,54,118,0.1)':'transparent',color:setup.sports.includes(s)?'#F63676':'#757070',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'Montserrat,sans-serif'}}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginBottom:'14px'}}>
              <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Skill Level</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {LEVELS.map(l=>(
                  <div key={l} onClick={()=>setSetup(f=>({...f,skill_level:l}))} style={{padding:'10px',borderRadius:'10px',border:`1px solid ${setup.skill_level===l?LEVEL_COLORS[l]:'rgba(255,255,255,0.08)'}`,background:setup.skill_level===l?`${LEVEL_COLORS[l]}15`:'transparent',cursor:'pointer',textAlign:'center'}}>
                    <div style={{fontSize:'12px',fontWeight:800,color:setup.skill_level===l?LEVEL_COLORS[l]:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>{LEVEL_LABELS[l]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginBottom:'20px'}}>
              <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Bio (optional)</div>
              <textarea style={{...inp,minHeight:'60px',resize:'vertical'}} value={setup.bio} onChange={e=>setSetup(f=>({...f,bio:e.target.value}))} placeholder="e.g. Padel player, love doubles games on weekends"/>
            </div>
            <button onClick={saveProfile} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:'10px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>
              {loading?'SAVING...':'SAVE PROFILE'}
            </button>
          </div>
        </div>
      )}

      {/* Create Lobby popup */}
      {showLobby && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
          <div style={{background:'#140008',border:'1px solid rgba(246,54,118,0.3)',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'400px'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'18px',fontWeight:900,color:'#FFFFFF',marginBottom:'20px'}}>OPEN A LOBBY</div>
            <form onSubmit={createLobby}>
              {[['Title','text','title','e.g. Padel doubles — Need 2 more!'],['Location','text','location','Court name or address']].map(([label,type,key,ph])=>(
                <div key={key} style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>{label}</div>
                  <input style={inp} type={type} value={lobby[key]} onChange={e=>setLobby(f=>({...f,[key]:e.target.value}))} required placeholder={ph}/>
                </div>
              ))}
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>Date & Time</div>
                <input style={inp} type="datetime-local" value={lobby.scheduled_at} onChange={e=>setLobby(f=>({...f,scheduled_at:e.target.value}))} required/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                <div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>Sport</div>
                  <select value={lobby.sport} onChange={e=>setLobby(f=>({...f,sport:e.target.value}))} style={{...inp,marginTop:0}}>
                    {SPORTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>Level</div>
                  <select value={lobby.skill_level} onChange={e=>setLobby(f=>({...f,skill_level:e.target.value}))} style={{...inp,marginTop:0}}>
                    {LEVELS.map(l=><option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>Spots Needed</div>
                <select value={lobby.spots_total} onChange={e=>setLobby(f=>({...f,spots_total:Number(e.target.value)}))} style={{...inp,marginTop:0}}>
                  {[2,3,4,6,8].map(n=><option key={n} value={n}>{n} players total</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'8px'}}>
                <button type="button" onClick={()=>setShowLobby(false)} style={{padding:'13px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#757070',fontSize:'12px',fontWeight:700,fontFamily:'Montserrat,sans-serif'}}>CANCEL</button>
                <button type="submit" disabled={loading} style={{padding:'13px',borderRadius:'10px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'12px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px'}}>
                  {loading?'CREATING...':'OPEN LOBBY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{padding:'16px',paddingBottom:'80px'}}>
        {/* My profile bar */}
        {myProfile && (
          <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'14px 16px',border:'1px solid rgba(255,255,255,0.06)',marginBottom:'14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'11px',color:'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'4px'}}>Your Level</div>
              <div style={{fontSize:'14px',fontWeight:800,color:LEVEL_COLORS[myProfile.skill_level]||'#F63676',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>{LEVEL_LABELS[myProfile.skill_level]}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{fontSize:'11px',color:available?'#F63676':'#757070',fontFamily:'Montserrat,sans-serif',fontWeight:700}}>{available?'● AVAILABLE':'○ OFFLINE'}</div>
              <div onClick={toggleAvailable} style={{width:'46px',height:'26px',borderRadius:'13px',background:available?'#F63676':'rgba(255,255,255,0.1)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:'3px',left:available?'23px':'3px',width:'20px',height:'20px',borderRadius:'50%',background:'white',transition:'left .2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}}>
          <button onClick={()=>setShowLobby(true)} style={{padding:'13px',borderRadius:'12px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'12px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>
            🏟 Open Lobby
          </button>
          <button onClick={()=>setShowSetup(true)} style={{padding:'13px',borderRadius:'12px',border:'1px solid rgba(246,54,118,0.3)',background:'transparent',color:'#F63676',fontSize:'12px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>
            ✏️ Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {[['map','🗺️ Map'],['lobbies','🏟 Open Lobbies'],['players','👥 Players']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 12px',borderRadius:'8px',border:`1px solid ${tab===id?'#F63676':'rgba(255,255,255,0.06)'}`,background:tab===id?'rgba(246,54,118,0.1)':'transparent',color:tab===id?'#F63676':'#757070',fontSize:'10px',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif',cursor:'pointer',whiteSpace:'nowrap'}}>
              {label}
            </button>
          ))}
        </div>

        {/* Map tab */}
        {tab==='map' && (
          <div style={{borderRadius:'16px',overflow:'hidden',border:'1px solid rgba(246,54,118,0.2)'}}>
            <MapContainer center={playerPos} zoom={13} style={{height:'400px',width:'100%'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors'/>
              {/* Available players */}
              {availablePlayers.map(p=>p.latitude&&p.longitude&&(
                <Marker key={p.id} position={[p.latitude,p.longitude]} icon={playerIcon(p.skill_level)}>
                  <Popup>
                    <div style={{textAlign:'center',minWidth:'130px'}}>
                      <div style={{fontWeight:700,color:'#FFFFFF',fontSize:'14px'}}>{p.profiles?.full_name}</div>
                      <div style={{fontSize:'11px',color:LEVEL_COLORS[p.skill_level],marginTop:'4px',fontWeight:700}}>{LEVEL_LABELS[p.skill_level]}</div>
                      <div style={{fontSize:'11px',color:'#757070',marginTop:'2px'}}>{p.sports?.join(', ')}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Open lobbies */}
              {openLobbies.map(l=>l.latitude&&l.longitude&&(
                <Marker key={l.id} position={[l.latitude,l.longitude]} icon={lobbyIcon}>
                  <Popup>
                    <div style={{textAlign:'center',minWidth:'150px'}}>
                      <div style={{fontWeight:700,color:'#FFFFFF',fontSize:'13px'}}>{l.title}</div>
                      <div style={{fontSize:'11px',color:'#EDFF00',marginTop:'4px'}}>{l.sport} · {LEVEL_LABELS[l.skill_level]}</div>
                      <div style={{fontSize:'11px',color:'#757070',marginTop:'2px'}}>{l.spots_filled}/{l.spots_total} players</div>
                      <button onClick={()=>requestJoin(l.id)} style={{marginTop:'8px',padding:'6px 12px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'11px',fontWeight:700,cursor:'pointer',width:'100%'}}>Request to Join</button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Lobbies tab */}
        {tab==='lobbies' && (
          openLobbies.length===0
            ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontFamily:'DM Sans,sans-serif'}}>No open lobbies right now. Be the first to open one!</div>
            : openLobbies.map(l=>(
              <div key={l.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.06)',marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                  <div>
                    <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{l.title}</div>
                    <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{l.sport} · {l.location}</div>
                  </div>
                  <div style={{background:`${LEVEL_COLORS[l.skill_level]}20`,border:`1px solid ${LEVEL_COLORS[l.skill_level]}50`,color:LEVEL_COLORS[l.skill_level],fontSize:'9px',fontWeight:800,padding:'3px 8px',borderRadius:'20px',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase',whiteSpace:'nowrap'}}>{LEVEL_LABELS[l.skill_level]}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>👤 {l.profiles?.full_name} · 🕐 {new Date(l.scheduled_at).toLocaleDateString()}</div>
                  <div style={{fontSize:'12px',fontWeight:700,color:'#EDFF00',fontFamily:'Montserrat,sans-serif'}}>{l.spots_filled}/{l.spots_total} spots</div>
                </div>
                <button onClick={()=>requestJoin(l.id)} style={{width:'100%',padding:'11px',borderRadius:'8px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'12px',fontWeight:800,fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>
                  REQUEST TO JOIN
                </button>
              </div>
            ))
        )}

        {/* Players tab */}
        {tab==='players' && (
          availablePlayers.length===0
            ? <div style={{textAlign:'center',color:'#757070',padding:'40px',fontFamily:'DM Sans,sans-serif'}}>No players available right now.</div>
            : availablePlayers.map(p=>(
              <div key={p.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'14px',padding:'14px',border:'1px solid rgba(255,255,255,0.06)',marginBottom:'10px',display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background:`${LEVEL_COLORS[p.skill_level]}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',border:`2px solid ${LEVEL_COLORS[p.skill_level]}50`,flexShrink:0}}>🎾</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{p.profiles?.full_name}</div>
                  <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{p.sports?.join(', ')}</div>
                  {p.bio&&<div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif',fontStyle:'italic'}}>"{p.bio}"</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'11px',fontWeight:800,color:LEVEL_COLORS[p.skill_level],fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>{LEVEL_LABELS[p.skill_level]}</div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}