import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const tg = window.Telegram?.WebApp;
const getInitData = () => tg?.initData || "";
const getTgUser = () => tg?.initDataUnsafe?.user || null;

async function api(path, options = {}) {
  const uid = getTgUser()?.id;
  const headers = {
    "Content-Type": "application/json",
    "X-Telegram-Init-Data": getInitData(),
  };
  if (!getInitData() && uid) headers["X-Dev-User-Id"] = String(uid);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
const apiGet  = (p) => api(p);
const apiPost = (p, b) => api(p, { method: "POST", body: b });

const T = {
  sbg:"#0d1209",sc:"#1a2412",sc2:"#222f17",sc3:"#2a3820",
  a:"#6b8f4e",ab:"#7aaa58",ad:"#4a5c3a",
  tm:"#eef2e8",tmu:"#7a9068",tmd:"#3d5030",bc:"#2a3820",
  red:"#e87c72",redbg:"#2a1010",redbr:"#4a1a1a",
  amber:"#d4a843",blue:"#5a9fd4",
};

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{background:${T.sbg};color:${T.tm};font-family:'DM Sans',sans-serif;min-height:100vh;}
    button{cursor:pointer;border:none;outline:none;font-family:'DM Sans',sans-serif;}
    input,textarea{font-family:'DM Sans',sans-serif;outline:none;}
    ::-webkit-scrollbar{width:0;}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(122,170,88,0);}50%{box-shadow:0 0 0 6px rgba(122,170,88,0.18);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes blink{0%,100%{border-color:${T.a};}50%{border-color:${T.ab};}}
    @keyframes sh{0%,100%{opacity:.5;}50%{opacity:1;}}
    .fi{animation:fadeIn .3s ease forwards;}
    .pu{animation:pulse 2.5s ease-in-out infinite;}
    .sp{animation:spin 1s linear infinite;}
    .bl{animation:blink 2s ease-in-out infinite;}
    .sh{animation:sh 1.8s ease-in-out infinite;}
  `}</style>
);

const Spin = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 0"}}>
    <div className="sp" style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${T.bc}`,borderTopColor:T.ab}}/>
  </div>
);
const Div = () => <div style={{height:1,background:T.bc,margin:"2px 0"}}/>;
const Bdg = ({children,v="green"}) => {
  const m={green:[T.ab,T.a,"rgba(107,143,78,.18)"],amber:[T.amber,"rgba(212,168,67,.35)","rgba(212,168,67,.15)"],red:[T.red,T.redbr,"rgba(232,124,114,.15)"],blue:[T.blue,"rgba(90,159,212,.3)","rgba(90,159,212,.15)"],purple:["#a09ae8","rgba(160,154,232,.3)","rgba(160,154,232,.15)"]}[v]||[T.ab,T.a,"rgba(107,143,78,.18)"];
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:m[2],color:m[0],border:`1px solid ${m[1]}`,whiteSpace:"nowrap"}}>{children}</span>;
};
const Ava = ({name="?",size=34}) => {
  const i=(name||"?").split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(107,143,78,.2)",border:`1px solid ${T.a}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.35,fontWeight:500,color:T.ab,flexShrink:0}}>{i}</div>;
};
const Tog = ({on,onToggle}) => (
  <div onClick={onToggle} style={{width:34,height:18,borderRadius:10,background:on?T.a:T.sc3,position:"relative",cursor:"pointer",transition:"background .2s",border:on?"none":`1px solid ${T.bc}`,flexShrink:0}}>
    <div style={{width:14,height:14,borderRadius:"50%",background:T.tm,position:"absolute",top:2,left:on?18:2,transition:"left .2s"}}/>
  </div>
);
const PBtn = ({children,onClick,disabled,loading,style={}}) => (
  <button onClick={onClick} disabled={disabled||loading} className={disabled||loading?"":"pu"}
    style={{background:disabled||loading?T.ad:T.a,color:T.tm,borderRadius:10,padding:"12px 0",width:"100%",fontSize:13,fontWeight:500,opacity:disabled||loading?.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,...style}}>
    {loading&&<div className="sp" style={{width:14,height:14,borderRadius:"50%",border:`2px solid rgba(255,255,255,.3)`,borderTopColor:T.tm}}/>}
    {children}
  </button>
);
const GBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{background:"transparent",color:T.ab,border:`1px solid ${T.bc}`,borderRadius:10,padding:"10px 0",width:"100%",fontSize:12,...style}}>{children}</button>
);
const Scr = ({children,style={}}) => (
  <div className="fi" style={{flex:1,overflowY:"auto",padding:"10px 14px 20px",display:"flex",flexDirection:"column",gap:8,...style}}>{children}</div>
);
const TNav = ({title,subtitle,onBack,rightEl}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px 8px",borderBottom:`1px solid ${T.bc}`,flexShrink:0}}>
    <div style={{width:64}}>
      {onBack&&<button onClick={onBack} style={{background:"none",display:"flex",alignItems:"center",gap:3,color:T.ab,fontSize:11}}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M11 4L5 9l6 5" stroke={T.ab} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Назад
      </button>}
    </div>
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:13,fontWeight:500,color:T.tm}}>{title}</div>
      {subtitle&&<div style={{fontSize:9,color:T.tmu,marginTop:1}}>{subtitle}</div>}
    </div>
    <div style={{width:64,display:"flex",justifyContent:"flex-end"}}>{rightEl}</div>
  </div>
);
const BNav = ({active,onChange,isAdmin}) => {
  const tabs=isAdmin
    ?[{id:"dashboard",l:"Огляд"},{id:"clients",l:"Клієнти"},{id:"payments",l:"Оплати"},{id:"broadcast",l:"Розсилка"},{id:"settings",l:"Налашт."}]
    :[{id:"plan",l:"План"},{id:"nutrition",l:"Харчування"},{id:"progress",l:"Прогрес"},{id:"profile",l:"Профіль"}];
  return (
    <div style={{display:"flex",borderTop:`1px solid ${T.bc}`,flexShrink:0,background:T.sbg}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0 8px"}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:active===t.id?T.ab:"transparent",marginBottom:1}}/>
          <span style={{fontSize:9,color:active===t.id?T.ab:T.tmu}}>{t.l}</span>
        </button>
      ))}
    </div>
  );
};

