import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const tg = window.Telegram?.WebApp;
const getInitData = () => tg?.initData || "";
const getTgUser = () => tg?.initDataUnsafe?.user || null;

async function api(path, options = {}) {
  const uid = getTgUser()?.id;
  const headers = { "Content-Type": "application/json", "X-Telegram-Init-Data": getInitData() };
  if (!getInitData() && uid) headers["X-Dev-User-Id"] = String(uid);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers||{}) }, body: options.body ? JSON.stringify(options.body) : undefined });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
const apiGet  = p => api(p);
const apiPost = (p,b) => api(p, { method:"POST", body:b });

const PHOTOS = {
  trainer_welcome: "/photo2.jpg",
  trainer_profile: "/photo1.jpg",
  trainer_plan:    "/photo3.jpg",
};

const C = {
  bg:"#0a0a0a", s1:"#111111", s2:"#161616", s3:"#1c1c1c",
  acc:"#c8f53a", acc2:"#a8d420",
  tm:"#ffffff", ts:"#888888", td:"#444444", bc:"#222222",
  red:"#ff5555", amber:"#e8a832", blue:"#4a9fdf",
};

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{background:${C.bg};color:${C.tm};font-family:'Inter',sans-serif;min-height:100vh;}
    button{cursor:pointer;border:none;outline:none;font-family:'Inter',sans-serif;}
    input,textarea{font-family:'Inter',sans-serif;outline:none;}
    ::-webkit-scrollbar{width:0;}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,245,58,0);}50%{box-shadow:0 0 0 8px rgba(200,245,58,0.15);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes blink{0%,100%{border-color:${C.acc};}50%{border-color:#e8ff80;}}
    .fi{animation:fadeIn .3s ease forwards;}
    .pu{animation:pulse 2.5s ease-in-out infinite;}
    .sp{animation:spin 1s linear infinite;}
    .bl{animation:blink 2s ease-in-out infinite;}
  `}</style>
);

const Spin = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"50px 0"}}>
    <div className="sp" style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${C.s3}`,borderTopColor:C.acc}}/>
  </div>
);

const Div = ({style={}}) => <div style={{height:1,background:C.bc,...style}}/>;

const Bdg = ({children,v="green"}) => {
  const m = {green:[C.acc,C.acc,"rgba(200,245,58,.1)"],amber:[C.amber,"rgba(232,168,50,.3)","rgba(232,168,50,.1)"],red:[C.red,"rgba(255,85,85,.3)","rgba(255,85,85,.1)"],blue:[C.blue,"rgba(74,159,223,.3)","rgba(74,159,223,.1)"]}[v]||[C.acc,C.acc,"rgba(200,245,58,.1)"];
  return <span style={{fontSize:12,padding:"3px 10px",borderRadius:20,background:m[2],color:m[0],border:`1px solid ${m[1]}`,whiteSpace:"nowrap",fontWeight:600}}>{children}</span>;
};

const Ava = ({name="?",size=44}) => {
  const i=(name||"?").split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(200,245,58,.1)",border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:800,color:C.acc,flexShrink:0}}>{i}</div>;
};

const Tog = ({on,onToggle}) => (
  <div onClick={onToggle} style={{width:44,height:24,borderRadius:12,background:on?C.acc:C.s3,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
    <div style={{width:18,height:18,borderRadius:"50%",background:on?"#0a0a0a":C.ts,position:"absolute",top:3,left:on?23:3,transition:"left .2s"}}/>
  </div>
);

const PBtn = ({children,onClick,disabled,loading,style={}}) => (
  <button onClick={onClick} disabled={disabled||loading} className={disabled||loading?"":"pu"}
    style={{background:disabled||loading?"rgba(200,245,58,.3)":C.acc,color:"#0a0a0a",borderRadius:16,padding:"16px 0",width:"100%",fontSize:16,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,...style}}>
    {loading&&<div className="sp" style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(0,0,0,.2)",borderTopColor:"#0a0a0a"}}/>}
    {children}
  </button>
);

const GBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{background:"transparent",color:C.ts,border:`1px solid ${C.bc}`,borderRadius:16,padding:"14px 0",width:"100%",fontSize:15,fontWeight:600,...style}}>{children}</button>
);

const Scr = ({children,style={}}) => (
  <div className="fi" style={{flex:1,overflowY:"auto",padding:"12px 16px 20px",display:"flex",flexDirection:"column",gap:10,...style}}>{children}</div>
);

const TNav = ({title,onBack,rightEl}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 12px",borderBottom:`1px solid ${C.bc}`,flexShrink:0}}>
    <div style={{width:64}}>
      {onBack&&<button onClick={onBack} style={{background:"none",display:"flex",alignItems:"center",gap:4,color:C.acc,fontSize:14,fontWeight:600}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L5 9l6 5" stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Назад
      </button>}
    </div>
    <div style={{fontSize:18,fontWeight:800,color:C.tm,letterSpacing:"-.5px"}}>{title}</div>
    <div style={{width:64,display:"flex",justifyContent:"flex-end"}}>{rightEl}</div>
  </div>
);

const BNav = ({active,onChange,isAdmin}) => {
  const tabs = isAdmin
    ? [{id:"dashboard",l:"Огляд"},{id:"clients",l:"Клієнти"},{id:"payments",l:"Оплати"},{id:"broadcast",l:"Розсилка"},{id:"settings",l:"Налашт."}]
    : [{id:"plan",l:"План"},{id:"nutrition",l:"Харч."},{id:"progress",l:"Прогрес"},{id:"menu",l:"Меню"},{id:"profile",l:"Профіль"}];
  const icons = {
    plan: c=><path d="M3 9h12M2 7v4M4 6v6M11 6v6M13 7v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>,
    nutrition: c=><><path d="M9 2v5a4 4 0 01-4 4H5M15 2v14" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    progress: c=><path d="M2 14l4.5-5 3.5 3.5 5.5-7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    profile: c=><><circle cx="9" cy="6.5" r="3.5" stroke={c} strokeWidth="1.8" fill="none"/><path d="M2 17c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    dashboard: c=><><rect x="2" y="9" width="3.5" height="7" rx="1" fill={c}/><rect x="7" y="6" width="3.5" height="10" rx="1" fill={c}/><rect x="12" y="3" width="3.5" height="13" rx="1" fill={c}/></>,
    clients: c=><><circle cx="9" cy="6.5" r="3.5" stroke={c} strokeWidth="1.8" fill="none"/><path d="M2 17c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    payments: c=><><rect x="2" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.8" fill="none"/><path d="M2 9h14" stroke={c} strokeWidth="1.8"/><circle cx="6" cy="13" r="1.5" fill={c}/></>,
    broadcast: c=><path d="M2 9l13-6-5 6 5 6-13-6z" fill={c}/>,
    settings: c=><><circle cx="9" cy="9" r="3" stroke={c} strokeWidth="1.8" fill="none"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></>,
    menu: c=><><rect x="2" y="4" width="14" height="1.8" rx=".9" fill={c}/><rect x="2" y="8.1" width="10" height="1.8" rx=".9" fill={c}/><rect x="2" y="12.2" width="12" height="1.8" rx=".9" fill={c}/></>,
  };
  return (
    <div style={{display:"flex",borderTop:`1px solid ${C.bc}`,flexShrink:0,background:C.bg,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
      {tabs.map(t=>{
        const isAct=active===t.id;
        const color=isAct?C.acc:C.ts;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 0 14px"}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:isAct?C.acc:"transparent",marginBottom:2}}/>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">{icons[t.id]?icons[t.id](color):null}</svg>
            <span style={{fontSize:11,fontWeight:600,color}}>{t.l}</span>
          </button>
        );
      })}
    </div>
  );
};

// ═══ WELCOME ═══
const Welcome = ({onStart,onLogin}) => (
  <div className="fi" style={{flex:1,display:"flex",flexDirection:"column"}}>
    <div style={{position:"relative",height:320,flexShrink:0,overflow:"hidden"}}>
      <img src={PHOTOS.trainer_welcome} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(10,10,10,.2) 0%,rgba(10,10,10,.6) 60%,rgba(10,10,10,1) 100%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 20px"}}>
        <div style={{fontSize:12,color:C.acc,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:"rgba(200,245,58,.1)",border:"1px solid rgba(200,245,58,.25)",display:"inline-block",padding:"4px 14px",borderRadius:20,marginBottom:10}}>AI Trainer</div>
        <div style={{fontSize:36,fontWeight:900,color:C.tm,letterSpacing:-1.5,lineHeight:1.05}}>MATIAS<br/>FITNESS</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,.55)",marginTop:6}}>Персональний тренер · Одеса</div>
      </div>
    </div>
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:12,flex:1}}>
      <PBtn onClick={onStart}>Почати безкоштовно</PBtn>
      <GBtn onClick={onLogin}>Вже маю акаунт</GBtn>
      <div style={{fontSize:13,color:C.ts,textAlign:"center"}}>Без карти · <span style={{color:C.acc,fontWeight:600}}>3 дні повного доступу</span></div>
    </div>
  </div>
);

// ═══ PLAN SELECT ═══
const PLANS_STATIC = {
  start:{
    name:"START", price:799, stars:500,
    desc:"Базовий старт для новачків",
    features:["Шаблонний тренувальний план","Базовий план харчування (КБЖУ)","Трекінг ваги і прогресу","Чекіни без фідбеку"],
    no:["AI персоналізація","Фідбек тренера","БАДи"]
  },
  premium:{
    name:"PREMIUM", price:1699, stars:999, hot:true,
    desc:"Персональний підхід від ШІ-тренера",
    features:["Персональний план від Claude AI","Щотижневе оновлення плану","Чекіни 2× на тиждень з AI фідбеком","Індивідуальне харчування з грамами","Відповіді тренера на питання"],
    no:["Прямий зв'язок з тренером","Пропись БАДів"]
  },
  vip:{
    name:"VIP", price:3499, stars:1999,
    desc:"Максимальний результат з особистим супроводом",
    features:["Все що в PREMIUM","Прямий зв'язок з тренером особисто","Пропись БАДів під твої цілі","Корекція плану в будь-який момент","Пріоритетна відповідь 24/7"],
    no:[]
  },
};
const TRAINER_LINK = "https://t.me/matmatias";
// ═══ MENU (тарифи і опис) ═══
const MenuScreen = ({plans,payLinks,onSelectPlan,clientPlan,onShowReviews}) => {
  const p = plans || PLANS_STATIC;
  const planV = {start:"green",premium:"blue",vip:"purple"};
  return (
    <Scr>
      <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>Тарифи</div>
      <div style={{fontSize:15,color:C.ts,lineHeight:1.6}}>Обери рівень під свої цілі. Всі тарифи починаються з 3 днів безкоштовно.</div>
      {Object.entries(p).map(([k,plan])=>(
        <div key={k} style={{background:C.s1,borderRadius:18,border:`1.5px solid ${plan.hot?C.acc:C.bc}`,padding:"18px",position:"relative",overflow:"hidden"}}>
          {plan.hot&&<div style={{position:"absolute",top:16,right:16,fontSize:11,color:"#0a0a0a",background:C.acc,borderRadius:20,padding:"3px 12px",fontWeight:800}}>Популярний</div>}
          {clientPlan===k&&<div style={{position:"absolute",top:16,right:plan.hot?120:16,fontSize:11,color:C.acc,background:"rgba(200,245,58,.1)",border:`1px solid ${C.acc}`,borderRadius:20,padding:"3px 12px",fontWeight:700}}>Твій тариф</div>}
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
            <div style={{fontSize:22,fontWeight:900,color:C.tm}}>{plan.name}</div>
          </div>
          <div style={{fontSize:36,fontWeight:900,color:C.acc,letterSpacing:-1,marginBottom:4}}>{plan.price} <span style={{fontSize:15,color:C.ts,fontWeight:500}}>₴/міс</span></div>
          <div style={{fontSize:14,color:C.ts,marginBottom:14}}>{plan.desc}</div>
          <div style={{height:1,background:C.bc,marginBottom:12}}/>
          <div style={{fontSize:12,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Включено:</div>
          {(plan.features||[]).map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.tm,marginBottom:7}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(200,245,58,.15)",border:`1px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke={C.acc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {f}
            </div>
          ))}
          {(plan.no||[]).length>0&&<>
            <div style={{fontSize:12,color:C.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8,marginTop:4}}>Недоступно:</div>
            {(plan.no||[]).map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.td,marginBottom:6}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:C.s2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke={C.td} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {f}
              </div>
            ))}
          </>}
          {clientPlan!==k&&<PBtn onClick={()=>onSelectPlan(k)} style={{marginTop:14,background:plan.hot?C.acc:C.s2,color:plan.hot?"#0a0a0a":C.tm}}>
            {clientPlan?"Перейти на "+plan.name:"Обрати "+plan.name}
          </PBtn>}
        </div>
      ))}
      <div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:16,padding:"16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:C.acc,marginBottom:6}}>Питання щодо тарифів?</div>
        <div style={{fontSize:14,color:C.ts,marginBottom:12,lineHeight:1.6}}>Напиши тренеру — підберемо оптимальний варіант особисто.</div>
        <a href={TRAINER_LINK} style={{textDecoration:"none"}}>
          <PBtn style={{background:C.s2,color:C.tm}}>Написати тренеру</PBtn>
        </a>
      </div>
      <ReviewsPreview onShowAll={onShowReviews}/>
    </Scr>
  );
};

const ReviewsPreview = ({onShowAll}) => {
  const [reviews,setReviews]=useState([]);
  useEffect(()=>{
    apiGet("/api/reviews").then(r=>setReviews((r.reviews||[]).slice(0,3))).catch(()=>{});
  },[]);
  if(!reviews.length)return null;
  return(
    <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.bc}`}}>
        <div style={{fontSize:16,fontWeight:800,color:C.tm}}>Відгуки клієнтів</div>
        <button onClick={onShowAll} style={{background:"none",fontSize:13,color:C.acc,fontWeight:700}}>Всі →</button>
      </div>
      {reviews.map(r=>(
        <div key={r.id} style={{padding:"12px 16px",borderBottom:`1px solid ${C.bc}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
            <div style={{fontSize:13,fontWeight:700,color:C.tm}}>{r.full_name||"Анонімно"}</div>
            <div>{Array.from({length:5},(_,i)=><span key={i} style={{fontSize:12,opacity:i<r.rating?1:.2}}>⭐</span>)}</div>
          </div>
          {r.text_positive&&<div style={{fontSize:13,color:C.ts,lineHeight:1.5}}>{r.text_positive.slice(0,100)}{r.text_positive.length>100?"...":""}</div>}
        </div>
      ))}
    </div>
  );
};

