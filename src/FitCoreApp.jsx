import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const T = {
  sbg: "#0d1209", sc: "#1a2412", sc2: "#222f17", sc3: "#2a3820",
  a: "#6b8f4e", ab: "#7aaa58", ad: "#4a5c3a",
  tm: "#eef2e8", tmu: "#7a9068", tmd: "#3d5030",
  bc: "#2a3820",
  red: "#e87c72", redbg: "#2a1010", redbr: "#4a1a1a",
  amber: "#d4a843", amberbg: "#1e1a0a",
  blue: "#5a9fd4",
};

const css = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (vals[i] ?? ""), "");

// ─── GLOBAL STYLES ───────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{background:${T.sbg};color:${T.tm};font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
    button{cursor:pointer;border:none;outline:none;font-family:'DM Sans',sans-serif;}
    input,textarea{font-family:'DM Sans',sans-serif;outline:none;}
    ::-webkit-scrollbar{width:0;}

    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(122,170,88,0);}50%{box-shadow:0 0 0 6px rgba(122,170,88,0.18);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes shimmer{0%,100%{opacity:0.5;}50%{opacity:1;}}
    @keyframes blink{0%,100%{border-color:${T.a};}50%{border-color:${T.ab};}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes barFill{from{width:0;}to{width:var(--w);}}

    .fade-in{animation:fadeIn .3s ease forwards;}
    .slide-up{animation:slideUp .35s ease forwards;}
    .pulse-btn{animation:pulse 2.5s ease-in-out infinite;}
    .shimmer{animation:shimmer 1.8s ease-in-out infinite;}
    .blink-border{animation:blink 2s ease-in-out infinite;}
  `}</style>
);

// ─── PRIMITIVES ──────────────────────────────────────────────
const Icon = ({ name, size = 18, color = T.tmu }) => {
  const icons = {
    home: <><rect x="3" y="9" width="3" height="8" rx="1" fill={color}/><rect x="7" y="6" width="3" height="11" rx="1" fill={color}/><rect x="11" y="3" width="3" height="14" rx="1" fill={color}/></>,
    users: <><circle cx="8" cy="6" r="3" stroke={color} strokeWidth="1.4" fill="none"/><path d="M2 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    card: <><rect x="2" y="5" width="14" height="12" rx="2" stroke={color} strokeWidth="1.4" fill="none"/><path d="M2 9h14" stroke={color} strokeWidth="1.4"/><circle cx="6" cy="13" r="1.5" fill={color}/></>,
    send: <><path d="M2 12l13-8-5 8 5 8L2 12z" fill={color}/></>,
    settings: <><circle cx="9" cy="9" r="3" stroke={color} strokeWidth="1.4" fill="none"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4 4l1.4 1.4M12.6 12.6L14 14M4 14l1.4-1.4M12.6 5.4L14 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    back: <><path d="M11 4L5 9l6 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    check: <><path d="M4 9l4 4 7-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    x: <><path d="M4 4l10 10M14 4L4 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
    plus: <><path d="M9 3v12M3 9h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
    search: <><circle cx="7.5" cy="7.5" r="4" stroke={color} strokeWidth="1.4" fill="none"/><path d="M10.5 10.5l3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    play: <><path d="M5 3l11 6-11 6V3z" fill={color}/></>,
    dumbbell: <><path d="M4 9h10M3 7v4M5 6v6M11 6v6M13 7v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
    food: <><path d="M9 2v5a4 4 0 01-4 4H4M14 2v14M9 2c0 0-2 2-2 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    chart: <><path d="M2 14l4-4 3 3 5-6" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    fire: <><path d="M9 2c0 4-3 5-3 8a3 3 0 006 0c0-3-3-4-3-8z" stroke={color} strokeWidth="1.4" fill="none"/><path d="M9 14a1.5 1.5 0 000-3" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    lock: <><rect x="4" y="8" width="10" height="8" rx="1.5" stroke={color} strokeWidth="1.4" fill="none"/><path d="M6 8V6a3 3 0 016 0v2" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    bell: <><path d="M9 2a5 5 0 015 5v3l1.5 2H2.5L4 10V7a5 5 0 015-5z" stroke={color} strokeWidth="1.4" fill="none"/><path d="M7 14a2 2 0 004 0" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    video: <><rect x="2" y="5" width="11" height="8" rx="1.5" stroke={color} strokeWidth="1.4" fill="none"/><path d="M13 8l4-2v6l-4-2V8z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none"/></>,
    eye: <><path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke={color} strokeWidth="1.4" fill="none"/><circle cx="9" cy="9" r="2" stroke={color} strokeWidth="1.4" fill="none"/></>,
    shield: <><path d="M9 2l6 3v4c0 3.5-2.5 6.5-6 7-3.5-.5-6-3.5-6-7V5l6-3z" stroke={color} strokeWidth="1.4" fill="none"/></>,
    arrow: <><path d="M4 9h10M10 5l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      {icons[name] || null}
    </svg>
  );
};

const Divider = () => <div style={{ height: 1, background: T.bc, margin: "4px 0" }} />;

const Badge = ({ children, variant = "green" }) => {
  const variants = {
    green: { bg: "rgba(107,143,78,.18)", color: T.ab, border: T.a },
    amber: { bg: "rgba(212,168,67,.15)", color: T.amber, border: "rgba(212,168,67,.35)" },
    red:   { bg: "rgba(232,124,114,.15)", color: T.red, border: T.redbr },
    blue:  { bg: "rgba(90,159,212,.15)", color: T.blue, border: "rgba(90,159,212,.3)" },
    purple:{ bg: "rgba(160,154,232,.15)", color: "#a09ae8", border: "rgba(160,154,232,.3)" },
  };
  const v = variants[variant];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: v.bg, color: v.color, border: `1px solid ${v.border}`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const Avatar = ({ name, size = 34 }) => {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(107,143,78,.2)", border: `1px solid ${T.a}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 500, color: T.ab, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const Toggle = ({ on, onToggle }) => (
  <div onClick={onToggle} style={{ width: 34, height: 18, borderRadius: 10, background: on ? T.a : T.sc3, position: "relative", cursor: "pointer", transition: "background .2s", border: on ? "none" : `1px solid ${T.bc}`, flexShrink: 0 }}>
    <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.tm, position: "absolute", top: 2, left: on ? 18 : 2, transition: "left .2s" }} />
  </div>
);