// WELCOME
const Welcome = ({onStart}) => (
  <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",padding:16,gap:12}}>
    <div style={{background:T.sc,borderRadius:16,border:`1px solid ${T.bc}`,height:160,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(0deg,${T.a}20 0,${T.a}20 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,${T.a}20 0,${T.a}20 1px,transparent 1px,transparent 24px)`}}/>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,transparent 40%,${T.sbg}dd)`}}/>
      <div className="pu" style={{width:56,height:56,borderRadius:"50%",border:`2px solid ${T.ab}`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path d="M5 3l11 6-11 6V3z" fill={T.ab}/></svg>
      </div>
      <div style={{position:"absolute",bottom:10,left:14,fontSize:10,color:T.tm,zIndex:2}}>Матіас — твій тренер</div>
      <div style={{position:"absolute",bottom:10,right:14,fontSize:9,color:T.tmu,background:"rgba(0,0,0,.5)",padding:"2px 7px",borderRadius:4,zIndex:2}}>0:47</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:38,height:38,background:T.a,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M2 7v4M4 6v6M11 6v6M13 7v4" stroke={T.tm} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <div>
        <div style={{fontSize:22,fontWeight:600,color:T.tm,letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>FITCORE</div>
        <div style={{fontSize:9,color:T.tmu,letterSpacing:1}}>AI TRAINER BY MATIAS</div>
      </div>
    </div>
    <Div/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
      {[["1200+","клієнтів"],["4.9★","рейтинг"],["3 дні","безкошт."]].map(([v,l])=>(
        <div key={l} style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"9px 0",textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:500,color:T.ab}}>{v}</div>
          <div style={{fontSize:9,color:T.tmu,marginTop:2}}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{marginTop:"auto",display:"flex",flexDirection:"column",gap:8}}>
      <PBtn onClick={onStart}>Почати безкоштовно</PBtn>
      <div style={{fontSize:10,color:T.tmu,textAlign:"center"}}>Без карти · <span style={{color:T.ab}}>3 дні повного доступу</span></div>
    </div>
  </div>
);

// PLAN SELECT
const PLANS = {
  start:{name:"START",price:799,features:["Тренувальний план","Шаблон харчування","Трекінг прогресу"]},
  premium:{name:"PREMIUM",price:1699,features:["Персональний ШІ-план","Чекіни 2×/тиж","Нутріціологія","Фідбек тренера"],hot:true},
  vip:{name:"VIP",price:3499,features:["Повний супровід","Прямий доступ до тренера","Пріоритет","VIP підтримка 24/7"]},
};
const PlanSelect = ({plans,payLinks,onSelect}) => {
  const p=plans||PLANS;
  return (
    <Scr>
      <div style={{fontSize:14,fontWeight:500,color:T.tm}}>Обери тариф</div>
      <div style={{fontSize:10,color:T.tmu}}>3 дні безкоштовно</div>
      {Object.entries(p).map(([k,plan])=>(
        <div key={k} className={plan.hot?"bl":""} onClick={()=>onSelect(k)}
          style={{background:T.sc,borderRadius:12,border:`1px solid ${plan.hot?T.a:T.bc}`,padding:"12px 14px",cursor:"pointer"}}>
          {plan.hot&&<div style={{fontSize:9,background:T.a,color:T.tm,borderRadius:8,padding:"2px 8px",display:"inline-block",marginBottom:6}}>Популярний</div>}
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontSize:14,fontWeight:500,color:T.tm}}>{plan.name}</div>
            <div style={{fontSize:18,fontWeight:500,color:T.ab}}>{plan.price} <span style={{fontSize:10,color:T.tmu,fontWeight:400}}>₴/міс</span></div>
          </div>
          {(plan.features||[]).map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:plan.hot?"#b8d89a":T.tmu,marginBottom:3}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:T.a,flexShrink:0}}/>{f}
            </div>
          ))}
        </div>
      ))}
    </Scr>
  );
};

// PAYMENT
const Payment = ({planKey,plans,payLinks,onBack,onPaid}) => {
  const plan=(plans||PLANS)[planKey];
  const link=(payLinks||{})[planKey]||"#";
  return (
    <Scr>
      <TNav title="Оплата" onBack={onBack}/>
      <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Замовлення</div>
        {[["Тариф",plan?.name],["Пробний","3 дні безкошт."]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11}}>
            <span style={{color:T.tmu}}>{l}</span>
            <span style={{color:l==="Пробний"?T.ab:T.tm}}>{v}</span>
          </div>
        ))}
        <Div/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:6}}>
          <span style={{fontSize:12,fontWeight:500,color:T.tm}}>До сплати</span>
          <span style={{fontSize:22,fontWeight:500,color:T.ab}}>{plan?.price} ₴</span>
        </div>
      </div>
      <div className="bl" style={{background:"rgba(107,143,78,.06)",borderRadius:12,border:`1px solid ${T.a}`,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,background:T.sc2,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="11" rx="2" stroke={T.ab} strokeWidth="1.4"/><path d="M2 9h14" stroke={T.ab} strokeWidth="1.4"/><circle cx="6" cy="13" r="1.5" fill={T.ab}/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:500,color:T.tm}}>Monobank jar</div>
          <div style={{fontSize:9,color:T.tmu}}>MatiasFitness — {plan?.name}</div>
        </div>
      </div>
      <a href={link} style={{textDecoration:"none"}}><PBtn>Перейти до оплати</PBtn></a>
      <GBtn onClick={onPaid}>Надіслати скріншот оплати</GBtn>
    </Scr>
  );
};