const PlanSelect = ({plans,payLinks,onSelect}) => {
  const p=plans||PLANS_STATIC;
  return (
    <Scr>
      <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1}}>Обери тариф</div>
      <div style={{fontSize:14,color:C.ts}}>3 дні безкоштовно на будь-якому тарифі</div>
      {Object.entries(p).map(([k,plan])=>(
        <div key={k} className={plan.hot?"bl":""} onClick={()=>onSelect(k)}
          style={{background:C.s1,borderRadius:18,border:`1.5px solid ${plan.hot?C.acc:C.bc}`,padding:"16px",cursor:"pointer"}}>
          {plan.hot&&<div style={{fontSize:11,color:"#0a0a0a",background:C.acc,borderRadius:20,padding:"3px 12px",display:"inline-block",marginBottom:8,fontWeight:800}}>Популярний</div>}
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:20,fontWeight:800,color:C.tm}}>{plan.name}</div>
            <div>
              <div style={{fontSize:26,fontWeight:900,color:C.acc}}>{plan.price} <span style={{fontSize:13,color:C.ts,fontWeight:500}}>₴/міс</span></div>
              {plan.stars&&<div style={{fontSize:12,color:"#f6c90e",fontWeight:600,marginTop:2}}>⭐ або {plan.stars} зірок Telegram</div>}
            </div>
          </div>
          {(plan.features||[]).map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:plan.hot?"#d8f080":C.ts,marginBottom:5}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.acc,flexShrink:0}}/>{f}
            </div>
          ))}
        </div>
      ))}
    </Scr>
  );
};

// ═══ PAYMENT ═══
const Payment = ({planKey,plans,payLinks,onBack,onPaid,userId}) => {
  const plan=(plans||PLANS_STATIC)[planKey];
  const link=(payLinks||{})[planKey]||"#";
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);

  const sendScreenshot=async()=>{
    if(!userId)return;
    setSending(true);
    try{
      await apiPost(`/api/client/${userId}/payment-screenshot`,{plan:planKey});
      setSent(true);
      // Не робимо автоматичний перехід — клієнт бачить інструкцію і сам вирішує
    }catch(e){
      alert("Помилка: "+e.message);
    }
    setSending(false);
  };

  if(sent)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(200,245,58,.1)",border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="32" height="32" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 7-7" stroke={C.acc} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Тренер отримав сповіщення!</div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid rgba(200,245,58,.2)`,padding:"16px",width:"100%"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:10,textTransform:"uppercase",letterSpacing:.7}}>Що робити далі:</div>
        {[
          ["1","Відкрий бота @fitcore_matias_bot"],
          ["2","Натисни кнопку або напиши будь-що"],
          ["3","Надішли скріншот оплати в чат"],
          ["4","Тренер підтвердить протягом 1 години"],
        ].map(([n,t])=>(
          <div key={n} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:C.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#080808",flexShrink:0}}>{n}</div>
            <div style={{fontSize:14,color:C.ts,lineHeight:1.5,textAlign:"left"}}>{t}</div>
          </div>
        ))}
      </div>
      <a href="https://t.me/fitcore_matias_bot" style={{textDecoration:"none",width:"100%"}}>
        <PBtn>Відкрити бота</PBtn>
      </a>
      <GBtn onClick={onBack}>Повернутись назад</GBtn>
    </div>
  );

  return (
    <Scr>
      <TNav title="Оплата" onBack={onBack}/>
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,marginBottom:10,fontWeight:600}}>Замовлення</div>
        {[["Тариф",plan?.name],["Пробний","3 дні безкоштовно"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15}}>
            <span style={{color:C.ts}}>{l}</span>
            <span style={{color:l==="Пробний"?C.acc:C.tm,fontWeight:600}}>{v}</span>
          </div>
        ))}
        <Div style={{margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:16,fontWeight:700,color:C.tm}}>До сплати</span>
          <span style={{fontSize:32,fontWeight:900,color:C.acc}}>{plan?.price} ₴</span>
        </div>
      </div>
      <div className="bl" style={{background:"rgba(200,245,58,.05)",borderRadius:18,border:`1.5px solid ${C.acc}`,padding:"16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,background:C.s2,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="13" rx="2.5" stroke={C.acc} strokeWidth="1.6" fill="none"/><path d="M2 10h18" stroke={C.acc} strokeWidth="1.6"/><circle cx="7" cy="14.5" r="1.8" fill={C.acc}/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:C.tm}}>Monobank jar</div>
          <div style={{fontSize:12,color:C.ts,marginTop:2}}>MatiasFitness — {plan?.name}</div>
        </div>
      </div>
      <PBtn onClick={()=>{
        if(link&&link!=="#"){
          if(window.Telegram?.WebApp?.openLink){window.Telegram.WebApp.openLink(link);}
          else{window.open(link,"_blank");}
        }
      }}>💳 Monobank</PBtn>
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}>
        <div style={{flex:1,height:1,background:C.bc}}/>
        <div style={{fontSize:12,color:C.td}}>або</div>
        <div style={{flex:1,height:1,background:C.bc}}/>
      </div>
      <PBtn onClick={()=>{
        const tg=window.Telegram?.WebApp;
        if(tg){tg.close();}
        // Stars payment triggered via bot
        fetch(`${API_BASE}/api/client/${userId}/request-stars-payment`,{
          method:"POST",
          headers:{"Content-Type":"application/json","X-Dev-User-Id":String(userId)},
          body:JSON.stringify({plan:planKey})
        }).then(()=>{
          if(tg){setTimeout(()=>tg.close(),500);}
        }).catch(e=>console.error(e));
      }} style={{background:"linear-gradient(135deg,#f6c90e,#e4a200)",color:"#000"}}>⭐ Оплатити зірками Telegram</PBtn>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.tm,marginBottom:6}}>Вже оплатив?</div>
        <div style={{fontSize:13,color:C.ts,marginBottom:12,lineHeight:1.6}}>Натисни кнопку — тренер отримає сповіщення і надішле запит на скріншот прямо в бот.</div>
        <PBtn onClick={sendScreenshot} loading={sending} style={{background:C.s2,color:C.tm}}>
          {sending?"Надсилаю...":"📸 Надіслати скріншот оплати"}
        </PBtn>
      </div>
    </Scr>
  );
};

// ═══ TRAINING PLAN ═══
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
    setGen(false);
  };
  if(loading)return <Spin/>;
  if(!data)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"0 24px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.ts,textAlign:"center"}}>План ще не готовий</div>
      <PBtn onClick={generate} loading={gen} style={{maxWidth:260}}>{gen?"Генерую...":"Згенерувати план"}</PBtn>
    </div>
  );
  let days=[],weekNote="";
  try{const p=JSON.parse(data.plan_text||"{}");days=p.training?.days||[];weekNote=p.training?.week_note||"";}catch{}
  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:140,flexShrink:0,overflow:"hidden"}}>
        <img src={PHOTOS.trainer_plan} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(10,10,10,.92) 0%,rgba(10,10,10,.5) 55%,rgba(10,10,10,.1) 100%)"}}/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 18px"}}>
          <div style={{fontSize:11,color:C.acc,fontWeight:700,letterSpacing:.8,textTransform:"uppercase"}}>Тиждень {data.week_number||1}</div>
          <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-.8,marginTop:3}}>{days.length} тренувань</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:3}}>{days.filter(d=>d.exercises?.length).map(d=>d.muscle_group?.split(" ")[0]).slice(0,3).join(" · ")}</div>
        </div>
        <button onClick={generate} disabled={gen} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"rgba(200,245,58,.15)",border:`1px solid rgba(200,245,58,.3)`,borderRadius:10,padding:"6px 12px",color:C.acc,fontSize:11,fontWeight:700}}>
          {gen?"...":"Оновити"}
        </button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px 20px",display:"flex",flexDirection:"column",gap:10}}>
        {days.length>0?days.map((d,i)=>(
          <div key={i} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
            <div style={{background:C.s2,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.bc}`}}>
              <div style={{fontSize:17,fontWeight:800,color:C.tm}}>{d.day}</div>
              {d.muscle_group&&<div style={{fontSize:11,color:"#0a0a0a",background:C.acc,padding:"4px 12px",borderRadius:20,fontWeight:800}}>{d.muscle_group}</div>}
            </div>
            {(d.exercises||[]).length>0&&(
              <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {(d.exercises||[]).map((ex,j)=>(
                  <div key={j}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:C.acc,flexShrink:0}}/>
                        <div style={{fontSize:14,color:C.tm}}>{ex.name}</div>
                      </div>
                      <div style={{fontSize:13,color:C.acc,fontWeight:700,background:"rgba(200,245,58,.08)",padding:"4px 10px",borderRadius:8}}>{ex.sets}×{ex.reps}</div>
                    </div>
                    {ex.note&&<div style={{fontSize:12,color:C.td,fontStyle:"italic",marginTop:3,paddingLeft:14}}>📌 {ex.note}</div>}
                    {ex.technique&&<div style={{fontSize:12,color:"rgba(200,245,58,0.75)",marginTop:4,paddingLeft:14,lineHeight:1.5}}>💡 {ex.technique}</div>}
                  </div>
                ))}
                {d.rest_note&&<div style={{fontSize:12,color:C.td,fontStyle:"italic",marginTop:4}}>{d.rest_note}</div>}
              </div>
            )}
            {!(d.exercises||[]).length&&<div style={{padding:"12px 16px",fontSize:14,color:C.ts}}>День відпочинку · активне відновлення</div>}
          </div>
        )):(
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:14,color:C.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.plan_text}</div>
          </div>
        )}
        {weekNote&&<div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:14,padding:"12px 14px",display:"flex",gap:8}}>
          <div style={{width:3,background:C.acc,borderRadius:2,flexShrink:0}}/>
          <div style={{fontSize:13,color:C.ts,lineHeight:1.6}}>{weekNote}</div>
        </div>}
      </div>
    </div>
  );
};

// ═══ NUTRITION ═══
const Nutrition = ({userId}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet(`/api/client/${userId}/plan`).then(r=>{setData(r.plan);setLoad(false);}).catch(()=>setLoad(false));},[userId]);
  if(loading)return <Spin/>;
  if(!data)return <Scr><div style={{padding:"50px 0",textAlign:"center",color:C.ts,fontSize:15}}>Харчування не призначено</div></Scr>;
  let nut=null;
  try{const p=JSON.parse(data.plan_text||"{}");nut=p.nutrition||null;}catch{}
  if(!nut)return <Scr><div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}><div style={{fontSize:14,color:C.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.nutrition_text||"Не знайдено"}</div></div></Scr>;
  const macros=[{l:"Білок",v:`${nut.protein}г`,pct:72,c:C.acc},{l:"Жири",v:`${nut.fat}г`,pct:55,c:C.amber},{l:"Вуглеводи",v:`${nut.carbs}г`,pct:65,c:C.blue}];
  return(
    <Scr>
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:130,height:130,borderRadius:"50%",background:C.acc,opacity:.04}}/>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>Денна норма</div>
        <div style={{marginTop:6}}><span style={{fontSize:48,fontWeight:900,color:C.tm,letterSpacing:-2,lineHeight:1}}>{nut.calories}</span> <span style={{fontSize:16,color:C.ts}}>ккал</span></div>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          {macros.map(m=>(
            <div key={m.l} style={{flex:1,background:C.s2,borderRadius:12,padding:"12px 10px"}}>
              <div style={{fontSize:11,color:C.ts,textTransform:"uppercase",letterSpacing:.5,fontWeight:600}}>{m.l}</div>
              <div style={{fontSize:18,fontWeight:800,color:C.tm,margin:"5px 0 6px"}}>{m.v}</div>
              <div style={{height:3,background:C.bc,borderRadius:2}}><div style={{height:"100%",width:`${m.pct}%`,background:m.c,borderRadius:2}}/></div>
            </div>
          ))}
        </div>
      </div>
      {(nut.meals||[]).map((m,i)=>(
        <div key={i} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
          <div style={{background:C.s2,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:C.acc,fontWeight:700,background:"rgba(200,245,58,.1)",display:"inline-block",padding:"2px 9px",borderRadius:8,marginBottom:4}}>{m.time}</div>
              <div style={{fontSize:17,fontWeight:800,color:C.tm}}>{m.name}</div>
            </div>
            <div style={{fontSize:26,fontWeight:900,color:C.acc}}>{m.kcal}</div>
          </div>
          <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:6}}>
            {(m.foods||[]).map((f,j)=>(
              <div key={j}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:15}}>
                  <span style={{color:C.tm}}>{f.name}</span>
                  <span style={{color:C.ts,background:C.s2,padding:"3px 10px",borderRadius:8,fontSize:13,fontWeight:600}}>{f.qty}</span>
                </div>
                {j<(m.foods||[]).length-1&&<div style={{height:1,background:C.bc,margin:"5px 0"}}/>}
              </div>
            ))}
          </div>
        </div>
      ))}
      {nut.water_liters&&<div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:13,color:C.ts}}>Вода на день</div><div style={{fontSize:22,fontWeight:800,color:C.tm,marginTop:3}}>{nut.water_liters} <span style={{fontSize:14,color:C.ts,fontWeight:500}}>літрів</span></div></div>
        <div style={{display:"flex",gap:4}}>
          {Array.from({length:10},(_,i)=><div key={i} style={{width:10,height:28,borderRadius:4,background:i<Math.round(nut.water_liters/0.28)?C.acc:C.s3}}/>)}
        </div>
      </div>}
    </Scr>
  );
};

// ═══ CHECKIN ═══
const Checkin = ({userId,onDone}) => {
  const [w,setW]=useState("");const [e,setE]=useState(null);const [s,setS]=useState("");const [c,setC]=useState("");
  const [loading,setLoad]=useState(false);const [result,setResult]=useState(null);
  const submit=async()=>{
    if(!w||!e)return;setLoad(true);
    try{const r=await apiPost(`/api/client/${userId}/checkin`,{weight_kg:parseFloat(w),energy_level:e,sleep_hours:s?parseFloat(s):null,comment:c||null});setResult(r);}
    catch(err){alert("Помилка: "+err.message);}
    setLoad(false);
  };
  if(result)return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 24px"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(200,245,58,.1)",border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="32" height="32" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 7-7" stroke={C.acc} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Збережено!</div>
      <div style={{display:"flex",gap:14,fontSize:15}}>
        <span style={{color:C.ts}}>Стрік: <span style={{color:C.acc,fontWeight:700}}>{result.streak} днів</span></span>
        {result.delta!=null&&<span style={{color:C.ts}}>{result.delta>0?"+":""}<span style={{color:C.acc,fontWeight:700}}>{result.delta} кг</span></span>}
      </div>
      {result.feedback&&<div style={{background:C.s1,border:`1px solid rgba(200,245,58,.2)`,borderRadius:16,padding:"16px",width:"100%"}}>
        <div style={{fontSize:11,color:C.acc,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.8}}>Фідбек тренера</div>
        <div style={{fontSize:15,color:C.tm,lineHeight:1.7}}>{result.feedback}</div>
      </div>}
      <PBtn onClick={onDone} style={{maxWidth:220}}>Готово</PBtn>
    </div>
  );
  return(
    <Scr>
      <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1}}>Чекін</div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:8}}>Вага сьогодні (кг)</div>
        <input value={w} onChange={ev=>setW(ev.target.value)} type="number" placeholder="82.5" style={{background:"none",color:C.tm,fontSize:40,fontWeight:900,width:"100%",letterSpacing:-1}}/>
      </div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:10}}>Рівень енергії</div>
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setE(n)} style={{flex:1,background:e===n?C.acc:C.s2,border:`1px solid ${e===n?C.acc:C.bc}`,borderRadius:12,padding:"12px 0",fontSize:16,fontWeight:800,color:e===n?"#0a0a0a":C.ts}}>{n}</button>
          ))}
        </div>
      </div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:8}}>Сон (годин)</div>
        <input value={s} onChange={ev=>setS(ev.target.value)} type="number" placeholder="7.5" style={{background:"none",color:C.tm,fontSize:32,fontWeight:800,width:"100%"}}/>
      </div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:8}}>Коментар</div>
        <textarea value={c} onChange={ev=>setC(ev.target.value)} placeholder="Як пройшло тренування?" rows={2} style={{background:"none",color:C.tm,fontSize:15,width:"100%",resize:"none",lineHeight:1.6}}/>
      </div>
      <PBtn onClick={submit} loading={loading} disabled={!w||!e}>{loading?"Зберігаю...":"Зберегти чекін"}</PBtn>
    </Scr>
  );
};

