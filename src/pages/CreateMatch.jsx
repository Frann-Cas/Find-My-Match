import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'

const SPORTS = [{id:'Tennis',icon:'🎾'},{id:'Padel',icon:'🏓'},{id:'Pickleball',icon:'🏓'},{id:'Basketball',icon:'🏀'},{id:'Soccer',icon:'⚽'},{id:'Volleyball',icon:'🏐'}]

export default function CreateMatch() {
  const nav = useNavigate()
  const { createMatch } = useMatches()
  const [form, setForm] = useState({ title:'', sport:'Tennis', team1_name:'', team2_name:'', location:'', scheduled_at:'', pay_rate:50, service:'full_referee', is_public:true, notes:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await createMatch(form)
    if (error) { setError(error.message); setLoading(false) }
    else nav('/dashboard')
  }

  const inp = { width:'100%',padding:'11px 14px',borderRadius:'10px',border:'1px solid var(--border)',fontSize:'14px',background:'var(--bg)',outline:'none',marginTop:'6px',color:'var(--navy)' }
  const sec = { background:'var(--white)',borderRadius:'16px',padding:'18px',border:'1px solid var(--border)',marginBottom:'14px' }
  const secTitle = { fontSize:'13px',fontWeight:700,color:'var(--navy)',marginBottom:'14px' }

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'var(--bg)',minHeight:'100vh'}}>
      <div style={{background:'var(--navy)',padding:'0 16px',height:'56px',display:'flex',alignItems:'center',gap:'12px',position:'sticky',top:0,zIndex:100}}>
        <button onClick={()=>nav(-1)} style={{background:'rgba(255,255,255,0.08)',border:'none',color:'#fff',width:'36px',height:'36px',borderRadius:'10px',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:'16px',fontWeight:800,color:'#fff'}}>New Match Request</div>
      </div>

      <form onSubmit={handleSubmit} style={{padding:'16px 16px 100px'}}>
        {error && <div style={{background:'#FEF2F2',color:'var(--red)',padding:'10px 14px',borderRadius:'10px',fontSize:'13px',marginBottom:'14px'}}>{error}</div>}

        {/* Sport */}
        <div style={sec}>
          <div style={secTitle}>🏆 Select Sport</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {SPORTS.map(s=>(
              <div key={s.id} onClick={()=>set('sport',s.id)} style={{border:`1.5px solid ${form.sport===s.id?'var(--green)':'var(--border)'}`,borderRadius:'10px',padding:'10px 6px',cursor:'pointer',textAlign:'center',background:form.sport===s.id?'var(--green-pale)':'var(--white)',transition:'all .2s'}}>
                <div style={{fontSize:'22px',marginBottom:'4px'}}>{s.icon}</div>
                <div style={{fontSize:'10px',fontWeight:700}}>{s.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={sec}>
          <div style={secTitle}>📋 Match Details</div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',fontWeight:600,display:'block'}}>Match Title<input style={inp} value={form.title} onChange={e=>set('title',e.target.value)} required placeholder="e.g. Sunday Friendly — Court A" /></label></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',fontWeight:600,display:'block'}}>Date & Time<input style={inp} type="datetime-local" value={form.scheduled_at} onChange={e=>set('scheduled_at',e.target.value)} required /></label></div>
          <div><label style={{fontSize:'12px',fontWeight:600,display:'block'}}>Location<input style={inp} value={form.location} onChange={e=>set('location',e.target.value)} required placeholder="Venue name or address" /></label></div>
        </div>

        {/* Teams */}
        <div style={sec}>
          <div style={secTitle}>👥 Players / Teams</div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',fontWeight:600,display:'block'}}>Team / Player 1<input style={inp} value={form.team1_name} onChange={e=>set('team1_name',e.target.value)} required placeholder="e.g. Team Alpha" /></label></div>
          <div><label style={{fontSize:'12px',fontWeight:600,display:'block'}}>Team / Player 2<input style={inp} value={form.team2_name} onChange={e=>set('team2_name',e.target.value)} required placeholder="e.g. Team Bravo" /></label></div>
        </div>

        {/* Service & Pay */}
        <div style={sec}>
          <div style={secTitle}>💰 Service & Pay</div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',fontWeight:600,display:'block'}}>Pay Rate ($)<input style={inp} type="number" min="10" max="500" value={form.pay_rate} onChange={e=>set('pay_rate',Number(e.target.value))} /></label></div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:'13px',fontWeight:500}}>Service Type</div>
              <div style={{fontSize:'11px',color:'var(--slate)'}}>Full referee or scoring only</div>
            </div>
            <select value={form.service} onChange={e=>set('service',e.target.value)} style={{padding:'7px 10px',borderRadius:'8px',border:'1px solid var(--border)',fontSize:'12px',fontWeight:600,color:'var(--navy)',background:'var(--bg)'}}>
              <option value="full_referee">Full Referee</option>
              <option value="scoring_only">Scoring Only</option>
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:'13px',fontWeight:500}}>Public Match</div>
              <div style={{fontSize:'11px',color:'var(--slate)'}}>Viewers can follow live</div>
            </div>
            <div onClick={()=>set('is_public',!form.is_public)} style={{width:'42px',height:'24px',borderRadius:'12px',background:form.is_public?'var(--green)':'var(--border)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
              <div style={{position:'absolute',top:'3px',left:form.is_public?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'left .2s'}}></div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={sec}>
          <div style={secTitle}>📝 Notes for Referee</div>
          <textarea style={{...inp,resize:'vertical',minHeight:'80px'}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any special requirements or instructions..." />
        </div>

        <button type="submit" disabled={loading} style={{width:'100%',padding:'15px',borderRadius:'14px',border:'none',background:'var(--green)',color:'var(--navy)',fontSize:'16px',fontWeight:700,opacity:loading?0.7:1}}>
          {loading ? 'Posting...' : '🚀 Post Match Request'}
        </button>
      </form>
    </div>
  )
}
