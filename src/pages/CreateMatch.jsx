import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import { Logo } from '../components/Logo'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SPORTS = [{id:'Tennis',icon:'🎾'},{id:'Padel',icon:'🏓'},{id:'Pickleball',icon:'🏓'},{id:'Basketball',icon:'🏀'},{id:'Soccer',icon:'⚽'},{id:'Volleyball',icon:'🏐'}]

export default function CreateMatch() {
  const nav = useNavigate()
  const { createMatch } = useMatches()
  const [form, setForm] = useState({title:'',sport:'Tennis',team1_name:'',team2_name:'',location:'',scheduled_at:'',pay_rate:50,service:'full_referee',is_public:true,notes:''})
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v)=>setForm(f=>({...f,[k]:v}))

  async function handleSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    const submitForm = {...form, scheduled_at: selectedDate ? selectedDate.toISOString() : ''}
    const {error}=await createMatch(submitForm)
    if(error){setError(error.message);setLoading(false)}
    else nav('/dashboard')
  }

  const inp = {width:'100%',padding:'12px 14px',borderRadius:'8px',border:'1px solid rgba(246,54,118,0.15)',fontSize:'14px',background:'rgba(255,255,255,0.03)',outline:'none',marginTop:'6px',color:'#FFFFFF',fontFamily:'DM Sans,sans-serif'}
  const sec = {background:'rgba(255,255,255,0.02)',borderRadius:'14px',padding:'18px',border:'1px solid rgba(255,255,255,0.05)',marginBottom:'12px'}
  const secTitle = {fontSize:'11px',fontWeight:800,color:'#F63676',marginBottom:'14px',fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}

  return (
    <div style={{maxWidth:'480px',margin:'0 auto',background:'#0A0000',minHeight:'100vh'}}>
      <style>{`
        .react-datepicker { background:#1A000A!important; border:1px solid rgba(246,54,118,0.2)!important; font-family:'DM Sans',sans-serif!important; border-radius:12px!important; }
        .react-datepicker__header { background:#0A0000!important; border-bottom:1px solid rgba(246,54,118,0.15)!important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color:#FFFFFF!important; font-weight:700!important; }
        .react-datepicker__day { color:#FFFFFF!important; border-radius:8px!important; }
        .react-datepicker__day:hover { background:rgba(246,54,118,0.2)!important; color:#F63676!important; }
        .react-datepicker__day--selected { background:#F63676!important; color:#FFFFFF!important; }
        .react-datepicker__navigation-icon::before { border-color:#F63676!important; }
        .react-datepicker__day--outside-month { color:#757070!important; }
        .react-datepicker__time-container { border-left:1px solid rgba(246,54,118,0.15)!important; }
        .react-datepicker__time { background:#1A000A!important; }
        .react-datepicker__time-list-item { color:#FFFFFF!important; }
        .react-datepicker__time-list-item:hover { background:rgba(246,54,118,0.2)!important; }
        .react-datepicker__time-list-item--selected { background:#F63676!important; color:#FFFFFF!important; }
        .react-datepicker-wrapper { width:100%; }
        .date-input { width:100%; padding:12px 14px; border-radius:8px; border:1px solid rgba(246,54,118,0.15); font-size:14px; background:rgba(255,255,255,0.03); outline:none; margin-top:6px; color:#FFFFFF; font-family:'DM Sans',sans-serif; cursor:pointer; }
        .date-input::placeholder { color:#757070; }
      `}</style>

      <div style={{background:'#0A0000',padding:'0 16px',height:'58px',display:'flex',alignItems:'center',gap:'12px',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(246,54,118,0.1)'}}>
        <button onClick={()=>nav(-1)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#FFFFFF',width:'36px',height:'36px',borderRadius:'8px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>←</button>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'14px',fontWeight:900,color:'#FFFFFF',letterSpacing:'0.5px',textTransform:'uppercase'}}>Post Match Request</div>
      </div>

      <div style={{background:'linear-gradient(135deg,#140008 0%,#0A0000 100%)',padding:'20px 16px 24px',borderBottom:'3px solid transparent',borderImage:'linear-gradient(90deg,#F63676,#757070,#EDFF00) 1'}}>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:'11px',color:'#757070',letterSpacing:'1px',textTransform:'uppercase'}}>Fill in the details — referees will see this instantly</div>
      </div>

      <form onSubmit={handleSubmit} style={{padding:'16px 16px 100px'}}>
        {error&&<div style={{background:'rgba(246,54,118,0.1)',color:'#F63676',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'14px',border:'1px solid rgba(246,54,118,0.2)'}}>{error}</div>}

        <div style={sec}>
          <div style={secTitle}>🏆 Select Sport</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {SPORTS.map(s=>(
              <div key={s.id} onClick={()=>set('sport',s.id)} style={{border:`1.5px solid ${form.sport===s.id?'#F63676':'rgba(255,255,255,0.06)'}`,borderRadius:'10px',padding:'10px 6px',cursor:'pointer',textAlign:'center',background:form.sport===s.id?'rgba(246,54,118,0.08)':'rgba(255,255,255,0.02)'}}>
                <div style={{fontSize:'22px',marginBottom:'4px'}}>{s.icon}</div>
                <div style={{fontSize:'10px',fontWeight:700,color:form.sport===s.id?'#F63676':'#757070',fontFamily:'Montserrat,sans-serif',textTransform:'uppercase'}}>{s.id}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={sec}>
          <div style={secTitle}>📋 Match Details</div>
          <div style={{marginBottom:'12px'}}>
            <label style={{fontSize:'10px',fontWeight:700,color:'#757070',display:'block',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.8px',textTransform:'uppercase'}}>Match Title</label>
            <input style={inp} value={form.title} onChange={e=>set('title',e.target.value)} required placeholder="e.g. Sunday Friendly — Court A"/>
          </div>
          <div style={{marginBottom:'12px'}}>
            <label style={{fontSize:'10px',fontWeight:700,color:'#757070',display:'block',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.8px',textTransform:'uppercase'}}>Location</label>
            <input style={inp} value={form.location} onChange={e=>set('location',e.target.value)} required placeholder="Venue name or address"/>
          </div>
          <div>
            <label style={{fontSize:'10px',fontWeight:700,color:'#757070',display:'block',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.8px',textTransform:'uppercase'}}>Date & Time</label>
            <DatePicker
              selected={selectedDate}
              onChange={date=>setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Click to select date and time"
              className="date-input"
              minDate={new Date()}
            />
          </div>
        </div>

        <div style={sec}>
          <div style={secTitle}>👥 Players / Teams</div>
          <div style={{marginBottom:'12px'}}>
            <label style={{fontSize:'10px',fontWeight:700,color:'#757070',display:'block',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.8px',textTransform:'uppercase'}}>Team / Player 1</label>
            <input style={inp} value={form.team1_name} onChange={e=>set('team1_name',e.target.value)} required placeholder="e.g. Team Alpha"/>
          </div>
          <div>
            <label style={{fontSize:'10px',fontWeight:700,color:'#757070',display:'block',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.8px',textTransform:'uppercase'}}>Team / Player 2</label>
            <input style={inp} value={form.team2_name} onChange={e=>set('team2_name',e.target.value)} required placeholder="e.g. Team Bravo"/>
          </div>
        </div>

        <div style={sec}>
          <div style={secTitle}>💰 Service & Pay</div>
          <div style={{marginBottom:'12px'}}>
            <label style={{fontSize:'10px',fontWeight:700,color:'#757070',display:'block',fontFamily:'Montserrat,sans-serif',letterSpacing:'0.8px',textTransform:'uppercase'}}>Pay Rate ($)</label>
            <input style={inp} type="number" min="10" max="500" value={form.pay_rate} onChange={e=>set('pay_rate',Number(e.target.value))}/>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <div>
              <div style={{fontSize:'13px',fontWeight:500,color:'#FFFFFF',fontFamily:'DM Sans,sans-serif'}}>Service Type</div>
              <div style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>Full referee or scoring only</div>
            </div>
            <select value={form.service} onChange={e=>set('service',e.target.value)} style={{padding:'8px 10px',borderRadius:'8px',border:'1px solid rgba(246,54,118,0.15)',fontSize:'12px',fontWeight:600,color:'#FFFFFF',background:'rgba(255,255,255,0.05)',fontFamily:'Montserrat,sans-serif'}}>
              <option value="full_referee">Full Referee</option>
              <option value="scoring_only">Scorer Only</option>
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <div>
              <div style={{fontSize:'13px',fontWeight:500,color:'#FFFFFF',fontFamily:'DM Sans,sans-serif'}}>Public Match</div>
              <div style={{fontSize:'11px',color:'#757070',fontFamily:'DM Sans,sans-serif'}}>Viewers can follow live</div>
            </div>
            <div onClick={()=>set('is_public',!form.is_public)} style={{width:'46px',height:'26px',borderRadius:'13px',background:form.is_public?'#F63676':'rgba(255,255,255,0.1)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
              <div style={{position:'absolute',top:'3px',left:form.is_public?'23px':'3px',width:'20px',height:'20px',borderRadius:'50%',background:'white',transition:'left .2s'}}></div>
            </div>
          </div>
        </div>

        <div style={sec}>
          <div style={secTitle}>📝 Notes for Referee</div>
          <textarea style={{...inp,resize:'vertical',minHeight:'80px'}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any special requirements or instructions..."/>
        </div>

        <button type="submit" disabled={loading} style={{width:'100%',padding:'15px',borderRadius:'12px',border:'none',background:'#F63676',color:'#FFFFFF',fontSize:'13px',fontWeight:800,opacity:loading?0.7:1,fontFamily:'Montserrat,sans-serif',letterSpacing:'1px',textTransform:'uppercase'}}>
          {loading?'POSTING...':'🚀 POST MATCH REQUEST'}
        </button>
      </form>
    </div>
  )
}