// ═══ REVIEWS ═══
const ReviewsScreen = ({userId}) => {
  const [reviews,setReviews]=useState([]);
  const [loading,setLoad]=useState(true);
  const [showForm,setForm]=useState(false);
  const [rating,setRating]=useState(0);
  const [pos,setPos]=useState("");
  const [imp,setImp]=useState("");
  const [anon,setAnon]=useState(false);
  const [sending,setSend]=useState(false);
  const [sent,setSent]=useState(false);

  useEffect(()=>{
    apiGet("/api/reviews").then(r=>{setReviews(r.reviews||[]);setLoad(false);}).catch(()=>setLoad(false));
  },[]);

  const submit=async()=>{
    if(!rating)return;
    setSend(true);
    try{
      await apiPost(`/api/client/${userId}/review`,{rating,text_positive:pos,text_improve:imp,is_anonymous:anon});
      setSent(true);
      setForm(false);
      const r=await apiGet("/api/reviews");
      setReviews(r.reviews||[]);
    }catch(e){alert("Помилка: "+e.message);}
    setSend(false);
  };

  const stars=(n,selected)=>Array.from({length:5},(_,i)=>(
    <button key={i} onClick={()=>selected(i+1)}
      style={{width:40,height:40,borderRadius:12,background:i<n?"rgba(240,160,48,.15)":"var(--s2)",border:`1.5px solid ${i<n?"rgba(240,160,48,.4)":"var(--bc)"}`,fontSize:20,cursor:"pointer"}}>
      {i<n?"⭐":"☆"}
    </button>
  ));

  if(showForm)return(
    <Scr>
      <TNav title="Залишити відгук" onBack={()=>setForm(false)}/>
      {sent?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,textAlign:"center"}}>
          <div style={{fontSize:48}}>🙏</div>
          <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Дякуємо!</div>
          <div style={{fontSize:15,color:C.ts,lineHeight:1.7}}>Відгук надіслано тренеру і опубліковано.</div>
          <PBtn onClick={()=>setSent(false)} style={{maxWidth:200}}>Готово</PBtn>
        </div>
      ):(
        <>
          <div style={{fontSize:14,color:C.ts,lineHeight:1.6}}>Твій відгук допомагає покращувати програму і мотивує інших клієнтів.</div>
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Загальна оцінка</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>{stars(rating,setRating)}</div>
            {rating>0&&<div style={{textAlign:"center",fontSize:14,fontWeight:700,color:C.amber,marginTop:8}}>
              {["","😞 Погано","😕 Нижче середнього","😐 Нормально","😊 Добре","🔥 Відмінно"][rating]}
            </div>}
          </div>
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Що найбільше подобається?</div>
            <textarea value={pos} onChange={e=>setPos(e.target.value)} placeholder="Розкажи що тобі подобається в програмі..." rows={3}
              style={{background:C.s2,border:`1px solid ${pos?C.bc2:C.bc}`,borderRadius:12,padding:"12px",color:C.tm,fontSize:14,width:"100%",resize:"none",lineHeight:1.6}}/>
          </div>
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Що можна покращити?</div>
            <textarea value={imp} onChange={e=>setImp(e.target.value)} placeholder="Твої побажання для тренера..." rows={2}
              style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px",color:C.tm,fontSize:14,width:"100%",resize:"none",lineHeight:1.6}}/>
          </div>
          <button onClick={()=>setAnon(!anon)} style={{background:"none",display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
            <div style={{width:20,height:20,borderRadius:6,background:anon?"rgba(200,245,58,.15)":"var(--s2)",border:`1.5px solid ${anon?C.acc:C.bc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {anon&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={C.acc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{fontSize:14,color:C.ts}}>Публікувати анонімно</span>
          </button>
          <PBtn onClick={submit} loading={sending} disabled={!rating}>{sending?"Надсилаю...":"Надіслати відгук"}</PBtn>
        </>
      )}
    </Scr>
  );

  return(
    <Scr>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>Відгуки</div>
        <button onClick={()=>setForm(true)} style={{background:C.acc,color:"#080808",borderRadius:20,padding:"8px 16px",fontSize:13,fontWeight:800}}>+ Залишити</button>
      </div>
      {loading?<Spin/>:reviews.length===0?(
        <div style={{padding:"40px 0",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>💬</div>
          <div style={{fontSize:15,color:C.ts,lineHeight:1.7}}>Відгуків поки немає.<br/>Будь першим!</div>
        </div>
      ):reviews.map(r=>(
        <div key={r.id} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700,color:C.tm}}>{r.full_name||"Анонімно"}</div>
            <div style={{display:"flex",gap:2}}>{Array.from({length:5},(_,i)=>(
              <span key={i} style={{fontSize:14,opacity:i<r.rating?1:.25}}>⭐</span>
            ))}</div>
          </div>
          {r.text_positive&&<div style={{fontSize:14,color:C.ts,lineHeight:1.6,marginBottom:6}}>👍 {r.text_positive}</div>}
          {r.text_improve&&<div style={{fontSize:13,color:C.td,lineHeight:1.6}}>💡 {r.text_improve}</div>}
          <div style={{fontSize:11,color:C.td,marginTop:8}}>{(r.created_at||"").slice(0,10)}</div>
        </div>
      ))}
    </Scr>
  );
};

// ═══ NOTIFICATIONS SETTINGS ═══
const NotificationsScreen = ({userId,nutritionPlan}) => {
  const [settings,setSettings]=useState(null);
  const [loading,setLoad]=useState(true);
  const [saving,setSave]=useState(false);
  const [saved,setSaved]=useState(false);

  const DAYS=[{n:"Пн",v:"1"},{n:"Вт",v:"2"},{n:"Ср",v:"3"},{n:"Чт",v:"4"},{n:"Пт",v:"5"},{n:"Сб",v:"6"},{n:"Нд",v:"7"}];

  useEffect(()=>{
    apiGet(`/api/client/${userId}/notifications`).then(r=>{
      setSettings({...r,meal_settings:r.meal_settings||{}});
      setLoad(false);
    }).catch(()=>{
      setSettings({workout_enabled:true,workout_time:"18:00",workout_days:"1,3,5",checkin_enabled:true,water_enabled:true,meal_settings:{}});
      setLoad(false);
    });
  },[userId]);

  const save=async()=>{
    setSave(true);
    try{
      await apiPost(`/api/client/${userId}/notifications`,settings);
      setSaved(true);
      setTimeout(()=>setSaved(false),2000);
    }catch(e){alert("Помилка: "+e.message);}
    setSave(false);
  };

  const toggleDay=d=>{
    const days=(settings.workout_days||"").split(",").filter(Boolean);
    const newDays=days.includes(d)?days.filter(x=>x!==d):[...days,d].sort();
    setSettings(s=>({...s,workout_days:newDays.join(",")}));
  };

  const toggleMeal=(name,enabled)=>{
    setSettings(s=>({...s,meal_settings:{...s.meal_settings,[name]:{...s.meal_settings[name],enabled}}}));
  };

  if(loading)return <Spin/>;

  const mealItems=nutritionPlan?.meals||[
    {name:"Сніданок",time:"07:30"},{name:"Перекус",time:"10:30"},{name:"Обід",time:"13:00"},
    {name:"Пред-тренув.",time:"16:00"},{name:"Вечеря",time:"18:30"},{name:"Пізній перекус",time:"21:00"}
  ];
  const mealColors=["#c8f53a","#f0a030","#3a9fd8","#9b7fe8","#ff6b6b","#888"];

  const Tog=({on,onToggle,size=44})=>(
    <div onClick={onToggle} style={{width:size,height:size*0.55,borderRadius:size*0.28,background:on?C.acc:C.s3,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
      <div style={{width:size*0.42,height:size*0.42,borderRadius:"50%",background:on?"#080808":C.ts,position:"absolute",top:size*0.065,left:on?size*0.52:size*0.065,transition:"left .2s"}}/>
    </div>
  );

  return(
    <Scr>
      <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>Нагадування</div>
      <div style={{fontSize:14,color:C.ts}}>Налаштуй сповіщення під свій розклад.</div>

      {saved&&<div style={{background:"rgba(200,245,58,.1)",border:"1px solid rgba(200,245,58,.2)",borderRadius:14,padding:"12px 16px",fontSize:14,color:C.acc,fontWeight:700}}>✓ Збережено</div>}

      <div style={{fontSize:13,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,padding:"4px 0"}}>Тренування</div>

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Нагадування про тренування</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>За 30 хв до початку</div></div>
        <Tog on={settings.workout_enabled} onToggle={()=>setSettings(s=>({...s,workout_enabled:!s.workout_enabled}))}/>
      </div>

      {settings.workout_enabled&&<>
        <div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:14,color:C.ts}}>Час тренування</div>
          <input type="time" value={settings.workout_time||"18:00"} onChange={e=>setSettings(s=>({...s,workout_time:e.target.value}))}
            style={{background:"none",color:C.acc,fontSize:16,fontWeight:700,border:"none",outline:"none",textAlign:"right"}}/>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {DAYS.map(d=>{
            const active=(settings.workout_days||"").split(",").includes(d.v);
            return <button key={d.v} onClick={()=>toggleDay(d.v)}
              style={{width:40,height:40,borderRadius:12,background:active?C.acc:C.s1,border:`1px solid ${active?C.acc:C.bc}`,fontSize:13,fontWeight:700,color:active?"#080808":C.ts}}>{d.n}</button>;
          })}
        </div>
      </>}

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Нагадування про чекін</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Ср і Пт о 19:00</div></div>
        <Tog on={settings.checkin_enabled} onToggle={()=>setSettings(s=>({...s,checkin_enabled:!s.checkin_enabled}))}/>
      </div>

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Нагадування про воду</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Кожні 2 години з 9:00</div></div>
        <Tog on={settings.water_enabled} onToggle={()=>setSettings(s=>({...s,water_enabled:!s.water_enabled}))}/>
      </div>

      <div style={{fontSize:13,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,padding:"4px 0"}}>Прийоми їжі</div>

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Всі нагадування їжі</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Головний перемикач</div></div>
        <Tog on={Object.values(settings.meal_settings||{}).some(m=>m.enabled!==false)} onToggle={()=>{
          const allOn=mealItems.every(m=>(settings.meal_settings[m.name]?.enabled)!==false);
          const newMs={};
          mealItems.forEach(m=>{newMs[m.name]={...settings.meal_settings[m.name],enabled:!allOn};});
          setSettings(s=>({...s,meal_settings:newMs}));
        }}/>
      </div>

      {mealItems.map((m,i)=>{
        const ms=settings.meal_settings[m.name]||{};
        const enabled=ms.enabled!==false;
        const mealTime=ms.time||m.time;
        return(
          <div key={m.name} style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"10px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:mealColors[i],flexShrink:0}}/>
                <div style={{fontSize:14,fontWeight:600,color:C.tm}}>{m.name}</div>
              </div>
              <Tog on={enabled} onToggle={()=>toggleMeal(m.name,!enabled)} size={38}/>
            </div>
            {enabled&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1px solid ${C.bc}`}}>
              <div style={{fontSize:12,color:C.ts}}>Час</div>
              <input type="time" value={mealTime}
                onChange={e=>setSettings(s=>({...s,meal_settings:{...s.meal_settings,[m.name]:{...ms,enabled,time:e.target.value}}}))}
                style={{background:"none",color:C.acc,fontSize:14,fontWeight:700,border:"none",outline:"none"}}/>
            </div>}
          </div>
        );
      })
      ])}
import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const tg = window.Telegram?.WebApp;
const getInitData = () => tg?.initData || "";
const getTgUser = () => tg?.initDataUnsafe?.user || null;

async function api(path, options = {}) {
  const uid = getTgUser()?.id;
  const headers = { "Content-Type": "application/json", "X-Telegram-Init-Data": getInitData() };
  if (!getInitData() && uid) headers["X-Dev-User-Id"] = String(uid);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers||{}) }, body: options.body ? JSON.stringify(options.body) : undefined });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
const apiGet  = p => api(p);
const apiPost = (p,b) => api(p, { method:"POST", body:b });

const PHOTOS = {
  trainer_welcome: "/photo2.jpg",
  trainer_profile: "/photo1.jpg",
  trainer_plan:    "/photo3.jpg",
};

const C = {
  bg:"#0a0a0a", s1:"#111111", s2:"#161616", s3:"#1c1c1c",
  acc:"#c8f53a", acc2:"#a8d420",
  tm:"#ffffff", ts:"#888888", td:"#444444", bc:"#222222",
  red:"#ff5555", amber:"#e8a832", blue:"#4a9fdf",
};

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{background:${C.bg};color:${C.tm};font-family:'Inter',sans-serif;min-height:100vh;}
    button{cursor:pointer;border:none;outline:none;font-family:'Inter',sans-serif;}
    input,textarea{font-family:'Inter',sans-serif;outline:none;}
    ::-webkit-scrollbar{width:0;}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,245,58,0);}50%{box-shadow:0 0 0 8px rgba(200,245,58,0.15);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes blink{0%,100%{border-color:${C.acc};}50%{border-color:#e8ff80;}}
    .fi{animation:fadeIn .3s ease forwards;}
    .pu{animation:pulse 2.5s ease-in-out infinite;}
    .sp{animation:spin 1s linear infinite;}
    .bl{animation:blink 2s ease-in-out infinite;}
  `}</style>
);

const Spin = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"50px 0"}}>
    <div className="sp" style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${C.s3}`,borderTopColor:C.acc}}/>
  </div>
);

const Div = ({style={}}) => <div style={{height:1,background:C.bc,...style}}/>;

const Bdg = ({children,v="green"}) => {
  const m = {green:[C.acc,C.acc,"rgba(200,245,58,.1)"],amber:[C.amber,"rgba(232,168,50,.3)","rgba(232,168,50,.1)"],red:[C.red,"rgba(255,85,85,.3)","rgba(255,85,85,.1)"],blue:[C.blue,"rgba(74,159,223,.3)","rgba(74,159,223,.1)"]}[v]||[C.acc,C.acc,"rgba(200,245,58,.1)"];
  return <span style={{fontSize:12,padding:"3px 10px",borderRadius:20,background:m[2],color:m[0],border:`1px solid ${m[1]}`,whiteSpace:"nowrap",fontWeight:600}}>{children}</span>;
};

const Ava = ({name="?",size=44}) => {
  const i=(name||"?").split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(200,245,58,.1)",border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:800,color:C.acc,flexShrink:0}}>{i}</div>;
};