// TRAINING PLAN
const TrainPlan = ({userId}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  const [gen,setGen]=useState(false);
  const load=useCallback(async()=>{
    try{setLoad(true);const r=await apiGet(`/api/client/${userId}/plan`);setData(r.plan);}
    catch(e){console.error(e);}finally{setLoad(false);}
  },[userId]);
  useEffect(()=>{load();},[load]);
  const generate=async()=>{
    setGen(true);
    try{await apiPost(`/api/client/${userId}/generate-plan`,{});await load();}
    catch(e){alert("Помилка: "+e.message);}
    finally{setGen(false);}
  };
  if(loading)return <Spin/>;
  if(!data)return(
    <Scr>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:"40px 0"}}>
        <div style={{fontSize:13,color:T.tmu,textAlign:"center"}}>План ще не призначено</div>
        <PBtn onClick={generate} loading={gen} style={{maxWidth:240}}>{gen?"Генерую...":"Згенерувати план"}</PBtn>
      </div>
    </Scr>
  );
  let days=[];
  let weekNote="";
  try{
    const parsed=JSON.parse(data.plan_text||"{}");
    days=parsed.training?.days||[];
    weekNote=parsed.training?.week_note||"";
  }catch{}
  return(
    <Scr>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:10,color:T.ab,background:"rgba(107,143,78,.15)",border:`1px solid ${T.a}`,borderRadius:10,padding:"3px 10px"}}>Тиждень {data.week_number||1}</div>
        <button onClick={generate} disabled={gen} style={{background:"none",fontSize:10,color:T.tmu,display:"flex",alignItems:"center",gap:4}}>
          {gen&&<div className="sp" style={{width:12,height:12,borderRadius:"50%",border:`1.5px solid ${T.bc}`,borderTopColor:T.ab}}/>}
          Оновити
        </button>
      </div>
      {days.length>0?days.map((d,i)=>(
        <div key={i} style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,overflow:"hidden"}}>
          <div style={{background:T.sc2,padding:"7px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,fontWeight:500,color:T.tm}}>{d.day}</div>
            {d.muscle_group&&<div style={{fontSize:9,color:T.ab,background:"rgba(107,143,78,.15)",padding:"2px 8px",borderRadius:8,border:`1px solid ${T.a}`}}>{d.muscle_group}</div>}
          </div>
          {(d.exercises||[]).length>0&&(
            <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:5}}>
              {(d.exercises||[]).map((ex,j)=>(
                <div key={j}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,color:T.tm}}>{ex.name}</div>
                    <div style={{fontSize:10,color:T.tmu,fontFamily:"'DM Mono',monospace"}}>{ex.sets}×{ex.reps}</div>
                  </div>
                  {ex.note&&<div style={{fontSize:9,color:T.tmd,fontStyle:"italic",marginTop:1}}>{ex.note}</div>}
                </div>
              ))}
              {d.rest_note&&<div style={{fontSize:9,color:T.tmd,fontStyle:"italic",marginTop:3}}>{d.rest_note}</div>}
            </div>
          )}
          {!(d.exercises||[]).length&&<div style={{padding:"8px 12px",fontSize:10,color:T.tmu}}>День відпочинку</div>}
        </div>
      )):(
        <div style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:T.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.plan_text}</div>
        </div>
      )}
      {weekNote&&<div style={{background:"rgba(107,143,78,.06)",border:`1px solid ${T.bc}`,borderRadius:8,padding:"8px 12px",fontSize:10,color:T.tmu,lineHeight:1.6}}>{weekNote}</div>}
    </Scr>
  );
};