const PrimaryBtn = ({ children, onClick, style = {}, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} className="pulse-btn" style={{ background: disabled ? T.ad : T.a, color: T.tm, borderRadius: 10, padding: "11px 0", width: "100%", fontSize: 13, fontWeight: 500, transition: "opacity .2s", opacity: disabled ? .5 : 1, ...style }}>
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{ background: "transparent", color: T.ab, border: `1px solid ${T.bc}`, borderRadius: 10, padding: "9px 0", width: "100%", fontSize: 12, ...style }}>
    {children}
  </button>
);

// ─── SCREEN WRAPPER ──────────────────────────────────────────
const Screen = ({ children, style = {} }) => (
  <div className="fade-in" style={{ flex: 1, overflowY: "auto", padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 8, ...style }}>
    {children}
  </div>
);

// ─── TOP NAV ─────────────────────────────────────────────────
const TopNav = ({ title, subtitle, onBack, rightEl }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px 8px", borderBottom: `1px solid ${T.bc}`, flexShrink: 0 }}>
    <div style={{ width: 60 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", display: "flex", alignItems: "center", gap: 4, color: T.ab, fontSize: 11 }}>
          <Icon name="back" size={16} color={T.ab} /> Назад
        </button>
      )}
    </div>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: T.tm }}>{title}</div>
      {subtitle && <div style={{ fontSize: 9, color: T.tmu, marginTop: 1 }}>{subtitle}</div>}
    </div>
    <div style={{ width: 60, display: "flex", justifyContent: "flex-end" }}>{rightEl}</div>
  </div>
);

// ─── BOTTOM NAV ──────────────────────────────────────────────
const BottomNav = ({ active, onChange, isAdmin }) => {
  const clientTabs = [
    { id: "plan", label: "План", icon: "dumbbell" },
    { id: "nutrition", label: "Харчування", icon: "food" },
    { id: "progress", label: "Прогрес", icon: "chart" },
    { id: "profile", label: "Профіль", icon: "users" },
  ];
  const adminTabs = [
    { id: "dashboard", label: "Огляд", icon: "home" },
    { id: "clients", label: "Клієнти", icon: "users" },
    { id: "payments", label: "Оплати", icon: "card" },
    { id: "broadcast", label: "Розсилка", icon: "send" },
    { id: "settings", label: "Налашт.", icon: "settings" },
  ];
  const tabs = isAdmin ? adminTabs : clientTabs;
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${T.bc}`, padding: "5px 0 8px", flexShrink: 0, background: T.sbg }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ flex: 1, background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Icon name={t.icon} size={18} color={active === t.id ? T.ab : T.tmu} />
          <span style={{ fontSize: 9, color: active === t.id ? T.ab : T.tmu }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CLIENT SCREENS
// ═══════════════════════════════════════════════════════════════

// ─── WELCOME ─────────────────────────────────────────────────
const WelcomeScreen = ({ onStart, onLogin }) => (
  <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px 16px", gap: 12 }}>
    <div style={{ background: T.sc, borderRadius: 16, border: `1px solid ${T.bc}`, height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,${T.a}22 0,${T.a}22 1px,transparent 1px,transparent 22px),repeating-linear-gradient(90deg,${T.a}22 0,${T.a}22 1px,transparent 1px,transparent 22px)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(0deg, ${T.sbg}cc 0%, transparent 60%)` }} />
      <div className="pulse-btn" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${T.ab}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <Icon name="play" size={20} color={T.ab} />
      </div>
      <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, color: T.tm, zIndex: 2 }}>Матіас — тренер</div>
      <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, color: T.tmu, background: "rgba(0,0,0,.5)", padding: "2px 6px", borderRadius: 4, zIndex: 2 }}>0:47</div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, background: T.a, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="dumbbell" size={18} color={T.tm} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: T.tm, letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" }}>FITCORE</div>
        <div style={{ fontSize: 9, color: T.tmu, letterSpacing: 1 }}>AI TRAINER BY MATIAS</div>
      </div>
    </div>

    <div style={{ height: 1, background: T.bc }} />

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
      {[["1200+", "клієнтів"], ["4.9", "рейтинг"], ["3 дні", "безкошт."]].map(([v, l]) => (
        <div key={l} style={{ background: T.sc, borderRadius: 10, border: `1px solid ${T.bc}`, padding: "8px 0", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: T.ab }}>{v}</div>
          <div style={{ fontSize: 9, color: T.tmu, marginTop: 2 }}>{l}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
      <PrimaryBtn onClick={onStart}>Почати безкоштовно</PrimaryBtn>
      <GhostBtn onClick={onLogin}>Вже маю акаунт</GhostBtn>
      <div style={{ fontSize: 10, color: T.tmu, textAlign: "center" }}>
        Без карти · <span style={{ color: T.ab }}>3 дні повного доступу</span>
      </div>
    </div>
  </div>
);

// ─── ONBOARDING ──────────────────────────────────────────────
const STEPS = [
  { key: "age",      label: "Вік",                     type: "number",  placeholder: "27", unit: "років" },
  { key: "gender",   label: "Стать",                   type: "chips",   options: [{ v: "male", l: "Чоловік" }, { v: "female", l: "Жінка" }] },
  { key: "height",   label: "Ріст",                    type: "number",  placeholder: "178", unit: "см" },
  { key: "weight",   label: "Поточна вага",             type: "number",  placeholder: "82.0", unit: "кг" },
  { key: "target",   label: "Цільова вага",             type: "number",  placeholder: "76.0", unit: "кг" },
  { key: "goal",     label: "Головна ціль",             type: "chips",   options: [{ v: "lose", l: "Схуднути" }, { v: "gain", l: "Набір маси" }, { v: "recomp", l: "Рельєф" }, { v: "strength", l: "Сила" }, { v: "health", l: "Здоров'я" }] },
  { key: "exp",      label: "Досвід тренувань",         type: "chips",   options: [{ v: "beginner", l: "Новачок" }, { v: "intermediate", l: "Середній" }, { v: "advanced", l: "Досвідчений" }] },
  { key: "equip",    label: "Обладнання",               type: "chips",   options: [{ v: "gym", l: "Зал" }, { v: "home_dumbs", l: "Вдома з гантелями" }, { v: "home_none", l: "Вдома без" }, { v: "outdoor", l: "Вулиця" }] },
  { key: "health",   label: "Обмеження здоров'я",       type: "chips",   options: [{ v: "none", l: "Немає" }, { v: "back", l: "Спина" }, { v: "knees", l: "Коліна" }, { v: "shoulders", l: "Плечі" }, { v: "heart", l: "Серце" }] },
  { key: "wpw",      label: "Тренувань на тиждень",     type: "chips",   options: [{ v: "2", l: "2×" }, { v: "3", l: "3×" }, { v: "4", l: "4×" }, { v: "5", l: "5×" }, { v: "6", l: "6×" }] },
  { key: "time",     label: "Час тренувань",            type: "chips",   options: [{ v: "morning", l: "Ранок" }, { v: "afternoon", l: "День" }, { v: "evening", l: "Вечір" }, { v: "any", l: "Будь-коли" }] },
];

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [inputVal, setInputVal] = useState("");
  const cur = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  const canNext = cur.type === "number" ? inputVal.trim() !== "" : data[cur.key] !== undefined;

  const handleNext = () => {
    if (cur.type === "number") {
      setData(d => ({ ...d, [cur.key]: inputVal }));
      setInputVal("");
    }
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onComplete(data);
  };

  return (
    <Screen>
      <div style={{ fontSize: 14, fontWeight: 500, color: T.tm }}>{cur.label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 3, background: T.sc2, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: T.ab, borderRadius: 2, transition: "width .3s" }} />
        </div>
        <span style={{ fontSize: 10, color: T.tmu, flexShrink: 0 }}>{step + 1} / {STEPS.length}</span>
      </div>

      {cur.type === "number" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.sc, border: `1px solid ${T.a}`, borderRadius: 10, padding: "10px 14px" }}>
          <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="number" placeholder={cur.placeholder} style={{ background: "none", color: T.tm, fontSize: 22, fontWeight: 500, flex: 1, width: "100%" }} />
          <span style={{ fontSize: 12, color: T.tmu }}>{cur.unit}</span>
        </div>
      )}

      {cur.type === "chips" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
          {cur.options.map(o => (
            <button key={o.v} onClick={() => setData(d => ({ ...d, [cur.key]: o.v }))}
              style={{ padding: "8px 14px", borderRadius: 20, border: `1px solid ${data[cur.key] === o.v ? T.ab : T.bc}`, background: data[cur.key] === o.v ? "rgba(107,143,78,.18)" : T.sc, color: data[cur.key] === o.v ? T.ab : T.tmu, fontSize: 12, transition: "all .15s" }}>
              {o.l}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        {step > 0 && <GhostBtn onClick={() => setStep(s => s - 1)} style={{ width: "auto", padding: "9px 20px" }}>Назад</GhostBtn>}
        <PrimaryBtn onClick={handleNext} disabled={!canNext}>{step === STEPS.length - 1 ? "Завершити" : "Далі"}</PrimaryBtn>
      </div>
    </Screen>
  );
};

// ─── PLAN SELECT ─────────────────────────────────────────────
const PLANS = [
  { key: "start",   name: "START",   price: 799,  tier: 1, emoji: "🟢", features: ["Тренувальний план", "Шаблон харчування", "Трекінг прогресу"] },
  { key: "premium", name: "PREMIUM", price: 1699, tier: 2, emoji: "🔵", features: ["Персональний ШІ-план", "Чекіни 2× на тиждень", "Нутріціологія", "Фідбек тренера"], hot: true },
  { key: "vip",     name: "VIP",     price: 3499, tier: 3, emoji: "🟣", features: ["Повний супровід", "Прямий доступ до тренера", "Пріоритет оновлень", "VIP підтримка 24/7"] },
];

const PlanSelectScreen = ({ onSelect }) => (
  <Screen>
    <div style={{ fontSize: 14, fontWeight: 500, color: T.tm }}>Обери тариф</div>
    <div style={{ fontSize: 10, color: T.tmu }}>Всі тарифи — 3 дні безкоштовно</div>

    {PLANS.map(p => (
      <div key={p.key} className={p.hot ? "blink-border" : ""} onClick={() => onSelect(p.key)}
        style={{ background: T.sc, borderRadius: 12, border: `1px solid ${p.hot ? T.a : T.bc}`, padding: "12px 14px", cursor: "pointer" }}>
        {p.hot && <div style={{ fontSize: 9, background: T.a, color: T.tm, borderRadius: 8, padding: "2px 8px", display: "inline-block", marginBottom: 6 }}>Популярний</div>}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.tm }}>{p.name}</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: T.ab }}>{p.price} <span style={{ fontSize: 10, color: T.tmu, fontWeight: 400 }}>₴/міс</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {p.features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: p.hot ? "#b8d89a" : T.tmu }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.a, flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>
    ))}

    <div style={{ background: T.sc2, borderRadius: 10, border: `1px solid ${T.bc}`, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 500, color: T.tm }}>План харчування</div>
        <div style={{ fontSize: 9, color: T.tmu }}>КБЖУ + прийоми їжі з грамами</div>
      </div>
      <Icon name="arrow" size={18} color={T.ab} />
    </div>
  </Screen>
);