const Tog = ({on,onToggle}) => (
  <div onClick={onToggle} style={{width:44,height:24,borderRadius:12,background:on?C.acc:C.s3,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
    <div style={{width:18,height:18,borderRadius:"50%",background:on?"#0a0a0a":C.ts,position:"absolute",top:3,left:on?23:3,transition:"left .2s"}}/>
  </div>
);

const PBtn = ({children,onClick,disabled,loading,style={}}) => (
  <button onClick={onClick} disabled={disabled||loading} className={disabled||loading?"":"pu"}
    style={{background:disabled||loading?"rgba(200,245,58,.3)":C.acc,color:"#0a0a0a",borderRadius:16,padding:"16px 0",width:"100%",fontSize:16,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,...style}}>
    {loading&&<div className="sp" style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(0,0,0,.2)",borderTopColor:"#0a0a0a"}}/>}
    {children}
  </button>
);

const GBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{background:"transparent",color:C.ts,border:`1px solid ${C.bc}`,borderRadius:16,padding:"14px 0",width:"100%",fontSize:15,fontWeight:600,...style}}>{children}</button>
);

const Scr = ({children,style={}}) => (
  <div className="fi" style={{flex:1,overflowY:"auto",padding:"12px 16px 20px",display:"flex",flexDirection:"column",gap:10,...style}}>{children}</div>
);

const TNav = ({title,onBack,rightEl}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 12px",borderBottom:`1px solid ${C.bc}`,flexShrink:0}}>
    <div style={{width:64}}>
      {onBack&&<button onClick={onBack} style={{background:"none",display:"flex",alignItems:"center",gap:4,color:C.acc,fontSize:14,fontWeight:600}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L5 9l6 5" stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Назад
      </button>}
    </div>
    <div style={{fontSize:18,fontWeight:800,color:C.tm,letterSpacing:"-.5px"}}>{title}</div>
    <div style={{width:64,display:"flex",justifyContent:"flex-end"}}>{rightEl}</div>
  </div>
);

const BNav = ({active,onChange,isAdmin}) => {
  const tabs = isAdmin
    ? [{id:"dashboard",l:"Огляд"},{id:"clients",l:"Клієнти"},{id:"payments",l:"Оплати"},{id:"broadcast",l:"Розсилка"},{id:"settings",l:"Налашт."}]
    : [{id:"plan",l:"План"},{id:"nutrition",l:"Харч."},{id:"progress",l:"Прогрес"},{id:"menu",l:"Меню"},{id:"profile",l:"Профіль"}];
  const icons = {
    plan: c=><path d="M3 9h12M2 7v4M4 6v6M11 6v6M13 7v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>,
    nutrition: c=><><path d="M9 2v5a4 4 0 01-4 4H5M15 2v14" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    progress: c=><path d="M2 14l4.5-5 3.5 3.5 5.5-7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    profile: c=><><circle cx="9" cy="6.5" r="3.5" stroke={c} strokeWidth="1.8" fill="none"/><path d="M2 17c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    dashboard: c=><><rect x="2" y="9" width="3.5" height="7" rx="1" fill={c}/><rect x="7" y="6" width="3.5" height="10" rx="1" fill={c}/><rect x="12" y="3" width="3.5" height="13" rx="1" fill={c}/></>,
    clients: c=><><circle cx="9" cy="6.5" r="3.5" stroke={c} strokeWidth="1.8" fill="none"/><path d="M2 17c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    payments: c=><><rect x="2" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.8" fill="none"/><path d="M2 9h14" stroke={c} strokeWidth="1.8"/><circle cx="6" cy="13" r="1.5" fill={c}/></>,
    broadcast: c=><path d="M2 9l13-6-5 6 5 6-13-6z" fill={c}/>,
    settings: c=><><circle cx="9" cy="9" r="3" stroke={c} strokeWidth="1.8" fill="none"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></>,
    menu: c=><><rect x="2" y="4" width="14" height="1.8" rx=".9" fill={c}/><rect x="2" y="8.1" width="10" height="1.8" rx=".9" fill={c}/><rect x="2" y="12.2" width="12" height="1.8" rx=".9" fill={c}/></>,
  };
  return (
    <div style={{display:"flex",borderTop:`1px solid ${C.bc}`,flexShrink:0,background:C.bg,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
      {tabs.map(t=>{
        const isAct=active===t.id;
        const color=isAct?C.acc:C.ts;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 0 14px"}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:isAct?C.acc:"transparent",marginBottom:2}}/>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">{icons[t.id]?icons[t.id](color):null}</svg>
            <span style={{fontSize:11,fontWeight:600,color}}>{t.l}</span>
          </button>
        );
      })}
    </div>
  );
};

// ═══ WELCOME ═══
const Welcome = ({onStart,onLogin}) => (
  <div className="fi" style={{flex:1,display:"flex",flexDirection:"column"}}>
    <div style={{position:"relative",height:320,flexShrink:0,overflow:"hidden"}}>
      <img src={PHOTOS.trainer_welcome} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(10,10,10,.2) 0%,rgba(10,10,10,.6) 60%,rgba(10,10,10,1) 100%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 20px"}}>
        <div style={{fontSize:12,color:C.acc,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:"rgba(200,245,58,.1)",border:"1px solid rgba(200,245,58,.25)",display:"inline-block",padding:"4px 14px",borderRadius:20,marginBottom:10}}>AI Trainer</div>
        <div style={{fontSize:36,fontWeight:900,color:C.tm,letterSpacing:-1.5,lineHeight:1.05}}>MATIAS<br/>FITNESS</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,.55)",marginTop:6}}>Персональний тренер · Одеса</div>
      </div>
    </div>
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:12,flex:1}}>
      <PBtn onClick={onStart}>Почати безкоштовно</PBtn>
      <GBtn onClick={onLogin}>Вже маю акаунт</GBtn>
      <div style={{fontSize:13,color:C.ts,textAlign:"center"}}>Без карти · <span style={{color:C.acc,fontWeight:600}}>3 дні повного доступу</span></div>
    </div>
  </div>
);

// ═══ PLAN SELECT ═══
const PLANS_STATIC = {
  start:{
    name:"START", price:799, stars:500,
    desc:"Базовий старт для новачків",
    features:["Шаблонний тренувальний план","Базовий план харчування (КБЖУ)","Трекінг ваги і прогресу","Чекіни без фідбеку"],
    no:["AI персоналізація","Фідбек тренера","БАДи"]
  },
  premium:{
    name:"PREMIUM", price:1699, stars:999, hot:true,
    desc:"Персональний підхід від ШІ-тренера",
    features:["Персональний план від Claude AI","Щотижневе оновлення плану","Чекіни 2× на тиждень з AI фідбеком","Індивідуальне харчування з грамами","Відповіді тренера на питання"],
    no:["Прямий зв'язок з тренером","Пропись БАДів"]
  },
  vip:{
    name:"VIP", price:3499, stars:1999,
    desc:"Максимальний результат з особистим супроводом",
    features:["Все що в PREMIUM","Прямий зв'язок з тренером особисто","Пропись БАДів під твої цілі","Корекція плану в будь-який момент","Пріоритетна відповідь 24/7"],
    no:[]
  },
};
const TRAINER_LINK = "https://t.me/matmatias";
// ═══ MENU (тарифи і опис) ═══
const MenuScreen = ({plans,payLinks,onSelectPlan,clientPlan,onShowReviews}) => {
  const p = plans || PLANS_STATIC;
  const planV = {start:"green",premium:"blue",vip:"purple"};
  return (
    <Scr>
      <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>Тарифи</div>
      <div style={{fontSize:15,color:C.ts,lineHeight:1.6}}>Обери рівень під свої цілі. Всі тарифи починаються з 3 днів безкоштовно.</div>
      {Object.entries(p).map(([k,plan])=>(
        <div key={k} style={{background:C.s1,borderRadius:18,border:`1.5px solid ${plan.hot?C.acc:C.bc}`,padding:"18px",position:"relative",overflow:"hidden"}}>
          {plan.hot&&<div style={{position:"absolute",top:16,right:16,fontSize:11,color:"#0a0a0a",background:C.acc,borderRadius:20,padding:"3px 12px",fontWeight:800}}>Популярний</div>}
          {clientPlan===k&&<div style={{position:"absolute",top:16,right:plan.hot?120:16,fontSize:11,color:C.acc,background:"rgba(200,245,58,.1)",border:`1px solid ${C.acc}`,borderRadius:20,padding:"3px 12px",fontWeight:700}}>Твій тариф</div>}
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
            <div style={{fontSize:22,fontWeight:900,color:C.tm}}>{plan.name}</div>
          </div>
          <div style={{fontSize:36,fontWeight:900,color:C.acc,letterSpacing:-1,marginBottom:4}}>{plan.price} <span style={{fontSize:15,color:C.ts,fontWeight:500}}>₴/міс</span></div>
          <div style={{fontSize:14,color:C.ts,marginBottom:14}}>{plan.desc}</div>
          <div style={{height:1,background:C.bc,marginBottom:12}}/>
          <div style={{fontSize:12,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Включено:</div>
          {(plan.features||[]).map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.tm,marginBottom:7}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(200,245,58,.15)",border:`1px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke={C.acc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {f}
            </div>
          ))}
          {(plan.no||[]).length>0&&<>
            <div style={{fontSize:12,color:C.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8,marginTop:4}}>Недоступно:</div>
            {(plan.no||[]).map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.td,marginBottom:6}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:C.s2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke={C.td} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {f}
              </div>
            ))}
          </>}
          {clientPlan!==k&&<PBtn onClick={()=>onSelectPlan(k)} style={{marginTop:14,background:plan.hot?C.acc:C.s2,color:plan.hot?"#0a0a0a":C.tm}}>
            {clientPlan?"Перейти на "+plan.name:"Обрати "+plan.name}
          </PBtn>}
        </div>
      ))}
      <div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:16,padding:"16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:C.acc,marginBottom:6}}>Питання щодо тарифів?</div>
        <div style={{fontSize:14,color:C.ts,marginBottom:12,lineHeight:1.6}}>Напиши тренеру — підберемо оптимальний варіант особисто.</div>
        <a href={TRAINER_LINK} style={{textDecoration:"none"}}>
          <PBtn style={{background:C.s2,color:C.tm}}>Написати тренеру</PBtn>
        </a>
      </div>
      <ReviewsPreview onShowAll={onShowReviews}/>
    </Scr>
  );
};

const ReviewsPreview = ({onShowAll}) => {
  const [reviews,setReviews]=useState([]);
  useEffect(()=>{
    apiGet("/api/reviews").then(r=>setReviews((r.reviews||[]).slice(0,3))).catch(()=>{});
  },[]);
  if(!reviews.length)return null;
  return(
    <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.bc}`}}>
        <div style={{fontSize:16,fontWeight:800,color:C.tm}}>Відгуки клієнтів</div>
        <button onClick={onShowAll} style={{background:"none",fontSize:13,color:C.acc,fontWeight:700}}>Всі →</button>
      </div>
      {reviews.map(r=>(
        <div key={r.id} style={{padding:"12px 16px",borderBottom:`1px solid ${C.bc}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
            <div style={{fontSize:13,fontWeight:700,color:C.tm}}>{r.full_name||"Анонімно"}</div>
            <div>{Array.from({length:5},(_,i)=><span key={i} style={{fontSize:12,opacity:i<r.rating?1:.2}}>⭐</span>)}</div>
          </div>
          {r.text_positive&&<div style={{fontSize:13,color:C.ts,lineHeight:1.5}}>{r.text_positive.slice(0,100)}{r.text_positive.length>100?"...":""}</div>}
        </div>
      ))}
    </div>
  );
};

const PlanSelect = ({plans,payLinks,onSelect}) => {
  const p=plans||PLANS_STATIC;
  return (
    <Scr>
      <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1}}>Обери тариф</div>
      <div style={{fontSize:14,color:C.ts}}>3 дні безкоштовно на будь-якому тарифі</div>
      {Object.entries(p).map(([k,plan])=>(
        <div key={k} className={plan.hot?"bl":""} onClick={()=>onSelect(k)}
          style={{background:C.s1,borderRadius:18,border:`1.5px solid ${plan.hot?C.acc:C.bc}`,padding:"16px",cursor:"pointer"}}>
          {plan.hot&&<div style={{fontSize:11,color:"#0a0a0a",background:C.acc,borderRadius:20,padding:"3px 12px",display:"inline-block",marginBottom:8,fontWeight:800}}>Популярний</div>}
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:20,fontWeight:800,color:C.tm}}>{plan.name}</div>
            <div>
              <div style={{fontSize:26,fontWeight:900,color:C.acc}}>{plan.price} <span style={{fontSize:13,color:C.ts,fontWeight:500}}>₴/міс</span></div>
              {plan.stars&&<div style={{fontSize:12,color:"#f6c90e",fontWeight:600,marginTop:2}}>⭐ або {plan.stars} зірок Telegram</div>}
            </div>
          </div>
          {(plan.features||[]).map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:plan.hot?"#d8f080":C.ts,marginBottom:5}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.acc,flexShrink:0}}/>{f}
            </div>
          ))}
        </div>
      ))}
    </Scr>
  );
};

