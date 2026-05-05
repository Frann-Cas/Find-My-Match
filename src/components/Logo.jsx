import { useNavigate } from 'react-router-dom'

export function Logo({ size = 'md', showTagline = false }) {
  const nav = useNavigate()
  const sizes = { sm:{h:16,t:16,s:9}, md:{h:22,t:22,s:10}, lg:{h:32,t:32,s:12} }
  const s = sizes[size]
  return (
    <div onClick={()=>nav('/')} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}>
      <div style={{display:'flex',gap:'3px',alignItems:'center'}}>
        <div style={{width:`${s.h*0.38}px`,height:`${s.h}px`,background:'#F63676',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
        <div style={{width:`${s.h*0.38}px`,height:`${s.h}px`,background:'#757070',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
        <div style={{width:`${s.h*0.38}px`,height:`${s.h}px`,background:'#EDFF00',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
      </div>
      <div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:`${s.t}px`,fontWeight:900,color:'#FFFFFF',lineHeight:1,letterSpacing:'-0.5px'}}>
          MY <span style={{color:'#F63676'}}>REFERI</span>
        </div>
        {showTagline && <div style={{fontFamily:'Montserrat,sans-serif',fontSize:`${s.s}px`,fontWeight:700,color:'#757070',letterSpacing:'2px',textTransform:'uppercase',marginTop:'2px'}}>— BY AREYA —</div>}
      </div>
    </div>
  )
}

export function LogoDark({ size = 'md', showTagline = false }) {
  const nav = useNavigate()
  const sizes = { sm:{h:16,t:16,s:9}, md:{h:22,t:22,s:10}, lg:{h:32,t:32,s:12} }
  const s = sizes[size]
  return (
    <div onClick={()=>nav('/')} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}>
      <div style={{display:'flex',gap:'3px',alignItems:'center'}}>
        <div style={{width:`${s.h*0.38}px`,height:`${s.h}px`,background:'#F63676',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
        <div style={{width:`${s.h*0.38}px`,height:`${s.h}px`,background:'#757070',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
        <div style={{width:`${s.h*0.38}px`,height:`${s.h}px`,background:'#EDFF00',transform:'skewX(-12deg)',borderRadius:'2px'}}></div>
      </div>
      <div>
        <div style={{fontFamily:'Montserrat,sans-serif',fontSize:`${s.t}px`,fontWeight:900,color:'#0A0000',lineHeight:1,letterSpacing:'-0.5px'}}>
          MY <span style={{color:'#F63676'}}>REFERI</span>
        </div>
        {showTagline && <div style={{fontFamily:'Montserrat,sans-serif',fontSize:`${s.s}px`,fontWeight:700,color:'#757070',letterSpacing:'2px',textTransform:'uppercase',marginTop:'2px'}}>— BY AREYA —</div>}
      </div>
    </div>
  )
}