// ─── PAYMENT ─────────────────────────────────────────────────
const PaymentScreen = ({ planKey, onBack, onPaid }) => {
  const plan = PLANS.find(p => p.key === planKey);
  return (
    <Screen>
      <TopNav title="Оплата" onBack={onBack} />
      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.bc}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: T.tmu, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Замовлення</div>
        {[["Тариф", plan?.name], ["Період", "1 місяць"], ["Пробний", "3 дні безкошт."]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11 }}>
            <span style={{ color: T.tmu }}>{l}</span>
            <span style={{ color: l === "Пробний" ? T.ab : T.tm }}>{v}</span>
          </div>
        ))}
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.tm }}>До сплати</span>
          <span style={{ fontSize: 20, fontWeight: 500, color: T.ab }}>{plan?.price} ₴</span>
        </div>
      </div>

      <div className="blink-border" style={{ background: "rgba(107,143,78,.06)", borderRadius: 12, border: `1px solid ${T.a}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: T.sc2, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="card" size={18} color={T.ab} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: T.tm }}>Monobank jar</div>
          <div style={{ fontSize: 9, color: T.tmu }}>MatiasFitness — {plan?.name}</div>
        </div>
        <div className="pulse-btn" style={{ width: 28, height: 28, background: T.a, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="arrow" size={14} color={T.tm} />
        </div>
      </div>

      <PrimaryBtn onClick={onPaid}>Перейти до оплати</PrimaryBtn>
      <GhostBtn onClick={onPaid}>Надіслати скріншот</GhostBtn>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <Icon name="lock" size={12} color={T.tmd} />
        <span style={{ fontSize: 9, color: T.tmu }}>Безпечна оплата через Monobank</span>
      </div>
    </Screen>
  );
};

// ─── CLIENT: TRAINING PLAN ────────────────────────────────────
const TrainingPlanScreen = () => {
  const days = [
    { name: "Понеділок", tag: "Груди + Трицепс", exercises: [["Жим штанги лежачи", "4 × 8"], ["Жим гантелей 30°", "4 × 10"], ["Зведення в кросовері", "3 × 12"], ["Французький жим", "3 × 10"]], note: "Відпочинок: 90 сек" },
    { name: "Вівторок", tag: "День відпочинку", rest: true },
    { name: "Середа", tag: "Спина + Біцепс", exercises: [["Підтягування", "4 × 8"], ["Тяга штанги в нахилі", "4 × 8"], ["Тяга блоку сидячи", "3 × 12"]], note: "Відпочинок: 2 хв" },
    { name: "Четвер", tag: "День відпочинку", rest: true },
    { name: "П'ятниця", tag: "Плечі (окремий день)", exercises: [["Жим гантелей сидячи", "4 × 10"], ["Підйоми в сторони", "4 × 14"], ["Махи в нахилі", "4 × 14"], ["Тяга до підборіддя", "3 × 12"]], note: "Відпочинок: 60–90 сек" },
  ];
  return (
    <Screen>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 10, color: T.ab, background: "rgba(107,143,78,.15)", border: `1px solid ${T.a}`, borderRadius: 10, padding: "3px 10px" }}>Тиждень 3</div>
        <div style={{ fontSize: 10, color: T.tmu }}>+5% від минулого</div>
      </div>
      {days.map(d => (
        <div key={d.name} style={{ background: T.sc, borderRadius: 10, border: `1px solid ${T.bc}`, overflow: "hidden" }}>
          <div style={{ background: T.sc2, padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.tm }}>{d.name}</div>
            <div style={{ fontSize: 9, color: d.rest ? T.tmu : T.ab, background: d.rest ? "transparent" : "rgba(107,143,78,.15)", padding: "2px 8px", borderRadius: 8, border: d.rest ? "none" : `1px solid ${T.a}` }}>{d.tag}</div>
          </div>
          {!d.rest && (
            <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
              {d.exercises.map(([name, sets]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: T.tm }}>{name}</div>
                  <div style={{ fontSize: 10, color: T.tmu, fontFamily: "'DM Mono', monospace" }}>{sets}</div>
                </div>
              ))}
              <div style={{ fontSize: 9, color: T.tmd, fontStyle: "italic", marginTop: 2 }}>{d.note}</div>
            </div>
          )}
          {d.rest && (
            <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="fire" size={14} color={T.tmu} />
              <div style={{ fontSize: 10, color: T.tmu }}>Активне відновлення: прогулянка або стретчинг</div>
            </div>
          )}
        </div>
      ))}
      <div style={{ background: "rgba(107,143,78,.06)", border: `1px solid ${T.bc}`, borderRadius: 8, padding: "8px 12px", display: "flex", gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.a, marginTop: 4, flexShrink: 0 }} />
        <div style={{ fontSize: 10, color: T.tmu, lineHeight: 1.6 }}>Тиж 4 — розвантажувальний. Знизь вагу на 10%, фокус на техніці.</div>
      </div>
    </Screen>
  );
};

// ─── CLIENT: NUTRITION ────────────────────────────────────────
const NutritionScreen = () => {
  const meals = [
    { time: "08:00", name: "Сніданок", kcal: 620, foods: [["Вівсянка відварна", "120г"], ["Яйця курячі", "3 шт"], ["Банан", "1 шт"]] },
    { time: "11:00", name: "Перекус", kcal: 280, foods: [["Грецький горіх", "30г"], ["Яблуко", "1 шт"]] },
    { time: "14:00", name: "Обід", kcal: 780, foods: [["Куряче філе", "200г"], ["Рис відварний", "150г"], ["Огірок + помідор", "200г"]] },
    { time: "17:00", name: "До тренування", kcal: 320, foods: [["Банан", "1 шт"], ["Хліб цільнозерновий", "60г"]] },
    { time: "20:00", name: "Вечеря", kcal: 560, foods: [["Лосось запечений", "180г"], ["Гречка відварна", "120г"], ["Броколі", "150г"]] },
  ];
  const macros = [{ l: "Білок", v: "185г", pct: 75, color: T.ab }, { l: "Жири", v: "72г", pct: 55, color: T.amber }, { l: "Вугл.", v: "248г", pct: 65, color: T.blue }];
  return (
    <Screen>
      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.bc}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Денна норма</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: T.ab, marginBottom: 8 }}>2 340 <span style={{ fontSize: 12, color: T.tmu, fontWeight: 400 }}>ккал</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          {macros.map(m => (
            <div key={m.l} style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: T.tmu }}>{m.l}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: T.tm, margin: "2px 0 4px" }}>{m.v}</div>
              <div style={{ height: 3, background: T.bc, borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {meals.map(m => (
        <div key={m.time} style={{ background: T.sc, borderRadius: 10, border: `1px solid ${T.bc}`, overflow: "hidden" }}>
          <div style={{ background: T.sc2, padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, color: T.tmu }}>{m.time}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: T.tm }}>{m.name}</div>
            </div>
            <div style={{ fontSize: 10, color: T.ab }}>{m.kcal} ккал</div>
          </div>
          <div style={{ padding: "7px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {m.foods.map(([name, qty], i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                  <span style={{ color: T.tm }}>{name}</span>
                  <span style={{ color: T.tmu, fontFamily: "'DM Mono', monospace" }}>{qty}</span>
                </div>
                {i < m.foods.length - 1 && <div style={{ height: 1, background: T.bc, margin: "3px 0" }} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ background: T.sc, borderRadius: 8, border: `1px solid ${T.bc}`, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i <= 5 ? T.a : "transparent", border: `1px solid ${T.a}` }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.tmu }}>Вода: 1.25 л з 2.5 л</div>
      </div>
    </Screen>
  );
};

// ─── CLIENT: PROGRESS ────────────────────────────────────────
const ProgressScreen = () => {
  const checkins = [
    { week: 1, weight: 85.0, energy: 3 }, { week: 2, weight: 84.2, energy: 4 },
    { week: 3, weight: 83.5, energy: 3 }, { week: 4, weight: 83.8, energy: 2 },
    { week: 5, weight: 83.0, energy: 4 }, { week: 6, weight: 82.4, energy: 4 },
  ];
  const maxW = Math.max(...checkins.map(c => c.weight));
  const minW = Math.min(...checkins.map(c => c.weight));
  return (
    <Screen>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[["Старт", "85.0 кг", T.tmu], ["Зараз", "82.4 кг", T.ab], ["Прогрес", "−2.6 кг", T.ab], ["Стрік", "14 днів", T.amber]].map(([l, v, c]) => (
          <div key={l} style={{ background: T.sc, borderRadius: 10, border: `1px solid ${T.bc}`, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: T.tmu }}>{l}</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: c, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.bc}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: T.tmu, marginBottom: 10 }}>Динаміка ваги</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
          {checkins.map(c => {
            const h = ((c.weight - minW + 1) / (maxW - minW + 1)) * 60 + 10;
            return (
              <div key={c.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 8, color: T.tmu }}>{c.weight}</div>
                <div style={{ width: "100%", height: h, background: T.a, borderRadius: "3px 3px 0 0", transition: "height .5s" }} />
                <div style={{ fontSize: 8, color: T.tmd }}>Т{c.week}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.bc}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: T.tmu, marginBottom: 8 }}>Прогрес до цілі (76 кг)</div>
        <div style={{ height: 6, background: T.bc, borderRadius: 4, marginBottom: 6 }}>
          <div style={{ height: "100%", width: "42%", background: T.ab, borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
          <span style={{ color: T.tmu }}>85 кг</span>
          <span style={{ color: T.ab }}>42% пройдено</span>
          <span style={{ color: T.tmu }}>76 кг</span>
        </div>
      </div>

      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.bc}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: T.tmu, marginBottom: 8 }}>Бейджі</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["🔥", "7 днів", true], ["⚡", "14 днів", true], ["🏆", "30 днів", false], ["💎", "60 днів", false]].map(([e, l, earned]) => (
            <div key={l} style={{ background: earned ? "rgba(107,143,78,.15)" : T.sc2, borderRadius: 10, border: `1px solid ${earned ? T.a : T.bc}`, padding: "6px 10px", textAlign: "center", opacity: earned ? 1 : .4 }}>
              <div style={{ fontSize: 16 }}>{e}</div>
              <div style={{ fontSize: 8, color: earned ? T.ab : T.tmu, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
};

// ─── CLIENT: PROFILE ─────────────────────────────────────────
const ProfileScreen = ({ onAdminAccess }) => (
  <Screen>
    <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.a}`, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name="Оксана Петренко" size={48} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.tm }}>Оксана Петренко</div>
        <div style={{ fontSize: 10, color: T.tmu, marginTop: 2 }}>@oksana_p</div>
        <Badge variant="blue" style={{ marginTop: 4 }}>PREMIUM · до 7 трав</Badge>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {[["Вік", "28 років"], ["Стать", "Жінка"], ["Вага", "82.4 кг"], ["Ціль", "76 кг"], ["Зал", "Тренажерний"], ["Тренувань", "4×/тиж"]].map(([l, v]) => (
        <div key={l} style={{ background: T.sc, borderRadius: 8, border: `1px solid ${T.bc}`, padding: "7px 10px" }}>
          <div style={{ fontSize: 9, color: T.tmu }}>{l}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: T.tm, marginTop: 1 }}>{v}</div>
        </div>
      ))}
    </div>
    <Divider />
    {[["Мій план тренувань", "dumbbell"], ["Чекін", "chart"], ["Налаштування", "settings"]].map(([l, icon]) => (
      <button key={l} style={{ background: T.sc, border: `1px solid ${T.bc}`, borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={icon} size={16} color={T.ab} />
          <span style={{ fontSize: 12, color: T.tm }}>{l}</span>
        </div>
        <Icon name="arrow" size={14} color={T.tmd} />
      </button>
    ))}
    <Divider />
    <button onClick={onAdminAccess} style={{ background: "rgba(107,143,78,.08)", border: `1px solid ${T.a}`, borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <Icon name="shield" size={16} color={T.ab} />
      <span style={{ fontSize: 12, color: T.ab, fontWeight: 500 }}>Адмін-панель</span>
    </button>
  </Screen>
);

// ═══════════════════════════════════════════════════════════════
// ADMIN SCREENS
// ═══════════════════════════════════════════════════════════════

const CLIENTS_DATA = [
  { id: 1, name: "Оксана Петренко", username: "@oksana_p", plan: "premium", status: "active", weight: 63.2, streak: 14, checkins: 11, lastActive: "2 год тому", age: 28, gender: "female", height: 165, targetWeight: 58, equip: "Зал", wpw: 4 },
  { id: 2, name: "Дмитро Коваль",   username: "@dmytro_k", plan: "premium", status: "pending", weight: 88.0, streak: 0,  checkins: 0,  lastActive: "1 год тому", age: 31, gender: "male", height: 182, targetWeight: 82, equip: "Зал", wpw: 4 },
  { id: 3, name: "Марина Федоренко",username: "@marina_f", plan: "trial",   status: "trial",   weight: 70.5, streak: 3,  checkins: 3,  lastActive: "вчора", age: 25, gender: "female", height: 168, targetWeight: 65, equip: "Зал", wpw: 3 },
  { id: 4, name: "Іван Мороз",      username: "@ivan_m",   plan: "start",   status: "active",  weight: 92.0, streak: 5,  checkins: 5,  lastActive: "15 хв тому", age: 34, gender: "male", height: 178, targetWeight: 85, equip: "Вдома", wpw: 3 },
  { id: 5, name: "Аліна Савченко",  username: "@alina_s",  plan: "vip",     status: "active",  weight: 58.3, streak: 21, checkins: 21, lastActive: "3 год тому", age: 27, gender: "female", height: 163, targetWeight: 55, equip: "Зал", wpw: 5 },
  { id: 6, name: "Тетяна Бойко",    username: "@tetyana_b",plan: "start",   status: "pending", weight: 74.0, streak: 0,  checkins: 0,  lastActive: "30 хв тому", age: 29, gender: "female", height: 170, targetWeight: 68, equip: "Вдома", wpw: 3 },
];

const planVariant = { start: "green", premium: "blue", vip: "purple", trial: "amber" };
const planLabel   = { start: "START", premium: "PREMIUM", vip: "VIP", trial: "Trial" };
const statusLabel = { active: "Активний", pending: "Очікує", trial: "Trial" };

// ─── ADMIN: DASHBOARD ────────────────────────────────────────
const AdminDashboard = () => {
  const chartBars = [40, 55, 45, 70, 60, 82, 100];
  return (
    <Screen>
      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.a}`, padding: "12px 14px" }}>
        <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>Виручка місяця</div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 500, color: T.ab }}>47 200 <span style={{ fontSize: 12, color: T.tmu, fontWeight: 400 }}>₴</span></div>
            <div style={{ fontSize: 10, color: T.tmu }}>+12% до минулого місяця</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
            {chartBars.map((h, i) => (
              <div key={i} style={{ width: 8, height: `${h}%`, background: i >= 5 ? T.a : T.sc2, borderRadius: "2px 2px 0 0" }} />
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: T.bc, borderRadius: 2, marginTop: 8 }}>
          <div style={{ height: "100%", width: "68%", background: T.ab, borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[["Активні", 34, T.ab, "+3 цього тижня"], ["Trial", 12, T.amber, "закінч. сьогодні: 2"], ["Очікують", 5, T.red, "оплат на перевірці"], ["Чекіни", 8, T.tm, "з 34 активних"]].map(([l, v, c, s]) => (
          <div key={l} style={{ background: T.sc, borderRadius: 10, border: `1px solid ${T.bc}`, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .4 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: c, margin: "2px 0" }}>{v}</div>
            <div style={{ fontSize: 9, color: T.tmd }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Остання активність</div>
      {[
        { name: "Оксана Петренко", sub: "Чекін — вага 63.2 кг", badge: "2 хв", v: "green" },
        { name: "Дмитро Коваль",   sub: "Оплата PREMIUM",        badge: "на перевірці", v: "amber" },
        { name: "Марина Федоренко",sub: "Trial закінчується",     badge: "сьогодні", v: "red" },
        { name: "Іван Мороз",      sub: "Новий клієнт — START",   badge: "15 хв", v: "green" },
      ].map(a => (
        <div key={a.name} style={{ background: T.sc, borderRadius: 8, border: `1px solid ${T.bc}`, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: a.v === "green" ? T.ab : a.v === "amber" ? T.amber : T.red }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: T.tm, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
            <div style={{ fontSize: 9, color: T.tmu }}>{a.sub}</div>
          </div>
          <Badge variant={a.v}>{a.badge}</Badge>
        </div>
      ))}
    </Screen>
  );
};

// ─── ADMIN: CLIENTS ──────────────────────────────────────────
const AdminClients = ({ onSelect }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filters = [{ v: "all", l: "Всі" }, { v: "active", l: "Активні" }, { v: "trial", l: "Trial" }, { v: "pending", l: "Очікують" }];
  const filtered = CLIENTS_DATA.filter(c => {
    const matchF = filter === "all" || c.status === filter;
    const matchS = c.name.toLowerCase().includes(search.toLowerCase()) || c.username.includes(search.toLowerCase());
    return matchF && matchS;
  });
  return (
    <Screen>
      <div style={{ background: T.sc, border: `1px solid ${T.bc}`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="search" size={14} color={T.tmd} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук клієнта..." style={{ background: "none", color: T.tm, fontSize: 12, flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
        {filters.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{ padding: "5px 12px", borderRadius: 12, border: `1px solid ${filter === f.v ? T.ab : T.bc}`, background: filter === f.v ? "rgba(107,143,78,.15)" : T.sc, color: filter === f.v ? T.ab : T.tmu, fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}>
            {f.l}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.tmu }}>
        <span>Знайдено: {filtered.length}</span>
        <span>Всього: {CLIENTS_DATA.length}</span>
      </div>
      {filtered.map(c => (
        <button key={c.id} onClick={() => onSelect(c)} style={{ background: T.sc, borderRadius: 10, border: `1px solid ${T.bc}`, padding: "8px 10px", display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}>
          <Avatar name={c.name} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.tm, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ fontSize: 9, color: T.tmu, marginTop: 1 }}>{c.username} · {c.lastActive}</div>
          </div>
          <Badge variant={planVariant[c.plan]}>{planLabel[c.plan]}</Badge>
          <Icon name="arrow" size={14} color={T.tmd} />
        </button>
      ))}
    </Screen>
  );
};

// ─── ADMIN: CLIENT DETAIL ────────────────────────────────────
const AdminClientDetail = ({ client, onBack }) => {
  const [msg, setMsg] = useState(null);
  const actions = [
    { label: "Призначити план", color: T.a, textColor: T.tm, pulse: true },
    { label: "Переглянути план", color: T.sc, textColor: T.tmu, border: T.bc },
    { label: "Додати відео", color: T.amberbg, textColor: T.amber, border: "rgba(212,168,67,.3)" },
    { label: "Чекіни клієнта", color: T.sc, textColor: T.tmu, border: T.bc },
    { label: "Анкета", color: T.sc, textColor: T.tmu, border: T.bc },
    { label: "Заблокувати", color: T.redbg, textColor: T.red, border: T.redbr },
  ];
  return (
    <Screen>
      <div style={{ background: T.sc, borderRadius: 12, border: `1px solid ${T.a}`, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar name={client.name} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.tm }}>{client.name}</div>
          <div style={{ fontSize: 9, color: T.tmu, marginTop: 1 }}>{client.username}</div>
          <div style={{ marginTop: 5, display: "flex", gap: 5 }}>
            <Badge variant={planVariant[client.plan]}>{planLabel[client.plan]}</Badge>
            <Badge variant={client.status === "active" ? "green" : client.status === "pending" ? "amber" : "blue"}>{statusLabel[client.status]}</Badge>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {[["Вік", `${client.age} р.`], ["Стать", client.gender === "female" ? "Жінка" : "Чоловік"], ["Вага / ціль", `${client.weight} → ${client.targetWeight} кг`], ["Обладнання", client.equip], ["Тренувань/тиж", `${client.wpw}×`], ["Стрік", `${client.streak} днів`], ["Чекінів", `${client.checkins}`], ["Остання актив.", client.lastActive]].map(([l, v]) => (
          <div key={l} style={{ background: T.sc, borderRadius: 8, border: `1px solid ${T.bc}`, padding: "6px 9px" }}>
            <div style={{ fontSize: 8, color: T.tmu }}>{l}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: T.tm, marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>

      <Divider />
      <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Дії</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {actions.map(a => (
          <button key={a.label} onClick={() => setMsg(`✓ ${a.label}`)} className={a.pulse ? "pulse-btn" : ""} style={{ background: a.color, color: a.textColor, borderRadius: 9, padding: "9px 10px", fontSize: 11, fontWeight: 500, border: a.border ? `1px solid ${a.border}` : "none", textAlign: "center" }}>
            {a.label}
          </button>
        ))}
      </div>
      {msg && (
        <div style={{ background: "rgba(107,143,78,.1)", border: `1px solid ${T.a}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: T.ab }}>
          {msg}
        </div>
      )}
      <div style={{ background: "rgba(107,143,78,.06)", border: `1px solid ${T.bc}`, borderRadius: 8, padding: "8px 10px" }}>
        <div style={{ fontSize: 9, color: T.tmu, marginBottom: 4, textTransform: "uppercase", letterSpacing: .4 }}>Останній чекін</div>
        <div style={{ fontSize: 11, color: T.tm }}>Вага {client.weight} кг · Енергія 4/5 · Сон 7.5 год</div>
        <div style={{ fontSize: 9, color: T.tmd, marginTop: 3 }}>{client.lastActive}</div>
      </div>
    </Screen>
  );
};