// ═══ PAYMENT ═══
const Payment = ({planKey,plans,payLinks,onBack,onPaid,userId}) => {
  const plan=(plans||PLANS_STATIC)[planKey];
  const link=(payLinks||{})[planKey]||"#";
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);

  const sendScreenshot=async()=>{
    if(!userId)return;
    setSending(true);
    try{
      await apiPost(`/api/client/${userId}/payment-screenshot`,{plan:planKey});
      setSent(true);
      // Не робимо автоматичний перехід — клієнт бачить інструкцію і сам вирішує
    }catch(e){
      alert("Помилка: "+e.message);
    }
    setSending(false);
  };

  if(sent)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(200,245,58,.1)",border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="32" height="32" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 7-7" stroke={C.acc} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Тренер отримав сповіщення!</div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid rgba(200,245,58,.2)`,padding:"16px",width:"100%"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.acc,marginBottom:10,textTransform:"uppercase",letterSpacing:.7}}>Що робити далі:</div>
        {[
          ["1","Відкрий бота @fitcore_matias_bot"],
          ["2","Натисни кнопку або напиши будь-що"],
          ["3","Надішли скріншот оплати в чат"],
          ["4","Тренер підтвердить протягом 1 години"],
        ].map(([n,t])=>(
          <div key={n} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:C.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#080808",flexShrink:0}}>{n}</div>
            <div style={{fontSize:14,color:C.ts,lineHeight:1.5,textAlign:"left"}}>{t}</div>
          </div>
        ))}
      </div>
      <a href="https://t.me/fitcore_matias_bot" style={{textDecoration:"none",width:"100%"}}>
        <PBtn>Відкрити бота</PBtn>
      </a>
      <GBtn onClick={onBack}>Повернутись назад</GBtn>
    </div>
  );

  return (
    <Scr>
      <TNav title="Оплата" onBack={onBack}/>
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,marginBottom:10,fontWeight:600}}>Замовлення</div>
        {[["Тариф",plan?.name],["Пробний","3 дні безкоштовно"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15}}>
            <span style={{color:C.ts}}>{l}</span>
            <span style={{color:l==="Пробний"?C.acc:C.tm,fontWeight:600}}>{v}</span>
          </div>
        ))}
        <Div style={{margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:16,fontWeight:700,color:C.tm}}>До сплати</span>
          <span style={{fontSize:32,fontWeight:900,color:C.acc}}>{plan?.price} ₴</span>
        </div>
      </div>
      <div className="bl" style={{background:"rgba(200,245,58,.05)",borderRadius:18,border:`1.5px solid ${C.acc}`,padding:"16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,background:C.s2,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="13" rx="2.5" stroke={C.acc} strokeWidth="1.6" fill="none"/><path d="M2 10h18" stroke={C.acc} strokeWidth="1.6"/><circle cx="7" cy="14.5" r="1.8" fill={C.acc}/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:C.tm}}>Monobank jar</div>
          <div style={{fontSize:12,color:C.ts,marginTop:2}}>MatiasFitness — {plan?.name}</div>
        </div>
      </div>
      <PBtn onClick={()=>{
        if(link&&link!=="#"){
          if(window.Telegram?.WebApp?.openLink){window.Telegram.WebApp.openLink(link);}
          else{window.open(link,"_blank");}
        }
      }}>💳 Monobank</PBtn>
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}>
        <div style={{flex:1,height:1,background:C.bc}}/>
        <div style={{fontSize:12,color:C.td}}>або</div>
        <div style={{flex:1,height:1,background:C.bc}}/>
      </div>
      <PBtn onClick={()=>{
        const tg=window.Telegram?.WebApp;
        if(tg){tg.close();}
        // Stars payment triggered via bot
        fetch(`${API_BASE}/api/client/${userId}/request-stars-payment`,{
          method:"POST",
          headers:{"Content-Type":"application/json","X-Dev-User-Id":String(userId)},
          body:JSON.stringify({plan:planKey})
        }).then(()=>{
          if(tg){setTimeout(()=>tg.close(),500);}
        }).catch(e=>console.error(e));
      }} style={{background:"linear-gradient(135deg,#f6c90e,#e4a200)",color:"#000"}}>⭐ Оплатити зірками Telegram</PBtn>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.tm,marginBottom:6}}>Вже оплатив?</div>
        <div style={{fontSize:13,color:C.ts,marginBottom:12,lineHeight:1.6}}>Натисни кнопку — тренер отримає сповіщення і надішле запит на скріншот прямо в бот.</div>
        <PBtn onClick={sendScreenshot} loading={sending} style={{background:C.s2,color:C.tm}}>
          {sending?"Надсилаю...":"📸 Надіслати скріншот оплати"}
        </PBtn>
      </div>
    </Scr>
  );
};

// ═══ TRAINING PLAN ═══
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
    setGen(false);
  };
  if(loading)return <Spin/>;
  if(!data)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"0 24px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.ts,textAlign:"center"}}>План ще не готовий</div>
      <PBtn onClick={generate} loading={gen} style={{maxWidth:260}}>{gen?"Генерую...":"Згенерувати план"}</PBtn>
    </div>
  );
  let days=[],weekNote="";
  try{const p=JSON.parse(data.plan_text||"{}");days=p.training?.days||[];weekNote=p.training?.week_note||"";}catch{}
  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:140,flexShrink:0,overflow:"hidden"}}>
        <img src={PHOTOS.trainer_plan} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(10,10,10,.92) 0%,rgba(10,10,10,.5) 55%,rgba(10,10,10,.1) 100%)"}}/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 18px"}}>
          <div style={{fontSize:11,color:C.acc,fontWeight:700,letterSpacing:.8,textTransform:"uppercase"}}>Тиждень {data.week_number||1}</div>
          <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-.8,marginTop:3}}>{days.length} тренувань</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:3}}>{days.filter(d=>d.exercises?.length).map(d=>d.muscle_group?.split(" ")[0]).slice(0,3).join(" · ")}</div>
        </div>
        <button onClick={generate} disabled={gen} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"rgba(200,245,58,.15)",border:`1px solid rgba(200,245,58,.3)`,borderRadius:10,padding:"6px 12px",color:C.acc,fontSize:11,fontWeight:700}}>
          {gen?"...":"Оновити"}
        </button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px 20px",display:"flex",flexDirection:"column",gap:10}}>
        {days.length>0?days.map((d,i)=>(
          <div key={i} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
            <div style={{background:C.s2,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.bc}`}}>
              <div style={{fontSize:17,fontWeight:800,color:C.tm}}>{d.day}</div>
              {d.muscle_group&&<div style={{fontSize:11,color:"#0a0a0a",background:C.acc,padding:"4px 12px",borderRadius:20,fontWeight:800}}>{d.muscle_group}</div>}
            </div>
            {(d.exercises||[]).length>0&&(
              <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {(d.exercises||[]).map((ex,j)=>(
                  <div key={j}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:C.acc,flexShrink:0}}/>
                        <div style={{fontSize:14,color:C.tm}}>{ex.name}</div>
                      </div>
                      <div style={{fontSize:13,color:C.acc,fontWeight:700,background:"rgba(200,245,58,.08)",padding:"4px 10px",borderRadius:8}}>{ex.sets}×{ex.reps}</div>
                    </div>
                    {ex.note&&<div style={{fontSize:12,color:C.td,fontStyle:"italic",marginTop:3,paddingLeft:14}}>📌 {ex.note}</div>}
                    {ex.technique&&<div style={{fontSize:12,color:"rgba(200,245,58,0.75)",marginTop:4,paddingLeft:14,lineHeight:1.5}}>💡 {ex.technique}</div>}
                  </div>
                ))}
                {d.rest_note&&<div style={{fontSize:12,color:C.td,fontStyle:"italic",marginTop:4}}>{d.rest_note}</div>}
              </div>
            )}
            {!(d.exercises||[]).length&&<div style={{padding:"12px 16px",fontSize:14,color:C.ts}}>День відпочинку · активне відновлення</div>}
          </div>
        )):(
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:14,color:C.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.plan_text}</div>
          </div>
        )}
        {weekNote&&<div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:14,padding:"12px 14px",display:"flex",gap:8}}>
          <div style={{width:3,background:C.acc,borderRadius:2,flexShrink:0}}/>
          <div style={{fontSize:13,color:C.ts,lineHeight:1.6}}>{weekNote}</div>
        </div>}
      </div>
    </div>
  );
};

// ═══ NUTRITION ═══
const Nutrition = ({userId}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet(`/api/client/${userId}/plan`).then(r=>{setData(r.plan);setLoad(false);}).catch(()=>setLoad(false));},[userId]);
  if(loading)return <Spin/>;
  if(!data)return <Scr><div style={{padding:"50px 0",textAlign:"center",color:C.ts,fontSize:15}}>Харчування не призначено</div></Scr>;
  let nut=null;
  try{const p=JSON.parse(data.plan_text||"{}");nut=p.nutrition||null;}catch{}
  if(!nut)return <Scr><div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}><div style={{fontSize:14,color:C.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.nutrition_text||"Не знайдено"}</div></div></Scr>;
  const macros=[{l:"Білок",v:`${nut.protein}г`,pct:72,c:C.acc},{l:"Жири",v:`${nut.fat}г`,pct:55,c:C.amber},{l:"Вуглеводи",v:`${nut.carbs}г`,pct:65,c:C.blue}];
  return(
    <Scr>
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:130,height:130,borderRadius:"50%",background:C.acc,opacity:.04}}/>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>Денна норма</div>
        <div style={{marginTop:6}}><span style={{fontSize:48,fontWeight:900,color:C.tm,letterSpacing:-2,lineHeight:1}}>{nut.calories}</span> <span style={{fontSize:16,color:C.ts}}>ккал</span></div>
        <div style={{display:"flex",gap:10,marginTop:14}}>
          {macros.map(m=>(
            <div key={m.l} style={{flex:1,background:C.s2,borderRadius:12,padding:"12px 10px"}}>
              <div style={{fontSize:11,color:C.ts,textTransform:"uppercase",letterSpacing:.5,fontWeight:600}}>{m.l}</div>
              <div style={{fontSize:18,fontWeight:800,color:C.tm,margin:"5px 0 6px"}}>{m.v}</div>
              <div style={{height:3,background:C.bc,borderRadius:2}}><div style={{height:"100%",width:`${m.pct}%`,background:m.c,borderRadius:2}}/></div>
            </div>
          ))}
        </div>
      </div>
      {(nut.meals||[]).map((m,i)=>(
        <div key={i} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
          <div style={{background:C.s2,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:C.acc,fontWeight:700,background:"rgba(200,245,58,.1)",display:"inline-block",padding:"2px 9px",borderRadius:8,marginBottom:4}}>{m.time}</div>
              <div style={{fontSize:17,fontWeight:800,color:C.tm}}>{m.name}</div>
            </div>
            <div style={{fontSize:26,fontWeight:900,color:C.acc}}>{m.kcal}</div>
          </div>
          <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:6}}>
            {(m.foods||[]).map((f,j)=>(
              <div key={j}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:15}}>
                  <span style={{color:C.tm}}>{f.name}</span>
                  <span style={{color:C.ts,background:C.s2,padding:"3px 10px",borderRadius:8,fontSize:13,fontWeight:600}}>{f.qty}</span>
                </div>
                {j<(m.foods||[]).length-1&&<div style={{height:1,background:C.bc,margin:"5px 0"}}/>}
              </div>
            ))}
          </div>
        </div>
      ))}
      {nut.water_liters&&<div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:13,color:C.ts}}>Вода на день</div><div style={{fontSize:22,fontWeight:800,color:C.tm,marginTop:3}}>{nut.water_liters} <span style={{fontSize:14,color:C.ts,fontWeight:500}}>літрів</span></div></div>
        <div style={{display:"flex",gap:4}}>
          {Array.from({length:10},(_,i)=><div key={i} style={{width:10,height:28,borderRadius:4,background:i<Math.round(nut.water_liters/0.28)?C.acc:C.s3}}/>)}
        </div>
      </div>}
    </Scr>
  );
};

// ═══ CHECKIN ═══
const Checkin = ({userId,onDone}) => {
  const [w,setW]=useState("");const [e,setE]=useState(null);const [s,setS]=useState("");const [c,setC]=useState("");
  const [loading,setLoad]=useState(false);const [result,setResult]=useState(null);
  const submit=async()=>{
    if(!w||!e)return;setLoad(true);
    try{const r=await apiPost(`/api/client/${userId}/checkin`,{weight_kg:parseFloat(w),energy_level:e,sleep_hours:s?parseFloat(s):null,comment:c||null});setResult(r);}
    catch(err){alert("Помилка: "+err.message);}
    setLoad(false);
  };
  if(result)return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 24px"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(200,245,58,.1)",border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="32" height="32" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 7-7" stroke={C.acc} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Збережено!</div>
      <div style={{display:"flex",gap:14,fontSize:15}}>
        <span style={{color:C.ts}}>Стрік: <span style={{color:C.acc,fontWeight:700}}>{result.streak} днів</span></span>
        {result.delta!=null&&<span style={{color:C.ts}}>{result.delta>0?"+":""}<span style={{color:C.acc,fontWeight:700}}>{result.delta} кг</span></span>}
      </div>
      {result.feedback&&<div style={{background:C.s1,border:`1px solid rgba(200,245,58,.2)`,borderRadius:16,padding:"16px",width:"100%"}}>
        <div style={{fontSize:11,color:C.acc,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.8}}>Фідбек тренера</div>
        <div style={{fontSize:15,color:C.tm,lineHeight:1.7}}>{result.feedback}</div>
      </div>}
      <PBtn onClick={onDone} style={{maxWidth:220}}>Готово</PBtn>
    </div>
  );
  return(
    <Scr>
      <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1}}>Чекін</div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:8}}>Вага сьогодні (кг)</div>
        <input value={w} onChange={ev=>setW(ev.target.value)} type="number" placeholder="82.5" style={{background:"none",color:C.tm,fontSize:40,fontWeight:900,width:"100%",letterSpacing:-1}}/>
      </div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:10}}>Рівень енергії</div>
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setE(n)} style={{flex:1,background:e===n?C.acc:C.s2,border:`1px solid ${e===n?C.acc:C.bc}`,borderRadius:12,padding:"12px 0",fontSize:16,fontWeight:800,color:e===n?"#0a0a0a":C.ts}}>{n}</button>
          ))}
        </div>
      </div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:8}}>Сон (годин)</div>
        <input value={s} onChange={ev=>setS(ev.target.value)} type="number" placeholder="7.5" style={{background:"none",color:C.tm,fontSize:32,fontWeight:800,width:"100%"}}/>
      </div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:12,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:8}}>Коментар</div>
        <textarea value={c} onChange={ev=>setC(ev.target.value)} placeholder="Як пройшло тренування?" rows={2} style={{background:"none",color:C.tm,fontSize:15,width:"100%",resize:"none",lineHeight:1.6}}/>
      </div>
      <PBtn onClick={submit} loading={loading} disabled={!w||!e}>{loading?"Зберігаю...":"Зберегти чекін"}</PBtn>
    </Scr>
  );
};