// NUTRITION
const Nutrition = ({userId}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet(`/api/client/${userId}/plan`).then(r=>{setData(r.plan);setLoad(false);}).catch(()=>setLoad(false));},[userId]);
  if(loading)return <Spin/>;
  if(!data)return <Scr><div style={{padding:"40px 0",textAlign:"center",color:T.tmu,fontSize:12}}>Харчування не призначено</div></Scr>;
  let nutrition=null;
  try{const p=JSON.parse(data.plan_text||"{}");nutrition=p.nutrition||null;}catch{}
  if(!nutrition)return(
    <Scr>
      <div style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:T.tmu,marginBottom:6}}>План харчування</div>
        <div style={{fontSize:11,color:T.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.nutrition_text||"Не знайдено"}</div>
      </div>
    </Scr>
  );
  const macros=[{l:"Білок",v:`${nutrition.protein}г`,pct:75,c:T.ab},{l:"Жири",v:`${nutrition.fat}г`,pct:55,c:T.amber},{l:"Вугл.",v:`${nutrition.carbs}г`,pct:65,c:T.blue}];
  return(
    <Scr>
      <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Денна норма</div>
        <div style={{fontSize:26,fontWeight:500,color:T.ab,marginBottom:10}}>{nutrition.calories} <span style={{fontSize:12,color:T.tmu,fontWeight:400}}>ккал</span></div>
        <div style={{display:"flex",gap:10}}>
          {macros.map(m=>(
            <div key={m.l} style={{flex:1}}>
              <div style={{fontSize:9,color:T.tmu}}>{m.l}</div>
              <div style={{fontSize:12,fontWeight:500,color:T.tm,margin:"2px 0 4px"}}>{m.v}</div>
              <div style={{height:3,background:T.bc,borderRadius:2}}><div style={{height:"100%",width:`${m.pct}%`,background:m.c,borderRadius:2}}/></div>
            </div>
          ))}
        </div>
      </div>
      {(nutrition.meals||[]).map((m,i)=>(
        <div key={i} style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,overflow:"hidden"}}>
          <div style={{background:T.sc2,padding:"7px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:T.tmu}}>{m.time}</div><div style={{fontSize:12,fontWeight:500,color:T.tm}}>{m.name}</div></div>
            <div style={{fontSize:10,color:T.ab}}>{m.kcal} ккал</div>
          </div>
          <div style={{padding:"7px 12px",display:"flex",flexDirection:"column",gap:4}}>
            {(m.foods||[]).map((f,j)=>(
              <div key={j}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                  <span style={{color:T.tm}}>{f.name}</span>
                  <span style={{color:T.tmu,fontFamily:"'DM Mono',monospace"}}>{f.qty}</span>
                </div>
                {j<(m.foods||[]).length-1&&<div style={{height:1,background:T.bc,margin:"3px 0"}}/>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Scr>
  );
};

// CHECKIN
const Checkin = ({userId,onDone}) => {
  const [w,setW]=useState("");
  const [e,setE]=useState(null);
  const [s,setS]=useState("");
  const [c,setC]=useState("");
  const [loading,setLoad]=useState(false);
  const [result,setResult]=useState(null);
  const submit=async()=>{
    if(!w||!e)return;
    setLoad(true);
    try{
      const r=await apiPost(`/api/client/${userId}/checkin`,{weight_kg:parseFloat(w),energy_level:e,sleep_hours:s?parseFloat(s):null,comment:c||null});
      setResult(r);
    }catch(err){alert("Помилка: "+err.message);}
    finally{setLoad(false);}
  };
  if(result)return(
    <Scr>
      <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(107,143,78,.2)",border:`2px solid ${T.a}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="26" height="26" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 7-7" stroke={T.ab} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{fontSize:15,fontWeight:500,color:T.tm}}>Чекін збережено!</div>
        <div style={{display:"flex",gap:10,fontSize:12,color:T.tmu}}>
          <span>🔥 Стрік: {result.streak} днів</span>
          {result.delta!=null&&<span>{result.delta>0?"+":""}{result.delta} кг</span>}
        </div>
        {result.feedback&&(
          <div style={{background:T.sc2,border:`1px solid ${T.a}`,borderRadius:10,padding:"12px 14px",width:"100%"}}>
            <div style={{fontSize:9,color:T.ab,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Фідбек тренера</div>
            <div style={{fontSize:12,color:T.tm,lineHeight:1.6}}>{result.feedback}</div>
          </div>
        )}
        <PBtn onClick={onDone} style={{maxWidth:200}}>Готово</PBtn>
      </div>
    </Scr>
  );
  return(
    <Scr>
      <div style={{fontSize:14,fontWeight:500,color:T.tm}}>Чекін</div>
      <div style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Вага (кг)</div>
        <input value={w} onChange={ev=>setW(ev.target.value)} type="number" placeholder="82.5" style={{background:"none",color:T.tm,fontSize:28,fontWeight:500,width:"100%"}}/>
      </div>
      <div style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Рівень енергії</div>
        <div style={{display:"flex",gap:6}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setE(n)} style={{flex:1,background:e===n?T.a:T.sc2,border:`1px solid ${e===n?T.ab:T.bc}`,borderRadius:8,padding:"9px 0",fontSize:13,fontWeight:500,color:e===n?T.tm:T.tmu}}>{n}</button>
          ))}
        </div>
      </div>
      <div style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Сон (години)</div>
        <input value={s} onChange={ev=>setS(ev.target.value)} type="number" placeholder="7.5" style={{background:"none",color:T.tm,fontSize:18,fontWeight:500,width:"100%"}}/>
      </div>
      <div style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Коментар</div>
        <textarea value={c} onChange={ev=>setC(ev.target.value)} placeholder="Як пройшло тренування?" rows={2} style={{background:"none",color:T.tm,fontSize:12,width:"100%",resize:"none",lineHeight:1.5}}/>
      </div>
      <PBtn onClick={submit} loading={loading} disabled={!w||!e}>{loading?"Зберігаю...":"Зберегти чекін"}</PBtn>
    </Scr>
  );
};

// PROGRESS
const Progress = ({userId}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet(`/api/client/${userId}/progress`).then(r=>{setData(r);setLoad(false);}).catch(()=>setLoad(false));},[userId]);
  if(loading)return <Spin/>;
  if(!data)return <Scr><div style={{padding:"40px 0",textAlign:"center",color:T.tmu}}>Немає даних</div></Scr>;
  const checkins=data.checkins||[];
  const maxW=checkins.length?Math.max(...checkins.map(c=>c.weight_kg||0)):1;
  const minW=checkins.length?Math.min(...checkins.map(c=>c.weight_kg||0)):0;
  const badgeMap={"STREAK-7":["🔥","7 днів"],"STREAK-14":["⚡","14 днів"],"STREAK-30":["🏆","30 днів"],"STREAK-60":["💎","60 днів"],"STREAK-90":["👑","90 днів"]};
  const earned=(data.badges||"").split(",").filter(Boolean);
  return(
    <Scr>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[["Старт",`${data.start_weight||"—"} кг`,T.tmu],["Зараз",`${data.last_weight||"—"} кг`,T.ab],["Прогрес",data.start_weight&&data.last_weight?`${Math.round((data.last_weight-data.start_weight)*10)/10} кг`:"—",T.ab],["Стрік",`${data.streak||0} днів`,T.amber]].map(([l,v,c])=>(
          <div key={l} style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:T.tmu}}>{l}</div>
            <div style={{fontSize:18,fontWeight:500,color:c,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
      {checkins.length>0&&(
        <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:T.tmu,marginBottom:10}}>Динаміка ваги</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:70}}>
            {checkins.slice(-8).map((c,i)=>{
              const h=maxW===minW?50:((c.weight_kg-minW)/(maxW-minW))*55+10;
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:7,color:T.tmu}}>{c.weight_kg}</div>
                <div style={{width:"100%",height:h,background:i===checkins.slice(-8).length-1?T.ab:T.a,borderRadius:"3px 3px 0 0"}}/>
                <div style={{fontSize:7,color:T.tmd}}>Т{c.week_number}</div>
              </div>;
            })}
          </div>
        </div>
      )}
      {data.start_weight&&data.target_weight&&(
        <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:T.tmu,marginBottom:8}}>Прогрес до цілі ({data.target_weight} кг)</div>
          <div style={{height:6,background:T.bc,borderRadius:4,marginBottom:6}}>
            <div style={{height:"100%",width:`${data.progress_pct||0}%`,background:T.ab,borderRadius:4}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
            <span style={{color:T.tmu}}>{data.start_weight} кг</span>
            <span style={{color:T.ab}}>{data.progress_pct||0}%</span>
            <span style={{color:T.tmu}}>{data.target_weight} кг</span>
          </div>
        </div>
      )}
      <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.bc}`,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:T.tmu,marginBottom:10}}>Бейджі</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(badgeMap).map(([code,[emoji,label]])=>{
            const has=earned.includes(code);
            return <div key={code} style={{background:has?"rgba(107,143,78,.15)":T.sc2,borderRadius:10,border:`1px solid ${has?T.a:T.bc}`,padding:"7px 12px",textAlign:"center",opacity:has?1:.4}}>
              <div style={{fontSize:18}}>{emoji}</div>
              <div style={{fontSize:8,color:has?T.ab:T.tmu,marginTop:2}}>{label}</div>
            </div>;
          })}
        </div>
      </div>
    </Scr>
  );
};

// PROFILE
const Profile = ({client,questionnaire,isAdmin,onAdminAccess,onCheckin}) => {
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  return(
    <Scr>
      <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.a}`,padding:"14px",display:"flex",gap:12,alignItems:"center"}}>
        <Ava name={client?.full_name||"?"} size={52}/>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:500,color:T.tm}}>{client?.full_name||"Клієнт"}</div>
          <div style={{fontSize:10,color:T.tmu,marginTop:2}}>{client?.username?`@${client.username}`:""}</div>
          <div style={{marginTop:6}}><Bdg v={planV[client?.plan]||"green"}>{(client?.plan||"").toUpperCase()} · до {(client?.expires_at||"").slice(0,10)}</Bdg></div>
        </div>
      </div>
      {questionnaire&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {[["Вік",`${questionnaire.age||"—"} р.`],["Стать",questionnaire.gender==="female"?"Жінка":"Чоловік"],["Вага",`${questionnaire.weight_kg||"—"} кг`],["Ціль",`${questionnaire.target_weight||"—"} кг`],["Обладнання",questionnaire.equipment==="gym"?"Зал":questionnaire.equipment||"—"],["Трен./тиж",`${questionnaire.workouts_pw||"—"}×`]].map(([l,v])=>(
            <div key={l} style={{background:T.sc,borderRadius:8,border:`1px solid ${T.bc}`,padding:"7px 10px"}}>
              <div style={{fontSize:9,color:T.tmu}}>{l}</div>
              <div style={{fontSize:12,fontWeight:500,color:T.tm,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      <Div/>
      <button onClick={onCheckin} style={{background:T.sc,border:`1px solid ${T.bc}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
        <span style={{fontSize:13,color:T.tm}}>Зробити чекін</span>
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke={T.tmd} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {isAdmin&&(
        <button onClick={onAdminAccess} style={{background:"rgba(107,143,78,.08)",border:`1px solid ${T.a}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l6 3v4c0 3.5-2.5 6.5-6 7-3.5-.5-6-3.5-6-7V5l6-3z" stroke={T.ab} strokeWidth="1.4" fill="none"/></svg>
          <span style={{fontSize:13,color:T.ab,fontWeight:500}}>Адмін-панель</span>
        </button>
      )}
    </Scr>
  );
};

// ADMIN DASHBOARD
const AdminDash = () => {
  const [stats,setStats]=useState(null);
  const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet("/api/admin/stats").then(r=>{setStats(r);setLoad(false);}).catch(()=>setLoad(false));},[]);
  if(loading)return <Spin/>;
  if(!stats)return <Scr><div style={{color:T.tmu,textAlign:"center",padding:"40px 0"}}>Помилка</div></Scr>;
  return(
    <Scr>
      <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.a}`,padding:"12px 14px"}}>
        <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Виручка місяця</div>
        <div style={{fontSize:28,fontWeight:500,color:T.ab}}>{(stats.revenue_month||0).toLocaleString()} <span style={{fontSize:12,color:T.tmu,fontWeight:400}}>₴</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[["Активні",stats.active,T.ab],["Trial",stats.trial,T.amber],["Очікують",stats.pending,T.red],["Чекіни",stats.checkins_today,T.tm]].map(([l,v,c])=>(
          <div key={l} style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.4}}>{l}</div>
            <div style={{fontSize:24,fontWeight:500,color:c,margin:"2px 0"}}>{v||0}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5}}>Остання активність</div>
      {(stats.recent_activity||[]).map((a,i)=>(
        <div key={i} style={{background:T.sc,borderRadius:8,border:`1px solid ${T.bc}`,padding:"8px 10px",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:T.ab,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:500,color:T.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.full_name}</div>
            <div style={{fontSize:9,color:T.tmu}}>Чекін · {a.weight_kg} кг</div>
          </div>
        </div>
      ))}
    </Scr>
  );
};

// ADMIN CLIENTS
const AdminClients = ({onSelect}) => {
  const [clients,setClients]=useState([]);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [loading,setLoad]=useState(true);
  useEffect(()=>{
    setLoad(true);
    apiGet(`/api/admin/clients?status=${filter}`).then(r=>{setClients(r.clients||[]);setLoad(false);}).catch(()=>setLoad(false));
  },[filter]);
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  const filtered=clients.filter(c=>!search||(c.full_name||"").toLowerCase().includes(search.toLowerCase())||(c.username||"").includes(search));
  return(
    <Scr>
      <div style={{background:T.sc,border:`1px solid ${T.bc}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="4" stroke={T.tmd} strokeWidth="1.4"/><path d="M10.5 10.5l3 3" stroke={T.tmd} strokeWidth="1.4" strokeLinecap="round"/></svg>
        <input value={search} onChange={ev=>setSearch(ev.target.value)} placeholder="Пошук..." style={{background:"none",color:T.tm,fontSize:12,flex:1}}/>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto"}}>
        {[["all","Всі"],["active","Активні"],["trial","Trial"],["pending_approval","Очікують"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"5px 12px",borderRadius:12,border:`1px solid ${filter===v?T.ab:T.bc}`,background:filter===v?"rgba(107,143,78,.15)":T.sc,color:filter===v?T.ab:T.tmu,fontSize:10,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
        ))}
      </div>
      {loading?<Spin/>:filtered.map(c=>(
        <button key={c.user_id} onClick={()=>onSelect(c)} style={{background:T.sc,borderRadius:10,border:`1px solid ${T.bc}`,padding:"9px 10px",display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left"}}>
          <Ava name={c.full_name||"?"} size={36}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500,color:T.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.full_name}</div>
            <div style={{fontSize:9,color:T.tmu,marginTop:1}}>{c.username?`@${c.username}`:""} · стрік {c.streak||0}</div>
          </div>
          <Bdg v={planV[c.plan]||"green"}>{(c.plan||"").toUpperCase()}</Bdg>
        </button>
      ))}
    </Scr>
  );
};

// ADMIN CLIENT DETAIL
const AdminClientDetail = ({client,onBack}) => {
  const [detail,setDetail]=useState(null);
  const [loading,setLoad]=useState(true);
  const [msg,setMsg]=useState("");
  const [gen,setGen]=useState(false);
  useEffect(()=>{apiGet(`/api/admin/client/${client.user_id}`).then(r=>{setDetail(r);setLoad(false);}).catch(()=>setLoad(false));},[client.user_id]);
  const activate=async(plan)=>{await apiPost(`/api/admin/client/${client.user_id}/activate`,{plan});setMsg(`✓ Активовано: ${plan.toUpperCase()}`);};
  const block=async()=>{await apiPost(`/api/admin/client/${client.user_id}/block`,{});setMsg("✓ Заблоковано");};
  const generate=async()=>{
    setGen(true);
    try{await apiPost(`/api/client/${client.user_id}/generate-plan`,{});setMsg("✓ План згенеровано");}
    catch(e){setMsg("Помилка: "+e.message);}
    setGen(false);
  };
  if(loading)return <Spin/>;
  const qst=detail?.questionnaire;
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  return(
    <Scr>
      <div style={{background:T.sc,borderRadius:12,border:`1px solid ${T.a}`,padding:"12px 14px",display:"flex",gap:12,alignItems:"center"}}>
        <Ava name={client.full_name||"?"} size={48}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:500,color:T.tm}}>{client.full_name}</div>
          <div style={{fontSize:9,color:T.tmu,marginTop:1}}>{client.username?`@${client.username}`:""}</div>
          <div style={{marginTop:5,display:"flex",gap:5}}>
            <Bdg v={planV[client.plan]||"green"}>{(client.plan||"").toUpperCase()}</Bdg>
            <Bdg v={client.status==="active"?"green":"amber"}>{client.status}</Bdg>
          </div>
        </div>
      </div>
      {qst&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {[["Вік",`${qst.age||"—"} р.`],["Стать",qst.gender==="female"?"Жінка":"Чоловік"],["Вага/ціль",`${qst.weight_kg}→${qst.target_weight} кг`],["Обладнання",qst.equipment||"—"],["Трен./тиж",`${qst.workouts_pw||"—"}×`],["Стрік",`${client.streak||0} днів`]].map(([l,v])=>(
            <div key={l} style={{background:T.sc,borderRadius:8,border:`1px solid ${T.bc}`,padding:"6px 9px"}}>
              <div style={{fontSize:8,color:T.tmu}}>{l}</div>
              <div style={{fontSize:11,fontWeight:500,color:T.tm,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      <Div/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        <button onClick={generate} disabled={gen} className={gen?"":"pu"} style={{background:T.a,color:T.tm,borderRadius:9,padding:"10px 0",fontSize:11,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {gen&&<div className="sp" style={{width:12,height:12,borderRadius:"50%",border:`2px solid rgba(255,255,255,.3)`,borderTopColor:T.tm}}/>}
          Згенерувати план
        </button>
        {["start","premium","vip"].map(p=>(
          <button key={p} onClick={()=>activate(p)} style={{background:T.sc,color:T.tmu,border:`1px solid ${T.bc}`,borderRadius:9,padding:"10px 0",fontSize:11}}>Активувати {p.toUpperCase()}</button>
        ))}
        <button onClick={block} style={{background:T.redbg,color:T.red,border:`1px solid ${T.redbr}`,borderRadius:9,padding:"10px 0",fontSize:11}}>Заблокувати</button>
      </div>
      {msg&&<div style={{background:"rgba(107,143,78,.1)",border:`1px solid ${T.a}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.ab}}>{msg}</div>}
    </Scr>
  );
};

// ADMIN PAYMENTS
const AdminPayments = () => {
  const [payments,setPayments]=useState([]);
  const [filter,setFilter]=useState("submitted");
  const [loading,setLoad]=useState(true);
  const load=useCallback(async()=>{
    setLoad(true);
    try{const r=await apiGet(`/api/admin/payments?status=${filter}`);setPayments(r.payments||[]);}
    finally{setLoad(false);}
  },[filter]);
  useEffect(()=>{load();},[load]);
  return(
    <Scr>
      <div style={{display:"flex",gap:6}}>
        {[["submitted","На перевірці"],["confirmed","Підтверджені"],["rejected","Відхилені"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{flex:1,padding:"6px 0",borderRadius:10,border:`1px solid ${filter===v?T.ab:T.bc}`,background:filter===v?"rgba(107,143,78,.15)":T.sc,color:filter===v?T.ab:T.tmu,fontSize:10}}>{l}</button>
        ))}
      </div>
      {loading?<Spin/>:payments.length===0?(
        <div style={{padding:"40px 0",textAlign:"center",color:T.tmu,fontSize:12}}>Немає оплат</div>
      ):payments.map(p=>(
        <div key={p.id} style={{background:T.sc,borderRadius:10,border:`1px solid ${filter==="submitted"?"rgba(212,168,67,.3)":T.bc}`,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <div style={{fontSize:12,fontWeight:500,color:T.tm}}>{p.full_name||`ID ${p.user_id}`}</div>
              <div style={{fontSize:9,color:T.tmu}}>{(p.plan||"").toUpperCase()} · {(p.submitted_at||"").slice(0,16)}</div>
            </div>
            <div style={{fontSize:16,fontWeight:500,color:T.ab}}>{p.amount} ₴</div>
          </div>
          {filter==="submitted"&&(
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <button onClick={async()=>{await apiPost(`/api/admin/payment/${p.id}/confirm`,{});load();}} style={{flex:1,background:"rgba(107,143,78,.18)",color:T.ab,border:`1px solid ${T.a}`,borderRadius:7,padding:"7px 0",fontSize:11,fontWeight:500}}>Підтвердити</button>
              <button onClick={async()=>{await apiPost(`/api/admin/payment/${p.id}/reject`,{});load();}} style={{flex:1,background:T.redbg,color:T.red,border:`1px solid ${T.redbr}`,borderRadius:7,padding:"7px 0",fontSize:11}}>Відхилити</button>
            </div>
          )}
        </div>
      ))}
    </Scr>
  );
};

// ADMIN BROADCAST
const AdminBroadcast = () => {
  const [target,setTarget]=useState("all");
  const [text,setText]=useState("");
  const [sending,setSend]=useState(false);
  const [result,setResult]=useState(null);
  const send=async()=>{
    if(!text)return;
    setSend(true);
    try{const r=await apiPost("/api/admin/broadcast",{text,target});setResult(r);setText("");}
    catch(e){alert("Помилка: "+e.message);}
    setSend(false);
  };
  return(
    <Scr>
      {result&&<div style={{background:"rgba(107,143,78,.1)",border:`1px solid ${T.a}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.ab}}>✓ Надіслано {result.sent_to} клієнтам</div>}
      <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5}}>Аудиторія</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
        {[["all","Всі"],["start","START"],["premium","PREMIUM"],["vip","VIP"],["trial","Trial"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTarget(v)} style={{background:T.sc,border:`1px solid ${target===v?T.a:T.bc}`,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:target===v?T.a:"transparent",border:`2px solid ${target===v?T.a:T.bc}`,flexShrink:0}}/>
            <span style={{fontSize:11,color:T.tm}}>{l}</span>
          </button>
        ))}
      </div>
      <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5}}>Повідомлення</div>
      <textarea value={text} onChange={ev=>setText(ev.target.value)} placeholder="Текст..." rows={4} style={{background:T.sc,border:`1px solid ${T.bc}`,borderRadius:8,padding:"10px 12px",color:T.tm,fontSize:12,resize:"none",lineHeight:1.5}}/>
      {text&&<div style={{background:"rgba(107,143,78,.06)",border:`1px solid ${T.bc}`,borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:9,color:T.tmu,marginBottom:5}}>Попередній перегляд</div>
        <div style={{fontSize:11,color:T.tm,lineHeight:1.6}}>{text}</div>
      </div>}
      <PBtn onClick={send} loading={sending} disabled={!text}>Надіслати</PBtn>
    </Scr>
  );
};

// ADMIN SETTINGS
const AdminSettings = ({settings}) => {
  const [tog,setTog]=useState({autoplan:true,remind:true,offer:true,notify:false});
  return(
    <Scr>
      <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5}}>Автоматизація</div>
      {[{k:"autoplan",l:"Авто-план щопонеділка",s:"Claude AI"},{k:"remind",l:"Нагадування про чекін",s:"Ср та Пт 18:00"},{k:"offer",l:"Оффер на день 3",s:"Trial → платний"},{k:"notify",l:"Сповіщення адміна",s:"Нові оплати"}].map(item=>(
        <div key={item.k} style={{background:T.sc,borderRadius:9,border:`1px solid ${T.bc}`,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div><div style={{fontSize:12,color:T.tm}}>{item.l}</div><div style={{fontSize:9,color:T.tmu,marginTop:2}}>{item.s}</div></div>
          <Tog on={tog[item.k]} onToggle={()=>setTog(t=>({...t,[item.k]:!t[item.k]}))}/>
        </div>
      ))}
      <Div/>
      <div style={{fontSize:9,color:T.tmu,textTransform:"uppercase",letterSpacing:.5}}>Тарифи</div>
      {Object.entries(settings?.plans||{start:{name:"START",price:799},premium:{name:"PREMIUM",price:1699},vip:{name:"VIP",price:3499}}).map(([k,plan])=>(
        <div key={k} style={{background:T.sc,borderRadius:9,border:`1px solid ${T.bc}`,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,color:T.tm}}>{plan.name}</div><div style={{fontSize:9,color:T.tmu}}>Monobank jar</div></div>
          <Bdg v={{start:"green",premium:"blue",vip:"purple"}[k]||"green"}>{plan.price} ₴</Bdg>
        </div>
      ))}
    </Scr>
  );
};

// MAIN APP
export default function FitCoreApp() {
  const [screen,setScreen]=useState("loading");
  const [userId,setUserId]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [clientData,setClient]=useState(null);
  const [questionnaire,setQst]=useState(null);
  const [plans,setPlans]=useState(null);
  const [payLinks,setPayLinks]=useState(null);
  const [settings,setSettings]=useState(null);
  const [clientTab,setClientTab]=useState("plan");
  const [adminTab,setAdminTab]=useState("dashboard");
  const [selClient,setSelClient]=useState(null);
  const [selPlan,setSelPlan]=useState(null);
  const [checkinMode,setCheckin]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      try{
        const auth=await apiPost("/api/auth",{});
        setUserId(auth.user_id);
        setIsAdmin(auth.is_admin);
        setPlans(auth.plans);
        setPayLinks(auth.payment_links);
        setClient(auth.client);
        if(auth.is_admin){
          try{const s=await apiGet("/api/admin/settings");setSettings(s);}catch{}
        }
        if(auth.client){
          try{const d=await apiGet(`/api/client/${auth.user_id}`);setQst(d.questionnaire);}catch{}
          const st=auth.client.status;
          if(["active","trial"].includes(st))setScreen("client");
          else if(st==="pending_approval")setScreen("pending");
          else setScreen("welcome");
        }else{setScreen("welcome");}
      }catch(e){console.error("Init:",e);setScreen("welcome");}
    };
    init();
  },[]);

  if(screen==="loading")return(
    <>
      <G/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <div style={{fontSize:22,fontWeight:600,color:T.ab,letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>FITCORE</div>
        <div className="sp" style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${T.bc}`,borderTopColor:T.ab}}/>
      </div>
    </>
  );

  const isAdminMode=screen==="admin";
  const showNav=["client","admin"].includes(screen)&&!checkinMode;
  const titles={plan:"Мій план",nutrition:"Харчування",progress:"Прогрес",profile:"Профіль",dashboard:"Дашборд",clients:"Клієнти",payments:"Оплати",broadcast:"Розсилка",settings:"Налаштування"};
  const topTitle=checkinMode?"Чекін":isAdminMode?(selClient?"Профіль клієнта":titles[adminTab]):titles[clientTab];

  const renderContent=()=>{
    if(screen==="welcome")return <Welcome onStart={()=>setScreen("plans")}/>;
    if(screen==="plans")return <PlanSelect plans={plans} payLinks={payLinks} onSelect={p=>{setSelPlan(p);setScreen("payment");}}/>;
    if(screen==="payment")return <Payment planKey={selPlan} plans={plans} payLinks={payLinks} onBack={()=>setScreen("plans")} onPaid={()=>setScreen("pending")}/>;
    if(screen==="pending")return(
      <Scr>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:"40px 0"}}>
          <div className="sh" style={{width:56,height:56,borderRadius:"50%",background:"rgba(212,168,67,.2)",border:`2px solid ${T.amber}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke={T.amber} strokeWidth="1.4"/><path d="M9 5v4l2.5 2" stroke={T.amber} strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div style={{fontSize:14,fontWeight:500,color:T.tm}}>Очікування підтвердження</div>
          <div style={{fontSize:12,color:T.tmu,textAlign:"center",lineHeight:1.6}}>Тренер перевіряє оплату.<br/>Повідомимо після підтвердження.</div>
        </div>
      </Scr>
    );
    if(screen==="admin"){
      if(selClient)return <AdminClientDetail client={selClient} onBack={()=>setSelClient(null)}/>;
      if(adminTab==="dashboard")return <AdminDash/>;
      if(adminTab==="clients")return <AdminClients onSelect={c=>setSelClient(c)}/>;
      if(adminTab==="payments")return <AdminPayments/>;
      if(adminTab==="broadcast")return <AdminBroadcast/>;
      if(adminTab==="settings")return <AdminSettings settings={settings}/>;
    }
    if(screen==="client"){
      if(checkinMode)return <Checkin userId={userId} onDone={()=>setCheckin(false)}/>;
      if(clientTab==="plan")return <TrainPlan userId={userId}/>;
      if(clientTab==="nutrition")return <Nutrition userId={userId}/>;
      if(clientTab==="progress")return <Progress userId={userId}/>;
      if(clientTab==="profile")return <Profile client={clientData} questionnaire={questionnaire} isAdmin={isAdmin} onAdminAccess={()=>setScreen("admin")} onCheckin={()=>setCheckin(true)}/>;
    }
  };

  return(
    <>
      <G/>
      <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.sbg,display:"flex",flexDirection:"column"}}>
        {["client","admin"].includes(screen)&&(
          <TNav title={topTitle}
            onBack={selClient?()=>setSelClient(null):checkinMode?()=>setCheckin(false):isAdminMode?()=>setScreen("client"):undefined}
            rightEl={isAdminMode&&adminTab==="payments"&&!selClient&&<div className="sh" style={{fontSize:9,background:"rgba(212,168,67,.15)",color:T.amber,border:"1px solid rgba(212,168,67,.3)",borderRadius:8,padding:"2px 8px"}}>оплати</div>}
          />
        )}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>{renderContent()}</div>
        {showNav&&<BNav active={isAdminMode?adminTab:clientTab} onChange={id=>{if(isAdminMode){setAdminTab(id);setSelClient(null);}else setClientTab(id);}} isAdmin={isAdminMode}/>}
      </div>
    </>
  );
}