// ─── ADMIN: PAYMENTS ─────────────────────────────────────────
const AdminPayments = () => {
  const [filter, setFilter] = useState("pending");
  const [confirmed, setConfirmed] = useState([]);
  const [rejected, setRejected] = useState([]);
  const pending = [
    { id: 1, name: "Дмитро Коваль",   plan: "PREMIUM", amount: 1699, time: "5 хв тому" },
    { id: 2, name: "Тетяна Бойко",    plan: "START",   amount: 799,  time: "23 хв тому" },
    { id: 3, name: "Олег Тимченко",   plan: "VIP",     amount: 3499, time: "1 год тому" },
    { id: 4, name: "Катерина Лисенко",plan: "PREMIUM", amount: 1699, time: "2 год тому" },
    { id: 5, name: "Роман Яценко",    plan: "START",   amount: 799,  time: "3 год тому" },
  ].filter(p => !confirmed.includes(p.id) && !rejected.includes(p.id));
  return (
    <Screen>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, color: T.tmu }}>На перевірці</div>
        <div className="shimmer" style={{ fontSize: 10, background: "rgba(212,168,67,.15)", color: T.amber, border: "1px solid rgba(212,168,67,.3)", borderRadius: 8, padding: "2px 8px" }}>{pending.length} очікують</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {["pending", "confirmed", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 12, border: `1px solid ${filter === f ? T.ab : T.bc}`, background: filter === f ? "rgba(107,143,78,.15)" : T.sc, color: filter === f ? T.ab : T.tmu, fontSize: 10 }}>
            {{ pending: "На перевірці", confirmed: "Підтверджені", rejected: "Відхилені" }[f]}
          </button>
        ))}
      </div>

      {filter === "pending" && pending.map(p => (
        <div key={p.id} style={{ background: T.sc, borderRadius: 10, border: "1px solid rgba(212,168,67,.3)", overflow: "hidden" }}>
          <div style={{ padding: "9px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.tm }}>{p.name}</div>
                <div style={{ fontSize: 9, color: T.tmu }}>{p.plan} · {p.time}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: T.ab }}>{p.amount} ₴</div>
            </div>
            <div style={{ background: T.sc2, borderRadius: 6, padding: "5px 8px", marginBottom: 7, fontSize: 9, color: T.tmu }}>Скріншот оплати прикріплено</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setConfirmed(c => [...c, p.id])} style={{ flex: 1, background: "rgba(107,143,78,.18)", color: T.ab, border: `1px solid ${T.a}`, borderRadius: 7, padding: "6px 0", fontSize: 11, fontWeight: 500 }}>Підтвердити</button>
              <button onClick={() => setRejected(r => [...r, p.id])} style={{ flex: 1, background: T.redbg, color: T.red, border: `1px solid ${T.redbr}`, borderRadius: 7, padding: "6px 0", fontSize: 11 }}>Відхилити</button>
            </div>
          </div>
        </div>
      ))}
      {filter === "confirmed" && (
        <div style={{ padding: "20px 0", textAlign: "center", color: T.tmu, fontSize: 12 }}>
          Підтверджено: {confirmed.length} оплат
        </div>
      )}
      {filter === "rejected" && (
        <div style={{ padding: "20px 0", textAlign: "center", color: T.tmu, fontSize: 12 }}>
          Відхилено: {rejected.length} оплат
        </div>
      )}
      <Divider />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
        <div style={{ fontSize: 10, color: T.tmu }}>Виручка місяця</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: T.ab }}>47 200 ₴</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {[["START", "18×", T.a], ["PREMIUM", "12×", T.blue], ["VIP", "4×", "#a09ae8"]].map(([l, v, c]) => (
          <div key={l} style={{ background: T.sc, borderRadius: 8, border: `1px solid ${T.bc}`, padding: "6px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: T.tmu }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: c }}>{v}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
};

// ─── ADMIN: BROADCAST ────────────────────────────────────────
const AdminBroadcast = () => {
  const [targets, setTargets] = useState(["all"]);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const audiences = [{ v: "all", l: "Всі", count: 46 }, { v: "start", l: "START", count: 18 }, { v: "premium", l: "PREMIUM", count: 12 }, { v: "vip", l: "VIP", count: 4 }, { v: "trial", l: "Trial", count: 12 }];
  const toggle = v => setTargets(t => t.includes(v) ? t.filter(x => x !== v) : [...t, v]);
  const totalCount = targets.includes("all") ? 46 : audiences.filter(a => targets.includes(a.v)).reduce((s, a) => s + a.count, 0);

  return (
    <Screen>
      {sent ? (
        <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(107,143,78,.2)", border: `2px solid ${T.a}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" size={24} color={T.ab} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.tm }}>Надіслано</div>
          <div style={{ fontSize: 11, color: T.tmu }}>Отримали: {totalCount} клієнтів</div>
          <button onClick={() => { setSent(false); setText(""); }} style={{ marginTop: 8, background: T.sc, color: T.ab, border: `1px solid ${T.a}`, borderRadius: 10, padding: "10px 24px", fontSize: 12 }}>Нова розсилка</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Аудиторія</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {audiences.map(a => (
              <button key={a.v} onClick={() => toggle(a.v)} style={{ background: T.sc, border: `1px solid ${targets.includes(a.v) ? T.a : T.bc}`, borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", gap: 7, textAlign: "left" }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: targets.includes(a.v) ? T.a : "transparent", border: `1px solid ${targets.includes(a.v) ? T.a : T.bc}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {targets.includes(a.v) && <Icon name="check" size={10} color={T.tm} />}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.tm }}>{a.l}</div>
                  <div style={{ fontSize: 9, color: T.tmu }}>{a.count} клієнтів</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Повідомлення</div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Введи текст повідомлення..." rows={4} style={{ background: T.sc, border: `1px solid ${T.bc}`, borderRadius: 8, padding: "10px 12px", color: T.tm, fontSize: 12, resize: "none", lineHeight: 1.5 }} />
          {text && (
            <div style={{ background: "rgba(107,143,78,.06)", border: `1px solid ${T.bc}`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: T.tmu, marginBottom: 5, textTransform: "uppercase", letterSpacing: .4 }}>Попередній перегляд</div>
              <div style={{ fontSize: 11, color: T.tm, lineHeight: 1.6 }}>{text}</div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.tmu }}>
            <span>Отримають: {totalCount} клієнтів</span>
            <span>{text.length} символів</span>
          </div>
          <PrimaryBtn onClick={() => text && setSent(true)} disabled={!text}>Надіслати</PrimaryBtn>
        </>
      )}
    </Screen>
  );
};

// ─── ADMIN: SETTINGS ─────────────────────────────────────────
const AdminSettings = () => {
  const [toggles, setToggles] = useState({ autoplan: true, checkinRemind: true, trialOffer: true, adminNotify: false });
  const toggle = k => setToggles(t => ({ ...t, [k]: !t[k] }));
  return (
    <Screen>
      <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Автоматизація бота</div>
      {[
        { k: "autoplan", l: "Авто-план щопонеділка", s: "Генерація через Claude AI" },
        { k: "checkinRemind", l: "Нагадування про чекін", s: "Ср та Пт о 18:00" },
        { k: "trialOffer", l: "Оффер на день 3", s: "Trial → платний тариф" },
        { k: "adminNotify", l: "Сповіщення адміна", s: "Нові оплати і чекіни" },
      ].map(item => (
        <div key={item.k} style={{ background: T.sc, borderRadius: 9, border: `1px solid ${T.bc}`, padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: T.tm }}>{item.l}</div>
            <div style={{ fontSize: 9, color: T.tmu, marginTop: 2 }}>{item.s}</div>
          </div>
          <Toggle on={toggles[item.k]} onToggle={() => toggle(item.k)} />
        </div>
      ))}
      <Divider />
      <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Тарифи (Monobank)</div>
      {[["START", 799, "green"], ["PREMIUM", 1699, "blue"], ["VIP", 3499, "purple"]].map(([name, price, v]) => (
        <div key={name} style={{ background: T.sc, borderRadius: 9, border: `1px solid ${T.bc}`, padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: T.tm }}>{name}</div>
            <div style={{ fontSize: 9, color: T.tmu, marginTop: 2 }}>Monobank jar · посилання</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge variant={v}>{price} ₴</Badge>
            <Icon name="arrow" size={14} color={T.tmd} />
          </div>
        </div>
      ))}
      <Divider />
      <div style={{ fontSize: 9, color: T.tmu, textTransform: "uppercase", letterSpacing: .5 }}>Медіа</div>
      {[["Відео-привітання", "Головний екран Mini App", "Завантажено"], ["Відео до плану", "Прикріплюється через клієнтів", "Не налаштовано"]].map(([l, s, status]) => (
        <div key={l} style={{ background: T.sc, borderRadius: 9, border: `1px solid ${T.bc}`, padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: T.tm }}>{l}</div>
            <div style={{ fontSize: 9, color: T.tmu, marginTop: 2 }}>{s}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: status === "Завантажено" ? T.ab : T.tmu }}>{status}</span>
            <Icon name="arrow" size={14} color={T.tmd} />
          </div>
        </div>
      ))}
      <Divider />
      <div style={{ background: T.redbg, borderRadius: 9, border: `1px solid ${T.redbr}`, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="lock" size={16} color={T.red} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.red }}>Вийти з адмін-панелі</div>
          <div style={{ fontSize: 9, color: "rgba(232,124,114,.6)" }}>Повернутись до клієнтського режиму</div>
        </div>
        <Icon name="arrow" size={14} color={T.red} />
      </div>
    </Screen>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function FitCoreApp() {
  const [appState, setAppState] = useState("welcome");
  const [clientTab, setClientTab] = useState("plan");
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const isAdmin = appState === "admin";

  const renderContent = () => {
    if (appState === "welcome") return <WelcomeScreen onStart={() => setAppState("onboarding")} onLogin={() => setAppState("client")} />;
    if (appState === "onboarding") return <OnboardingScreen onComplete={() => setAppState("planselect")} />;
    if (appState === "planselect") return <PlanSelectScreen onSelect={p => { setSelectedPlan(p); setAppState("payment"); }} />;
    if (appState === "payment") return <PaymentScreen planKey={selectedPlan} onBack={() => setAppState("planselect")} onPaid={() => setAppState("client")} />;

    if (appState === "client") {
      if (clientTab === "plan")      return <TrainingPlanScreen />;
      if (clientTab === "nutrition") return <NutritionScreen />;
      if (clientTab === "progress")  return <ProgressScreen />;
      if (clientTab === "profile")   return <ProfileScreen onAdminAccess={() => setAppState("admin")} />;
    }

    if (appState === "admin") {
      if (selectedClient) return <AdminClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />;
      if (adminTab === "dashboard") return <AdminDashboard />;
      if (adminTab === "clients")   return <AdminClients onSelect={c => setSelectedClient(c)} />;
      if (adminTab === "payments")  return <AdminPayments />;
      if (adminTab === "broadcast") return <AdminBroadcast />;
      if (adminTab === "settings")  return <AdminSettings />;
    }
  };

  const showTopNav = !["welcome", "onboarding", "planselect", "payment"].includes(appState);
  const showBottomNav = appState === "client" || appState === "admin";

  const getTopNavTitle = () => {
    if (isAdmin) {
      if (selectedClient) return null;
      return { dashboard: "Дашборд", clients: "Клієнти", payments: "Оплати", broadcast: "Розсилка", settings: "Налаштування" }[adminTab];
    }
    return { plan: "Мій план", nutrition: "Харчування", progress: "Прогрес", profile: "Профіль" }[clientTab];
  };

  return (
    <>
      <GlobalStyle />
      <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: T.sbg, display: "flex", flexDirection: "column", position: "relative" }}>


        {/* TOP NAV */}
        {showTopNav && !["welcome","onboarding","planselect","payment"].includes(appState) && (
          <TopNav
            title={getTopNavTitle()}
            subtitle={isAdmin && !selectedClient ? `${CLIENTS_DATA.length} клієнтів` : undefined}
            onBack={selectedClient ? () => setSelectedClient(null) : isAdmin ? () => setAppState("client") : undefined}
            rightEl={isAdmin && adminTab === "payments" && (
              <div className="shimmer" style={{ fontSize: 9, background: "rgba(212,168,67,.15)", color: T.amber, border: "1px solid rgba(212,168,67,.3)", borderRadius: 8, padding: "2px 8px" }}>5 оплат</div>
            )}
          />
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {renderContent()}
        </div>

        {/* BOTTOM NAV */}
        {showBottomNav && (
          <BottomNav
            active={isAdmin ? adminTab : clientTab}
            onChange={id => { if (isAdmin) { setAdminTab(id); setSelectedClient(null); } else setClientTab(id); }}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </>
  );
}