// ═══ REVIEWS ═══
const ReviewsScreen = ({userId}) => {
  const [reviews,setReviews]=useState([]);
  const [loading,setLoad]=useState(true);
  const [showForm,setForm]=useState(false);
  const [rating,setRating]=useState(0);
  const [pos,setPos]=useState("");
  const [imp,setImp]=useState("");
  const [anon,setAnon]=useState(false);
  const [sending,setSend]=useState(false);
  const [sent,setSent]=useState(false);

  useEffect(()=>{
    apiGet("/api/reviews").then(r=>{setReviews(r.reviews||[]);setLoad(false);}).catch(()=>setLoad(false));
  },[]);

  const submit=async()=>{
    if(!rating)return;
    setSend(true);
    try{
      await apiPost(`/api/client/${userId}/review`,{rating,text_positive:pos,text_improve:imp,is_anonymous:anon});
      setSent(true);
      setForm(false);
      const r=await apiGet("/api/reviews");
      setReviews(r.reviews||[]);
    }catch(e){alert("Помилка: "+e.message);}
    setSend(false);
  };

  const stars=(n,selected)=>Array.from({length:5},(_,i)=>(
    <button key={i} onClick={()=>selected(i+1)}
      style={{width:40,height:40,borderRadius:12,background:i<n?"rgba(240,160,48,.15)":"var(--s2)",border:`1.5px solid ${i<n?"rgba(240,160,48,.4)":"var(--bc)"}`,fontSize:20,cursor:"pointer"}}>
      {i<n?"⭐":"☆"}
    </button>
  ));

  if(showForm)return(
    <Scr>
      <TNav title="Залишити відгук" onBack={()=>setForm(false)}/>
      {sent?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,textAlign:"center"}}>
          <div style={{fontSize:48}}>🙏</div>
          <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Дякуємо!</div>
          <div style={{fontSize:15,color:C.ts,lineHeight:1.7}}>Відгук надіслано тренеру і опубліковано.</div>
          <PBtn onClick={()=>setSent(false)} style={{maxWidth:200}}>Готово</PBtn>
        </div>
      ):(
        <>
          <div style={{fontSize:14,color:C.ts,lineHeight:1.6}}>Твій відгук допомагає покращувати програму і мотивує інших клієнтів.</div>
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Загальна оцінка</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>{stars(rating,setRating)}</div>
            {rating>0&&<div style={{textAlign:"center",fontSize:14,fontWeight:700,color:C.amber,marginTop:8}}>
              {["","😞 Погано","😕 Нижче середнього","😐 Нормально","😊 Добре","🔥 Відмінно"][rating]}
            </div>}
          </div>
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Що найбільше подобається?</div>
            <textarea value={pos} onChange={e=>setPos(e.target.value)} placeholder="Розкажи що тобі подобається в програмі..." rows={3}
              style={{background:C.s2,border:`1px solid ${pos?C.bc2:C.bc}`,borderRadius:12,padding:"12px",color:C.tm,fontSize:14,width:"100%",resize:"none",lineHeight:1.6}}/>
          </div>
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Що можна покращити?</div>
            <textarea value={imp} onChange={e=>setImp(e.target.value)} placeholder="Твої побажання для тренера..." rows={2}
              style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px",color:C.tm,fontSize:14,width:"100%",resize:"none",lineHeight:1.6}}/>
          </div>
          <button onClick={()=>setAnon(!anon)} style={{background:"none",display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
            <div style={{width:20,height:20,borderRadius:6,background:anon?"rgba(200,245,58,.15)":"var(--s2)",border:`1.5px solid ${anon?C.acc:C.bc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {anon&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={C.acc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{fontSize:14,color:C.ts}}>Публікувати анонімно</span>
          </button>
          <PBtn onClick={submit} loading={sending} disabled={!rating}>{sending?"Надсилаю...":"Надіслати відгук"}</PBtn>
        </>
      )}
    </Scr>
  );

  return(
    <Scr>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>Відгуки</div>
        <button onClick={()=>setForm(true)} style={{background:C.acc,color:"#080808",borderRadius:20,padding:"8px 16px",fontSize:13,fontWeight:800}}>+ Залишити</button>
      </div>
      {loading?<Spin/>:reviews.length===0?(
        <div style={{padding:"40px 0",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>💬</div>
          <div style={{fontSize:15,color:C.ts,lineHeight:1.7}}>Відгуків поки немає.<br/>Будь першим!</div>
        </div>
      ):reviews.map(r=>(
        <div key={r.id} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700,color:C.tm}}>{r.full_name||"Анонімно"}</div>
            <div style={{display:"flex",gap:2}}>{Array.from({length:5},(_,i)=>(
              <span key={i} style={{fontSize:14,opacity:i<r.rating?1:.25}}>⭐</span>
            ))}</div>
          </div>
          {r.text_positive&&<div style={{fontSize:14,color:C.ts,lineHeight:1.6,marginBottom:6}}>👍 {r.text_positive}</div>}
          {r.text_improve&&<div style={{fontSize:13,color:C.td,lineHeight:1.6}}>💡 {r.text_improve}</div>}
          <div style={{fontSize:11,color:C.td,marginTop:8}}>{(r.created_at||"").slice(0,10)}</div>
        </div>
      ))}
    </Scr>
  );
};

// ═══ NOTIFICATIONS SETTINGS ═══
const NotificationsScreen = ({userId,nutritionPlan}) => {
  const [settings,setSettings]=useState(null);
  const [loading,setLoad]=useState(true);
  const [saving,setSave]=useState(false);
  const [saved,setSaved]=useState(false);

  const DAYS=[{n:"Пн",v:"1"},{n:"Вт",v:"2"},{n:"Ср",v:"3"},{n:"Чт",v:"4"},{n:"Пт",v:"5"},{n:"Сб",v:"6"},{n:"Нд",v:"7"}];

  useEffect(()=>{
    apiGet(`/api/client/${userId}/notifications`).then(r=>{
      setSettings({...r,meal_settings:r.meal_settings||{}});
      setLoad(false);
    }).catch(()=>{
      setSettings({workout_enabled:true,workout_time:"18:00",workout_days:"1,3,5",checkin_enabled:true,water_enabled:true,meal_settings:{}});
      setLoad(false);
    });
  },[userId]);

  const save=async()=>{
    setSave(true);
    try{
      await apiPost(`/api/client/${userId}/notifications`,settings);
      setSaved(true);
      setTimeout(()=>setSaved(false),2000);
    }catch(e){alert("Помилка: "+e.message);}
    setSave(false);
  };

  const toggleDay=d=>{
    const days=(settings.workout_days||"").split(",").filter(Boolean);
    const newDays=days.includes(d)?days.filter(x=>x!==d):[...days,d].sort();
    setSettings(s=>({...s,workout_days:newDays.join(",")}));
  };

  const toggleMeal=(name,enabled)=>{
    setSettings(s=>({...s,meal_settings:{...s.meal_settings,[name]:{...s.meal_settings[name],enabled}}}));
  };

  if(loading)return <Spin/>;

  const mealItems=nutritionPlan?.meals||[
    {name:"Сніданок",time:"07:30"},{name:"Перекус",time:"10:30"},{name:"Обід",time:"13:00"},
    {name:"Пред-тренув.",time:"16:00"},{name:"Вечеря",time:"18:30"},{name:"Пізній перекус",time:"21:00"}
  ];
  const mealColors=["#c8f53a","#f0a030","#3a9fd8","#9b7fe8","#ff6b6b","#888"];

  const Tog=({on,onToggle,size=44})=>(
    <div onClick={onToggle} style={{width:size,height:size*0.55,borderRadius:size*0.28,background:on?C.acc:C.s3,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
      <div style={{width:size*0.42,height:size*0.42,borderRadius:"50%",background:on?"#080808":C.ts,position:"absolute",top:size*0.065,left:on?size*0.52:size*0.065,transition:"left .2s"}}/>
    </div>
  );

  return(
    <Scr>
      <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>Нагадування</div>
      <div style={{fontSize:14,color:C.ts}}>Налаштуй сповіщення під свій розклад.</div>

      {saved&&<div style={{background:"rgba(200,245,58,.1)",border:"1px solid rgba(200,245,58,.2)",borderRadius:14,padding:"12px 16px",fontSize:14,color:C.acc,fontWeight:700}}>✓ Збережено</div>}

      <div style={{fontSize:13,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,padding:"4px 0"}}>Тренування</div>

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Нагадування про тренування</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>За 30 хв до початку</div></div>
        <Tog on={settings.workout_enabled} onToggle={()=>setSettings(s=>({...s,workout_enabled:!s.workout_enabled}))}/>
      </div>

      {settings.workout_enabled&&<>
        <div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:14,color:C.ts}}>Час тренування</div>
          <input type="time" value={settings.workout_time||"18:00"} onChange={e=>setSettings(s=>({...s,workout_time:e.target.value}))}
            style={{background:"none",color:C.acc,fontSize:16,fontWeight:700,border:"none",outline:"none",textAlign:"right"}}/>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {DAYS.map(d=>{
            const active=(settings.workout_days||"").split(",").includes(d.v);
            return <button key={d.v} onClick={()=>toggleDay(d.v)}
              style={{width:40,height:40,borderRadius:12,background:active?C.acc:C.s1,border:`1px solid ${active?C.acc:C.bc}`,fontSize:13,fontWeight:700,color:active?"#080808":C.ts}}>{d.n}</button>;
          })}
        </div>
      </>}

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Нагадування про чекін</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Ср і Пт о 19:00</div></div>
        <Tog on={settings.checkin_enabled} onToggle={()=>setSettings(s=>({...s,checkin_enabled:!s.checkin_enabled}))}/>
      </div>

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Нагадування про воду</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Кожні 2 години з 9:00</div></div>
        <Tog on={settings.water_enabled} onToggle={()=>setSettings(s=>({...s,water_enabled:!s.water_enabled}))}/>
      </div>

      <div style={{fontSize:13,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,padding:"4px 0"}}>Прийоми їжі</div>

      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.tm}}>Всі нагадування їжі</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Головний перемикач</div></div>
        <Tog on={Object.values(settings.meal_settings||{}).some(m=>m.enabled!==false)} onToggle={()=>{
          const allOn=mealItems.every(m=>(settings.meal_settings[m.name]?.enabled)!==false);
          const newMs={};
          mealItems.forEach(m=>{newMs[m.name]={...settings.meal_settings[m.name],enabled:!allOn};});
          setSettings(s=>({...s,meal_settings:newMs}));
        }}/>
      </div>

      {mealItems.map((m,i)=>{
        const ms=settings.meal_settings[m.name]||{};
        const enabled=ms.enabled!==false;
        return(
          <div key={m.name} style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:mealColors[i],flexShrink:0}}/>
              <div><div style={{fontSize:14,fontWeight:600,color:C.tm}}>{m.name}</div><div style={{fontSize:12,color:C.ts}}>{m.time}</div></div>
            </div>
            <Tog on={enabled} onToggle={()=>toggleMeal(m.name,!enabled)} size={38}/>
          </div>
        );
      })}

      <PBtn onClick={save} loading={saving}>Зберегти налаштування</PBtn>
    </Scr>
  );
};

// ═══ SUPPLEMENTS (VIP) ═══
const SupplementsScreen = ({userId,clientPlan,isAdmin}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  const [genLoading,setGenLoad]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [contra,setContra]=useState("");
  const [manualText,setManual]=useState("");
  const [saving,setSaving]=useState(false);

  const load=()=>{
    apiGet(`/api/client/${userId}/supplements`).then(r=>{setData(r);setManual(r.supplements||"");setLoad(false);}).catch(()=>setLoad(false));
  };
  useEffect(()=>{load();},[userId]);

  const generateAI=async()=>{
    setGenLoad(true);
    try{
      const r=await apiPost(`/api/client/${userId}/generate-supplements`,{contraindications:contra,goals_extra:""});
      setData(d=>({...d,supplements:r.supplements}));
      setShowForm(false);
    }catch(e){alert("Помилка: "+e.message);}
    setGenLoad(false);
  };

  const saveManual=async()=>{
    setSaving(true);
    try{
      await apiPost(`/api/client/${userId}/supplements`,{supplements:manualText});
      setData(d=>({...d,supplements:manualText}));
    }catch(e){alert("Помилка: "+e.message);}
    setSaving(false);
  };

  if(loading)return <Spin/>;
  if(clientPlan!=="vip"&&!isAdmin)return(
    <Scr>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 24px",textAlign:"center"}}>
        <div style={{fontSize:40}}>💊</div>
        <div style={{fontSize:22,fontWeight:900,color:C.tm}}>Тільки для VIP</div>
        <div style={{fontSize:15,color:C.ts,lineHeight:1.7}}>Персональна пропись БАДів під твої цілі доступна на тарифі VIP.</div>
      </div>
    </Scr>
  );

  if(showForm)return(
    <Scr>
      <TNav title="Генерація БАДів" onBack={()=>setShowForm(false)}/>
      <div style={{fontSize:15,color:C.ts,lineHeight:1.6}}>Перед генерацією вкажи важливу інформацію для безпечного підбору.</div>
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
        <div style={{fontSize:12,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Алергії, ліки, хронічні хвороби</div>
        <textarea value={contra} onChange={e=>setContra(e.target.value)}
          placeholder="Наприклад: алергія на рибу, приймаю метформін, гіпертонія..."
          rows={4} style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px",color:C.tm,fontSize:14,width:"100%",resize:"none",lineHeight:1.6}}/>
      </div>
      <div style={{background:"rgba(255,85,85,.06)",border:"1px solid rgba(255,85,85,.2)",borderRadius:14,padding:"12px 14px"}}>
        <div style={{fontSize:13,color:"#ff8888",lineHeight:1.6}}>⚠️ БАДи не є ліками. Перед прийомом проконсультуйся з лікарем, особливо якщо маєш хронічні захворювання або приймаєш медикаменти.</div>
      </div>
      <PBtn onClick={generateAI} loading={genLoading}>{genLoading?"Генерую...":"Згенерувати AI пропись"}</PBtn>
    </Scr>
  );

  return(
    <Scr>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:26,fontWeight:900,color:C.tm,letterSpacing:-1}}>БАДи</div>
        <button onClick={()=>setShowForm(true)} style={{background:C.acc,color:"#080808",borderRadius:20,padding:"8px 14px",fontSize:12,fontWeight:800}}>AI ✦</button>
      </div>
      <div style={{fontSize:14,color:C.ts}}>Персональна пропись від тренера</div>

      {data?.supplements?(
        <div style={{background:C.s1,borderRadius:18,border:`1px solid rgba(200,245,58,.2)`,padding:"18px"}}>
          <div style={{fontSize:12,color:C.acc,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Твоя пропись</div>
          <div style={{fontSize:15,color:C.tm,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{data.supplements}</div>
        </div>
      ):(
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"20px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>⏳</div>
          <div style={{fontSize:16,fontWeight:700,color:C.tm,marginBottom:6}}>Пропись ще не готова</div>
          <div style={{fontSize:14,color:C.ts,lineHeight:1.6,marginBottom:14}}>Натисни "AI ✦" щоб згенерувати автоматично або зачекай поки тренер призначить вручну.</div>
          <PBtn onClick={()=>setShowForm(true)}>Згенерувати AI пропись</PBtn>
        </div>
      )}

      {isAdmin&&(
        <div style={{background:C.s1,borderRadius:16,border:`1px solid rgba(200,245,58,.2)`,padding:"14px 16px"}}>
          <div style={{fontSize:12,color:C.acc,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>Ручне призначення (адмін)</div>
          <textarea value={manualText} onChange={e=>setManual(e.target.value)}
            placeholder="Введи пропись БАДів вручну..." rows={5}
            style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px",color:C.tm,fontSize:13,width:"100%",resize:"none",lineHeight:1.6,marginBottom:10}}/>
          <PBtn onClick={saveManual} loading={saving} style={{background:C.s3,color:C.tm}}>Зберегти</PBtn>
        </div>
      )}

      <div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:16,padding:"16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:C.acc,marginBottom:6}}>Є питання?</div>
        <div style={{fontSize:14,color:C.ts,marginBottom:12}}>Напиши тренеру особисто — відповість протягом години.</div>
        <a href={TRAINER_LINK} style={{textDecoration:"none"}}><PBtn style={{background:C.s2,color:C.tm}}>Написати тренеру</PBtn></a>
      </div>
    </Scr>
  );
};

// ═══ PROGRESS ═══
const Progress = ({userId}) => {
  const [data,setData]=useState(null);const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet(`/api/client/${userId}/progress`).then(r=>{setData(r);setLoad(false);}).catch(()=>setLoad(false));},[userId]);
  if(loading)return <Spin/>;
  if(!data)return <Scr><div style={{padding:"50px 0",textAlign:"center",color:C.ts,fontSize:15}}>Немає даних</div></Scr>;
  const checkins=data.checkins||[];
  const maxW=checkins.length?Math.max(...checkins.map(c=>c.weight_kg||0)):1;
  const minW=checkins.length?Math.min(...checkins.map(c=>c.weight_kg||0)):0;
  const badges={"STREAK-7":["🔥","7 днів"],"STREAK-14":["⚡","14 днів"],"STREAK-30":["🏆","30 днів"],"STREAK-60":["💎","60 днів"]};
  const earned=(data.badges||"").split(",").filter(Boolean);
  return(
    <Scr>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Старт",data.start_weight?`${data.start_weight} кг`:"—",C.ts],["Зараз",data.last_weight?`${data.last_weight} кг`:"—",C.acc],["Прогрес",data.start_weight&&data.last_weight?`${Math.round((data.last_weight-data.start_weight)*10)/10} кг`:"—",C.acc],["Стрік",`${data.streak||0} днів`,C.amber]].map(([l,v,c])=>(
          <div key={l} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px"}}>
            <div style={{fontSize:13,color:C.ts,fontWeight:600}}>{l}</div>
            <div style={{fontSize:24,fontWeight:900,color:c,marginTop:4}}>{v}</div>
          </div>
        ))}
      </div>
      {checkins.length>0&&<div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.tm,marginBottom:12}}>Динаміка ваги</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {checkins.slice(-8).map((c,i)=>{
            const h=maxW===minW?50:((c.weight_kg-minW)/(maxW-minW))*65+15;
            return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:8,color:C.ts}}>{c.weight_kg}</div>
              <div style={{width:"100%",height:h,background:i===checkins.slice(-8).length-1?C.acc:"rgba(200,245,58,.3)",borderRadius:"4px 4px 0 0"}}/>
              <div style={{fontSize:8,color:C.td}}>Т{c.week_number}</div>
            </div>;
          })}
        </div>
      </div>}
      {data.start_weight&&data.target_weight&&<div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:C.tm}}>До цілі</div>
          <div style={{fontSize:14,fontWeight:700,color:C.acc}}>{data.progress_pct||0}%</div>
        </div>
        <div style={{height:8,background:C.bc,borderRadius:4}}><div style={{height:"100%",width:`${data.progress_pct||0}%`,background:C.acc,borderRadius:4}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:13,color:C.ts}}>
          <span>{data.start_weight} кг</span><span style={{color:C.acc,fontWeight:600}}>{data.target_weight} кг ціль</span>
        </div>
      </div>}
      {checkins.length===0&&<div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"20px",textAlign:"center",color:C.ts,fontSize:14}}>Зроби перший чекін щоб відстежувати прогрес</div>}
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.tm,marginBottom:12}}>Досягнення</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(badges).map(([code,[emoji,label]])=>{
            const has=earned.includes(code);
            return <div key={code} style={{background:has?"rgba(200,245,58,.1)":C.s2,borderRadius:14,border:`1px solid ${has?C.acc:C.bc}`,padding:"10px 16px",textAlign:"center",opacity:has?1:.4}}>
              <div style={{fontSize:22}}>{emoji}</div>
              <div style={{fontSize:11,color:has?C.acc:C.ts,marginTop:4,fontWeight:600}}>{label}</div>
            </div>;
          })}
        </div>
      </div>
    </Scr>
  );
};

// ═══ PROFILE ═══
const Profile = ({client,questionnaire,isAdmin,onAdminAccess,onCheckin,onBuyPlan,onSupplements,userId}) => {
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  const [profileTab,setProfileTab]=useState(0);
  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:200,flexShrink:0,overflow:"hidden"}}>
        <img src={PHOTOS.trainer_profile} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(10,10,10,.3) 0%,rgba(10,10,10,.85) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 18px",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:C.tm,letterSpacing:-.8}}>{client?.full_name||"Клієнт"}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.55)",marginTop:2}}>{client?.username?`@${client.username}`:""}</div>
          </div>
          <Bdg v={planV[client?.plan]||"amber"}>{(client?.plan||"trial").toUpperCase()}</Bdg>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 20px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:14,color:C.ts,fontWeight:600}}>Доступ</div>
          <div style={{fontSize:14,color:C.amber,fontWeight:700}}>{(client?.status||"").toUpperCase()} · до {(client?.expires_at||"").slice(0,10)}</div>
        </div>
        <div style={{display:"flex",gap:7}}>
          {["Дані","Відгуки","Сповіщення"].map((t,i)=>(
            <button key={t} onClick={()=>setProfileTab(i)}
              style={{flex:1,padding:"9px 0",borderRadius:12,fontSize:13,fontWeight:700,background:profileTab===i?C.acc:C.s1,color:profileTab===i?"#080808":C.ts,border:`1px solid ${profileTab===i?C.acc:C.bc}`}}>
              {t}
            </button>
          ))}
        </div>
        {profileTab===0&&questionnaire&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["Вік",`${questionnaire.age||"—"} р.`],["Стать",questionnaire.gender==="female"?"Жінка":"Чоловік"],["Вага",`${questionnaire.weight_kg||"—"} кг`],["Ціль",`${questionnaire.target_weight||"—"} кг`],["Обладнання",questionnaire.equipment==="gym"?"Зал":questionnaire.equipment||"—"],["Трен./тиж",`${questionnaire.workouts_pw||"—"}×`]].map(([l,v])=>(
            <div key={l} style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 14px"}}>
              <div style={{fontSize:12,color:C.ts,fontWeight:600}}>{l}</div>
              <div style={{fontSize:18,fontWeight:800,color:C.tm,marginTop:3}}>{v}</div>
            </div>
          ))}
        </div>}
        {profileTab===1&&<ReviewsScreen userId={userId}/>}
        {profileTab===2&&<NotificationsScreen userId={userId}/>}
        {client?.status==="trial"&&<div className="pu" onClick={onBuyPlan} style={{background:C.acc,borderRadius:16,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:17,fontWeight:800,color:"#0a0a0a"}}>Придбати тариф</div><div style={{fontSize:12,color:"rgba(10,10,10,.55)",fontWeight:600,marginTop:2}}>від 799 ₴ / місяць</div></div>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" fill="rgba(0,0,0,.2)"/><path d="M9 14h10M14 9l5 5-5 5" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>}
        <button onClick={onCheckin} style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
          <span style={{fontSize:16,fontWeight:700,color:C.tm}}>Зробити чекін</span>
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {onSupplements&&<button onClick={onSupplements} style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.2)",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
          <span style={{fontSize:16,fontWeight:700,color:C.acc}}>💊 Мої БАДи (VIP)</span>
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>}
        <a href={TRAINER_LINK} style={{textDecoration:"none",display:"block"}}>
          <button style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
            <span style={{fontSize:16,fontWeight:700,color:C.tm}}>Написати тренеру</span>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </a>
        {isAdmin&&<button onClick={onAdminAccess} style={{background:"rgba(200,245,58,.05)",border:"1.5px solid rgba(200,245,58,.2)",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-4z" stroke={C.acc} strokeWidth="1.8" fill="none"/></svg>
          <span style={{fontSize:16,fontWeight:800,color:C.acc}}>Адмін-панель</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:"auto"}}><path d="M4 8h8M8 4l4 4-4 4" stroke={C.acc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>}
      </div>
    </div>
  );
};

// ═══ ADMIN: DASHBOARD ═══
const AdminDash = () => {
  const [stats,setStats]=useState(null);const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet("/api/admin/stats").then(r=>{setStats(r);setLoad(false);}).catch(()=>setLoad(false));},[]);
  if(loading)return <Spin/>;
  if(!stats)return <Scr><div style={{padding:"50px 0",textAlign:"center",color:C.ts}}>Помилка завантаження</div></Scr>;
  return(
    <Scr>
      <div style={{background:C.s1,borderRadius:18,border:`1px solid rgba(200,245,58,.2)`,padding:"18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:150,height:150,borderRadius:"50%",background:C.acc,opacity:.04}}/>
        <div style={{fontSize:13,color:C.ts,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>Виручка місяця</div>
        <div style={{marginTop:6}}><span style={{fontSize:44,fontWeight:900,color:C.tm,letterSpacing:-2}}>{(stats.revenue_month||0).toLocaleString()}</span> <span style={{fontSize:18,color:C.ts}}>₴</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Активні",stats.active,C.acc],["Trial",stats.trial,C.amber],["Очікують",stats.pending,C.red],["Чекіни сьогодні",stats.checkins_today,C.tm]].map(([l,v,c])=>(
          <div key={l} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px"}}>
            <div style={{fontSize:13,color:C.ts,fontWeight:600}}>{l}</div>
            <div style={{fontSize:32,fontWeight:900,color:c,marginTop:4}}>{v||0}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:14,fontWeight:700,color:C.tm}}>Остання активність</div>
      {(stats.recent_activity||[]).length===0&&<div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"16px",textAlign:"center",color:C.ts,fontSize:14}}>Активності поки немає</div>}
      {(stats.recent_activity||[]).map((a,i)=>(
        <div key={i} style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.acc,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700,color:C.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.full_name}</div>
            <div style={{fontSize:12,color:C.ts,marginTop:1}}>Чекін · {a.weight_kg} кг</div>
          </div>
          <div style={{fontSize:12,color:C.td}}>{(a.time||"").slice(11,16)}</div>
        </div>
      ))}
    </Scr>
  );
};

// ═══ ADMIN: CLIENTS ═══
const AdminClients = ({onSelect}) => {
  const [clients,setClients]=useState([]);const [filter,setFilter]=useState("all");const [search,setSearch]=useState("");const [loading,setLoad]=useState(true);
  useEffect(()=>{setLoad(true);apiGet(`/api/admin/clients?status=${filter}`).then(r=>{setClients(r.clients||[]);setLoad(false);}).catch(()=>setLoad(false));},[filter]);
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  const filtered=clients.filter(c=>!search||(c.full_name||"").toLowerCase().includes(search.toLowerCase())||(c.username||"").includes(search));
  return(
    <Scr>
      <div style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="4.5" stroke={C.td} strokeWidth="1.6"/><path d="M11 11l3.5 3.5" stroke={C.td} strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input value={search} onChange={ev=>setSearch(ev.target.value)} placeholder="Пошук клієнта..." style={{background:"none",color:C.tm,fontSize:15,flex:1}}/>
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto"}}>
        {[["all","Всі"],["active","Активні"],["trial","Trial"],["pending_approval","Очікують"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"8px 16px",borderRadius:20,border:`1px solid ${filter===v?C.acc:C.bc}`,background:filter===v?"rgba(200,245,58,.1)":C.s1,color:filter===v?C.acc:C.ts,fontSize:13,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
        ))}
      </div>
      <div style={{fontSize:14,color:C.ts}}>Знайдено: {filtered.length}</div>
      {loading?<Spin/>:filtered.map(c=>(
        <button key={c.user_id} onClick={()=>onSelect(c)} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,width:"100%",textAlign:"left"}}>
          <Ava name={c.full_name||"?"} size={44}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:700,color:C.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.full_name}</div>
            <div style={{fontSize:13,color:C.ts,marginTop:3}}>{c.username?`@${c.username}`:""} · стрік {c.streak||0} днів</div>
          </div>
          <Bdg v={planV[c.plan]||"green"}>{(c.plan||"").toUpperCase()}</Bdg>
        </button>
      ))}
    </Scr>
  );
};

// ═══ ADMIN: CLIENT DETAIL ═══
const AdminClientDetail = ({client,onBack}) => {
  const [detail,setDetail]=useState(null);const [loading,setLoad]=useState(true);const [msg,setMsg]=useState("");const [gen,setGen]=useState(false);
  useEffect(()=>{apiGet(`/api/admin/client/${client.user_id}`).then(r=>{setDetail(r);setLoad(false);}).catch(()=>setLoad(false));},[client.user_id]);
  const activate=async plan=>{await apiPost(`/api/admin/client/${client.user_id}/activate`,{plan});setMsg(`✓ Активовано: ${plan.toUpperCase()}`);};
  const block=async()=>{await apiPost(`/api/admin/client/${client.user_id}/block`,{});setMsg("✓ Заблоковано");};
  const generate=async()=>{setGen(true);try{await apiPost(`/api/client/${client.user_id}/generate-plan`,{});setMsg("✓ Новий план згенеровано");}catch(e){setMsg("Помилка: "+e.message);}setGen(false);};
  if(loading)return <Spin/>;
  const qst=detail?.questionnaire;
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  return(
    <Scr>
      <div style={{background:C.s1,borderRadius:18,border:`1px solid rgba(200,245,58,.2)`,padding:"16px",display:"flex",gap:14,alignItems:"center"}}>
        <Ava name={client.full_name||"?"} size={56}/>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:900,color:C.tm,letterSpacing:-.5}}>{client.full_name}</div>
          <div style={{fontSize:13,color:C.ts,marginTop:2}}>{client.username?`@${client.username}`:""}</div>
          <div style={{marginTop:6,display:"flex",gap:6}}><Bdg v={planV[client.plan]||"green"}>{(client.plan||"").toUpperCase()}</Bdg><Bdg v={client.status==="active"?"green":"amber"}>{client.status}</Bdg></div>
        </div>
      </div>
      {qst&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Вік",`${qst.age||"—"} р.`],["Стать",qst.gender==="female"?"Жінка":"Чоловік"],["Вага → ціль",`${qst.weight_kg} → ${qst.target_weight} кг`],["Обладнання",qst.equipment||"—"],["Трен./тиж",`${qst.workouts_pw||"—"}×`],["Стрік",`${client.streak||0} днів`]].map(([l,v])=>(
          <div key={l} style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 14px"}}>
            <div style={{fontSize:12,color:C.ts,fontWeight:600}}>{l}</div>
            <div style={{fontSize:16,fontWeight:700,color:C.tm,marginTop:3}}>{v}</div>
          </div>
        ))}
      </div>}
      <Div/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button onClick={generate} disabled={gen} className={gen?"":"pu"} style={{background:C.acc,borderRadius:14,padding:"14px 0",fontSize:14,fontWeight:800,color:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",gap:6,gridColumn:"1/-1"}}>
          {gen&&<div className="sp" style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(0,0,0,.2)",borderTopColor:"#0a0a0a"}}/>}
          Згенерувати план
        </button>
        {["start","premium","vip"].map(p=>(
          <button key={p} onClick={()=>activate(p)} style={{background:C.s1,color:C.ts,border:`1px solid ${C.bc}`,borderRadius:14,padding:"12px 0",fontSize:13,fontWeight:700}}>Активувати {p.toUpperCase()}</button>
        ))}
        <button onClick={block} style={{background:"rgba(255,85,85,.08)",color:C.red,border:"1px solid rgba(255,85,85,.2)",borderRadius:14,padding:"12px 0",fontSize:13,fontWeight:700}}>Заблокувати</button>
      </div>
      {msg&&<div style={{background:"rgba(200,245,58,.08)",border:"1px solid rgba(200,245,58,.2)",borderRadius:14,padding:"14px 16px",fontSize:15,color:C.acc,fontWeight:600}}>{msg}</div>}
      {(detail?.checkins||[]).length>0&&<div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:C.tm,marginBottom:10}}>Останні чекіни</div>
        {detail.checkins.slice(0,3).map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,borderBottom:i<2?`1px solid ${C.bc}`:"none"}}>
            <span style={{color:C.ts}}>{(c.submitted_at||"").slice(0,10)}</span>
            <span style={{color:C.tm,fontWeight:600}}>{c.weight_kg} кг · {c.energy_level}/5</span>
          </div>
        ))}
      </div>}
    </Scr>
  );
};

// ═══ ADMIN: PAYMENTS ═══
const AdminPayments = () => {
  const [payments,setPayments]=useState([]);const [filter,setFilter]=useState("submitted");const [loading,setLoad]=useState(true);
  const load=useCallback(async()=>{setLoad(true);try{const r=await apiGet(`/api/admin/payments?status=${filter}`);setPayments(r.payments||[]);}finally{setLoad(false);};},[filter]);
  useEffect(()=>{load();},[load]);
  return(
    <Scr>
      <div style={{display:"flex",gap:8}}>
        {[["submitted","На перевірці"],["confirmed","Підтверджені"],["rejected","Відхилені"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{flex:1,padding:"10px 0",borderRadius:14,border:`1px solid ${filter===v?C.acc:C.bc}`,background:filter===v?"rgba(200,245,58,.1)":C.s1,color:filter===v?C.acc:C.ts,fontSize:13,fontWeight:700}}>{l}</button>
        ))}
      </div>
      {loading?<Spin/>:payments.length===0?<div style={{padding:"50px 0",textAlign:"center",color:C.ts,fontSize:15}}>Немає оплат</div>:payments.map(p=>(
        <div key={p.id} style={{background:C.s1,borderRadius:16,border:`1px solid ${filter==="submitted"?"rgba(232,168,50,.3)":C.bc}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div><div style={{fontSize:17,fontWeight:700,color:C.tm}}>{p.full_name||`ID ${p.user_id}`}</div><div style={{fontSize:13,color:C.ts,marginTop:2}}>{(p.plan||"").toUpperCase()} · {(p.submitted_at||"").slice(0,16)}</div></div>
            <div style={{fontSize:28,fontWeight:900,color:C.acc}}>{p.amount} ₴</div>
          </div>
          {filter==="submitted"&&<div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={async()=>{await apiPost(`/api/admin/payment/${p.id}/confirm`,{});load();}} style={{flex:1,background:"rgba(200,245,58,.1)",color:C.acc,border:`1px solid rgba(200,245,58,.3)`,borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:700}}>Підтвердити</button>
            <button onClick={async()=>{await apiPost(`/api/admin/payment/${p.id}/reject`,{});load();}} style={{flex:1,background:"rgba(255,85,85,.08)",color:C.red,border:"1px solid rgba(255,85,85,.2)",borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:700}}>Відхилити</button>
          </div>}
        </div>
      ))}
    </Scr>
  );
};

