import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

export default function AdminPanel() {
  const { signOut } = useAuth()
  const nav = useNavigate()
  const [stats, setStats] = useState({users:0,matches:0,live:0,referees:0})
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(()=>{
    Promise.all([
      supabase.from('profiles').select('id,full_name,email,role,created_at').order('created_at',{ascending:false}).limit(20),
      supabase.from('matches').select('id,title,sport,status,location,pay_rate,team1_name,team2_name,created_at').order('created_at',{ascending:false}).limit(20),
    ]).then(([{data:u},{data:m}])=>{
      setUsers(u||[]); setMatches(m||[])
      setStats({users:u?.length||0,matches:m?.length||0,live:m?.filter(x=>x.status==='live').length||0,referees:u?.filter(x=>x.role==='referee').length||0})
    })
  },[])

  const statusColor = {open:'#EDFF00',confirmed:'#8B5CF6',live:'#F63676',finished:'#10B981',canceled:'#757070'}
  const roleColor = {player:'#FFFFFF',referee:'#F63676',viewer:'#EDFF00',facility:'#8B5CF6',admin:'#F63676'}

  const card = {background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'14px',border:'1px solid rgba(255,255,255,0.05)',marginBottom:'8px'}

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <Logo size="sm" />
        <button onClick={signOut} style={{background:'transparent',border:'none',color:'#757070',fontSize:'12px',fontFamily:'DM Sans,sans-serif'}}>Sign out</button>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'24px 16px 32px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'22px',fontWeight:900,color:'#FFFFFF',letterSpacing:'-0.5px'}}>ADMIN PANEL</div>
        <div style={{fontSize:'12px',color:'#757070',marginTop:'4px',fontFamily:'DM Sans,sans-serif'}}>Platform overview & management</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',padding:'16px',paddingBottom:'0'}}>
        {[['Total Users',stats.users,'#FFFFFF'],['Active Referees',stats.referees,'#F63676'],['Total Matches',stats.matches,'#EDFF00'],['Live Now',stats.live,'#F63676']].map(([label,val,color])=>(
          <div key={label} style={{background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'30px',fontWeight:900,color}}>{val}</div>
            <div style={{fontSize:'11px',color:'#757070',marginTop:'3px',fontFamily:'DM Sans,sans-serif'}}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:'8px',padding:'16px',paddingBottom:'0'}}>
        {['overview','matches','users'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 14px',borderRadius:'8px',border:`1px solid ${tab===t?'#F63676':'rgba(255,255,255,0.06)'}`,background:tab===t?'rgba(246,54,118,0.1)':'transparent',color:tab===t?'#F63676':'#757070',fontSize:'11px',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif'}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:'16px',paddingBottom:'80px'}}>
        {tab==='overview'&&(
          <>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Recent Matches</div>
            {matches.slice(0,5).map(m=>(
              <div key={m.id} style={{...card,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{m.title}</div>
                  <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{m.sport} · {m.location}</div>
                </div>
                <div style={{fontSize:'9px',fontWeight:800,padding:'4px 10px',borderRadius:'20px',background:`${statusColor[m.status]||'#757070'}18`,color:statusColor[m.status]||'#757070',textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif',border:`1px solid ${statusColor[m.status]||'#757070'}30`}}>{m.status}</div>
              </div>
            ))}
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',margin:'20px 0 12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Switch View</div>
            {[['👤 Player Dashboard',()=>nav('/dashboard'),'#FFFFFF'],['🧑‍⚖️ Referee Dashboard',()=>nav('/referee'),'#F63676']].map(([label,action,color])=>(
              <button key={label} onClick={action} style={{width:'100%',padding:'13px',borderRadius:'10px',border:`1px solid ${color}30`,background:`${color}08`,color,fontSize:'13px',fontWeight:700,marginBottom:'10px',textAlign:'left',paddingLeft:'16px',fontFamily:'Montserrat,sans-serif'}}>{label}</button>
            ))}
          </>
        )}
        {tab==='matches'&&(
          <>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>All Matches ({matches.length})</div>
            {matches.map(m=>(
              <div key={m.id} style={card}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{m.title}</div>
                  <div style={{fontSize:'9px',fontWeight:800,padding:'4px 10px',borderRadius:'20px',background:`${statusColor[m.status]||'#757070'}18`,color:statusColor[m.status]||'#757070',fontFamily:'Montserrat,sans-serif',border:`1px solid ${statusColor[m.status]||'#757070'}30`}}>{m.status}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {[['Sport',m.sport],['Pay',`$${m.pay_rate}`],['Teams',`${m.team1_name} vs ${m.team2_name}`],['Location',m.location]].map(([k,v])=>(
                    <div key={k}><span style={{fontSize:'10px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>{k}: </span><span style={{fontSize:'11px',fontWeight:600,color:'#FFFFFF',fontFamily:'DM Sans,sans-serif'}}>{v}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        {tab==='users'&&(
          <>
            <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'13px',fontWeight:800,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'0.5px',textTransform:'uppercase'}}>All Users ({users.length})</div>
            {users.map(u=>(
              <div key={u.id} style={{...card,display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(246,54,118,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:700,flexShrink:0,color:'#F63676',fontFamily:'Montserrat,sans-serif',border:'1px solid rgba(246,54,118,0.2)'}}>{u.full_name?.[0]||'?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#FFFFFF',fontFamily:'Montserrat,sans-serif'}}>{u.full_name}</div>
                  <div style={{fontSize:'11px',color:'#757070',marginTop:'2px',fontFamily:'DM Sans,sans-serif'}}>{u.email}</div>
                </div>
                <div style={{fontSize:'9px',fontWeight:800,padding:'3px 8px',borderRadius:'20px',background:`${roleColor[u.role]||'#FFFFFF'}10`,color:roleColor[u.role]||'#FFFFFF',textTransform:'uppercase',letterSpacing:'0.5px',fontFamily:'Montserrat,sans-serif',border:`1px solid ${roleColor[u.role]||'#FFFFFF'}20`}}>{u.role}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#0A0000',borderTop:'1px solid rgba(246,54,118,0.1)',display:'flex',padding:'8px 0 14px',zIndex:90}}>
        {[['🏠','Player',()=>nav('/dashboard')],['🧑‍⚖️','Referee',()=>nav('/referee')],['⚙️','Admin',()=>{}]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'9px',fontWeight:700,color:label==='Admin'?'#F63676':'#757070',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.5px',textTransform:'uppercase'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
