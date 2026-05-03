import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AdminPanel() {
  const { signOut } = useAuth()
  const nav = useNavigate()
  const [stats, setStats] = useState({ users:0, matches:0, live:0, referees:0 })
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id,full_name,email,role,created_at').order('created_at',{ascending:false}).limit(20),
      supabase.from('matches').select('id,title,sport,status,location,pay_rate,team1_name,team2_name,created_at').order('created_at',{ascending:false}).limit(20),
    ]).then(([{data:u},{data:m}]) => {
      setUsers(u||[])
      setMatches(m||[])
      setStats({
        users: u?.length||0,
        matches: m?.length||0,
        live: m?.filter(x=>x.status==='live').length||0,
        referees: u?.filter(x=>x.role==='referee').length||0,
      })
    })
  }, [])

  const statusColor = {open:'#B45309',confirmed:'var(--purple)',live:'var(--red)',finished:'#15803D',canceled:'var(--slate)'}
  const roleColor = {player:'var(--navy)',referee:'var(--purple)',viewer:'#B45309',facility:'var(--blue)',admin:'var(--red)'}

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'var(--bg)',minHeight:'100vh'}}>
      <div style={{background:'var(--navy)',padding:'0 16px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:800,color:'#fff'}}>Find<span style={{color:'var(--green)'}}>My</span>Match</div>
        <button onClick={signOut} style={{background:'transparent',border:'none',color:'#64748B',fontSize:'12px',fontWeight:600}}>Sign out</button>
      </div>

      <div style={{background:'var(--navy)',padding:'20px 16px 28px'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:800,color:'#fff'}}>Admin Panel</div>
        <div style={{fontSize:'12px',color:'#64748B',marginTop:'4px'}}>Platform overview & management</div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',padding:'16px',paddingBottom:'0'}}>
        {[['Total Users',stats.users,'var(--navy)'],['Active Referees',stats.referees,'var(--purple)'],['Total Matches',stats.matches,'var(--navy)'],['Live Now',stats.live,'var(--red)']].map(([label,val,color])=>(
          <div key={label} style={{background:'var(--white)',borderRadius:'14px',padding:'16px',border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'28px',fontWeight:800,color}}>{val}</div>
            <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'3px'}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'8px',padding:'16px',paddingBottom:'0'}}>
        {['overview','matches','users'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 14px',borderRadius:'8px',border:`1px solid ${tab===t?'var(--navy)':'var(--border)'}`,background:tab===t?'var(--navy)':'var(--white)',color:tab===t?'var(--white)':'var(--navy)',fontSize:'12px',fontWeight:700,textTransform:'capitalize',transition:'all .2s'}}>{t}</button>
        ))}
      </div>

      <div style={{padding:'16px',paddingBottom:'80px'}}>
        {tab==='overview' && (
          <>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'12px'}}>Recent Matches</div>
            {matches.slice(0,5).map(m=>(
              <div key={m.id} style={{background:'var(--white)',borderRadius:'14px',padding:'14px',border:'1px solid var(--border)',marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'13px',fontWeight:700}}>{m.title}</div>
                  <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>{m.sport} · {m.location}</div>
                </div>
                <div style={{fontSize:'10px',fontWeight:700,padding:'4px 10px',borderRadius:'20px',background:`${statusColor[m.status]}18`,color:statusColor[m.status]||'var(--slate)',textTransform:'uppercase'}}>{m.status}</div>
              </div>
            ))}
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,margin:'20px 0 12px'}}>Switch View</div>
            {[['👤 Player Dashboard',()=>nav('/dashboard'),'var(--navy)'],['🧑‍⚖️ Referee Dashboard',()=>nav('/referee'),'var(--purple)']].map(([label,action,bg])=>(
              <button key={label} onClick={action} style={{width:'100%',padding:'13px',borderRadius:'12px',border:'none',background:bg,color:'white',fontSize:'14px',fontWeight:700,marginBottom:'10px',textAlign:'left',paddingLeft:'16px'}}>{label}</button>
            ))}
          </>
        )}
        {tab==='matches' && (
          <>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'12px'}}>All Matches ({matches.length})</div>
            {matches.map(m=>(
              <div key={m.id} style={{background:'var(--white)',borderRadius:'14px',padding:'14px',border:'1px solid var(--border)',marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                  <div style={{fontSize:'13px',fontWeight:700}}>{m.title}</div>
                  <div style={{fontSize:'10px',fontWeight:700,padding:'4px 10px',borderRadius:'20px',background:`${statusColor[m.status]}18`,color:statusColor[m.status]||'var(--slate)'}}>{m.status}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {[['Sport',m.sport],['Pay',`$${m.pay_rate}`],['Teams',`${m.team1_name} vs ${m.team2_name}`],['Location',m.location]].map(([k,v])=>(
                    <div key={k}><span style={{fontSize:'10px',color:'var(--slate)'}}>{k}: </span><span style={{fontSize:'11px',fontWeight:600}}>{v}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        {tab==='users' && (
          <>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:700,marginBottom:'12px'}}>All Users ({users.length})</div>
            {users.map(u=>(
              <div key={u.id} style={{background:'var(--white)',borderRadius:'14px',padding:'14px',border:'1px solid var(--border)',marginBottom:'8px',display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:700,flexShrink:0,color:'var(--green)'}}>{u.full_name?.[0]||'?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:700}}>{u.full_name}</div>
                  <div style={{fontSize:'11px',color:'var(--slate)',marginTop:'2px'}}>{u.email}</div>
                </div>
                <div style={{fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'20px',background:`${roleColor[u.role]||'var(--navy)'}18`,color:roleColor[u.role]||'var(--navy)',textTransform:'uppercase'}}>{u.role}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'var(--white)',borderTop:'1px solid var(--border)',display:'flex',padding:'8px 0 12px',zIndex:90}}>
        {[['🏠','Player',()=>nav('/dashboard')],['🧑‍⚖️','Referee',()=>nav('/referee')],['⚙️','Admin',()=>{}]].map(([icon,label,action])=>(
          <div key={label} onClick={action} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer'}}>
            <div style={{fontSize:'20px'}}>{icon}</div>
            <div style={{fontSize:'10px',fontWeight:600,color:label==='Admin'?'var(--green)':'var(--slate)'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