// ═══ ADMIN: BROADCAST ═══
const AdminBroadcast = () => {
  const [target,setTarget]=useState("all");const [text,setText]=useState("");const [sending,setSend]=useState(false);const [result,setResult]=useState(null);
  const send=async()=>{if(!text)return;setSend(true);try{const r=await apiPost("/api/admin/broadcast",{text,target});setResult(r);setText("");}catch(e){alert("Помилка: "+e.message);}setSend(false);};
  return(
    <Scr>
      {result&&<div style={{background:"rgba(200,245,58,.08)",border:"1px solid rgba(200,245,58,.2)",borderRadius:14,padding:"14px",fontSize:15,color:C.acc,fontWeight:600}}>✓ Надіслано {result.sent_to} клієнтам</div>}
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Аудиторія</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["all","Всі"],["start","START"],["premium","PREMIUM"],["vip","VIP"],["trial","Trial"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTarget(v)} style={{background:C.s1,border:`1px solid ${target===v?C.acc:C.bc}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:target===v?C.acc:"transparent",border:`2px solid ${target===v?C.acc:C.bc}`,flexShrink:0}}/>
            <span style={{fontSize:15,color:C.tm,fontWeight:600}}>{l}</span>
          </button>
        ))}
      </div>
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Повідомлення</div>
      <textarea value={text} onChange={ev=>setText(ev.target.value)} placeholder="Текст повідомлення..." rows={4} style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:14,padding:"14px 16px",color:C.tm,fontSize:15,resize:"none",lineHeight:1.6}}/>
      {text&&<div style={{background:"rgba(200,245,58,.05)",border:`1px solid rgba(200,245,58,.15)`,borderRadius:14,padding:"14px 16px"}}>
        <div style={{fontSize:12,color:C.ts,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:.8}}>Попередній перегляд</div>
        <div style={{fontSize:15,color:C.tm,lineHeight:1.6}}>{text}</div>
      </div>}
      <PBtn onClick={send} loading={sending} disabled={!text}>Надіслати</PBtn>
    </Scr>
  );
};

// ═══ ADMIN: SETTINGS ═══
const AdminSettings = ({settings,onExitAdmin}) => {
  const [tog,setTog]=useState({autoplan:true,remind:true,offer:true,notify:false});
  return(
    <Scr>
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Автоматизація</div>
      {[{k:"autoplan",l:"Авто-план щопонеділка",s:"Генерація через Claude AI"},{k:"remind",l:"Нагадування про чекін",s:"Ср та Пт о 18:00"},{k:"offer",l:"Оффер на день 3",s:"Trial → платний тариф"},{k:"notify",l:"Сповіщення адміна",s:"Нові оплати та чекіни"}].map(item=>(
        <div key={item.k} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div><div style={{fontSize:16,fontWeight:600,color:C.tm}}>{item.l}</div><div style={{fontSize:13,color:C.ts,marginTop:3}}>{item.s}</div></div>
          <Tog on={tog[item.k]} onToggle={()=>setTog(t=>({...t,[item.k]:!t[item.k]}))}/>
        </div>
      ))}
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Тарифи</div>
      {Object.entries(settings?.plans||{start:{name:"START",price:799},premium:{name:"PREMIUM",price:1699},vip:{name:"VIP",price:3499}}).map(([k,plan])=>(
        <div key={k} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:16,fontWeight:700,color:C.tm}}>{plan.name}</div><div style={{fontSize:13,color:C.ts,marginTop:2}}>Monobank jar</div></div>
          <div style={{fontSize:22,fontWeight:900,color:C.acc}}>{plan.price} <span style={{fontSize:13,color:C.ts,fontWeight:500}}>₴</span></div>
        </div>
      ))}
      <div style={{height:1,background:C.bc}}/>
      <button onClick={onExitAdmin} style={{background:"rgba(255,85,85,.08)",border:"1px solid rgba(255,85,85,.2)",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M8 11h10M14 7l4 4-4 4" stroke="#ff5555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5H5a2 2 0 00-2 2v8a2 2 0 002 2h7" stroke="#ff5555" strokeWidth="1.8" strokeLinecap="round"/></svg>
        <span style={{fontSize:16,fontWeight:800,color:"#ff5555"}}>Вийти з адмін-панелі</span>
      </button>
    </Scr>
  );
};

// ═══ MAIN APP ═══
// ═══ DUMBBELL LOADER ═══
const DumbbellLoader = () => {
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSpinning(true), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={spinning ? "db-spin db-appear" : "db-appear"}
      style={{width:64,height:64,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="27" width="10" height="10" rx="3" fill="#c8f53a"/>
        <rect x="8" y="22" width="10" height="6" rx="2" fill="rgba(200,245,58,.6)"/>
        <rect x="8" y="36" width="10" height="6" rx="2" fill="rgba(200,245,58,.6)"/>
        <rect x="46" y="27" width="10" height="10" rx="3" fill="#c8f53a"/>
        <rect x="46" y="22" width="10" height="6" rx="2" fill="rgba(200,245,58,.6)"/>
        <rect x="46" y="36" width="10" height="6" rx="2" fill="rgba(200,245,58,.6)"/>
        <rect x="18" y="30" width="28" height="4" rx="2" fill="#c8f53a"/>
        <rect x="26" y="26" width="12" height="12" rx="3" fill="rgba(200,245,58,.3)" stroke="#c8f53a" strokeWidth="1.5"/>
      </svg>
    </div>
  );
};

export default function FitCoreApp() {
  const [screen,setScreen]=useState("loading");
  const [userId,setUserId]=useState(null);const [isAdmin,setIsAdmin]=useState(false);
  const [clientData,setClient]=useState(null);const [questionnaire,setQst]=useState(null);
  const [plans,setPlans]=useState(null);const [payLinks,setPayLinks]=useState(null);
  const [settings,setSettings]=useState(null);
  const [clientTab,setClientTab]=useState("plan");const [adminTab,setAdminTab]=useState("dashboard");
  const [selClient,setSelClient]=useState(null);const [selPlan,setSelPlan]=useState(null);
  const [checkinMode,setCheckin]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      try{
        const auth=await apiPost("/api/auth",{});
        setUserId(auth.user_id);setIsAdmin(auth.is_admin);setPlans(auth.plans);setPayLinks(auth.payment_links);setClient(auth.client);
        if(auth.is_admin){try{const s=await apiGet("/api/admin/settings");setSettings(s);}catch{}}
        if(auth.client){
          try{const d=await apiGet(`/api/client/${auth.user_id}`);setQst(d.questionnaire);}catch{}
          const st=auth.client.status;
          if(["active","trial"].includes(st))setScreen("client");
          else if(st==="pending_approval")setScreen("pending");
          else if(st==="expired")setScreen("expired");
          else setScreen("goto_bot");
        }else{setScreen("goto_bot");}
      }catch(e){console.error("Init:",e);setScreen("goto_bot");}
    };
    init();
  },[]);

  if(screen==="loading")return(
    <>
      <G/>
      <style>{`
        @keyframes dbSpin{0%{transform:rotate(0deg) scale(1);}80%{transform:rotate(360deg) scale(1);}100%{transform:rotate(360deg) scale(0) translateY(-40px);opacity:0;}}
        @keyframes dbAppear{from{opacity:0;transform:scale(.6);}to{opacity:1;transform:scale(1);}}
        .db-spin{animation:dbSpin 1.4s ease-in-out forwards;}
        .db-appear{animation:dbAppear .5s ease forwards;}
      `}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",position:"relative",overflow:"hidden"}}>
        <img src="/photo3.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(8,8,8,.4) 0%,rgba(8,8,8,.75) 50%,rgba(8,8,8,.97) 100%)"}}/>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
          <div style={{fontSize:42,fontWeight:900,color:C.tm,letterSpacing:-2,textAlign:"center",lineHeight:1}}>FITCORE</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.4)",letterSpacing:2,textTransform:"uppercase"}}>AI Trainer by Matias</div>
          <DumbbellLoader/>
        </div>
      </div>
    </>
  );

  const isAdminMode=screen==="admin";
  const showNav=["client","admin"].includes(screen)&&!checkinMode;
  const titles={plan:"Мій план",nutrition:"Харчування",progress:"Прогрес",menu:"Тарифи і меню",supplements:"БАДи",profile:"Профіль",dashboard:"Дашборд",clients:"Клієнти",payments:"Оплати",broadcast:"Розсилка",settings:"Налаштування"};
  const topTitle=checkinMode?"Чекін":isAdminMode?(selClient?"Профіль клієнта":titles[adminTab]):titles[clientTab];
  const showTopNav=["client","admin"].includes(screen)&&clientTab!=="profile"&&!(isAdminMode&&adminTab==="dashboard");

  const renderContent=()=>{
    if(screen==="welcome")return <Welcome onStart={()=>setScreen("plans")} onLogin={()=>setScreen("plans")}/>;
    if(screen==="goto_bot")return(
      <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"0 28px",textAlign:"center"}}>
        <img src="/photo2.jpg" alt="" style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",objectPosition:"center 20%",border:`3px solid ${C.acc}`}}/>
        <div style={{fontSize:28,fontWeight:900,color:C.tm,letterSpacing:-1,lineHeight:1.1}}>Привіт!</div>
        <div style={{fontSize:16,color:C.ts,lineHeight:1.7}}>Щоб розпочати — пройди коротку анкету в боті. Це займе 2 хвилини.</div>
        <a href="https://t.me/fitcore_matias_bot" style={{textDecoration:"none",width:"100%"}}>
          <PBtn>Відкрити бота</PBtn>
        </a>
        <div style={{fontSize:13,color:C.td}}>Вже пройшов анкету? Зачекай — доступ відкриється автоматично.</div>
      </div>
    );
    if(screen==="plans")return <PlanSelect plans={plans} payLinks={payLinks} onSelect={p=>{setSelPlan(p);setScreen("payment");}}/>;
    if(screen==="payment")return <Payment planKey={selPlan} plans={plans} payLinks={payLinks} onBack={()=>setScreen("plans")} onPaid={()=>setScreen("pending")} userId={userId}/>;
    if(screen==="expired")return(
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
        <div style={{fontSize:48}}>🔒</div>
        <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1}}>Пакет закінчився</div>
        <div style={{fontSize:15,color:C.ts,lineHeight:1.7}}>Твій тариф завершився.<br/>Придбай новий пакет щоб відновити доступ.</div>
        <PBtn onClick={()=>setScreen("plans")}>Придбати тариф</PBtn>
        <div style={{fontSize:13,color:C.td}}>Всі твої дані збережені</div>
      </div>
    );
    if(screen==="pending")return(
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 24px"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(232,168,50,.1)",border:`2px solid ${C.amber}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="32" height="32" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke={C.amber} strokeWidth="1.6"/><path d="M9 5.5v4l2.5 2.5" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
        <div style={{fontSize:24,fontWeight:900,color:C.tm}}>Очікуємо підтвердження</div>
        <div style={{fontSize:16,color:C.ts,textAlign:"center",lineHeight:1.7}}>Тренер перевіряє оплату.<br/>Отримаєш доступ одразу після підтвердження.</div>
      </div>
    );
    if(screen==="admin"){
      if(selClient)return <AdminClientDetail client={selClient} onBack={()=>setSelClient(null)}/>;
      const onExitAdmin=()=>{setScreen("client");setAdminTab("dashboard");};
      if(adminTab==="dashboard")return <AdminDash/>;
      if(adminTab==="clients")return <AdminClients onSelect={c=>setSelClient(c)}/>;
      if(adminTab==="payments")return <AdminPayments/>;
      if(adminTab==="broadcast")return <AdminBroadcast/>;
      if(adminTab==="settings")return <AdminSettings settings={settings} onExitAdmin={onExitAdmin}/>;
    }
    if(screen==="client"){
      if(checkinMode)return <Checkin userId={userId} onDone={()=>setCheckin(false)}/>;
      if(clientTab==="plan")return <TrainPlan userId={userId}/>;
      if(clientTab==="nutrition")return <Nutrition userId={userId}/>;
      if(clientTab==="progress")return <Progress userId={userId}/>;
      if(clientTab==="menu")return <MenuScreen plans={plans} payLinks={payLinks} onSelectPlan={p=>{setSelPlan(p);setScreen("payment");}} clientPlan={clientData?.plan} onShowReviews={()=>setClientTab("reviews")}/>;
      if(clientTab==="supplements")return <SupplementsScreen userId={userId} clientPlan={clientData?.plan} isAdmin={isAdmin}/>;
      if(clientTab==="reviews")return <ReviewsScreen userId={userId}/>;
      if(clientTab==="notifications")return <NotificationsScreen userId={userId}/>;
      if(clientTab==="profile")return <Profile client={clientData} questionnaire={questionnaire} isAdmin={isAdmin} onAdminAccess={()=>setScreen("admin")} onCheckin={()=>setCheckin(true)} onBuyPlan={()=>{setClientTab("menu");}} onSupplements={clientData?.plan==="vip"?()=>setClientTab("supplements"):null} userId={userId}/>;
    }
  };

  return(
    <>
      <G/>
      <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
        {showTopNav&&(
          <TNav title={topTitle}
            onBack={selClient?()=>setSelClient(null):checkinMode?()=>setCheckin(false):isAdminMode?()=>setScreen("client"):undefined}
            rightEl={isAdminMode&&adminTab==="payments"&&!selClient&&<div style={{fontSize:12,background:"rgba(232,168,50,.1)",color:C.amber,border:"1px solid rgba(232,168,50,.3)",borderRadius:20,padding:"4px 12px",fontWeight:700}}>оплати</div>}
          />
        )}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>{renderContent()}</div>
        {showNav&&<BNav active={isAdminMode?adminTab:clientTab} onChange={id=>{if(isAdminMode){setAdminTab(id);setSelClient(null);}else setClientTab(id);}} isAdmin={isAdminMode}/>}
      </div>
    </>
  );
}
