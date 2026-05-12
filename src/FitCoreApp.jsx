import { useState, useEffect, useCallback, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";
const tg = window.Telegram?.WebApp;
const getInitData = () => tg?.initData || "";
const getTgUser = () => tg?.initDataUnsafe?.user || null;

async function api(path, options = {}) {
  const uid = getTgUser()?.id;
  const headers = { "Content-Type": "application/json", "X-Telegram-Init-Data": getInitData() };
  if (!getInitData() && uid) headers["X-Dev-User-Id"] = String(uid);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers||{}) }, body: options.body ? JSON.stringify(options.body) : undefined });
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try { const b = await res.json(); if (b?.error) msg = b.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}
const apiGet  = p => api(p);
const apiPost = (p,b) => api(p, { method:"POST", body:b });

const PHOTOS = {
  trainer_welcome: "/photo2.jpg",
  trainer_profile: "/photo1.jpg",
  trainer_plan:    "/photo_2026-05-12 10.59.04.jpeg",
};

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS — єдина мова дизайну для всього додатку
// ═══════════════════════════════════════════════════════════════
const C = {
  // Кольори фону (від темнішого до світлішого)
  bg:"#0a0a0a", s1:"#111111", s2:"#161616", s3:"#1c1c1c",
  // Акцент
  acc:"#c8f53a", acc2:"#a8d420", accDim:"rgba(200,245,58,0.12)",
  // Текст
  tm:"#ffffff", ts:"#888888", td:"#444444", tt:"#666666",
  // Межі
  bc:"#222222", bcStrong:"#2a2a2a",
  // Семантика
  red:"#ff5555", amber:"#e8a832", blue:"#4a9fdf", green:"#4ade80", purple:"#a855f7",
  // Градієнти
  gradAcc:"linear-gradient(135deg,#c8f53a 0%,#a8d420 100%)",
  gradAccSubtle:"linear-gradient(135deg,rgba(200,245,58,0.18) 0%,rgba(200,245,58,0.04) 100%)",
  gradDark:"linear-gradient(180deg,#161616 0%,#0e0e0e 100%)",
};

// Простір — кратний 4
const SP = {1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48};

// Радіуси (кутки)
const R = {sm:8, md:12, lg:16, xl:20, full:9999};

// Розмір шрифтів і висота рядка
const F = {
  hero:    {size:34, height:1.05, weight:900, ls:-1.4},
  h1:      {size:26, height:1.15, weight:900, ls:-0.8},
  h2:      {size:20, height:1.2,  weight:800, ls:-0.4},
  h3:      {size:17, height:1.3,  weight:800, ls:-0.2},
  body:    {size:14, height:1.55, weight:500, ls:0},
  bodyLg:  {size:15, height:1.55, weight:500, ls:0},
  caption: {size:12, height:1.4,  weight:600, ls:0},
  meta:    {size:11, height:1.3,  weight:700, ls:0.6},  // для CAPS-міток
};

// Тіні (елевація)
const SH = {
  sm: "0 2px 8px rgba(0,0,0,0.3)",
  md: "0 4px 16px rgba(0,0,0,0.4)",
  lg: "0 8px 28px rgba(0,0,0,0.5)",
  xl: "0 16px 48px rgba(0,0,0,0.6)",
  glow: "0 0 24px rgba(200,245,58,0.25)",
  inner: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

// Тривалості анімацій
const T = {fast:"150ms", base:"220ms", slow:"320ms"};

// Easing (cubic-bezier)
const E = {
  out:    "cubic-bezier(0.16, 1, 0.3, 1)",     // плавний spring
  inOut:  "cubic-bezier(0.65, 0, 0.35, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{
      background:${C.bg};color:${C.tm};
      font-family:'Inter','-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif;
      min-height:100vh;
      font-feature-settings:'cv02','cv03','cv04','cv11';
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
    }
    button{cursor:pointer;border:none;outline:none;font-family:inherit;}
    button:active:not(:disabled){transform:scale(0.97);transition:transform 100ms ${E.out};}
    input,textarea,select{font-family:inherit;outline:none;}
    ::-webkit-scrollbar{width:0;height:0;}

    /* — keyframes — */
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes shimmer{0%{background-position:-1000px 0;}100%{background-position:1000px 0;}}
    @keyframes accentPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,245,58,0);}50%{box-shadow:0 0 0 8px rgba(200,245,58,0.15);}}
    @keyframes blinkBorder{0%,100%{border-color:${C.acc};}50%{border-color:#e8ff80;}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);}}
    @keyframes drawPath{from{stroke-dashoffset:1000;}to{stroke-dashoffset:0;}}
    @keyframes pulseDot{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1.2);}}
    @keyframes slideInRight{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
    @keyframes letterReveal{from{opacity:0;filter:blur(8px);transform:translateY(6px);}to{opacity:1;filter:blur(0);transform:translateY(0);}}
    @keyframes titlePulse{0%{transform:scale(1);}50%{transform:scale(1.04);}100%{transform:scale(1);}}
    @keyframes lineGrow{from{transform:scaleX(0);}to{transform:scaleX(1);}}

    /* — LIVING APP animations — */
    @keyframes meshShift{
      0%,100%{background-position:0% 0%, 100% 100%, 50% 50%;}
      33%{background-position:30% 20%, 70% 80%, 80% 30%;}
      66%{background-position:60% 60%, 30% 30%, 20% 80%;}
    }
    @keyframes glowBreathe{
      0%,100%{box-shadow:0 0 20px rgba(200,245,58,0.18), 0 0 40px rgba(200,245,58,0.08);}
      50%{box-shadow:0 0 35px rgba(200,245,58,0.35), 0 0 70px rgba(200,245,58,0.18);}
    }
    @keyframes floatUp{
      from{transform:translateY(110vh) scale(0.5);opacity:0;}
      10%{opacity:0.6;}
      90%{opacity:0.6;}
      to{transform:translateY(-10vh) scale(1.2);opacity:0;}
    }
    @keyframes parallaxZoom{
      0%,100%{transform:scale(1) translateY(0);}
      50%{transform:scale(1.04) translateY(-8px);}
    }

    /* — CINEMATIC onboarding transitions — */
    @keyframes slideInFromRight{
      from{opacity:0;transform:translateX(40px);filter:blur(8px);}
      to{opacity:1;transform:translateX(0);filter:blur(0);}
    }
    @keyframes slideInFromLeft{
      from{opacity:0;transform:translateX(-40px);filter:blur(8px);}
      to{opacity:1;transform:translateX(0);filter:blur(0);}
    }
    @keyframes confettiFall{
      0%{transform:translate3d(var(--tx,0),0,0) rotate(0deg);opacity:1;}
      100%{transform:translate3d(calc(var(--tx,0) + var(--dx,40px)),100vh,0) rotate(var(--rot,720deg));opacity:0;}
    }
    @keyframes screenFlash{
      0%{opacity:0;}
      30%{opacity:1;}
      100%{opacity:0;}
    }
    @keyframes heroPop{
      0%{opacity:0;transform:scale(0.4) translateY(40px);}
      40%{opacity:1;transform:scale(1.15) translateY(-10px);}
      70%{transform:scale(0.95) translateY(0);}
      100%{transform:scale(1);}
    }
    @keyframes ringPulse{
      0%{transform:scale(0.8);opacity:1;}
      100%{transform:scale(2.5);opacity:0;}
    }
    @keyframes cinematicReveal{
      0%{opacity:0;transform:translateY(20px) scale(0.95);filter:blur(12px);}
      to{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}
    }

    /* — WELCOME SCREEN entrance — Power Impact — */
    @keyframes wlLogoZ{
      0%{opacity:0;transform:rotateX(50deg) translateZ(-600px) scale(0.12);}
      62%{opacity:1;transform:rotateX(-4deg) translateZ(18px) scale(1.04);}
      80%{transform:rotateX(2deg) translateZ(-4px) scale(0.99);}
      100%{opacity:1;transform:rotateX(0deg) translateZ(0px) scale(1);}
    }
    @keyframes wlFlashPower{
      0%{opacity:0;}
      22%{opacity:0.55;}
      55%{opacity:0.1;}
      100%{opacity:0;}
    }
    @keyframes wlEdgeGlow{
      0%{opacity:0;transform:scale(0.88);}
      30%{opacity:1;}
      100%{opacity:0;transform:scale(1.45);}
    }
    @keyframes wlIconFlip{
      0%{opacity:0;transform:rotateX(-90deg) scale(0.8);}
      62%{opacity:1;transform:rotateX(8deg) scale(1.06);}
      80%{transform:rotateX(-3deg) scale(0.98);}
      100%{opacity:1;transform:rotateX(0deg) scale(1);}
    }
    @keyframes wlCardPower{
      0%{opacity:0;transform:rotateY(-22deg) translateX(55px);}
      62%{opacity:1;transform:rotateY(3deg) translateX(-4px);}
      80%{transform:rotateY(-1deg) translateX(2px);}
      100%{opacity:1;transform:rotateY(0deg) translateX(0px);}
    }
    @keyframes wlLineSlam{
      0%{transform:scaleX(0);}
      88%{transform:scaleX(1.06);}
      100%{transform:scaleX(1);}
    }
    @keyframes wlCTADrop{
      0%{opacity:0;transform:rotateX(70deg) translateY(-28px) scale(0.9);}
      58%{opacity:1;transform:rotateX(-5deg) translateY(4px) scale(1.02);}
      78%{transform:rotateX(2deg) translateY(-1px) scale(0.99);}
      100%{opacity:1;transform:rotateX(0deg) translateY(0px) scale(1);}
    }
    @keyframes wlStamp{
      0%{opacity:0;transform:translateY(-70px) scale(1.25);}
      60%{opacity:1;transform:translateY(5px) scale(0.97);}
      78%{transform:translateY(-2px) scale(1.01);}
      100%{opacity:1;transform:translateY(0) scale(1);}
    }
    @keyframes wlDustTL{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(-22px,-18px) scale(0);}}
    @keyframes wlDustTR{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(22px,-18px) scale(0);}}
    @keyframes wlDustBL{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(-16px,15px) scale(0);}}
    @keyframes wlDustBR{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(16px,15px) scale(0);}}
    @keyframes wlInkSmear{
      0%{transform:scaleX(0);opacity:1;}
      80%{transform:scaleX(1.06);}
      100%{transform:scaleX(1);opacity:1;}
    }

    /* — utility classes — */
    .glow{animation:glowBreathe 4s ease-in-out infinite;}
    .parallax{animation:parallaxZoom 15s ease-in-out infinite;}
    .slR{animation:slideInFromRight 350ms ${E.out} forwards;}
    .slL{animation:slideInFromLeft 350ms ${E.out} forwards;}
    .cnm{animation:cinematicReveal 500ms ${E.out} forwards;}

    /* — utility classes — */
    .fi{animation:fadeIn ${T.base} ${E.out} forwards;}
    .fu{animation:fadeUp ${T.slow} ${E.out} forwards;}
    .si{animation:scaleIn ${T.base} ${E.out} forwards;}
    .pu{animation:accentPulse 2.5s ease-in-out infinite;}
    .sp{animation:spin 1s linear infinite;}
    .bl{animation:blinkBorder 2s ease-in-out infinite;}

    /* stagger for lists — items animate one after another */
    .stg > *{animation:fadeUp ${T.slow} ${E.out} backwards;}
    .stg > *:nth-child(1){animation-delay:0ms;}
    .stg > *:nth-child(2){animation-delay:50ms;}
    .stg > *:nth-child(3){animation-delay:100ms;}
    .stg > *:nth-child(4){animation-delay:150ms;}
    .stg > *:nth-child(5){animation-delay:200ms;}
    .stg > *:nth-child(6){animation-delay:250ms;}
    .stg > *:nth-child(7){animation-delay:300ms;}
    .stg > *:nth-child(8){animation-delay:350ms;}
    .stg > *:nth-child(n+9){animation-delay:400ms;}

    /* skeleton shimmer for loading states */
    .sk{
      background:linear-gradient(90deg,${C.s2} 0%,${C.s3} 50%,${C.s2} 100%);
      background-size:1000px 100%;
      animation:shimmer 1.6s ease-in-out infinite;
      border-radius:${R.md}px;
    }

    /* number counter animation — used inline */
    .num{font-variant-numeric:tabular-nums;font-feature-settings:'tnum';}
  `}</style>
);

// ═══════════════════════════════════════════════════════════════
// HAPTICS — тактильний відгук через Telegram WebApp
// ═══════════════════════════════════════════════════════════════
const haptic = (kind="light") => {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg?.HapticFeedback) return;
    if (kind === "success" || kind === "warning" || kind === "error") {
      tg.HapticFeedback.notificationOccurred(kind);
    } else if (kind === "selection") {
      tg.HapticFeedback.selectionChanged();
    } else {
      tg.HapticFeedback.impactOccurred(kind); // light, medium, heavy, rigid, soft
    }
  } catch {}
};

// ═══════════════════════════════════════════════════════════════
// ANIMATED NUMBER — плавно прокручує цифру при зміні значення
// ═══════════════════════════════════════════════════════════════
const AnimatedNum = ({value, decimals=0, duration=600, suffix=""}) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const start = prevRef.current;
    const end = Number(value) || 0;
    if (start === end) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
      else { setDisplay(end); prevRef.current = end; }
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span className="num">{Number(display).toFixed(decimals)}{suffix}</span>;
};

// ═══════════════════════════════════════════════════════════════
// BUTTON — універсальна кнопка з усіма варіантами
// variant: primary | secondary | ghost | danger | success
// size: sm (40px) | md (48px) | lg (56px)
// ═══════════════════════════════════════════════════════════════
const Btn = ({children, variant="primary", size="md", disabled, loading, fullWidth=true, onClick, leftIcon, rightIcon, hapticKind="light", style={}, ...rest}) => {
  const sizes = {
    sm: {h:40, px:14, fs:13, gap:6, radius:R.md},
    md: {h:48, px:18, fs:14, gap:8, radius:R.md},
    lg: {h:56, px:22, fs:15, gap:10, radius:R.lg},
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: {
      background: C.gradAcc, color: "#0a0a0a", border: "none",
      boxShadow: SH.glow, hoverBg: C.gradAcc,
    },
    secondary: {
      background: C.s2, color: C.tm, border: `1px solid ${C.bc}`,
      boxShadow: SH.inner,
    },
    ghost: {
      background: "transparent", color: C.tm, border: `1px solid ${C.bc}`,
      boxShadow: "none",
    },
    danger: {
      background: "rgba(255,85,85,0.1)", color: C.red,
      border: "1px solid rgba(255,85,85,0.25)", boxShadow: "none",
    },
    success: {
      background: "rgba(74,222,128,0.1)", color: C.green,
      border: "1px solid rgba(74,222,128,0.25)", boxShadow: "none",
    },
  };
  const v = variants[variant] || variants.primary;

  const handleClick = (e) => {
    if (disabled || loading) return;
    haptic(hapticKind);
    onClick && onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? "100%" : "auto",
        height: s.h,
        padding: `0 ${s.px}px`,
        fontSize: s.fs,
        fontWeight: 800,
        letterSpacing: -0.2,
        borderRadius: s.radius,
        background: v.background,
        color: v.color,
        border: v.border,
        boxShadow: v.boxShadow,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        opacity: disabled ? 0.45 : 1,
        cursor: (disabled || loading) ? "default" : "pointer",
        transition: `transform 100ms ${E.out}, box-shadow ${T.base} ${E.out}`,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <div className="sp" style={{width:16, height:16, borderRadius:"50%", border:`2px solid ${variant==="primary"?"rgba(0,0,0,0.25)":"rgba(255,255,255,0.18)"}`, borderTopColor: variant==="primary" ? "#0a0a0a" : C.acc}}/>
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// CARD — стандартизована картка
// elevated: bg s1+border  |  flat: bg s1 без бордера  |  outline: тільки border
// ═══════════════════════════════════════════════════════════════
const Card = ({children, variant="elevated", padding=16, onClick, glow, style={}, ...rest}) => {
  const variants = {
    elevated: {background: C.s1, border: `1px solid ${C.bc}`, boxShadow: SH.inner},
    flat: {background: C.s1, border: "none", boxShadow: "none"},
    outline: {background: "transparent", border: `1px solid ${C.bc}`, boxShadow: "none"},
    accent: {background: C.gradAccSubtle, border: `1px solid rgba(200,245,58,0.25)`, boxShadow: glow ? SH.glow : SH.inner},
  };
  const v = variants[variant] || variants.elevated;
  return (
    <div
      onClick={onClick}
      style={{
        background: v.background,
        border: v.border,
        boxShadow: v.boxShadow,
        borderRadius: R.lg,
        padding: typeof padding === "number" ? `${padding}px` : padding,
        cursor: onClick ? "pointer" : "default",
        transition: `transform ${T.fast} ${E.out}, border-color ${T.base} ${E.out}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SECTION TITLE — капс-мітки секцій ("СЬОГОДНІ · ПОНЕДІЛОК")
// ═══════════════════════════════════════════════════════════════
const SectionLabel = ({children, accent, style={}}) => (
  <div style={{
    fontSize: F.meta.size,
    fontWeight: F.meta.weight,
    letterSpacing: F.meta.ls,
    textTransform: "uppercase",
    color: accent ? C.acc : C.ts,
    marginBottom: SP[3],
    ...style,
  }}>{children}</div>
);

// ═══════════════════════════════════════════════════════════════
// HEADING — експресивні заголовки з letter-spacing
// ═══════════════════════════════════════════════════════════════
const H = ({children, level=1, style={}}) => {
  const f = level === 0 ? F.hero : level === 1 ? F.h1 : level === 2 ? F.h2 : F.h3;
  return (
    <div style={{
      fontSize: f.size,
      fontWeight: f.weight,
      lineHeight: f.height,
      letterSpacing: `${f.ls}px`,
      color: C.tm,
      ...style,
    }}>{children}</div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAT BOX — велика метрика з підписом
// ═══════════════════════════════════════════════════════════════
const Stat = ({value, label, unit, accent, decimals=0, animated=true, sub, style={}}) => (
  <div style={{display:"flex", flexDirection:"column", gap:2, ...style}}>
    <div style={{
      fontSize: 28, fontWeight: 900, letterSpacing: -1,
      color: accent ? C.acc : C.tm,
      lineHeight: 1.1,
      display: "flex", alignItems: "baseline", gap: 4,
    }}>
      {animated ? <AnimatedNum value={value} decimals={decimals}/> : <span className="num">{Number(value).toFixed(decimals)}</span>}
      {unit && <span style={{fontSize:14, fontWeight:700, color:C.ts}}>{unit}</span>}
    </div>
    {label && <div style={{fontSize:11, fontWeight:700, color:C.ts, textTransform:"uppercase", letterSpacing:0.6}}>{label}</div>}
    {sub && <div style={{fontSize:12, color:C.td, marginTop:2}}>{sub}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SKELETON — placeholder поки контент завантажується
// ═══════════════════════════════════════════════════════════════
const Skel = ({w="100%", h=16, r=R.sm, style={}}) => (
  <div className="sk" style={{width:w, height:h, borderRadius:r, ...style}}/>
);

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE — порожній екран з характером
// ═══════════════════════════════════════════════════════════════
const Empty = ({icon, title, subtitle, action, style={}}) => (
  <div style={{
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    padding:"40px 24px", textAlign:"center", gap: SP[3],
    ...style
  }}>
    {icon && (
      <div style={{
        width:72, height:72, borderRadius:R.full,
        background: C.gradAccSubtle,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:32,
      }}>{icon}</div>
    )}
    {title && <div style={{fontSize:F.h3.size, fontWeight:800, color:C.tm, letterSpacing:-0.2}}>{title}</div>}
    {subtitle && <div style={{fontSize:F.body.size, color:C.ts, lineHeight:1.55, maxWidth:300}}>{subtitle}</div>}
    {action && <div style={{marginTop:SP[2], width:"100%", maxWidth:280}}>{action}</div>}
  </div>
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
  <div className="fi" style={{flex:1,overflowY:"auto",padding:"12px 16px 110px",display:"flex",flexDirection:"column",gap:10,...style}}>{children}</div>
);

const TNav = ({title,onBack,rightEl}) => (
  <div style={{
    display:"flex",alignItems:"center",justifyContent:"space-between",
    padding:"16px 18px 14px",
    borderBottom:`1px solid ${C.bc}`,flexShrink:0,
    background:"rgba(10,10,10,0.6)",
    backdropFilter:"blur(20px) saturate(140%)",
    WebkitBackdropFilter:"blur(20px) saturate(140%)",
    position:"relative",zIndex:5,
  }}>
    <div style={{width:64}}>
      {onBack&&<button onClick={()=>{haptic("light");onBack();}}
        style={{background:"transparent",display:"flex",alignItems:"center",gap:4,color:C.acc,fontSize:14,fontWeight:700,padding:0,cursor:"pointer",letterSpacing:-0.1}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L5 9l6 5" stroke={C.acc} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Назад
      </button>}
    </div>
    <div style={{fontSize:F.h3.size,fontWeight:F.h3.weight,color:C.tm,letterSpacing:`${F.h3.ls}px`}}>{title}</div>
    <div style={{width:64,display:"flex",justifyContent:"flex-end"}}>{rightEl}</div>
  </div>
);

const BNav = ({active,onChange,isAdmin}) => {
  const tabs = isAdmin
    ? [{id:"dashboard",l:"Огляд"},{id:"clients",l:"Клієнти"},{id:"chat",l:"Чат"},{id:"payments",l:"Оплати"},{id:"settings",l:"Налашт."}]
    : [{id:"plan",l:"План"},{id:"nutrition",l:"Харч."},{id:"aichat",l:"Матіас"},{id:"ranking",l:"Топ"},{id:"more",l:"Ще"},{id:"profile",l:"Профіль"}];
  const icons = {
    aichat: c=><><circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.8" fill="none"/><circle cx="6.5" cy="8.5" r="1" fill={c}/><circle cx="11.5" cy="8.5" r="1" fill={c}/><path d="M6 11.5c.8 1 1.9 1.5 3 1.5s2.2-.5 3-1.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
    more: c=><><circle cx="4" cy="9" r="1.5" fill={c}/><circle cx="9" cy="9" r="1.5" fill={c}/><circle cx="14" cy="9" r="1.5" fill={c}/></>,
    chat: c=><path d="M2 5a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3v-3H4a2 2 0 01-2-2V5z" stroke={c} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>,
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
    ranking: c=><><path d="M3 16h2v-5H3v5zm5 0h2V8H8v8zm5 0h2v-3h-2v3zM2 4l3 2 4-4 4 4 3-2v3H2V4z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill="none"/></>,
  };
  return (
    <div style={{
      display:"flex",borderTop:`1px solid ${C.bc}`,
      background:"rgba(10,10,10,0.6)",
      backdropFilter:"blur(22px) saturate(140%)",WebkitBackdropFilter:"blur(22px) saturate(140%)",
      paddingBottom:"env(safe-area-inset-bottom,0px)",
      position:"fixed",bottom:0,left:0,right:0,zIndex:100,
    }}>
      {tabs.map(t=>{
        const isAct=active===t.id;
        const color=isAct?C.acc:C.ts;
        return (
          <button key={t.id} onClick={()=>{haptic("light");onChange(t.id);}}
            style={{
              flex:1,background:"none",display:"flex",flexDirection:"column",
              alignItems:"center",gap:3,padding:"10px 0 12px",
              transition:`color ${T.fast} ${E.out}`,
            }}>
            <div style={{
              width:isAct?22:4,height:3,borderRadius:R.full,
              background:isAct?C.gradAcc:"transparent",
              marginBottom:4,
              transition:`all ${T.base} ${E.out}`,
              boxShadow:isAct?"0 0 8px rgba(200,245,58,0.5)":"none",
            }}/>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none" style={{transition:`transform ${T.base} ${E.out}`,transform:isAct?"scale(1.1)":"scale(1)"}}>{icons[t.id]?icons[t.id](color):null}</svg>
            <span style={{fontSize:9,fontWeight:isAct?800:600,color,letterSpacing:0.1,transition:`all ${T.fast} ${E.out}`}}>{t.l}</span>
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
    name:"START", price:123, stars:250,
    desc:"Базовий старт для новачків",
    features:["Шаблонний тренувальний план","Базовий план харчування (КБЖУ)","Трекінг ваги і прогресу","Чекіни без фідбеку"],
    no:["AI персоналізація","Фідбек тренера","БАДи"]
  },
  premium:{
    name:"PREMIUM", price:164, stars:310, hot:true,
    desc:"Персональний підхід від ШІ-тренера",
    features:["Персональний план від Claude AI","Щотижневе оновлення плану","Чекіни 2× на тиждень з AI фідбеком","Індивідуальне харчування з грамами","Відповіді тренера на питання"],
    no:["Прямий зв'язок з тренером","Пропись БАДів"]
  },
  vip:{
    name:"VIP", price:287, stars:540,
    desc:"Максимальний результат з особистим супроводом",
    features:["Все що в PREMIUM","Прямий зв'язок з тренером особисто","Пропись БАДів під твої цілі","Корекція плану в будь-який момент","Пріоритетна відповідь 24/7"],
    no:[]
  },
};
const TRAINER_LINK = "https://t.me/matmatias";
// ═══ MENU — тарифи + тривалість в одному місці ═══
const MenuScreen = ({plans,payLinks,onSelectPlan,clientPlan,onShowReviews}) => {
  const [stats,setStats] = useState(null);
  useEffect(()=>{
    apiGet("/api/social-stats").then(r=>setStats(r)).catch(()=>{});
  },[]);

  const p = plans || PLANS_STATIC;
  const [months,setMonths] = useState(1);

  return (
    <Scr>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <SectionLabel accent>Підписка FitCore</SectionLabel>
        <H level={1}>Тарифи</H>
        <div style={{fontSize:F.body.size,color:C.ts}}>3 дні безкоштовно · оплата після пробного</div>
      </div>

      {/* Duration switcher — преміум вигляд */}
      <Card variant="elevated" padding={16}>
        <SectionLabel>Тривалість підписки</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {[1,3,6,12].map(m=>{
            const on=months===m;
            const disc=DUR_DISC[m];
            return(
              <div key={m} onClick={()=>{haptic("selection");setMonths(m);}}
                style={{
                  borderRadius:R.md,
                  border:`1.5px solid ${on?C.acc:C.bc}`,
                  background:on?C.gradAccSubtle:C.s2,
                  padding:"12px 4px",cursor:"pointer",textAlign:"center",position:"relative",
                  transition:`all ${T.base} ${E.out}`,
                  boxShadow:on?SH.glow:"none",
                }}>
                {disc>0&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:m===12?C.acc:m===6?C.amber:C.blue,color:"#080808",fontSize:9,fontWeight:900,padding:"2px 6px",borderRadius:R.sm,whiteSpace:"nowrap",lineHeight:1.4,letterSpacing:0.3}}>−{disc}%</div>}
                <div style={{fontSize:m===12?10:12,fontWeight:800,color:on?C.acc:C.ts,lineHeight:1.3,letterSpacing:-0.1}}>{m===12?"1 рік":m+"міс"}</div>
              </div>
            );
          })}
        </div>
        {DUR_FUNNEL[months]&&(
          <div className="fi" key={months} style={{marginTop:12,padding:"12px 14px",background:C.gradAccSubtle,border:"1px solid rgba(200,245,58,0.25)",borderRadius:R.md,fontSize:13,color:C.acc,fontWeight:600,lineHeight:1.55}}>
            💡 {DUR_FUNNEL[months]}
          </div>
        )}
      </Card>

      {/* Plan cards */}
      {Object.entries(p).map(([k,plan])=>{
        const price=dCalc(plan.price,months);
        const stars=dStars(plan.stars||250,months);
        const saved=dSaved(plan.price,months);
        const perMo=months>1?Math.round(price/months):null;
        const isMine=clientPlan===k;
        return(
          <Card key={k} variant={plan.hot?"accent":"elevated"} glow={plan.hot} padding={20} className={plan.hot?"pu":undefined} style={{position:"relative",overflow:"hidden",border:plan.hot?`2px solid ${C.acc}`:undefined}}>
            {/* Top-right badges */}
            <div style={{position:"absolute",top:14,right:14,display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
              {plan.hot&&<div style={{fontSize:10,color:"#0a0a0a",background:C.gradAcc,borderRadius:R.full,padding:"4px 12px",fontWeight:900,letterSpacing:0.5,textTransform:"uppercase",boxShadow:SH.sm}}>Популярний</div>}
              {isMine&&<div style={{fontSize:10,color:C.acc,background:"rgba(200,245,58,0.12)",border:`1px solid ${C.acc}`,borderRadius:R.full,padding:"3px 10px",fontWeight:800,letterSpacing:0.4,textTransform:"uppercase"}}>Твій</div>}
              {months>1&&saved>0&&<div style={{fontSize:10,color:"#080808",background:C.amber,borderRadius:R.full,padding:"3px 10px",fontWeight:900,letterSpacing:0.3}}>−{saved.toLocaleString()} ₴</div>}
            </div>

            <H level={2} style={{marginBottom:6}}>{plan.name}</H>

            {/* Price — велика експресивна цифра */}
            <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:perMo?2:8}}>
              <span className="num" style={{fontSize:38,fontWeight:900,color:C.acc,letterSpacing:-1.5,lineHeight:1}}>{price.toLocaleString()}</span>
              <span style={{fontSize:14,color:C.ts,fontWeight:600}}>₴ / {DUR_LABEL[months]}</span>
            </div>
            {perMo&&<div style={{fontSize:13,color:C.ts,marginBottom:6,fontWeight:500}}>≈ <span className="num">{perMo}</span> ₴ на місяць</div>}
            <div style={{fontSize:12,color:C.amber,marginBottom:14,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
              <span>⭐</span>або <span className="num">{stars.toLocaleString()}</span> зірок Telegram
            </div>

            <div style={{fontSize:14,color:C.ts,marginBottom:14,lineHeight:1.55}}>{plan.desc}</div>

            <Div style={{marginBottom:14}}/>

            {/* Features list with stagger animation */}
            <SectionLabel>Включено</SectionLabel>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:(plan.no||[]).length>0?14:0}}>
              {(plan.features||[]).map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:C.tm,fontWeight:500}}>
                  <div style={{width:20,height:20,borderRadius:R.full,background:C.gradAccSubtle,border:`1px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke={C.acc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>

            {(plan.no||[]).length>0&&<>
              <SectionLabel style={{color:C.td}}>Недоступно</SectionLabel>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {(plan.no||[]).map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:C.td}}>
                    <div style={{width:20,height:20,borderRadius:R.full,background:C.s2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke={C.td} strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </>}

            <div style={{marginTop:18}}>
              <Btn variant={plan.hot?"primary":"secondary"} size="lg" onClick={()=>onSelectPlan(k,months)} hapticKind="medium">
                {isMine ? "✓ Поточний план" : "Обрати "+plan.name}
              </Btn>
            </div>
          </Card>
        );
      })}

      {months>1&&(
        <div style={{background:"rgba(200,245,58,.04)",border:"1px solid rgba(200,245,58,.12)",borderRadius:16,padding:"14px 16px"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.acc,marginBottom:8}}>🎯 Чому довгий пакет вигідніший?</div>
          {["Результат у фітнесі — це мінімум 3 місяці послідовної роботи","Зупинитись на місяць = майже повернутись до початку","Довгий пакет = зобов'язання перед собою = вищий результат",`Реальна економія ${DUR_DISC[months]}% — це ${dSaved(1699,months).toLocaleString()} ₴+ в залежності від тарифу`].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,fontSize:13,color:C.ts,marginBottom:5,lineHeight:1.5}}>
              <span style={{color:C.acc,fontWeight:700,flexShrink:0}}>▸</span>{t}
            </div>
          ))}
        </div>
      )}

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

// ─── Duration helpers ───
const DUR_DISC = {1:0,3:15,6:25,12:35};
const DUR_LABEL = {1:"1 місяць",3:"3 місяці",6:"6 місяців",12:"1 рік 🏆"};
const DUR_FUNNEL = {
  1: null,
  3: "73% клієнтів досягають цілі саме за 3 місяці системної роботи",
  6: "⭐ Найпопулярніший вибір — стабільна трансформація за 6 місяців",
  12: "🔥 Максимальний результат · Безперервний прогрес весь рік · Найбільша знижка",
};
const PRICES_UAH_TABLE={123:{1:123,3:314,6:554,12:959},164:{1:164,3:418,6:738,12:1279},287:{1:287,3:731,6:1292,12:2238}};
const PRICES_STARS_TABLE={250:{1:250,3:640,6:1130,12:1950},310:{1:310,3:790,6:1390,12:2400},540:{1:540,3:1370,6:2420,12:4200}};
function dCalc(base,months){return PRICES_UAH_TABLE[base]?.[months]??Math.round(base*months*(1-DUR_DISC[months]/100));}
function dStars(base,months){return PRICES_STARS_TABLE[base]?.[months]??Math.round(base*months*(1-DUR_DISC[months]/100));}
function dSaved(base,months){return Math.round(base*months)-dCalc(base,months);}

const PlanSelect = ({plans,payLinks,onSelect}) => {
  const [months,setMonths]=useState(1);
  const p=plans||PLANS_STATIC;
  return (
    <Scr>
      <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1}}>Обери тариф</div>

      {/* Соц.доказ — реальна статистика */}
      {stats && (stats.active_now>0 || stats.checkins_today>0 || stats.purchases_week>0) && (
        <div style={{background:"linear-gradient(135deg, rgba(200,245,58,.08), rgba(232,168,50,.06))",border:"1px solid rgba(200,245,58,.25)",borderRadius:16,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.acc,fontWeight:800,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Що відбувається в FitCore</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {stats.active_now > 0 && (
              <div>
                <div style={{fontSize:22,fontWeight:900,color:C.tm,letterSpacing:-.5}}>{stats.active_now}</div>
                <div style={{fontSize:11,color:C.ts,marginTop:2,lineHeight:1.3}}>клієнтів зараз<br/>активні</div>
              </div>
            )}
            {stats.checkins_today > 0 && (
              <div>
                <div style={{fontSize:22,fontWeight:900,color:C.tm,letterSpacing:-.5}}>{stats.checkins_today}</div>
                <div style={{fontSize:11,color:C.ts,marginTop:2,lineHeight:1.3}}>чекінів<br/>сьогодні</div>
              </div>
            )}
            {stats.purchases_week > 0 && (
              <div>
                <div style={{fontSize:22,fontWeight:900,color:C.acc,letterSpacing:-.5}}>+{stats.purchases_week}</div>
                <div style={{fontSize:11,color:C.ts,marginTop:2,lineHeight:1.3}}>купили підписку<br/>цього тижня</div>
              </div>
            )}
            {stats.total_kg_lost > 0 && (
              <div>
                <div style={{fontSize:22,fontWeight:900,color:C.acc,letterSpacing:-.5}}>−{stats.total_kg_lost}</div>
                <div style={{fontSize:11,color:C.ts,marginTop:2,lineHeight:1.3}}>кг скинуто<br/>клієнтами разом</div>
              </div>
            )}
          </div>
          {(stats.top_streak>=7 || stats.loyal_clients>0) && (
            <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid rgba(200,245,58,.15)`,display:"flex",justifyContent:"space-around",gap:12,fontSize:12}}>
              {stats.top_streak >= 7 && (
                <div style={{color:C.ts,textAlign:"center"}}>🔥 топ стрік<br/><b style={{color:C.tm,fontSize:14}}>{stats.top_streak} днів</b></div>
              )}
              {stats.loyal_clients > 0 && (
                <div style={{color:C.ts,textAlign:"center"}}>💪 з нами 30+ днів<br/><b style={{color:C.tm,fontSize:14}}>{stats.loyal_clients} {stats.loyal_clients===1?"клієнт":"клієнтів"}</b></div>
              )}
            </div>
          )}
        </div>
      )}
      <div style={{fontSize:14,color:C.ts,marginBottom:2}}>3 дні безкоштовно · оплата після</div>

      {/* Duration switcher */}
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"14px"}}>
        <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Тривалість підписки</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {[1,3,6,12].map(m=>{
            const on=months===m;
            const disc=DUR_DISC[m];
            return(
              <div key={m} onClick={()=>setMonths(m)}
                style={{borderRadius:14,border:`2px solid ${on?C.acc:C.bc}`,background:on?"rgba(200,245,58,.08)":C.s2,padding:"10px 6px",cursor:"pointer",textAlign:"center",position:"relative",transition:"all .15s"}}>
                {disc>0&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:m===12?C.acc:m===6?"#e8a832":"#4a9fdf",color:"#080808",fontSize:8,fontWeight:900,padding:"2px 5px",borderRadius:6,whiteSpace:"nowrap",lineHeight:1.4}}>-{disc}%</div>}
                <div style={{fontSize:m===12?10:12,fontWeight:800,color:on?C.acc:C.ts,lineHeight:1.3}}>{m===12?"1 рік":m+"міс"}</div>
              </div>
            );
          })}
        </div>
        {DUR_FUNNEL[months]&&(
          <div style={{marginTop:10,padding:"10px 12px",background:"rgba(200,245,58,.06)",border:"1px solid rgba(200,245,58,.2)",borderRadius:12,fontSize:13,color:C.acc,fontWeight:600,lineHeight:1.5}}>
            💡 {DUR_FUNNEL[months]}
          </div>
        )}
      </div>

      {/* Plan cards */}
      {Object.entries(p).map(([k,plan])=>{
        const price=dCalc(plan.price,months);
        const stars=dStars(plan.stars||250,months);
        const saved=dSaved(plan.price,months);
        const perMo=months>1?Math.round(price/months):null;
        return(
          <div key={k} className={plan.hot?"bl":""} onClick={()=>onSelect(k,months)}
            style={{background:C.s1,borderRadius:18,border:`1.5px solid ${plan.hot?C.acc:C.bc}`,padding:"16px",cursor:"pointer",position:"relative"}}>
            {plan.hot&&<div style={{position:"absolute",top:14,right:14,fontSize:11,color:"#0a0a0a",background:C.acc,borderRadius:20,padding:"3px 10px",fontWeight:800}}>Популярний</div>}
            {months>1&&saved>0&&<div style={{position:"absolute",top:plan.hot?40:14,right:14,fontSize:10,color:"#080808",background:"#e8a832",borderRadius:20,padding:"2px 8px",fontWeight:800}}>-{saved.toLocaleString()} ₴</div>}
            <div style={{fontSize:19,fontWeight:900,color:C.tm,marginBottom:6}}>{plan.name}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
              <span style={{fontSize:30,fontWeight:900,color:C.acc,letterSpacing:-1}}>{price.toLocaleString()}</span>
              <span style={{fontSize:14,color:C.ts}}>₴ / {DUR_LABEL[months]}</span>
            </div>
            {perMo&&<div style={{fontSize:13,color:C.ts,marginBottom:6}}>= {perMo} ₴/міс</div>}
            <div style={{fontSize:12,color:"#f6c90e",marginBottom:10}}>⭐ або {stars.toLocaleString()} зірок Telegram</div>
            {(plan.features||[]).map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:plan.hot?"#d8f080":C.ts,marginBottom:4}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.acc,flexShrink:0}}/>{f}
              </div>
            ))}
          </div>
        );
      })}

      {months>1&&(
        <div style={{background:"rgba(200,245,58,.04)",border:"1px solid rgba(200,245,58,.12)",borderRadius:16,padding:"14px 16px"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.acc,marginBottom:8}}>🎯 Чому довгий пакет вигідніший?</div>
          {["Результат у фітнесі — це мінімум 3 місяці послідовної роботи","Зупинитись на місяць = повернутись майже до початку","Довгий пакет = зобов'язання перед собою = вищий результат",`Ти реально економиш ${DUR_DISC[months]}% — це ${dSaved(1699,months).toLocaleString()} ₴+ в залежності від тарифу`].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,fontSize:13,color:C.ts,marginBottom:5,lineHeight:1.5}}>
              <span style={{color:C.acc,fontWeight:700,flexShrink:0}}>▸</span>{t}
            </div>
          ))}
        </div>
      )}
    </Scr>
  );
};

// ═══ PAYMENT ═══
const Payment = ({planKey,months=1,plans,payLinks,onBack,onPaid,userId}) => {
  const plan=(plans||PLANS_STATIC)[planKey];
  const link=(payLinks||{})[planKey]||"#";
  const totalPrice=dCalc((plan?.price)||0,months);
  const totalStars=dStars((plan?.stars)||250,months);
  const saved=dSaved((plan?.price)||0,months);
  const disc=DUR_DISC[months]||0;
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [wallet,setWallet]=useState(null);
  const [useCoins,setUseCoins]=useState(false);

  useEffect(()=>{
    if(userId) apiGet(`/api/client/${userId}/wallet`).then(r=>setWallet(r)).catch(()=>{});
  },[userId]);

  const coinsBalance=Math.floor(wallet?.balance_eur||0);
  const coinsDiscount=useCoins?Math.min(coinsBalance,totalPrice):0;
  const finalPrice=totalPrice-coinsDiscount;

  const sendScreenshot=async()=>{
    if(!userId)return;
    setSending(true);
    try{
      await apiPost(`/api/client/${userId}/payment-screenshot`,{plan:planKey,months,coins_applied:coinsDiscount});
      setSent(true);
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

  const perMonth = months > 1 ? Math.round(totalPrice/months) : null;
  const perMonthStars = months > 1 ? Math.round(totalStars/months) : null;

  return (
    <Scr>
      <TNav title="Оплата" onBack={onBack}/>

      {/* Order summary — clear and clean */}
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"18px"}}>
        <div style={{fontSize:11,color:C.ts,textTransform:"uppercase",letterSpacing:.8,marginBottom:14,fontWeight:700}}>Твоє замовлення</div>

        {/* Plan name + tariff */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:C.tm,letterSpacing:-.5}}>{plan?.name}</div>
            <div style={{fontSize:13,color:C.ts,marginTop:2}}>{DUR_LABEL[months]||"1 місяць"} доступу</div>
          </div>
          {disc>0 && (
            <div style={{background:"rgba(200,245,58,.12)",border:"1px solid rgba(200,245,58,.3)",borderRadius:8,padding:"4px 10px"}}>
              <div style={{fontSize:11,color:C.acc,fontWeight:800}}>−{disc}%</div>
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div style={{borderTop:`1px solid ${C.bc}`,paddingTop:12,fontSize:14}}>
          {disc > 0 && (
            <>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",color:C.ts}}>
                <span>Базова ціна</span>
                <span style={{textDecoration:"line-through",opacity:.6}}>{((plan?.price||0)*months).toLocaleString()} ₴</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",color:C.acc}}>
                <span>Знижка {disc}%</span>
                <span style={{fontWeight:700}}>−{saved.toLocaleString()} ₴</span>
              </div>
            </>
          )}
          {perMonth && (
            <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",color:C.ts}}>
              <span>Ціна за місяць</span>
              <span>{perMonth.toLocaleString()} ₴/міс</span>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",color:C.acc}}>
            <span>Пробний доступ</span>
            <span style={{fontWeight:700}}>3 дні безкоштовно</span>
          </div>
          {coinsBalance > 0 && (
            <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",color:useCoins?C.acc:C.ts,alignItems:"center"}}>
              <span>💰 FitCoins ({coinsBalance} FC)</span>
              <span style={{fontWeight:700}}>{useCoins?`−${coinsDiscount.toLocaleString()} ₴`:"не застосовано"}</span>
            </div>
          )}
        </div>

        <div style={{borderTop:`1px solid ${C.bc}`,marginTop:12,paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>До сплати</div>
            <div style={{fontSize:11,color:C.td,marginTop:2}}>або {totalStars.toLocaleString()} ⭐</div>
          </div>
          <div style={{fontSize:32,fontWeight:900,color:C.acc,letterSpacing:-1}}>{finalPrice.toLocaleString()} ₴</div>
        </div>
      </div>

      {/* FitCoins toggle */}
      {coinsBalance > 0 && (
        <div onClick={()=>{haptic("selection");setUseCoins(v=>!v);}} style={{
          background:useCoins?"rgba(200,245,58,0.08)":C.s1,
          border:`1.5px solid ${useCoins?C.acc:C.bc}`,
          borderRadius:R.lg,padding:"14px 16px",
          display:"flex",alignItems:"center",gap:12,cursor:"pointer",
          transition:`border-color ${T.base}`,
        }}>
          <div style={{
            width:44,height:44,borderRadius:R.md,flexShrink:0,
            background:useCoins?C.accDim:"rgba(255,255,255,0.04)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
          }}>💰</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:C.tm}}>
              Застосувати FitCoins
              <span style={{fontSize:11,color:C.acc,background:C.accDim,border:`1px solid rgba(200,245,58,0.3)`,padding:"2px 7px",borderRadius:R.full,fontWeight:800,marginLeft:6}}>{coinsBalance} FC</span>
            </div>
            <div style={{fontSize:12,color:C.ts,marginTop:2}}>
              {useCoins?`Знижка −${coinsDiscount.toLocaleString()} ₴ — до оплати ${finalPrice.toLocaleString()} ₴`:`Знижка ${coinsBalance.toLocaleString()} ₴ на цю підписку`}
            </div>
          </div>
          <Tog value={useCoins} onChange={()=>{}}/>
        </div>
      )}

      {/* Choose method */}
      <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginTop:6}}>Спосіб оплати</div>

      {/* Monobank — primary */}
      <div style={{background:C.s1,borderRadius:18,border:`1.5px solid ${C.acc}`,padding:"16px",position:"relative"}}>
        <div style={{position:"absolute",top:-9,left:14,background:C.acc,color:"#0a0a0a",fontSize:9,fontWeight:900,padding:"3px 8px",borderRadius:6,letterSpacing:.5}}>РЕКОМЕНДУЄМО</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:44,height:44,background:"rgba(200,245,58,.1)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24}}>💳</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.tm}}>Monobank · {finalPrice.toLocaleString()} ₴</div>
            <div style={{fontSize:12,color:C.ts,marginTop:2}}>Оплата через банку MatiasFitness</div>
          </div>
        </div>
        <PBtn onClick={()=>{
          haptic("medium");
          if(!link || link==="#"){
            alert("Оплата через Monobank тимчасово недоступна. Напиши тренеру @fitcore_matias_bot — підкажемо як оплатити.");
            return;
          }
          if(window.Telegram?.WebApp?.openLink){window.Telegram.WebApp.openLink(link);}
          else{window.open(link,"_blank");}
        }}>Оплатити {finalPrice.toLocaleString()} ₴</PBtn>
        <div style={{fontSize:12,color:C.td,marginTop:10,lineHeight:1.5}}>
          Після оплати — натисни кнопку нижче «Я оплатив», тренер активує доступ протягом 1 години.
        </div>
      </div>

      {/* Stars — alternative */}
      <div style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:44,height:44,background:"rgba(246,201,14,.1)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24}}>⭐</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.tm}}>Telegram Stars · {totalStars.toLocaleString()} ⭐</div>
            <div style={{fontSize:12,color:C.ts,marginTop:2}}>≈ {totalPrice.toLocaleString()} ₴ · активація автоматична</div>
          </div>
        </div>
        <button onClick={()=>{
          haptic("medium");
          const tg=window.Telegram?.WebApp;
          // Bot deep-link: pay_<plan>_<months> → бот шле інвойс, після оплати клієнт повертається в Mini App
          const link = `https://t.me/fitcore_matias_bot?start=pay_${planKey}_${months}`;
          if(tg && tg.openTelegramLink){
            tg.openTelegramLink(link);
            // Закриваємо Mini App щоб клієнт побачив інвойс у боті
            setTimeout(()=>{ try{ tg.close(); }catch{} }, 600);
          } else {
            window.location.href = link;
          }
        }} style={{width:"100%",background:"linear-gradient(135deg,#f6c90e,#e4a200)",color:"#0a0a0a",border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:800}}>Оплатити {totalStars.toLocaleString()} ⭐ → у боті</button>
        <div style={{fontSize:12,color:C.td,marginTop:10,lineHeight:1.5}}>
          Доступ активується миттєво після підтвердження Telegram.
        </div>
      </div>

      {/* Already paid */}
      <div style={{background:"rgba(200,245,58,.05)",borderRadius:14,border:"1px dashed rgba(200,245,58,.25)",padding:"14px 16px",textAlign:"center"}}>
        <div style={{fontSize:13,color:C.ts,marginBottom:10,lineHeight:1.5}}>Вже оплатив через Monobank?</div>
        <button onClick={sendScreenshot} disabled={sending} style={{width:"100%",background:"transparent",border:`1px solid ${C.acc}`,borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:700,color:C.acc}}>
          {sending?"Надсилаю...":"✓ Я оплатив — повідомити тренера"}
        </button>
      </div>

      <div style={{fontSize:11,color:C.td,textAlign:"center",lineHeight:1.6,padding:"4px 12px"}}>
        Гарантія повернення: якщо щось не сподобається — пиши тренеру в перші 7 днів.
      </div>
    </Scr>
  );
};

// ═══ EXERCISE TIPS ═══
// Текстові підказки — статичні, завантажуються миттєво
// Зображення — динамічно з wger.de API, тільки по тапу
const EX_TIPS = {
  // ── ГРУДИ ──
  "жим штанги лежачи":         {tip:"Лопатки зведені, спина природній прогин. Штанга до нижньої частини грудей. Лікті 45-75°. Негативна фаза 2 сек.", video:"/exercises/video (19).mp4"},
  "жим штанги вузьким хватом": {tip:"Хват 25-30 см. Лікті вздовж корпусу. Штанга до нижньої частини грудей. Акцент на трицепс.", video:null},
  "жим гантелей лежачи":       {tip:"Гантелі на рівні грудей. На підйомі злегка звужуй. Повний діапазон руху.", video:null},
  "жим гантелей на похилій":   {tip:"Лава 30-45°. Акцент на верхній частині грудей. Лікті не надто широко.", video:"/exercises/video (29).mp4"},
  "жим під кутом":             {tip:"Лава 30-45°. Акцент на верхній частині грудей. Лікті не надто широко.", video:"/exercises/video (29).mp4"},
  "жим в хаммері":             {tip:"Спина притиснута. Лікті трохи нижче плечей. Повний діапазон руху.", video:null},
  "зведення в кросовері":      {tip:"Легкий нахил вперед. Руки злегка зігнуті. Пікове скорочення внизу 1 сек.", video:null},
  "відмикання від підлоги":    {tip:"Тіло — пряма лінія. Лікті 45° від тулуба. Груди торкаються підлоги.", video:"/exercises/video (11).mp4"},
  "віджимання":                {tip:"Тіло — пряма лінія. Лікті 45°. Груди торкаються підлоги.", video:"/exercises/video (11).mp4"},

  // ── СПИНА ──
  "станова тяга":              {tip:"Спина пряма, нейтральний хребет. Штанга над серединою стопи. Ноги штовхають підлогу. Не округляй поперек.", video:"/exercises/video (6).mp4"},
  "підтягування":              {tip:"Хват ширше плечей. Починай з повного розгинання. Тягни лопатки вниз перед рухом. Груди до перекладини.", video:"/exercises/video (7).mp4"},
  "підтягування широким":      {tip:"Хват ширше плечей. Повне розгинання внизу. Груди до перекладини. Акцент на широчайші.", video:"/exercises/video (7).mp4"},
  "горизонтальні підтягування":{tip:"Тіло — пряма лінія. Тягни груди до грифа. Лопатки зводяться.", video:"/exercises/video (23).mp4"},
  "тяга верхнього блоку":      {tip:"Легкий відхил назад. Тягни до верхньої частини грудей. Лікті вниз вздовж тулуба.", video:null},
  "тяга штанги в нахилі":      {tip:"Нахил 45°, спина пряма. Тягни до поясу. Не розгойдуй корпус.", video:"/exercises/video.mp4"},
  "тяга гантелі":              {tip:"Упор рукою і коліном. Спина паралельно підлозі. Лікоть вгору-назад.", video:null},
  "тяга горизонтального блоку":{tip:"Сидячи прямо. Тягни до пупка, лікті вздовж тіла. Не відхиляйся назад.", video:"/exercises/video (28).mp4"},
  "тяга в тренажері сидячи":   {tip:"Сидячи прямо. Тягни до корпусу. Лопатки зводь у кінцевій точці.", video:"/exercises/video (9).mp4"},
  "гіперекстензія":            {tip:"Підіймайся до прямої лінії тіла — не вище. Повільний контрольований рух.", video:null},

  // ── ПЛЕЧІ ──
  "жим штанги стоячи":         {tip:"Ноги на ширині плечей. Штанга вертикально вгору. Корпус не прогинається назад.", video:null},
  "жим гантелей сидячи":       {tip:"Спина пряма. Гантелі на рівні вух. Жим вгору без стуку над головою.", video:"/exercises/video (24).mp4"},
  "жим гантелей стоячи":       {tip:"Спина пряма. Гантелі на рівні вух. Жим вгору без стуку.", video:"/exercises/video (24).mp4"},
  "підйом гантелей в сторони": {tip:"Руки злегка зігнуті. Підйом до рівня плечей. Мізинець вище великого.", video:"/exercises/video (3).mp4"},
  "махи в сторони":            {tip:"Руки злегка зігнуті. Підйом до рівня плечей. Мізинець вище великого.", video:"/exercises/video (3).mp4"},
  "махи в нахилі":             {tip:"Нахил 45-90°. Підйом ліктями вгору-назад. Акцент на задній дельті.", video:"/exercises/video (13).mp4"},
  "зворотні розведення":       {tip:"Нахил 45-90°. Підйом ліктями вгору-назад. Акцент на задній дельті.", video:"/exercises/video (8).mp4"},
  "розведення в тренажері":    {tip:"Лікті трохи зігнуті. Підйом до рівня плечей. Пікове скорочення 1 сек.", video:"/exercises/video (8).mp4"},
  "тяга до підборіддя":        {tip:"Хват вузький. Тягни лікті вгору-в сторони. Не піднімай вище підборіддя.", video:null},
  "шраги":                     {tip:"Руки прямі. Підйом плечей вертикально вгору. Без кругових рухів. 1 сек зверху.", video:null},

  // ── РУКИ ──
  "підйом штанги на біцепс":   {tip:"Лікті притиснуті. Підйом до повного скорочення. Опускання 2-3 сек.", video:"/exercises/video (26).mp4"},
  "ez-штангою на біцепс":      {tip:"EZ-штанга зменшує навантаження на запʼястя. Лікті нерухомі. Повний діапазон.", video:"/exercises/video (26).mp4"},
  "підйом гантелей на біцепс": {tip:"Лікті нерухомі. Обертай передпліччя під час підйому. Повне розгинання внизу.", video:"/exercises/video (1).mp4"},
  "молотки":                   {tip:"Хват нейтральний. Лікті нерухомі. Тягни до плеча. Акцент на брахіаліс.", video:"/exercises/video (14).mp4"},
  "французький жим":           {tip:"Плечі вертикально. Опускай за голову. Лікті нерухомі — лише передпліччя рухається.", video:"/exercises/video (25).mp4"},
  "французький жим лежачи":    {tip:"Лежачи. Лікті нерухомі, опускай штангу до лоба. Стабільні плечі.", video:"/exercises/video (25).mp4"},
  "відмикання на брусах":      {tip:"Тіло вертикально для трицепса. Лікті вздовж тіла. Повне розгинання вгорі.", video:null},
  "розгинання в блоці":        {tip:"Лікті притиснуті. Повне випрямлення. Пікове скорочення внизу.", video:"/exercises/video (15).mp4"},
  "розгинання рук у блоці":    {tip:"Лікті притиснуті до корпусу. Повне випрямлення рук. Пікове скорочення внизу.", video:"/exercises/video (15).mp4"},
  "розгинання в нахилі":       {tip:"Нахил вперед. Лікті фіксовані. Розгинай передпліччя назад — акцент на трицепсі.", video:"/exercises/video (27).mp4"},

  // ── НОГИ ──
  "присідання зі штангою":     {tip:"Штанга на трапеції. Носки 30° назовні. Коліна над носками. До паралелі або нижче.", video:"/exercises/video (5).mp4"},
  "присідання":                {tip:"Ноги на ширині плечей, носки 30° назовні. Коліна над носками. Спина пряма.", video:"/exercises/video (5).mp4"},
  "присідання в тренажері":    {tip:"Стопи посередині платформи. Повний діапазон. Коліна не виходять за носки.", video:"/exercises/video (12).mp4"},
  "гак-присідання":            {tip:"Плечі притиснуті до валиків. Повний діапазон. Коліна йдуть уздовж стоп.", video:"/exercises/video (12).mp4"},
  "жим ногами":                {tip:"Стопи посередині платформи. Коліна не виходять за носки. Не блокуй коліна вгорі.", video:"/exercises/video (22).mp4"},
  "румунська тяга":            {tip:"Спина пряма. Нахил з відведенням таза назад. Відчувай розтяжку задньої поверхні стегна.", video:null},
  "розгинання ніг":            {tip:"Розгинай до повного випрямлення. Пікове скорочення вгорі. Повільне опускання.", video:null},
  "згинання ніг":              {tip:"Таз притиснутий. Згинай до 90°. Повне розгинання внизу.", video:"/exercises/video (20).mp4"},
  "згинання ніг лежачи":       {tip:"Таз притиснутий до лави. Згинай гомілки до сідниць. Контрольована негативна фаза.", video:"/exercises/video (20).mp4"},
  "випади":                    {tip:"Коліно заднє майже торкається підлоги. Переднє коліно над носком. Штовхайся п'ятою.", video:null},
  "болгарські присідання":     {tip:"Задня нога на лаві. Передня нога далеко вперед. Опускайся до паралелі.", video:null},
  "підйом на носки":           {tip:"Повний діапазон — від максимального опускання до пальців. Пікове скорочення 1 сек.", video:null},
  "ягідичний міст":            {tip:"Підйом таза — стискай сідниці. Пікове скорочення 2 сек. Поясниця не прогинається.", video:"/exercises/video (16).mp4"},
  "відведення ноги":           {tip:"Спина пряма. Відводь ногу назад — акцент на сідничні. Без прогину в попереку.", video:"/exercises/video (17).mp4"},

  // ── ПРЕС ──
  "скручування":               {tip:"Піднімай лопатки від підлоги. Поясниця притиснута. Видих у верхній точці.", video:"/exercises/video (18).mp4"},
  "планка":                    {tip:"Тіло — пряма лінія. Таз не піднімай і не опускай. Дихай рівно.", video:null},
  "підйом ніг":                {tip:"Поясниця притиснута. Підйом до 90°. Повільне опускання без торкання підлоги.", video:"/exercises/video (4).mp4"},
  "підйом ніг у висі":         {tip:"Не гойдайся. Підйом колін або прямих ніг. Поперек не прогинається.", video:"/exercises/video (4).mp4"},
  "берпі":                     {tip:"Стрибок вниз → упор → відмикання → підйом → стрибок вгору. Приземляйся м'яко.", video:null},
  "гірська стежина":           {tip:"Упор лежачи. По черзі підтягуй коліна до грудей. Таз рівний. Швидкий темп.", video:null},
};

function getExTip(name) {
  if (!name) return null;
  const low = name.toLowerCase();
  // Сортуємо ключі за довжиною від найдовшого, щоб спочатку знаходити більш специфічні
  const keys = Object.keys(EX_TIPS).sort((a,b) => b.length - a.length);
  for (const k of keys) {
    if (low.includes(k)) return EX_TIPS[k];
  }
  return null;
}

// ═══ EXERCISE MODAL — центрований оверлей через портал ═══
const ExModal = ({ex, onClose}) => {
  const info = getExTip(ex?.name);
  const [imgUrl, setImgUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgErr, setImgErr] = useState(false);
  const [visible, setVisible] = useState(false);

  // Запустити анімацію появи
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Блокування body scroll поки модалка відкрита
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Локальне відео з public/exercises
  useEffect(() => {
    setImgLoading(false);
    if (info?.video) {
      setImgUrl(info.video);
      setImgErr(false);
    } else {
      setImgUrl(null);
      setImgErr(true);
    }
  }, [ex?.name]);

  if (!info) return null;

  const handleClose = () => { setVisible(false); setTimeout(onClose, 160); };

  const overlayContent = (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: visible ? "rgba(0,0,0,.7)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(4px)" : "blur(0px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        transition: "background .18s ease-out, backdrop-filter .18s ease-out",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          maxHeight: "85vh",
          overflowY: "auto",
          background: C.s1,
          borderRadius: 18,
          border: `1px solid ${C.bc}`,
          padding: "16px",
          boxShadow: "0 16px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(200,245,58,.1)",
          opacity: visible ? 1 : 0,
          transform: `scale(${visible ? 1 : 0.92})`,
          transition: "opacity .18s ease-out, transform .18s ease-out",
        }}
      >
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10}}>
          <div style={{fontSize:17,fontWeight:900,color:C.tm,flex:1,lineHeight:1.3}}>{ex.name}</div>
          <button
            onClick={handleClose}
            style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:10,width:30,height:30,color:C.ts,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}
          >×</button>
        </div>

        {/* Відео вправи */}
        {!imgErr && imgUrl && (
          <video
            src={imgUrl}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setImgErr(true)}
            style={{width:"100%",borderRadius:12,marginBottom:14,objectFit:"contain",maxHeight:260,background:"#fff"}}
          />
        )}

        {/* Техніка */}
        <div style={{background:"rgba(200,245,58,.06)",border:"1px solid rgba(200,245,58,.2)",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:C.acc,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>💡 Техніка</div>
          <div style={{fontSize:14,color:C.tm,lineHeight:1.7}}>{info.tip}</div>
        </div>

        {ex.sets && (
          <div style={{fontSize:13,color:C.ts,marginTop:10}}>
            Підходи: <span style={{color:C.acc,fontWeight:700}}>{ex.sets}×{ex.reps}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Монтуємо в document.body — поверх усього
  return createPortal(overlayContent, document.body);
};




// ═══════════════════════════════════════════════════════════════
// HERO MOMENT — повноекранне святкування з конфетті + flash
// ═══════════════════════════════════════════════════════════════
const HeroMoment = ({title, subtitle, icon, color=C.acc, onClose, duration=2400}) => {
  // Generate confetti pieces
  const confetti = useMemo(() => {
    const colors = [C.acc, "#a8d420", "#e8a832", "#4a9fdf", "#ff5555", "#a855f7"];
    return Array.from({length:50}).map((_,i) => ({
      id:i,
      left: Math.random() * 100,
      tx: (Math.random() - 0.5) * 200,
      dx: (Math.random() - 0.5) * 100,
      rot: 360 + Math.random() * 720,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 200,
      duration: 1500 + Math.random() * 1500,
    }));
  }, []);

  useEffect(() => {
    haptic("success");
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", alignItems:"center", justifyContent:"center",
      pointerEvents:"none",
    }}>
      {/* Screen flash */}
      <div style={{
        position:"absolute", inset:0,
        background:`radial-gradient(circle at center, ${color}40 0%, transparent 60%)`,
        animation:"screenFlash 700ms ease-out forwards",
      }}/>

      {/* Confetti pieces */}
      {confetti.map(p => (
        <div key={p.id} style={{
          position:"absolute", top:"40%",
          left:`${p.left}%`,
          width:p.size, height:p.size*1.6,
          background:p.color,
          borderRadius:2,
          "--tx": `${p.tx}px`,
          "--dx": `${p.dx}px`,
          "--rot": `${p.rot}deg`,
          animation:`confettiFall ${p.duration}ms ease-out ${p.delay}ms forwards`,
        }}/>
      ))}

      {/* Hero icon + text */}
      <div style={{
        position:"relative", zIndex:2, textAlign:"center",
        animation:"heroPop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}>
        <div style={{
          width:140, height:140, borderRadius:"50%",
          background:`linear-gradient(135deg, ${color}, ${color}dd)`,
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          fontSize:64,
          boxShadow:`0 20px 60px ${color}80, 0 0 0 0 ${color}`,
          marginBottom:20,
          position:"relative",
        }}>
          {icon}
          {/* Expanding rings */}
          {[0,1,2].map(i => (
            <div key={i} style={{
              position:"absolute", inset:-2,
              borderRadius:"50%",
              border:`2px solid ${color}`,
              animation:`ringPulse 1.6s ease-out ${i*200}ms infinite`,
            }}/>
          ))}
        </div>
        <div style={{fontSize:30,fontWeight:900,color:C.tm,letterSpacing:-1,marginBottom:6,textShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>{title}</div>
        {subtitle && <div style={{fontSize:15,color:"rgba(255,255,255,0.85)",fontWeight:600}}>{subtitle}</div>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LIVING BACKGROUND — повільний mesh-gradient що рухається
// ═══════════════════════════════════════════════════════════════
const LivingBackground = ({intensity=1}) => (
  <div style={{
    position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden",
    background:`
      radial-gradient(ellipse 600px 400px at 0% 0%, rgba(200,245,58,${0.08*intensity}) 0%, transparent 60%),
      radial-gradient(ellipse 500px 700px at 100% 100%, rgba(74,159,223,${0.06*intensity}) 0%, transparent 55%),
      radial-gradient(ellipse 700px 500px at 50% 50%, rgba(168,85,247,${0.05*intensity}) 0%, transparent 50%)
    `,
    backgroundSize:"200% 200%, 200% 200%, 200% 200%",
    animation:"meshShift 40s ease-in-out infinite",
    filter:"blur(40px)",
  }}/>
);

// ═══════════════════════════════════════════════════════════════
// FLOATING PARTICLES — пилок акценту що повільно пливе вгору
// ═══════════════════════════════════════════════════════════════
const FloatingParticles = ({count=18}) => {
  const particles = useMemo(() => Array.from({length:count}).map((_,i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 18 + Math.random() * 22,
    delay: -Math.random() * 30,
    opacity: 0.3 + Math.random() * 0.5,
  })), [count]);

  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.left}%`, bottom:0,
          width:p.size, height:p.size,
          borderRadius:"50%",
          background:C.acc,
          opacity:p.opacity,
          filter:`blur(${p.size > 4 ? 1 : 0}px)`,
          boxShadow:`0 0 ${p.size*3}px rgba(200,245,58,0.4)`,
          animation:`floatUp ${p.duration}s linear ${p.delay}s infinite`,
        }}/>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CINEMATIC LOADER — 3-секундний кадр створення плану
// ═══════════════════════════════════════════════════════════════
const CinematicLoader = ({onComplete}) => {
  const stages = [
    {ic:"🎯", text:"Аналізую твої цілі"},
    {ic:"💪", text:"Підбираю вправи"},
    {ic:"📋", text:"Створюю твій план"},
  ];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= stages.length) { onComplete(); return; }
    const t = setTimeout(() => setStage(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div style={{position:"absolute",inset:0,background:C.bg,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
      <LivingBackground intensity={1.4}/>
      <div style={{position:"relative",zIndex:2,textAlign:"center",width:"100%",maxWidth:380}}>
        <div className="cnm" key={stage} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
          <div className="glow" style={{
            width:96,height:96,borderRadius:R.full,
            background:C.gradAcc,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:44,
          }}>{stages[Math.min(stage,2)].ic}</div>
          <H level={1} style={{textAlign:"center"}}>{stages[Math.min(stage,2)].text}</H>
        </div>

        {/* Progress segments — 3 episode markers */}
        <div style={{display:"flex",gap:6,marginTop:40,justifyContent:"center"}}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:60,height:4,borderRadius:R.full,
              background:i < stage ? C.gradAcc : i === stage ? "rgba(200,245,58,0.4)" : C.s2,
              boxShadow:i <= stage ? "0 0 8px rgba(200,245,58,0.4)" : "none",
              transition:`all ${T.slow} ${E.out}`,
              animation:i === stage ? "accentPulse 1s ease-in-out infinite" : "none",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// WELCOME (для нових клієнтів — після відео в боті)
// ═══════════════════════════════════════════════════════════════
const WelcomeScreen = ({onStart}) => (
  <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"40px 24px 24px",textAlign:"center",minHeight:"100%",position:"relative",overflow:"hidden",perspective:"800px"}}>
    <LivingBackground intensity={1.4}/>
    <FloatingParticles count={24}/>

    {/* ── EDGE GLOW BURST — radiates outward at 350ms ── */}
    <div style={{position:"absolute",inset:-40,zIndex:10,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(200,245,58,0.5) 100%)`,opacity:0,animation:"wlEdgeGlow 550ms ease-out 350ms forwards"}}/>

    {/* ── HERO SECTION ── */}
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,marginTop:20,position:"relative",zIndex:2}}>
      {/* Icon — X-flip at 350ms, glow breathes after */}
      <div style={{
        width:120,height:120,borderRadius:R.xl,background:C.gradAcc,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,position:"relative",
        opacity:0,
        animation:`wlIconFlip 380ms cubic-bezier(0.34,1.2,0.64,1) 350ms forwards, glowBreathe 4s ease-in-out 2000ms infinite`,
      }}>
        💪
        <div className="pu" style={{position:"absolute",inset:-4,borderRadius:R.xl}}/>
      </div>

      {/* Logo block */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,position:"relative"}}>
        {/* FitCore logo — rubber stamp from above at 80ms */}
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{
            fontSize:44,fontWeight:900,letterSpacing:-2,color:C.tm,lineHeight:1,
            textShadow:`0 0 30px ${C.acc}, 0 0 60px rgba(200,245,58,0.3)`,
            opacity:0,
            animation:"wlStamp 300ms cubic-bezier(0.2,0,0.3,1) 80ms forwards",
          }}>
            FitCore
          </div>
          {/* Dust particles scatter at stamp impact (265ms) */}
          <div style={{position:"absolute",width:7,height:7,borderRadius:"50%",background:C.acc,top:-2,left:-2,opacity:0,animation:"wlDustTL 320ms ease-out 265ms forwards"}}/>
          <div style={{position:"absolute",width:6,height:6,borderRadius:"50%",background:C.acc,top:-2,right:-2,opacity:0,animation:"wlDustTR 320ms ease-out 265ms forwards"}}/>
          <div style={{position:"absolute",width:5,height:5,borderRadius:"50%",background:"rgba(200,245,58,0.7)",bottom:0,left:6,opacity:0,animation:"wlDustBL 300ms ease-out 280ms forwards"}}/>
          <div style={{position:"absolute",width:5,height:5,borderRadius:"50%",background:"rgba(200,245,58,0.6)",bottom:0,right:6,opacity:0,animation:"wlDustBR 300ms ease-out 280ms forwards"}}/>
        </div>

        {/* Lime underline — ink smear at stamp landing (270ms) */}
        <div style={{
          height:3,borderRadius:R.full,background:C.gradAcc,width:140,
          transformOrigin:"left center",transform:"scaleX(0)",
          animation:"wlInkSmear 70ms cubic-bezier(0.4,0,0.2,1) 270ms forwards",
          boxShadow:`0 0 16px ${C.acc}, 0 0 32px rgba(200,245,58,0.5)`,
        }}/>

        {/* Description (900ms) */}
        <div style={{fontSize:F.bodyLg.size,color:C.ts,lineHeight:1.6,maxWidth:300,margin:"8px auto 0",
          opacity:0,animation:"fadeUp 380ms ease-out 900ms forwards"}}>
          Заповни коротку анкету — і я побудую персональну програму під твої цілі. Це займе 2 хвилини.
        </div>
      </div>
    </div>

    {/* ── FEATURE CARDS (550–770ms, Y-rotate from right) ── */}
    <div style={{display:"flex",flexDirection:"column",gap:SP[2],margin:"0 auto",width:"100%",maxWidth:340,position:"relative",zIndex:2}}>
      {[
        {ic:"🎯",t:"Персональний план тренувань",d:"Кожна вправа — під твої цілі",        dl:550},
        {ic:"🍽",t:"Харчування під твій КБЖУ",  d:"Підрахунок калорій та макро",          dl:660},
        {ic:"🤖",t:"AI-тренер 24/7",             d:"Питай будь-коли — отримай відповідь",  dl:770},
      ].map((it,i)=>(
        <Card key={i} variant="elevated" padding="14px 16px"
          style={{display:"flex",alignItems:"center",gap:14,textAlign:"left",
            opacity:0,animation:`wlCardPower 380ms cubic-bezier(0.34,1.2,0.64,1) ${it.dl}ms forwards`}}>
          <div style={{width:44,height:44,borderRadius:R.md,background:C.gradAccSubtle,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
            {it.ic}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:C.tm,letterSpacing:-0.1}}>{it.t}</div>
            <div style={{fontSize:12,color:C.ts,marginTop:2}}>{it.d}</div>
          </div>
        </Card>
      ))}
    </div>

    {/* ── CTA BUTTON (1000ms) — squash drop ── */}
    <div style={{display:"flex",flexDirection:"column",gap:SP[3],maxWidth:340,margin:"0 auto",
      width:"100%",position:"relative",zIndex:2,
      opacity:0,animation:"wlCTADrop 420ms cubic-bezier(0.34,1.2,0.64,1) 1000ms forwards"}}>
      <Btn variant="primary" size="lg" onClick={onStart} hapticKind="medium">
        Заповнити анкету · 3 дні безкоштовно
      </Btn>
      <div style={{fontSize:12,color:C.td,textAlign:"center"}}>Без карти. Без зобовʼязань.</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ONBOARDING — анкета на 12 кроків
// ═══════════════════════════════════════════════════════════════
const OnboardingFlow = ({userId, onComplete}) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward"); // forward / back — для slide animation
  const [showLoader, setShowLoader] = useState(false);
  const [completedClient, setCompletedClient] = useState(null);
  const [data, setData] = useState({
    age: "", gender: "", height_cm: "", weight_kg: "", target_weight: "",
    goal: "", experience: "", equipment: "", workouts_pw: "", pref_time: "",
    health_issues: "none", health_comment: "", allergies: "none",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const update = (k,v) => { setData(d => ({...d, [k]:v})); setErr(""); };

  const steps = [
    // 0 — Вік
    {
      title: "Скільки тобі років?",
      sub: "Це впливає на розрахунок калорій і навантаження",
      render: () => (
        <input type="number" inputMode="numeric" placeholder="наприклад 27"
          value={data.age} onChange={e=>update("age", e.target.value)}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:14,padding:"16px 18px",color:C.tm,fontSize:20,fontWeight:700,textAlign:"center",outline:"none"}}
        />
      ),
      validate: () => {
        const n = parseInt(data.age);
        if (!n || n < 10 || n > 80) return "Введи вік від 10 до 80";
        return null;
      },
    },
    // 1 — Стать
    {
      title: "Твоя стать?",
      sub: "Впливає на гормональний контекст програми",
      render: () => (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{id:"male",l:"♂ Чоловік"},{id:"female",l:"♀ Жінка"}].map(o=>{
            const active = data.gender===o.id;
            return (
            <button key={o.id} onClick={()=>{haptic("selection");update("gender",o.id);}}
              style={{
                background:active?C.gradAcc:C.s1,
                color:active?"#0a0a0a":C.tm,
                border:active?"none":`1px solid ${C.bc}`,
                borderRadius:R.lg,padding:"22px 0",fontSize:15,fontWeight:800,
                cursor:"pointer",
                boxShadow:active?SH.glow:SH.inner,
                transition:`all ${T.base} ${E.out}`,
              }}>{o.l}</button>
            );
          })}
        </div>
      ),
      validate: () => data.gender ? null : "Обери стать",
    },
    // 2 — Зріст
    {
      title: "Який твій зріст?",
      sub: "У сантиметрах",
      render: () => (
        <input type="number" inputMode="numeric" placeholder="наприклад 178"
          value={data.height_cm} onChange={e=>update("height_cm", e.target.value)}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:14,padding:"16px 18px",color:C.tm,fontSize:20,fontWeight:700,textAlign:"center",outline:"none"}}
        />
      ),
      validate: () => {
        const n = parseInt(data.height_cm);
        if (!n || n < 100 || n > 230) return "Введи зріст від 100 до 230 см";
        return null;
      },
    },
    // 3 — Вага зараз
    {
      title: "Скільки ти зараз важиш?",
      sub: "У кілограмах. Можна з десятковою (78.5)",
      render: () => (
        <input type="number" inputMode="decimal" placeholder="наприклад 82" step="0.1"
          value={data.weight_kg} onChange={e=>update("weight_kg", e.target.value)}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:14,padding:"16px 18px",color:C.tm,fontSize:20,fontWeight:700,textAlign:"center",outline:"none"}}
        />
      ),
      validate: () => {
        const n = parseFloat(data.weight_kg);
        if (!n || n < 30 || n > 250) return "Введи вагу від 30 до 250 кг";
        return null;
      },
    },
    // 4 — Цільова вага
    {
      title: "Куди хочеш прийти?",
      sub: "Цільова вага у кг",
      render: () => (
        <input type="number" inputMode="decimal" placeholder="наприклад 75" step="0.1"
          value={data.target_weight} onChange={e=>update("target_weight", e.target.value)}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:14,padding:"16px 18px",color:C.tm,fontSize:20,fontWeight:700,textAlign:"center",outline:"none"}}
        />
      ),
      validate: () => {
        const n = parseFloat(data.target_weight);
        if (!n || n < 30 || n > 250) return "Введи цільову вагу від 30 до 250 кг";
        return null;
      },
    },
    // 5 — Ціль
    {
      title: "Яка твоя головна ціль?",
      sub: "Обери одну",
      render: () => (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {id:"lose_weight",l:"📉 Схуднути"},
            {id:"gain_muscle",l:"💪 Набір маси"},
            {id:"recomp",l:"🔄 Рекомпозиція"},
            {id:"strength",l:"🏋 Сила"},
            {id:"endurance",l:"🏃 Витривалість"},
            {id:"health",l:"❤️ Здоровʼя"},
          ].map(o=>(
            <button key={o.id} onClick={()=>update("goal",o.id)}
              style={{background:data.goal===o.id?C.acc:C.s2,color:data.goal===o.id?"#0a0a0a":C.tm,
                border:`1.5px solid ${data.goal===o.id?C.acc:C.bc}`,borderRadius:12,padding:"14px 16px",fontSize:14,fontWeight:700,textAlign:"left",cursor:"pointer"}}>{o.l}</button>
          ))}
        </div>
      ),
      validate: () => data.goal ? null : "Обери ціль",
    },
    // 6 — Досвід
    {
      title: "Твій досвід тренувань?",
      sub: "Це визначить початкову складність",
      render: () => (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {id:"beginner",l:"🌱 Новачок",d:"Менше року або взагалі ніколи"},
            {id:"intermediate",l:"💪 Середній",d:"1-3 роки регулярно"},
            {id:"advanced",l:"🔥 Досвідчений",d:"Більше 3 років"},
          ].map(o=>(
            <button key={o.id} onClick={()=>update("experience",o.id)}
              style={{background:data.experience===o.id?C.acc:C.s2,color:data.experience===o.id?"#0a0a0a":C.tm,
                border:`1.5px solid ${data.experience===o.id?C.acc:C.bc}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:15,fontWeight:800}}>{o.l}</div>
              <div style={{fontSize:12,opacity:.7,marginTop:2}}>{o.d}</div>
            </button>
          ))}
        </div>
      ),
      validate: () => data.experience ? null : "Обери досвід",
    },
    // 7 — Обладнання
    {
      title: "Де ти тренуєшся?",
      sub: "Обери своє основне місце",
      render: () => (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {id:"gym",l:"🏋 Тренажерний зал"},
            {id:"home_dumbs",l:"🏠 Вдома з гантелями"},
            {id:"home_no_eq",l:"🛋 Вдома без обладнання"},
            {id:"outdoor",l:"🌳 Вулиця / воркаут"},
          ].map(o=>(
            <button key={o.id} onClick={()=>update("equipment",o.id)}
              style={{background:data.equipment===o.id?C.acc:C.s2,color:data.equipment===o.id?"#0a0a0a":C.tm,
                border:`1.5px solid ${data.equipment===o.id?C.acc:C.bc}`,borderRadius:12,padding:"14px 16px",fontSize:14,fontWeight:700,textAlign:"left",cursor:"pointer"}}>{o.l}</button>
          ))}
        </div>
      ),
      validate: () => data.equipment ? null : "Обери місце",
    },
    // 8 — Тренувань на тиждень
    {
      title: "Скільки днів на тиждень готовий тренуватись?",
      sub: "Реалістичний графік — кращий за амбітний",
      render: () => (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[2,3,4,5,6].map(n=>(
            <button key={n} onClick={()=>update("workouts_pw",String(n))}
              style={{gridColumn: n===6?"span 4":"auto",background:String(data.workouts_pw)===String(n)?C.acc:C.s2,color:String(data.workouts_pw)===String(n)?"#0a0a0a":C.tm,
                border:`1.5px solid ${String(data.workouts_pw)===String(n)?C.acc:C.bc}`,borderRadius:12,padding:"16px 0",fontSize:18,fontWeight:800,cursor:"pointer"}}>{n}</button>
          ))}
        </div>
      ),
      validate: () => data.workouts_pw ? null : "Обери частоту",
    },
    // 9 — Час
    {
      title: "Зручний час тренувань?",
      sub: "Підлаштуємо нагадування",
      render: () => (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {id:"morning",l:"🌅 Ранок (5-10:00)"},
            {id:"day",l:"☀️ День (10-16:00)"},
            {id:"evening",l:"🌆 Вечір (16-22:00)"},
            {id:"flex",l:"🔄 Гнучкий — як вийде"},
          ].map(o=>(
            <button key={o.id} onClick={()=>update("pref_time",o.id)}
              style={{background:data.pref_time===o.id?C.acc:C.s2,color:data.pref_time===o.id?"#0a0a0a":C.tm,
                border:`1.5px solid ${data.pref_time===o.id?C.acc:C.bc}`,borderRadius:12,padding:"14px 16px",fontSize:14,fontWeight:700,textAlign:"left",cursor:"pointer"}}>{o.l}</button>
          ))}
        </div>
      ),
      validate: () => data.pref_time ? null : "Обери час",
    },
    // 10 — Здоровʼя
    {
      title: "Чи є проблеми зі здоровʼям?",
      sub: "Адаптуємо програму щоб не нашкодити",
      render: () => (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {id:"none",l:"✅ Все добре"},
            {id:"back",l:"🦴 Спина / поперек"},
            {id:"knees",l:"🦵 Коліна"},
            {id:"shoulders",l:"💪 Плечі"},
            {id:"heart",l:"❤️ Серцево-судинні"},
            {id:"other",l:"⚠️ Інше"},
          ].map(o=>(
            <button key={o.id} onClick={()=>update("health_issues",o.id)}
              style={{background:data.health_issues===o.id?C.acc:C.s2,color:data.health_issues===o.id?"#0a0a0a":C.tm,
                border:`1.5px solid ${data.health_issues===o.id?C.acc:C.bc}`,borderRadius:12,padding:"14px 16px",fontSize:14,fontWeight:700,textAlign:"left",cursor:"pointer"}}>{o.l}</button>
          ))}
          {(data.health_issues!=="none" && data.health_issues) && (
            <input type="text" placeholder="Уточни (необовʼязково)..."
              value={data.health_comment} onChange={e=>update("health_comment", e.target.value)}
              style={{marginTop:6,width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px 14px",color:C.tm,fontSize:14,outline:"none",boxSizing:"border-box"}}
            />
          )}
        </div>
      ),
      validate: () => data.health_issues ? null : "Обери варіант",
    },
    // 11 — Алергії (фінальний крок)
    {
      title: "Алергії або обмеження?",
      sub: "Якщо немає — пропусти",
      render: () => (
        <input type="text" placeholder="наприклад: лактоза, горіхи..."
          value={data.allergies==="none"?"":data.allergies}
          onChange={e=>update("allergies", e.target.value || "none")}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:14,padding:"16px 18px",color:C.tm,fontSize:16,outline:"none",boxSizing:"border-box"}}
        />
      ),
      validate: () => null, // optional
    },
  ];

  const cur = steps[step];
  const progress = ((step+1) / steps.length) * 100;
  const isLast = step === steps.length - 1;

  const next = async () => {
    const e = cur.validate();
    if (e) { setErr(e); return; }
    if (isLast) {
      // Submit
      setSubmitting(true);
      try {
        const r = await apiPost("/api/client/onboarding", {
          ...data,
          age: parseInt(data.age),
          height_cm: parseInt(data.height_cm),
          weight_kg: parseFloat(data.weight_kg),
          target_weight: parseFloat(data.target_weight),
          workouts_pw: parseInt(data.workouts_pw),
        });
        if (r && r.ok) {
          // Cinematic loader перед onComplete
          setCompletedClient(r.client);
          setShowLoader(true);
        } else {
          setErr(r?.error || "Помилка. Спробуй ще раз.");
          setSubmitting(false);
        }
      } catch (ex) {
        const msg = (ex?.message || "").toLowerCase();
        if (msg.includes("409")) {
          try {
            const auth = await apiPost("/api/auth", {});
            if (auth?.client) {
              setCompletedClient(auth.client);
              setShowLoader(true);
              return;
            }
          } catch {}
          setErr("Анкета вже заповнена раніше. Перезавантаж додаток.");
          setSubmitting(false);
          return;
        }
        if (msg.includes("403")) { setErr("Доступ заблоковано. Звернись до тренера."); setSubmitting(false); return; }
        if (msg.includes("400")) { setErr("Перевір правильність відповідей у попередніх кроках."); setSubmitting(false); return; }
        if (msg.includes("401")) { setErr("Сесію втрачено. Закрий і відкрий додаток заново."); setSubmitting(false); return; }
        console.error("Onboarding submit:", ex);
        setErr("Не вдалося зберегти. Перевір інтернет і спробуй ще раз.");
        setSubmitting(false);
      }
    } else {
      setDirection("forward");
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step > 0) {
      setDirection("back");
      setStep(step - 1);
      setErr("");
    }
  };

  // Show cinematic loader before onComplete
  if (showLoader && completedClient) {
    return <CinematicLoader onComplete={() => onComplete(completedClient)}/>;
  }

  // Cinematic color theme for each step — warm → cool → accent journey
  const stepThemes = [
    {bg:"radial-gradient(ellipse at top, rgba(232,168,50,0.08), transparent 60%)", accent:"#e8a832"},  // age — warm
    {bg:"radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)", accent:"#a855f7"},  // gender — purple
    {bg:"radial-gradient(ellipse at top, rgba(74,159,223,0.08), transparent 60%)", accent:"#4a9fdf"},  // height — blue
    {bg:"radial-gradient(ellipse at top, rgba(74,159,223,0.10), transparent 60%)", accent:"#4a9fdf"},  // weight
    {bg:"radial-gradient(ellipse at top, rgba(74,222,128,0.08), transparent 60%)", accent:"#4ade80"},  // target — green
    {bg:"radial-gradient(ellipse at top, rgba(200,245,58,0.10), transparent 60%)", accent:"#c8f53a"},  // goal — accent
    {bg:"radial-gradient(ellipse at top, rgba(200,245,58,0.08), transparent 60%)", accent:"#c8f53a"},  // experience
    {bg:"radial-gradient(ellipse at top, rgba(200,245,58,0.08), transparent 60%)", accent:"#c8f53a"},  // equipment
    {bg:"radial-gradient(ellipse at top, rgba(232,168,50,0.08), transparent 60%)", accent:"#e8a832"},  // workouts/week
    {bg:"radial-gradient(ellipse at top, rgba(232,168,50,0.10), transparent 60%)", accent:"#e8a832"},  // pref_time
    {bg:"radial-gradient(ellipse at top, rgba(255,85,85,0.06), transparent 60%)",  accent:"#ff5555"},  // health
    {bg:"radial-gradient(ellipse at top, rgba(200,245,58,0.12), transparent 60%)", accent:"#c8f53a"},  // allergies — final accent
  ];
  const theme = stepThemes[step] || stepThemes[0];

  return (
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,position:"relative",overflow:"hidden"}}>
      {/* Cinematic theme background — слабо видимий тонізатор */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",zIndex:0,
        background:theme.bg,
        transition:"background 600ms ease-out",
      }}/>

      {/* Header — episode markers progress */}
      <div style={{padding:"18px 18px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          {step > 0 ? (
            <button onClick={()=>{haptic("selection");back();}} style={{background:"transparent",border:"none",color:C.acc,fontSize:14,fontWeight:700,padding:"4px 0",cursor:"pointer",letterSpacing:-0.1}}>← Назад</button>
          ) : <div style={{height:24}}/>}
          <SectionLabel style={{marginBottom:0}}>Крок {step+1} / {steps.length}</SectionLabel>
        </div>

        {/* Episode markers — 12 segments */}
        <div style={{display:"flex",gap:3,height:5}}>
          {steps.map((_, i) => {
            const isPast = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} style={{
                flex:1,
                background: isPast ? C.gradAcc : isCurrent ? "rgba(200,245,58,0.5)" : C.s2,
                borderRadius:R.full,
                boxShadow: isPast || isCurrent ? "0 0 6px rgba(200,245,58,0.4)" : "none",
                transition:`all ${T.slow} ${E.out}`,
                animation: isCurrent ? "accentPulse 2s ease-in-out infinite" : "none",
              }}/>
            );
          })}
        </div>
      </div>

      {/* Body — slide animation depending on direction */}
      <div key={step} className={direction==="back"?"slL":"slR"} style={{flex:1,overflowY:"auto",padding:"36px 20px 16px",position:"relative",zIndex:2}}>
        <div style={{maxWidth:420,margin:"0 auto"}}>
          <div className="cnm" style={{
            fontSize:32, fontWeight:900, lineHeight:1.1, color:C.tm,
            letterSpacing:"-1.4px", marginBottom:10,
          }}>{cur.title}</div>
          <div className="cnm" style={{
            fontSize:F.bodyLg.size, color:C.ts, marginBottom:32, lineHeight:1.55,
            animationDelay:"100ms", animationFillMode:"backwards",
          }}>{cur.sub}</div>
          <div className="cnm" style={{animationDelay:"200ms",animationFillMode:"backwards"}}>
            {cur.render()}
          </div>
          {err && (
            <div style={{marginTop:16,padding:"12px 14px",background:"rgba(255,85,85,0.08)",border:"1px solid rgba(255,85,85,0.25)",borderRadius:R.md,fontSize:13,color:C.red,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
              <span>⚠</span><span>{err}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer — next button */}
      <div style={{padding:"14px 18px 18px",borderTop:`1px solid ${C.bc}`,flexShrink:0,background:"rgba(10,10,10,0.85)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",position:"relative",zIndex:2}}>
        <div style={{maxWidth:420,margin:"0 auto"}}>
          <Btn variant="primary" size="lg" loading={submitting} onClick={next} hapticKind={isLast?"success":"medium"}>
            {submitting ? "Створюю твій план..." : (isLast ? "✓ Завершити та активувати" : "Далі →")}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ONBOARDING SUCCESS — після завершення анкети
// ═══════════════════════════════════════════════════════════════
const OnboardingSuccess = ({onContinue}) => {
  const [seconds, setSeconds] = useState(3);
  useEffect(() => {
    if (seconds === 0) { onContinue(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onContinue]);

  // Haptic при появі
  useEffect(()=>{haptic("success");},[]);

  return (
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:SP[6],padding:"0 28px",textAlign:"center"}}>
      <div className="si glow" style={{
        width:108, height:108, borderRadius:R.full,
        background:C.gradAccSubtle,
        border:`2.5px solid ${C.acc}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        position:"relative",
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5L9.5 17L19 7" stroke={C.acc} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            style={{strokeDasharray:30, strokeDashoffset:30, animation:`drawPath 600ms ${E.out} 200ms forwards`}}/>
        </svg>
        <div className="pu" style={{position:"absolute",inset:-4,borderRadius:R.full,opacity:.6}}/>
      </div>

      <div className="fu" style={{display:"flex",flexDirection:"column",gap:12,animationDelay:"200ms"}}>
        <H level={0}>Готово.</H>
        <div style={{fontSize:F.bodyLg.size,color:C.ts,lineHeight:1.6,maxWidth:340}}>
          3 дні безкоштовного доступу активовано. Зараз я готую твій персональний план — це займе хвилину.
        </div>
      </div>

      <div className="fu" style={{display:"flex",flexDirection:"column",gap:SP[3],width:"100%",maxWidth:340,animationDelay:"400ms"}}>
        <Btn variant="primary" size="lg" onClick={onContinue} hapticKind="medium">
          Перейти в додаток
        </Btn>
        <div style={{fontSize:12,color:C.td}}>Автоматично через {seconds}с</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PENDING PAYMENT — після надсилання Monobank скріна
// ═══════════════════════════════════════════════════════════════
const PendingPaymentScreen = ({onRefresh}) => {
  const [refreshing, setR] = useState(false);
  const refresh = async () => {
    setR(true);
    setTimeout(()=>{setR(false); onRefresh && onRefresh();}, 800);
  };
  return (
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(232,168,50,.1)",border:`2.5px solid ${C.amber}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="36" height="36" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke={C.amber} strokeWidth="1.6"/><path d="M9 5.5v4l2.5 2.5" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round"/></svg>
      </div>
      <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-.5}}>Чекаємо підтвердження</div>
      <div style={{fontSize:15,color:C.ts,lineHeight:1.7,maxWidth:340}}>Ми отримали твій скріншот. Тренер підтвердить оплату протягом 5-30 хвилин — ти отримаєш повідомлення в боті.</div>
      <div style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:14,padding:"14px 16px",fontSize:13,color:C.ts,lineHeight:1.6,maxWidth:340}}>
        💡 Якщо чекаєш довше за годину — напиши <a href="https://t.me/fitcore_matias_bot" style={{color:C.acc,textDecoration:"none"}}>@fitcore_matias_bot</a>
      </div>
      <button onClick={refresh} disabled={refreshing} style={{width:"100%",maxWidth:340,marginTop:8,background:"transparent",color:C.acc,border:`1.5px solid ${C.acc}`,borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",opacity:refreshing?.6:1}}>{refreshing?"Перевірка...":"🔄 Перевірити статус"}</button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ПРОГРЕС-ФОТО "ДО/ПІСЛЯ"
// ═══════════════════════════════════════════════════════════════
const ProgressPhotos = ({userId}) => {
  const [photos,setPhotos] = useState([]);
  const [loading,setLoad] = useState(true);
  const [showHelp,setShowHelp] = useState(false);
  const [uploading,setUp] = useState(false);
  const [err,setErr] = useState("");
  const fileRef = useRef();

  const load = useCallback(async()=>{
    setLoad(true);
    try{
      const r = await apiGet(`/api/client/${userId}/progress-photos`);
      setPhotos(r.photos||[]);
    }catch(e){console.error(e);}
    setLoad(false);
  },[userId]);

  useEffect(()=>{load();},[load]);

  const onPick = () => fileRef.current?.click();

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if(!f) return;
    setErr("");
    if(f.size > 4*1024*1024) {
      setErr("Фото занадто велике. Максимум 4 МБ.");
      return;
    }
    setUp(true);
    try{
      // стискаємо фото
      const img = await new Promise((res,rej)=>{
        const r = new FileReader();
        r.onload = () => { const i = new Image(); i.onload = ()=>res(i); i.onerror=rej; i.src = r.result; };
        r.onerror = rej; r.readAsDataURL(f);
      });
      const maxSide = 1280;
      const scale = Math.min(1, maxSide/Math.max(img.width, img.height));
      const w = Math.round(img.width*scale);
      const h = Math.round(img.height*scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      const base64 = dataUrl.split(",")[1];
      await apiPost(`/api/client/${userId}/progress-photos`, {image: base64});
      await load();
    }catch(ex){
      console.error(ex);
      setErr("Не вдалося завантажити");
    }
    setUp(false);
    if(fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = async (id) => {
    if(!confirm("Видалити це фото?")) return;
    try{
      await fetch(`${API}/api/client/${userId}/progress-photos/${id}`, {
        method:"DELETE",
        headers:{"X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || ""}
      });
      await load();
    }catch(e){console.error(e);}
  };

  if(loading) return <Spin/>;

  return(
    <Scr>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
        <div style={{flex:1}}>
          <SectionLabel accent>Тіло у часі</SectionLabel>
          <H level={1}>Прогрес у фото</H>
        </div>
        <button onClick={()=>{haptic("selection");setShowHelp(true);}} style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:R.md,width:38,height:38,color:C.acc,fontSize:15,fontWeight:900,boxShadow:SH.inner,flexShrink:0}}>?</button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{display:"none"}}/>

      <Btn variant="primary" size="lg" onClick={onPick} loading={uploading} hapticKind="medium">
        📸 Додати нове фото
      </Btn>

      {err && <div style={{fontSize:13,color:C.red,padding:"6px 4px",fontWeight:600}}>⚠ {err}</div>}

      {photos.length === 0 ? (
        <Empty icon="📷" title="Ще немає фото" subtitle="Роби фото щотижня — через місяць побачиш реальну різницю"/>
      ) : (
        <div className="stg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {photos.map(p=>(
            <div key={p.id} style={{position:"relative",background:C.s1,borderRadius:R.md,overflow:"hidden",border:`1px solid ${C.bc}`,boxShadow:SH.sm}}>
              <img src={`data:image/jpeg;base64,${p.photo_path}`} alt="" style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
              <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:R.sm,letterSpacing:0.3}}>
                {(p.taken_at||"").slice(0,10)}
              </div>
              <button onClick={()=>{haptic("warning");removePhoto(p.id);}} style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",border:"none",color:"#ff6b6b",width:30,height:30,borderRadius:R.sm,fontSize:15,fontWeight:700}}>×</button>
            </div>
          ))}
        </div>
      )}

      {showHelp && createPortal(
        <div onClick={()=>setShowHelp(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(20px) saturate(140%)",WebkitBackdropFilter:"blur(20px) saturate(140%)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"18px",maxWidth:420,width:"100%"}}>
            <div style={{fontSize:18,fontWeight:900,color:C.tm,marginBottom:12}}>📸 Як користуватись</div>
            <div style={{fontSize:14,color:C.ts,lineHeight:1.7}}>
              <div style={{marginBottom:10}}>✅ <b style={{color:C.tm}}>Раз на тиждень</b> — одного фото достатньо щоб бачити прогрес</div>
              <div style={{marginBottom:10}}>✅ <b style={{color:C.tm}}>Однакове освітлення і ракурс</b> — вранці, натщесерце, у дзеркалі</div>
              <div style={{marginBottom:10}}>✅ <b style={{color:C.tm}}>Мінімум одягу</b> — щоб реально бачити зміни тіла</div>
              <div style={{marginBottom:10}}>✅ <b style={{color:C.tm}}>Фото — тільки твоє</b> — ніхто крім тебе (і тренера) не бачить</div>
              <div style={{marginTop:14,padding:"10px 12px",background:"rgba(200,245,58,.08)",border:"1px solid rgba(200,245,58,.2)",borderRadius:10,fontSize:13,color:C.acc}}>💡 Через місяць матимеш 4 фото — різниця буде помітна навіть коли не бачиш її щодня</div>
            </div>
            <button onClick={()=>setShowHelp(false)} style={{width:"100%",marginTop:16,background:C.acc,color:"#0a0a0a",border:"none",borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:800}}>Зрозуміло</button>
          </div>
        </div>,
        document.body
      )}
    </Scr>
  );
};

// ═══════════════════════════════════════════════════════════════
// AI ЧАТ — Матіас 24/7
// ═══════════════════════════════════════════════════════════════
const AIChat = ({userId,clientData}) => {
  const [messages,setMessages] = useState([]);
  const [input,setInput] = useState("");
  const [sending,setSend] = useState(false);
  const [limit,setLimit] = useState(null);
  const [used,setUsed] = useState(0);
  const [showHelp,setShowHelp] = useState(false);
  const [loading,setLoad] = useState(true);
  const scrollRef = useRef();

  const load = async()=>{
    try{
      const r = await apiGet(`/api/client/${userId}/ai-chat`);
      setMessages(r.messages||[]);
      setLimit(r.daily_limit);
      setUsed(r.used_today||0);
    }catch(e){console.error(e);}
    setLoad(false);
  };

  useEffect(()=>{load();},[userId]);

  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  },[messages]);

  // показати вітання якщо історія пуста
  const isEmpty = messages.length === 0 && !loading;

  const send = async()=>{
    const text = input.trim();
    if(!text || sending) return;
    if(limit !== null && used >= limit){ return; }
    setSend(true);
    // оптимістично додаємо
    setMessages(m=>[...m, {role:"user", content:text, created_at: new Date().toISOString()}]);
    setInput("");
    try{
      const r = await apiPost(`/api/client/${userId}/ai-chat`, {text});
      setMessages(m=>[...m, {role:"assistant", content:r.reply, created_at: new Date().toISOString()}]);
      setUsed(r.used);
    }catch(e){
      if(e.message && e.message.includes("limit")){
        setMessages(m=>[...m, {role:"assistant", content:"⚠ Денний ліміт повідомлень вичерпано. Оновлення — о 00:00 (Київ).", created_at:new Date().toISOString()}]);
      }else{
        setMessages(m=>[...m, {role:"assistant", content:"⚠ Тимчасово не вдається відповісти. Спробуй через хвилину.", created_at:new Date().toISOString()}]);
      }
    }
    setSend(false);
  };

  const plan = clientData?.plan || "trial";
  const planLabel = {trial:"Пробний",start:"START",premium:"PREMIUM",vip:"VIP"}[plan];

  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bc}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{
            width:44, height:44, borderRadius:R.full,
            background:"linear-gradient(135deg,"+C.acc+",#e8a832)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,fontWeight:900,color:"#0a0a0a",
            boxShadow:"0 6px 20px rgba(200,245,58,0.3)",
            position:"relative",
          }}>
            М
            {/* Online pulse dot */}
            <div style={{
              position:"absolute",bottom:-1,right:-1,
              width:14,height:14,borderRadius:R.full,
              background:C.green,
              border:`2.5px solid ${C.bg}`,
              boxShadow:"0 0 0 0 rgba(74,222,128,0.6)",
              animation:"pulseDot 2s ease-in-out infinite",
            }}/>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.tm,letterSpacing:-0.2}}>Матіас</div>
            <div style={{fontSize:11,color:C.green,fontWeight:700,letterSpacing:0.3,textTransform:"uppercase"}}>Online · AI-тренер</div>
          </div>
        </div>
        <button onClick={()=>{haptic("selection");setShowHelp(true);}} style={{background:C.s1,border:`1px solid ${C.bc}`,borderRadius:R.md,width:36,height:36,color:C.acc,fontSize:15,fontWeight:900,flexShrink:0,boxShadow:SH.inner}}>?</button>
      </div>

      {/* Limit bar */}
      {limit !== null && (
        <div style={{padding:"8px 16px",background:C.s2,fontSize:11,color:C.ts,display:"flex",justifyContent:"space-between",flexShrink:0}}>
          <span>{planLabel} · {used}/{limit===999?"∞":limit} сьогодні</span>
          {used >= limit && limit<999 && <span style={{color:C.red,fontWeight:700}}>Ліміт вичерпано</span>}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="fi" style={{flex:1,overflowY:"auto",padding:"14px 14px 140px",display:"flex",flexDirection:"column",gap:8}}>
        {loading && <Spin/>}
        {isEmpty && (
          <Card variant="elevated" padding={20} style={{textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:12}}>👋</div>
            <div style={{fontSize:F.h3.size,fontWeight:800,color:C.tm,marginBottom:8,letterSpacing:-0.2}}>Привіт! Я Матіас</div>
            <div style={{fontSize:F.body.size,color:C.ts,lineHeight:1.6,marginBottom:20}}>Питай будь-що про тренування, харчування чи відновлення. Відповім за декілька секунд.</div>
            <SectionLabel accent style={{textAlign:"left",marginBottom:8}}>Спробуй запитати</SectionLabel>
            <div className="stg" style={{display:"flex",flexDirection:"column",gap:8}}>
              {["Що їсти перед тренуванням?","Як правильно робити присідання?","Чому боляче коліно після тренування?"].map(q=>(
                <button key={q} onClick={()=>{haptic("light");setInput(q);}} style={{
                  background:C.gradAccSubtle,
                  border:"1px solid rgba(200,245,58,0.25)",
                  borderRadius:R.md,padding:"12px 14px",fontSize:13,
                  color:C.acc,textAlign:"left",fontWeight:600,
                  cursor:"pointer",transition:`all ${T.fast} ${E.out}`,
                }}>{q} →</button>
              ))}
            </div>
          </Card>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:16,background:m.role==="user"?C.acc:C.s1,color:m.role==="user"?"#0a0a0a":C.tm,border:m.role==="assistant"?`1px solid ${C.bc}`:"none",fontSize:14,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {sending && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{padding:"12px 16px",borderRadius:16,background:C.s1,border:`1px solid ${C.bc}`,display:"flex",gap:4}}>
              {[0,1,2].map(i=><div key={i} className="sp" style={{width:6,height:6,borderRadius:"50%",background:C.ts,animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${C.bc}`,display:"flex",gap:8,background:C.bg,position:"fixed",bottom:"calc(65px + env(safe-area-inset-bottom, 0px))",left:0,right:0,zIndex:99}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")send();}}
          placeholder="Запитай мене..."
          disabled={sending||(limit!==null && used>=limit && limit<999)}
          style={{flex:1,background:C.s1,border:`1px solid ${C.bc}`,borderRadius:16,padding:"12px 14px",color:C.tm,fontSize:14,outline:"none"}}
        />
        <button onClick={()=>{haptic("light");send();}} disabled={!input.trim()||sending||(limit!==null&&used>=limit&&limit<999)} style={{
          background:C.gradAcc,color:"#0a0a0a",border:"none",borderRadius:R.md,
          width:48,height:48,fontSize:18,fontWeight:900,flexShrink:0,
          opacity:(!input.trim()||sending)?.4:1,
          boxShadow:input.trim()?SH.glow:"none",
          transition:`opacity ${T.base} ${E.out}, box-shadow ${T.base} ${E.out}`,
        }}>↑</button>
      </div>

      {showHelp && createPortal(
        <div onClick={()=>setShowHelp(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(20px) saturate(140%)",WebkitBackdropFilter:"blur(20px) saturate(140%)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.s1,borderRadius:18,border:`1px solid ${C.bc}`,padding:"18px",maxWidth:420,width:"100%"}}>
            <div style={{fontSize:18,fontWeight:900,color:C.tm,marginBottom:12}}>🤖 Як користуватись чатом</div>
            <div style={{fontSize:14,color:C.ts,lineHeight:1.7}}>
              <div style={{marginBottom:10}}>💬 Питай про <b style={{color:C.tm}}>тренування, харчування, техніку вправ, відновлення</b> — відповім одразу</div>
              <div style={{marginBottom:10}}>🧠 Памʼятаю останні <b style={{color:C.tm}}>8 повідомлень</b> — можна задавати уточнюючі запитання</div>
              <div style={{marginBottom:10}}>📊 Твій ліміт залежить від тарифу:<br/>• Trial — 5 повідомлень/день<br/>• Start — 10<br/>• Premium — 30<br/>• VIP — безліміт</div>
              <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,180,0,.08)",border:"1px solid rgba(255,180,0,.2)",borderRadius:10,fontSize:13,color:"#f6c90e"}}>⚠ Якщо сильно болить або травма — звертайся до тренера Матіаса особисто</div>
            </div>
            <button onClick={()=>setShowHelp(false)} style={{width:"100%",marginTop:16,background:C.acc,color:"#0a0a0a",border:"none",borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:800}}>Зрозуміло</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// РЕЦЕПТИ (VIP)
// ═══════════════════════════════════════════════════════════════
const Recipes = ({userId,clientData}) => {
  const [category,setCat] = useState("breakfast");
  const [recipes,setRec] = useState([]);
  const [loading,setLoad] = useState(false);
  const [err,setErr] = useState("");
  const [trialBlock,setTrialBlock] = useState(null);
  const [expanded,setExpanded] = useState(null);

  const isVIP = clientData?.plan === "vip";
  const isTrial = clientData?.status === "trial";
  const hasAccess = isVIP || isTrial;

  const load = async(refresh=false)=>{
    if(!hasAccess) return;
    setLoad(true); setErr(""); setTrialBlock(null);
    try{
      const r = await apiGet(`/api/client/${userId}/recipes?category=${category}${refresh?"&refresh=1":""}`);
      setRec(r.recipes||[]);
    }catch(e){
      const msg = e.message||"";
      if(msg.includes("trial_limit")){
        setTrialBlock(true);
        setRec([]);
      }else{
        setErr("Не вдалося завантажити. Спробуй пізніше.");
      }
    }
    setLoad(false);
  };

  useEffect(()=>{if(hasAccess)load();},[category,hasAccess]);

  if(!hasAccess){
    return(
      <Scr>
        <div style={{background:C.s1,borderRadius:18,border:"1.5px solid rgba(168,85,247,.3)",padding:"24px 20px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>🍽</div>
          <div style={{fontSize:20,fontWeight:900,color:C.tm,marginBottom:8}}>Рецепти — VIP</div>
          <div style={{fontSize:14,color:C.ts,lineHeight:1.6,marginBottom:20}}>Персональні рецепти під твій КБЖУ. Генеруються під твою вагу, ціль і алергії. Доступно на тарифі VIP.</div>
          <div style={{padding:"14px",background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.2)",borderRadius:12,fontSize:13,color:"#d8b4fe",lineHeight:1.6}}>Перейди на VIP щоб отримати:<br/>✓ 5 рецептів на кожен прийом їжі<br/>✓ Точний КБЖУ під твої цілі<br/>✓ Врахування алергій</div>
        </div>
      </Scr>
    );
  }

  const cats = [
    {id:"breakfast", label:"🌅 Сніданок"},
    {id:"lunch",     label:"☀️ Обід"},
    {id:"dinner",    label:"🌙 Вечеря"},
    {id:"snack",     label:"🍎 Перекус"},
  ];

  return(
    <Scr>
      <div>
        <SectionLabel accent>VIP-рецепти</SectionLabel>
        <H level={1}>Рецепти під твій КБЖУ</H>
      </div>

      {isTrial && (
        <Card padding={"12px 14px"} style={{background:"rgba(168,85,247,0.08)",border:"1px solid rgba(168,85,247,0.25)"}}>
          <div style={{fontSize:13,color:"#d8b4fe",lineHeight:1.55}}>
            ⚡ <b>Пробний доступ:</b> 1 категорія рецептів на день. На VIP — без обмежень.
          </div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
        {cats.map(c=>{
          const active = category===c.id;
          return (
          <button key={c.id} onClick={()=>{haptic("selection");setCat(c.id);}}
            style={{
              background:active?C.gradAcc:C.s1,
              color:active?"#0a0a0a":C.ts,
              border:active?"none":`1px solid ${C.bc}`,
              borderRadius:R.md,padding:"11px 4px",fontSize:12,fontWeight:800,
              boxShadow:active?SH.glow:SH.inner,
              transition:`all ${T.base} ${E.out}`,
            }}>{c.label}</button>
          );
        })}
      </div>

      <Btn variant="ghost" size="sm" onClick={()=>load(true)} disabled={loading} hapticKind="light">
        🔄 Оновити список
      </Btn>

      {loading && <div style={{textAlign:"center",padding:"30px 0"}}><div className="sp" style={{display:"inline-block",width:32,height:32,borderRadius:"50%",border:`3px solid ${C.s2}`,borderTopColor:C.acc}}/><div style={{fontSize:12,color:C.ts,marginTop:10}}>Генеруємо рецепти...</div></div>}

      {err && <div style={{color:C.red,fontSize:13,padding:"8px 0"}}>{err}</div>}
      {trialBlock && (
        <div style={{background:"rgba(168,85,247,.08)",border:"1.5px solid rgba(168,85,247,.3)",borderRadius:14,padding:"16px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>🔒</div>
          <div style={{fontSize:15,fontWeight:800,color:C.tm,marginBottom:6}}>Сьогодні ліміт вичерпано</div>
          <div style={{fontSize:13,color:C.ts,lineHeight:1.6}}>На пробному доступі — 1 категорія на день. Завтра відкриється нова, або обери <b style={{color:"#d8b4fe"}}>VIP</b> щоб отримати всі 4 категорії одразу і без обмежень.</div>
        </div>
      )}

      {!loading && recipes.length>0 && <div className="stg" style={{display:"flex",flexDirection:"column",gap:SP[2]}}>
      {recipes.map((r,i)=>{
        const catEmoji = {breakfast:"🍳", lunch:"🍲", dinner:"🍽", snack:"🥗"}[category] || "🍴";
        const isOpen = expanded===i;
        return (
        <div key={i} onClick={()=>{haptic("light");setExpanded(isOpen?null:i);}} style={{background:C.s1,borderRadius:R.md,border:`1px solid ${isOpen?"rgba(200,245,58,0.3)":C.bc}`,padding:"14px 16px",cursor:"pointer",transition:`border-color ${T.base} ${E.out}, transform ${T.fast} ${E.out}`,boxShadow:isOpen?SH.sm:SH.inner}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Емоджі-картинка зліва */}
            <div style={{width:56,height:56,borderRadius:12,background:"linear-gradient(135deg, rgba(200,245,58,.15), rgba(200,245,58,.05))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{catEmoji}</div>

            {/* Назва + макроси */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:800,color:C.tm,marginBottom:4,lineHeight:1.3}}>{r.name}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:11,color:C.ts}}>
                <span>🔥 {r.kcal} ккал</span>
                <span>🥩 {r.protein_g}г</span>
                <span>🍞 {r.carbs_g}г</span>
                <span>🥑 {r.fat_g}г</span>
                {r.time_min && <span>⏱ {r.time_min} хв</span>}
              </div>
            </div>

            {/* Стрілка-індикатор */}
            <div style={{flexShrink:0,color:isOpen?C.acc:C.ts,fontSize:18,fontWeight:700,transform:`rotate(${isOpen?90:0}deg)`,transition:"transform .25s ease, color .2s"}}>›</div>
          </div>

          {isOpen && (
            <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bc}`}}>
              <div style={{fontSize:12,color:C.acc,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.8}}>Інгредієнти</div>
              {(r.ingredients||[]).map((ing,j)=>(
                <div key={j} style={{fontSize:13,color:C.ts,marginBottom:3,paddingLeft:8}}>• {ing}</div>
              ))}
              <div style={{fontSize:12,color:C.acc,fontWeight:700,marginTop:10,marginBottom:6,textTransform:"uppercase",letterSpacing:.8}}>Приготування</div>
              {(r.steps||[]).map((s,j)=>(
                <div key={j} style={{fontSize:13,color:C.ts,marginBottom:5,display:"flex",gap:6}}><span style={{color:C.acc,fontWeight:700,flexShrink:0}}>{j+1}.</span><span>{s}</span></div>
              ))}
            </div>
          )}
        </div>
      );})}</div>}
    </Scr>
  );
};

// ═══════════════════════════════════════════════════════════════
// КБЖУ КАЛЬКУЛЯТОР
// ═══════════════════════════════════════════════════════════════
const MACRO_LEVELS = [
  {id:"sedentary",   label:"Сидячий",        desc:"Без тренувань, офісна робота",   mult:1.2},
  {id:"light",       label:"Легкий",          desc:"1–2 тренування на тиждень",      mult:1.375},
  {id:"moderate",    label:"Помірний",        desc:"3–4 тренування на тиждень",      mult:1.55},
  {id:"active",      label:"Активний",        desc:"5–6 тренувань на тиждень",       mult:1.725},
  {id:"very_active", label:"Дуже активний",   desc:"Щодня або двічі на день",        mult:1.9},
];
const MACRO_GOALS = [
  {id:"lose_weight", label:"📉 Схуднення",  delta:-400},
  {id:"maintain",    label:"⚖️ Підтримка",   delta:0},
  {id:"gain_muscle", label:"💪 Набір маси",  delta:+250},
];

const MacrosCalculator = ({userId, questionnaire, onBack}) => {
  const initActivity = () => {
    if (questionnaire?.activity_level) return questionnaire.activity_level;
    const wpw = Number(questionnaire?.workouts_pw || 0);
    if (wpw === 0) return "sedentary";
    if (wpw <= 2) return "light";
    if (wpw <= 4) return "moderate";
    return "active";
  };
  const initGoal = () => {
    const g = questionnaire?.goal;
    return (g === "lose_weight" || g === "gain_muscle") ? g : "maintain";
  };

  const [weight,   setWeight]   = useState(String(questionnaire?.weight_kg  || ""));
  const [height,   setHeight]   = useState(String(questionnaire?.height_cm  || ""));
  const [age,      setAge]      = useState(String(questionnaire?.age        || ""));
  const [gender,   setGender]   = useState(questionnaire?.gender || "male");
  const [activity, setActivity] = useState(initActivity);
  const [goal,     setGoal]     = useState(initGoal);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const calc = useMemo(() => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    if (!w || !h || !a || w < 30 || h < 100 || a < 10) return null;
    const bmr = gender === "female"
      ? 10*w + 6.25*h - 5*a - 161
      : 10*w + 6.25*h - 5*a + 5;
    const mult = MACRO_LEVELS.find(l => l.id === activity)?.mult || 1.55;
    const tdee = Math.round(bmr * mult);
    const delta = MACRO_GOALS.find(g => g.id === goal)?.delta || 0;
    const calories = Math.max(1200, tdee + delta);
    const protein = goal === "lose_weight" ? Math.round(w*2.3) : goal === "gain_muscle" ? Math.round(w*2.0) : Math.round(w*1.8);
    const fat = Math.round(w * 0.9);
    const carbs = Math.max(50, Math.round((calories - protein*4 - fat*9) / 4));
    return {calories, protein, fat, carbs, tdee, bmr: Math.round(bmr)};
  }, [weight, height, age, gender, activity, goal]);

  const handleSave = async () => {
    if (!calc) return;
    setSaving(true);
    try {
      await apiPost(`/api/client/${userId}/macros`, {
        activity_level: activity,
        calories_tdee:  calc.calories,
        protein_g:      calc.protein,
        fat_g:          calc.fat,
        carbs_g:        calc.carbs,
      });
      haptic("success");
      setSaved(true);
    } catch { haptic("error"); }
    setSaving(false);
  };

  const touch = () => setSaved(false);
  const inp = {width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:R.md,padding:"13px 8px",color:C.tm,fontSize:17,fontWeight:800,textAlign:"center",outline:"none",boxSizing:"border-box"};

  return (
    <Scr>
      <button onClick={()=>{haptic("selection");onBack();}} style={{background:"transparent",border:"none",color:C.acc,fontSize:14,fontWeight:700,padding:"4px 0",cursor:"pointer",letterSpacing:-0.1,alignSelf:"flex-start"}}>← Назад</button>

      <div>
        <SectionLabel accent>Персональний розрахунок</SectionLabel>
        <H level={1}>КБЖУ калькулятор</H>
        <div style={{fontSize:13,color:C.ts,marginTop:6,lineHeight:1.55}}>Формула Mifflin-St Jeor. Дані з анкети підставлені автоматично.</div>
      </div>

      {/* Стать */}
      <Card variant="elevated">
        <SectionLabel style={{marginBottom:SP[2]}}>Стать</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{id:"male",l:"♂ Чоловік"},{id:"female",l:"♀ Жінка"}].map(o => {
            const on = gender === o.id;
            return (
              <button key={o.id} onClick={()=>{haptic("selection");setGender(o.id);touch();}}
                style={{background:on?C.gradAcc:C.s2,color:on?"#0a0a0a":C.tm,border:on?"none":`1px solid ${C.bc}`,borderRadius:R.md,padding:"13px 0",fontSize:14,fontWeight:800,cursor:"pointer",transition:`all ${T.base} ${E.out}`,boxShadow:on?SH.glow:"none"}}>{o.l}</button>
            );
          })}
        </div>
      </Card>

      {/* Параметри тіла */}
      <Card variant="elevated">
        <SectionLabel style={{marginBottom:SP[2]}}>Параметри тіла</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {label:"Вага (кг)",  val:weight, set:setWeight, ph:"82",  mode:"decimal"},
            {label:"Зріст (см)", val:height, set:setHeight, ph:"178", mode:"numeric"},
            {label:"Вік",        val:age,    set:setAge,    ph:"27",  mode:"numeric"},
          ].map(f => (
            <div key={f.label}>
              <div style={{fontSize:10,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,marginBottom:5,textAlign:"center"}}>{f.label}</div>
              <input type="number" inputMode={f.mode} value={f.val} placeholder={f.ph}
                onChange={e=>{f.set(e.target.value);touch();}} style={inp}/>
            </div>
          ))}
        </div>
      </Card>

      {/* Рівень активності */}
      <Card variant="elevated">
        <SectionLabel style={{marginBottom:SP[2]}}>Рівень активності</SectionLabel>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {MACRO_LEVELS.map(l => {
            const on = activity === l.id;
            return (
              <button key={l.id} onClick={()=>{haptic("selection");setActivity(l.id);touch();}}
                style={{background:on?C.gradAccSubtle:C.s2,border:`1.5px solid ${on?"rgba(200,245,58,0.4)":C.bc}`,borderRadius:R.md,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",transition:`all ${T.base} ${E.out}`}}>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:13,fontWeight:800,color:on?C.acc:C.tm,letterSpacing:-0.1}}>{l.label}</div>
                  <div style={{fontSize:11,color:C.ts,marginTop:1}}>{l.desc}</div>
                </div>
                <div style={{fontSize:12,color:on?C.acc:C.td,fontWeight:800,background:on?C.accDim:C.s3,padding:"3px 8px",borderRadius:R.sm}}>×{l.mult}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Ціль */}
      <Card variant="elevated">
        <SectionLabel style={{marginBottom:SP[2]}}>Ціль</SectionLabel>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {MACRO_GOALS.map(g => {
            const on = goal === g.id;
            return (
              <button key={g.id} onClick={()=>{haptic("selection");setGoal(g.id);touch();}}
                style={{background:on?C.gradAcc:C.s2,color:on?"#0a0a0a":C.tm,border:on?"none":`1px solid ${C.bc}`,borderRadius:R.md,padding:"14px 16px",fontSize:14,fontWeight:800,textAlign:"left",cursor:"pointer",transition:`all ${T.base} ${E.out}`,boxShadow:on?SH.glow:"none"}}>{g.label}</button>
            );
          })}
        </div>
      </Card>

      {/* Результат */}
      {calc ? (
        <Card variant="accent" glow style={{overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:110,height:110,borderRadius:"50%",background:C.acc,opacity:0.05,pointerEvents:"none"}}/>
          <SectionLabel accent style={{marginBottom:SP[3]}}>Твій результат</SectionLabel>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:SP[4]}}>
            <span style={{fontSize:52,fontWeight:900,color:C.tm,letterSpacing:-2,lineHeight:1}}><AnimatedNum value={calc.calories}/></span>
            <span style={{fontSize:16,color:C.ts}}>ккал / день</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:SP[3]}}>
            {[
              {l:"Білок",      v:calc.protein, c:C.acc},
              {l:"Жири",       v:calc.fat,     c:C.amber},
              {l:"Вуглеводи",  v:calc.carbs,   c:C.blue},
            ].map(m => (
              <div key={m.l} style={{background:"rgba(0,0,0,0.25)",borderRadius:R.md,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:10,color:C.ts,textTransform:"uppercase",letterSpacing:0.5,fontWeight:700,marginBottom:4}}>{m.l}</div>
                <div style={{fontSize:24,fontWeight:900,color:m.c,lineHeight:1}}><AnimatedNum value={m.v}/></div>
                <div style={{fontSize:11,color:C.td,marginTop:2}}>г</div>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 12px",background:"rgba(0,0,0,0.2)",borderRadius:R.md,fontSize:12,color:C.ts,lineHeight:1.5}}>
            {`BMR: ${calc.bmr} ккал · TDEE: ${calc.tdee} ккал`}
            {goal==="lose_weight" && " · −400 ккал дефіцит"}
            {goal==="gain_muscle" && " · +250 ккал профіцит"}
          </div>
        </Card>
      ) : (
        <Card variant="outline" style={{textAlign:"center",padding:"24px 16px"}}>
          <div style={{fontSize:32,marginBottom:8}}>🧮</div>
          <div style={{fontSize:13,color:C.ts}}>Заповни параметри вище щоб побачити результат</div>
        </Card>
      )}

      {calc && (
        saved ? (
          <Card variant="elevated" style={{textAlign:"center",padding:"18px 16px",border:`1px solid rgba(200,245,58,0.3)`}}>
            <div style={{fontSize:28,marginBottom:6}}>✅</div>
            <div style={{fontSize:15,fontWeight:800,color:C.acc}}>КБЖУ збережено!</div>
            <div style={{fontSize:12,color:C.ts,marginTop:4,lineHeight:1.5}}>Рецепти тепер генеруватимуться під твої показники</div>
          </Card>
        ) : (
          <Btn variant="primary" size="lg" loading={saving} onClick={handleSave} hapticKind="success">
            💾 Зберегти КБЖУ
          </Btn>
        )
      )}
    </Scr>
  );
};

// ═══════════════════════════════════════════════════════════════
// КАЛЕНДАР ТРЕНУВАНЬ
// ═══════════════════════════════════════════════════════════════
const TrainingSchedule = ({userId}) => {
  const [days,setDays] = useState([]);
  const [time,setTime] = useState("18:00");
  const [loading,setLoad] = useState(true);
  const [saving,setSave] = useState(false);
  const [saved,setSaved] = useState(false);

  const weekdays = [
    {id:0,label:"Пн"},{id:1,label:"Вт"},{id:2,label:"Ср"},
    {id:3,label:"Чт"},{id:4,label:"Пт"},{id:5,label:"Сб"},{id:6,label:"Нд"},
  ];

  useEffect(()=>{
    apiGet(`/api/client/${userId}/training-schedule`).then(r=>{
      setDays(r.days||[]);
      setTime(r.time||"18:00");
      setLoad(false);
    }).catch(()=>setLoad(false));
  },[userId]);

  const toggleDay = (d)=>{
    setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d].sort());
    setSaved(false);
  };

  const save = async()=>{
    setSave(true);
    try{
      await apiPost(`/api/client/${userId}/training-schedule`, {days, time});
      setSaved(true);
      setTimeout(()=>setSaved(false), 2500);
    }catch(e){}
    setSave(false);
  };

  if(loading) return <Spin/>;

  return(
    <Scr>
      <div>
        <SectionLabel accent>Графік занять</SectionLabel>
        <H level={1}>Календар тренувань</H>
        <div style={{fontSize:F.body.size,color:C.ts,lineHeight:1.6,marginTop:6}}>Обери дні тижня. За 5 годин до тренування — надійде нагадування в бот.</div>
      </div>

      <Card variant="elevated" padding={18}>
        <SectionLabel>Дні тренувань</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
          {weekdays.map(d=>{
            const active = days.includes(d.id);
            return (
            <button key={d.id} onClick={()=>{haptic("selection");toggleDay(d.id);}}
              style={{
                background:active?C.gradAcc:C.s2,
                color:active?"#0a0a0a":C.ts,
                border:active?"none":`1px solid ${C.bc}`,
                borderRadius:R.md,padding:"14px 0",fontSize:13,fontWeight:800,
                boxShadow:active?SH.glow:SH.inner,
                transition:`all ${T.base} ${E.out}`,
                letterSpacing:-0.1,
              }}>{d.label}</button>
            );
          })}
        </div>
      </Card>

      <Card variant="elevated" padding={18}>
        <SectionLabel>Час тренування</SectionLabel>
        <input type="time" value={time} onChange={e=>{setTime(e.target.value);setSaved(false);}} style={{
          width:"100%",background:C.s2,border:`1px solid ${C.bc}`,
          borderRadius:R.md,padding:"14px",color:C.tm,fontSize:22,
          textAlign:"center",fontWeight:800,colorScheme:"dark",
          letterSpacing:-0.5, fontVariantNumeric:"tabular-nums",
        }}/>
        <div style={{fontSize:12,color:C.td,marginTop:10,textAlign:"center"}}>Нагадування прийде за 5 годин до цього часу</div>
      </Card>

      <Btn variant="primary" size="lg" onClick={()=>{haptic("success");save();}} loading={saving} hapticKind="success">
        {saved?"✓ Збережено":"Зберегти розклад"}
      </Btn>

      {days.length>0 && (
        <Card padding={"12px 14px"} style={{background:C.gradAccSubtle,border:"1px solid rgba(200,245,58,0.25)"}}>
          <div style={{fontSize:13,color:C.acc,lineHeight:1.6,fontWeight:600}}>
            📅 Тренуєшся <b style={{fontWeight:900}}>{days.length}</b> {days.length===1?"день":days.length<5?"дні":"днів"} на тиждень о <b style={{fontWeight:900}}>{time}</b>. Нагадування — о {(()=>{const[h,m]=time.split(":").map(Number);const nh=(h-5+24)%24;return `${String(nh).padStart(2,"0")}:${String(m).padStart(2,"0")}`;})()}.
          </div>
        </Card>
      )}
    </Scr>
  );
};


// ═══════════════════════════════════════════════════════════════
// РЕФЕРАЛЬНА ПРОГРАМА
// ═══════════════════════════════════════════════════════════════
const BOT_USERNAME = "fitcore_matias_bot";

const ReferralScreen = ({userId, onBack}) => {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState(false);

  // Посилання доступне одразу — не чекаємо API
  const refLink = data?.ref_link || `https://t.me/${BOT_USERNAME}?start=ref${userId}`;

  useEffect(() => {
    apiGet(`/api/client/${userId}/referral-stats`).then(r => {
      if(r?.ok) setData(r);
      else setErr(true);
    }).catch(()=>setErr(true));
  }, [userId]);

  const copyLink = () => {
    haptic("light");
    if(navigator.clipboard) {
      navigator.clipboard.writeText(refLink).then(()=>{
        setCopied(true);
        haptic("success");
        setTimeout(()=>setCopied(false), 2000);
      });
    }
  };

  const shareLink = () => {
    haptic("light");
    const text = encodeURIComponent("Тренуюсь з AI-тренером Матіасом у FitCore 💪 Приєднуйся — отримаєш 25 FitCoins при першій оплаті!");
    const url = encodeURIComponent(refLink);
    const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    if(tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else if(window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(shareUrl);
    } else {
      copyLink();
    }
  };

  return (
    <Scr>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <Card variant="accent" padding="20px">
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:44,lineHeight:"52px"}}>🎁</div>
          <div style={{fontSize:18,fontWeight:800,color:C.tm,marginTop:10,letterSpacing:-0.3}}>
            Реферальна програма
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{
            display:"flex",flexDirection:"row",alignItems:"flex-start",gap:10,
            background:"rgba(0,0,0,0.22)",borderRadius:10,padding:"11px 13px",
          }}>
            <div style={{fontSize:16,lineHeight:"20px",flexShrink:0,marginTop:1}}>👤</div>
            <div style={{fontSize:13,fontWeight:500,color:C.ts,lineHeight:1.55}}>
              Ти отримуєш{" "}
              <span style={{color:C.acc,fontWeight:800}}>50 FitCoins</span>
              {" "}після першої оплати друга
            </div>
          </div>

          <div style={{
            display:"flex",flexDirection:"row",alignItems:"flex-start",gap:10,
            background:"rgba(0,0,0,0.22)",borderRadius:10,padding:"11px 13px",
          }}>
            <div style={{fontSize:16,lineHeight:"20px",flexShrink:0,marginTop:1}}>🤝</div>
            <div style={{fontSize:13,fontWeight:500,color:C.ts,lineHeight:1.55}}>
              Твій друг отримує{" "}
              <span style={{color:C.acc,fontWeight:800}}>25 FitCoins</span>
              {" "}при першій оплаті
            </div>
          </div>
        </div>
      </Card>

      {/* ── Посилання ──────────────────────────────────────────── */}
      <Card variant="elevated" padding="16px">
        <div style={{fontSize:11,fontWeight:700,color:C.ts,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>
          Твоє посилання
        </div>
        <div style={{
          background:C.s2,borderRadius:8,padding:"10px 12px",
          fontFamily:"monospace",fontSize:11,color:C.ts,
          wordBreak:"break-all",lineHeight:1.6,
          border:`1px solid ${C.bc}`,marginBottom:12,
        }}>
          {refLink}
        </div>
        <div style={{display:"flex",flexDirection:"row",gap:8}}>
          <Btn variant="secondary" size="md" onClick={copyLink} style={{flex:1}}>
            {copied ? "✅ Скопійовано!" : "📋 Копіювати"}
          </Btn>
          <Btn variant="primary" size="md" onClick={shareLink} style={{flex:1}}>
            📤 Поділитись
          </Btn>
        </div>
      </Card>

      {/* ── Статистика ─────────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Card variant="elevated" padding="14px">
          <div style={{fontSize:11,fontWeight:700,color:C.ts,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>
            Друзів
          </div>
          {data
            ? <div style={{fontSize:24,fontWeight:900,color:C.acc,lineHeight:1,marginBottom:5}}>{data.total_referrals}</div>
            : <Skel h={24} style={{width:32,marginBottom:5}}/>
          }
          <div style={{fontSize:11,color:C.td,fontWeight:500}}>приєдналось</div>
        </Card>

        <Card variant="elevated" padding="14px">
          <div style={{fontSize:11,fontWeight:700,color:C.ts,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>
            FitCoins
          </div>
          {data
            ? <div style={{fontSize:24,fontWeight:900,color:C.acc,lineHeight:1,marginBottom:5}}>{data.coins_earned}</div>
            : <Skel h={24} style={{width:32,marginBottom:5}}/>
          }
          <div style={{fontSize:11,color:C.td,fontWeight:500}}>зароблено</div>
        </Card>
      </div>

      {/* ── Список рефералів ───────────────────────────────────── */}
      {data?.referrals?.length > 0 && (
        <Card variant="elevated" padding="16px">
          <div style={{fontSize:11,fontWeight:700,color:C.ts,textTransform:"uppercase",letterSpacing:0.8,marginBottom:12}}>
            Твої реферали
          </div>
          {data.referrals.map((r,i)=>(
            <div key={i} style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",
              paddingTop:9,paddingBottom:9,
              borderBottom:i<data.referrals.length-1?`1px solid ${C.bc}`:"none",
            }}>
              <span style={{fontSize:13,fontWeight:500,color:C.tm}}>{r.name}</span>
              <span style={{fontSize:11,fontWeight:500,color:C.ts}}>{r.date}</span>
            </div>
          ))}
        </Card>
      )}

      {err && (
        <div style={{textAlign:"center",padding:20,fontSize:13,color:C.ts}}>
          Не вдалось завантажити статистику
        </div>
      )}

    </Scr>
  );
};

// ═══════════════════════════════════════════════════════════════
// EЩЕ — хаб додаткових фіч
// ═══════════════════════════════════════════════════════════════
const MoreScreen = ({clientData, onNav}) => {
  const isVIP = clientData?.plan === "vip";
  const isTrial = clientData?.status === "trial";
  const isActive = clientData?.status === "active";
  const items = [
    ...(isActive ? [{id:"menu", icon:"📦", title:"Змінити або продовжити пакет", desc:"Обери новий тариф або продовж поточний", locked:false}] : []),
    {id:"referral", icon:"🎁", title:"Запроси друга", desc:"Поділись реферальним посиланням — отримай FitCoins", locked:false},
    {id:"photos", icon:"📸", title:"Прогрес у фото", desc:"Роби фото щотижня і бачь реальну різницю", locked:false},
    {id:"schedule", icon:"📅", title:"Календар тренувань", desc:"Обери дні + нагадування за 5 годин", locked:false},
    {id:"progress", icon:"📊", title:"Чекіни і прогрес", desc:"Повна історія твоїх показників", locked:false},
    {id:"macros", icon:"🧮", title:"КБЖУ калькулятор", desc:"Розрахуй персональну норму калорій і макросів", locked:false},
    {
      id:"recipes",
      icon:"🍽",
      title:"Рецепти під КБЖУ",
      desc: isVIP ? "Персональні рецепти від AI" : isTrial ? "✨ Доступно на пробному (1 категорія/день)" : "Доступно на VIP",
      locked: !(isVIP || isTrial),
      vipBadge: isTrial,
    },
  ];
  return(
    <Scr>
      <div>
        <SectionLabel accent>Розширені можливості</SectionLabel>
        <H level={1}>Додатково</H>
      </div>
      <div className="stg" style={{display:"flex",flexDirection:"column",gap:SP[2]}}>
      {items.map(it=>(
        <Card key={it.id} variant="elevated" padding={"14px 16px"}
          onClick={()=>{if(!it.locked){haptic("light");onNav(it.id);}}}
          style={{
            display:"flex",alignItems:"center",gap:14,
            opacity:it.locked?0.55:1,
            cursor:it.locked?"default":"pointer",
          }}>
          <div style={{
            width:48,height:48,borderRadius:R.md,
            background:C.gradAccSubtle,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:24,flexShrink:0,
          }}>{it.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:800,color:C.tm,display:"flex",alignItems:"center",gap:6,letterSpacing:-0.1}}>
              {it.title}
              {it.locked && <span style={{fontSize:9,color:"#d8b4fe",background:"rgba(168,85,247,0.15)",border:"1px solid rgba(168,85,247,0.3)",padding:"2px 7px",borderRadius:R.sm,fontWeight:800,letterSpacing:0.5}}>VIP</span>}
              {it.vipBadge && !it.locked && <span style={{fontSize:9,color:C.acc,background:C.accDim,border:"1px solid rgba(200,245,58,0.3)",padding:"2px 7px",borderRadius:R.sm,fontWeight:800,letterSpacing:0.5}}>TRIAL</span>}
            </div>
            <div style={{fontSize:12,color:C.ts,marginTop:3,lineHeight:1.4}}>{it.desc}</div>
          </div>
          {!it.locked && <div style={{color:C.ts,fontSize:22,fontWeight:300,flexShrink:0}}>›</div>}
        </Card>
      ))}
      </div>
    </Scr>
  );
};

// ═══ TRAINING PLAN ═══
// ═══════════════════════════════════════════════════════════════
// LEADERBOARD — рейтинг клієнтів за кількістю босів
// ═══════════════════════════════════════════════════════════════
const Leaderboard = ({userId}) => {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState({leaderboard: [], my_position: null});
  const [bossProgress, setBossProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bossOpen, setBossOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiGet(`/api/leaderboard?period=${period}`),
      apiGet(`/api/client/${userId}/boss-progress`),
    ]).then(([lb, bp]) => {
      if (cancelled) return;
      setData(lb || {leaderboard: [], my_position: null});
      setBossProgress(bp || null);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [userId, period]);

  if (loading) return <Spin/>;

  const lb = data.leaderboard || [];
  const myPos = data.my_position;
  const me = lb.find(r => r.user_id === userId);
  const bp = bossProgress?.current_week || {};

  const medal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}.`;
  };

  return (
    <Scr>
      <div>
        <SectionLabel accent>FitCore community</SectionLabel>
        <H level={1}>Рейтинг 🏆</H>
        <div style={{fontSize:F.body.size,color:C.ts,lineHeight:1.55,marginTop:6}}>
          Хто більше виконує "босів тижня" — той вище у списку
        </div>
      </div>

      {/* Period switcher */}
      <div style={{display:"flex",gap:6,background:C.s2,borderRadius:R.full,padding:4}}>
        {[["all","Весь час"],["month","Місяць"],["week","Тиждень"]].map(([v,l])=>{
          const active = period===v;
          return (
            <button key={v} onClick={()=>{haptic("selection");setPeriod(v);}} style={{
              flex:1,
              background:active?C.gradAcc:"transparent",
              color:active?"#0a0a0a":C.ts,
              border:"none",borderRadius:R.full,
              padding:"8px 0",fontSize:12,fontWeight:800,
              cursor:"pointer",
              transition:`all ${T.fast} ${E.out}`,
            }}>{l}</button>
          );
        })}
      </div>

      {/* Boss of the week — collapsible info + progress */}
      <div style={{background:C.s1,border:`1px solid ${bossOpen?"rgba(200,245,58,0.55)":"rgba(200,245,58,0.22)"}`,borderRadius:R.lg,overflow:"hidden",transition:`border-color ${T.fast} ${E.out}`}}>

        {/* Header — tap to toggle */}
        <div onClick={()=>{haptic("light");setBossOpen(o=>!o);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:15}}>🏆</span>
            <span style={{fontSize:14,fontWeight:800,color:C.tm}}>Бос тижня</span>
            {bp?.all_passed && <span style={{fontSize:10,color:C.acc,fontWeight:800,background:"rgba(200,245,58,0.15)",padding:"2px 8px",borderRadius:R.full,letterSpacing:.4}}>✅ ВИКОНАНО</span>}
          </div>
          <span style={{fontSize:12,color:C.ts,display:"inline-block",transition:`transform ${T.fast} ${E.out}`,transform:bossOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
        </div>

        {/* Compact progress bars — always visible when data exists */}
        {bossProgress && (
          <div style={{display:"flex",gap:6,padding:"0 12px 11px"}}>
            {[
              {ic:"💪",label:"Тренування",done:bp.workouts_done||0,req:bp.workouts_required||7,passed:bp.workouts_passed},
              {ic:"✓", label:"Чекіни",    done:bp.checkins_done||0, req:7,                    passed:bp.checkins_passed},
              {ic:"📱",label:"Активність",done:bp.days_active||0,   req:7,                    passed:bp.activity_passed},
            ].map((c,i)=>(
              <div key={i} style={{flex:1,background:C.s2,borderRadius:R.md,padding:"6px 8px",textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:800,color:c.passed?C.acc:C.tm}} className="num">{c.ic} {c.done}/{c.req}</div>
                <div style={{height:3,background:"rgba(0,0,0,0.4)",borderRadius:R.full,marginTop:5,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:R.full,width:`${Math.min(100,Math.round((c.done/c.req)*100))}%`,background:c.passed?C.gradAcc:"rgba(200,245,58,0.3)",transition:`width ${T.slow} ${E.out}`}}/>
                </div>
                <div style={{fontSize:9,color:c.passed?C.acc:C.ts,fontWeight:700,marginTop:3,letterSpacing:.3,textTransform:"uppercase"}}>{c.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded — conditions + rewards */}
        {bossOpen && (
          <div style={{padding:"12px 14px",borderTop:`1px solid ${C.bc}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.acc,letterSpacing:.7,textTransform:"uppercase",marginBottom:8}}>Умови</div>
            {[
              ["💪","Виконай усі тренування за тиждень (за планом)"],
              ["✓", "Зроби чекін кожен день (7/7)"],
              ["📱","Відкривай додаток щодня (7/7)"],
            ].map(([ic,txt],i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:i<2?7:0}}>
                <span style={{fontSize:14,flexShrink:0,lineHeight:1.45}}>{ic}</span>
                <span style={{fontSize:13,color:C.ts,lineHeight:1.45}}>{txt}</span>
              </div>
            ))}

            <div style={{fontSize:11,fontWeight:700,color:C.acc,letterSpacing:.7,textTransform:"uppercase",marginTop:14,marginBottom:8}}>Нагороди</div>
            {[
              [C.ts,      "Start · Premium","+5€ на наступну оплату · 1 безкоштовний рецепт"],
              ["#a78bfa","VIP",             "Персональна сесія з тренером"],
            ].map(([clr,plan,reward],i)=>(
              <div key={i} style={{background:C.s2,borderRadius:R.md,padding:"8px 10px",marginBottom:i===0?6:0}}>
                <div style={{fontSize:10,fontWeight:700,color:clr,letterSpacing:.5,textTransform:"uppercase",marginBottom:2}}>{plan}</div>
                <div style={{fontSize:12,fontWeight:700,color:C.tm}}>{reward}</div>
              </div>
            ))}

            {(bossProgress?.total_bosses_passed||0)>0 && (
              <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.bc}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:12,color:C.ts,fontWeight:600}}>Всього пройдено</div>
                <div style={{fontSize:16,fontWeight:900,color:C.tm}} className="num"><AnimatedNum value={bossProgress.total_bosses_passed}/> 🏆</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard list */}
      {lb.length === 0 ? (
        <Empty icon="🏆" title="Поки порожньо" subtitle="Будь першим хто виконає 'боса тижня'!"/>
      ) : (
        <div className="stg" style={{display:"flex",flexDirection:"column",gap:SP[2]}}>
          {lb.slice(0,50).map((r, idx) => {
            const rank = idx + 1;
            const isMe = r.user_id === userId;
            return (
              <Card key={r.user_id} variant={isMe?"accent":"elevated"} glow={isMe} padding={"10px 14px"} style={{
                display:"flex",alignItems:"center",gap:12,
                position:"relative",
              }}>
                <div style={{
                  width:32,textAlign:"center",
                  fontSize:rank<=3?20:14,fontWeight:900,
                  color:rank===1?"#FFD700":rank===2?"#C0C0C0":rank===3?"#CD7F32":C.ts,
                  flexShrink:0,
                }}>{medal(rank)}</div>
                <Ava name={r.full_name||"?"} size={36}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:isMe?900:700,color:C.tm,letterSpacing:-0.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {r.full_name || `User ${r.user_id}`}
                    {isMe && <span style={{fontSize:10,marginLeft:6,color:C.acc,fontWeight:800,background:"rgba(0,0,0,0.3)",padding:"2px 6px",borderRadius:R.sm,letterSpacing:0.4}}>ТИ</span>}
                  </div>
                  <div style={{fontSize:11,color:C.ts,fontWeight:600,display:"flex",gap:8,marginTop:2}}>
                    {r.streak > 0 && <span>🔥 {r.streak}</span>}
                    <span style={{textTransform:"uppercase",letterSpacing:0.4}}>{r.plan}</span>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:900,color:C.acc,letterSpacing:-0.4,lineHeight:1}} className="num">
                    {r.bosses_count || 0}
                  </div>
                  <div style={{fontSize:9,color:C.ts,fontWeight:700,letterSpacing:0.4,textTransform:"uppercase"}}>🏆</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* My position if not in top 50 */}
      {myPos && myPos > 50 && me && (
        <Card variant="accent" glow padding={"10px 14px"} style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
          <div style={{width:32,textAlign:"center",fontSize:14,fontWeight:900,color:C.ts}}>{myPos}.</div>
          <Ava name={me.full_name||"?"} size={36}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:900,color:C.tm,letterSpacing:-0.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {me.full_name} <span style={{fontSize:10,marginLeft:6,color:C.acc,fontWeight:800,background:"rgba(0,0,0,0.3)",padding:"2px 6px",borderRadius:R.sm}}>ТИ</span>
            </div>
            <div style={{fontSize:11,color:C.ts,fontWeight:600,marginTop:2}}>
              {me.bosses_count || 0} 🏆 · до топ-50: ще декілька босів
            </div>
          </div>
        </Card>
      )}
    </Scr>
  );
};

// ═══════════════════════════════════════════════════════════════
// PROGRESSION SUGGESTION — AI-рекомендація на новий тиждень
// ═══════════════════════════════════════════════════════════════
const ProgressionSuggestion = ({userId, onUpdate}) => {
  const [sug, setSug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet(`/api/client/${userId}/progression-suggestion`).then(r => {
      if (cancelled) return;
      setSug(r?.suggestion || null);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [userId]);

  const respond = async (action) => {
    if (!sug) return;
    setResponding(true);
    try {
      await apiPost(`/api/client/${userId}/progression-suggestion/${sug.id}/respond`, {action});
      haptic(action === "accept" ? "success" : "light");
      setSug(null);
      onUpdate && onUpdate();
    } catch (e) {
      alert("Помилка: " + e.message);
      setResponding(false);
    }
  };

  if (loading || !sug) return null;

  let recs = [];
  try { recs = JSON.parse(sug.recommendations || "[]"); } catch {}

  return (
    <Card variant="accent" glow padding={16} style={{position:"relative",overflow:"hidden",marginBottom:SP[3]}}>
      <div style={{position:"absolute",right:-15,top:-15,fontSize:90,opacity:0.08}}>🎯</div>
      <div style={{position:"relative",zIndex:1}}>
        <SectionLabel accent>AI-рекомендація · тиждень {sug.week_number}</SectionLabel>
        <div style={{fontSize:14,color:C.tm,fontWeight:700,lineHeight:1.5,marginTop:6,marginBottom:12}}>
          {sug.summary}
        </div>
        {recs.length > 0 && (
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
            {recs.slice(0,3).map((r,i) => (
              <div key={i} style={{padding:"10px 12px",background:"rgba(0,0,0,0.25)",borderRadius:R.sm,fontSize:13,color:C.tm,lineHeight:1.5}}>
                <div style={{fontWeight:800,color:C.acc,marginBottom:2,letterSpacing:-0.1}}>{r.exercise}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>
                  <b>{r.action}</b> — {r.reason}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <Btn variant="primary" size="sm" onClick={()=>respond("accept")} loading={responding} hapticKind="success">
            ✓ Прийняти
          </Btn>
          <Btn variant="ghost" size="sm" onClick={()=>respond("decline")} disabled={responding} hapticKind="light">
            Залишити як є
          </Btn>
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════
// WORKOUT SCREEN — тренувальний режим (записати ваги, таймер, прогрес)
// ═══════════════════════════════════════════════════════════════

const WorkoutScreen = ({userId, day, weekNumber, onClose}) => {
  const [sessionId, setSessionId] = useState(null);
  const [lastWeights, setLastWeights] = useState({});
  const [logged, setLogged] = useState({});  // { exercise_name: {weight, sets_done} }
  const [exercises, setExercises] = useState([]);   // local state per ex
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  // Timer state — таймер прив'язаний до конкретної картки idx
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPreset, setTimerPreset] = useState(90);
  const [activeTimerForIdx, setActiveTimerForIdx] = useState(null);
  const timerRef = useRef(null);
  const wakeLockRef = useRef(null);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.28, 0.56].forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(1.0, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.25);
      });
    } catch {}
  };

  const acquireWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {}
  };

  const releaseWakeLock = () => {
    try { wakeLockRef.current?.release(); } catch {}
    wakeLockRef.current = null;
  };

  // Load lastWeights and start session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lw, tp, ss] = await Promise.all([
          apiGet(`/api/client/${userId}/workout/last-weights`).catch(()=>({last_weights:{}})),
          apiGet(`/api/client/${userId}/workout/today-progress`).catch(()=>({logged:[]})),
          apiPost(`/api/client/${userId}/workout/start`, {
            day_label: day?.day || "",
            week_number: weekNumber || 1,
            exercises_total: (day?.exercises||[]).length,
          }).catch(()=>null),
        ]);
        if (cancelled) return;
        setLastWeights(lw?.last_weights || {});
        const lm = {};
        (tp?.logged || []).forEach(l => {
          lm[l.exercise_name] = {
            weight_kg: l.weight_kg,
            sets_done: l.sets_done,
            sets_planned: l.sets_planned,
          };
        });
        setLogged(lm);
        setSessionId(ss?.session_id || null);
        // Initialize exercises with last weight as default
        const exs = (day?.exercises || []).map(ex => {
          const prev = (lw?.last_weights || {})[ex.name];
          const already = lm[ex.name];
          return {
            ...ex,
            currentWeight: already?.weight_kg ?? prev?.weight_kg ?? 0,
            setsDone: already?.sets_done || 0,
            setsPlanned: parseInt(ex.sets) || 4,
            skipped: false,
            saved: !!already,
          };
        });
        setExercises(exs);
        setLoading(false);
      } catch (e) {
        console.error("Workout init:", e);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [userId, day?.day, weekNumber]);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setTimerActive(false);
            setActiveTimerForIdx(null);
            haptic("warning");
            try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("warning"); } catch {}
            playBeep();
            releaseWakeLock();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerActive, timerSeconds]);

  const startTimer = (sec, idx) => {
    setTimerSeconds(sec);
    setTimerActive(true);
    setTimerPreset(sec);
    setActiveTimerForIdx(idx);
    haptic("light");
    acquireWakeLock();
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
    setActiveTimerForIdx(null);
    releaseWakeLock();
    haptic("light");
  };

  // Update single exercise field
  const updateEx = (idx, patch) => {
    setExercises(arr => arr.map((e,i) => i===idx ? {...e, ...patch} : e));
  };

  // Save exercise log
  const saveExercise = async (idx) => {
    const ex = exercises[idx];
    if (!ex) return;
    haptic("medium");
    try {
      await apiPost(`/api/client/${userId}/workout/log-exercise`, {
        exercise_name: ex.name,
        weight_kg: ex.currentWeight,
        sets_done: ex.setsDone,
        sets_planned: ex.setsPlanned,
        reps_planned: ex.reps || "",
        day_label: day?.day || "",
        week_number: weekNumber || 1,
        workout_date: new Date().toISOString().slice(0,10),
      });
      updateEx(idx, {saved: true});
      haptic("success");
    } catch (e) {
      alert("Помилка збереження: " + e.message);
    }
  };

  const finishWorkout = async () => {
    setFinishing(true);
    const done = exercises.filter(e => e.saved && !e.skipped).length;
    try {
      await apiPost(`/api/client/${userId}/workout/finish`, {
        session_id: sessionId,
        exercises_done: done,
      });
      haptic("success");
      onClose && onClose();
    } catch (e) {
      alert("Помилка: " + e.message);
      setFinishing(false);
    }
  };

  if (loading) return <Spin/>;

  const totalEx = exercises.length;
  const doneEx = exercises.filter(e => e.saved && !e.skipped).length;
  const progress = totalEx > 0 ? (doneEx / totalEx) * 100 : 0;

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      {/* Header — назва дня + прогрес */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bc}`,background:"rgba(10,10,10,0.7)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"relative",zIndex:5}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={()=>{haptic("light");onClose&&onClose();}} style={{background:"transparent",border:"none",color:C.acc,fontSize:14,fontWeight:700,padding:0,cursor:"pointer"}}>← Назад до плану</button>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <H level={2} style={{margin:0}}>{day?.day || "Тренування"}</H>
          <div style={{fontSize:12,color:C.acc,fontWeight:800,padding:"4px 10px",background:C.gradAccSubtle,borderRadius:R.full,border:"1px solid rgba(200,245,58,0.25)"}}>{doneEx}/{totalEx}</div>
        </div>
        {day?.muscle_group && <div style={{fontSize:13,color:C.ts,fontWeight:600}}>{day.muscle_group}</div>}
        {/* Progress bar */}
        <div style={{height:4,background:C.s2,borderRadius:R.full,overflow:"hidden",marginTop:10}}>
          <div style={{height:"100%",width:`${progress}%`,background:C.gradAcc,borderRadius:R.full,transition:`width ${T.slow} ${E.out}`,boxShadow:"0 0 10px rgba(200,245,58,0.5)"}}/>
        </div>
      </div>

      {/* Body — список вправ */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px 80px",display:"flex",flexDirection:"column",gap:SP[2]}}>
        {exercises.map((ex, idx) => {
          const prev = lastWeights[ex.name];
          const isSaved = ex.saved && !ex.skipped;
          const isSkipped = ex.skipped;
          return (
            <Card key={idx} variant={isSaved?"accent":isSkipped?"flat":"elevated"} padding={14} style={{opacity:isSkipped?0.5:1,transition:`opacity ${T.base}`}}>
              {/* Header: name + sets + skip menu */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:C.tm,letterSpacing:-0.2,lineHeight:1.3,marginBottom:3}}>{ex.name}</div>
                  <div style={{fontSize:11,color:C.ts,fontWeight:600}}>
                    {ex.setsPlanned}×{ex.reps}
                    {prev?.weight_kg ? <span style={{color:C.amber,marginLeft:8}}>· минуло: <span className="num" style={{fontWeight:800}}>{prev.weight_kg}</span> кг</span> : null}
                  </div>
                </div>
                <button onClick={()=>{haptic("warning");updateEx(idx, {skipped: !ex.skipped, saved: ex.skipped?ex.saved:false});}}
                  style={{background:isSkipped?"rgba(255,85,85,0.1)":"transparent",border:`1px solid ${isSkipped?C.red:C.bc}`,color:isSkipped?C.red:C.ts,borderRadius:R.sm,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  {isSkipped?"↻ Повернути":"× Пропустити"}
                </button>
              </div>

              {!isSkipped && <>
                {/* Weight controls */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <button onClick={()=>{haptic("light");updateEx(idx, {currentWeight: Math.max(0, (Number(ex.currentWeight)||0) - 2.5), saved:false});}}
                    style={{width:38,height:38,background:C.s2,border:`1px solid ${C.bc}`,color:C.acc,fontSize:18,fontWeight:900,borderRadius:R.md,cursor:"pointer",flexShrink:0}}>−</button>
                  <div style={{flex:1,background:C.s2,border:`1px solid ${C.bc}`,borderRadius:R.md,padding:"8px 10px",textAlign:"center"}}>
                    <input type="number" inputMode="decimal" step="0.5"
                      value={ex.currentWeight || ""}
                      onChange={e=>updateEx(idx, {currentWeight: parseFloat(e.target.value)||0, saved:false})}
                      placeholder="0"
                      style={{width:"100%",background:"none",color:C.tm,fontSize:22,fontWeight:900,textAlign:"center",border:"none",outline:"none",letterSpacing:-0.6}}
                      className="num"/>
                    <div style={{fontSize:10,color:C.ts,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginTop:-2}}>кг</div>
                  </div>
                  <button onClick={()=>{haptic("light");updateEx(idx, {currentWeight: (Number(ex.currentWeight)||0) + 2.5, saved:false});}}
                    style={{width:38,height:38,background:C.s2,border:`1px solid ${C.bc}`,color:C.acc,fontSize:18,fontWeight:900,borderRadius:R.md,cursor:"pointer",flexShrink:0}}>+</button>
                </div>

                {/* Sets done checkboxes + edit count */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginBottom:10}}>
                  <div style={{display:"flex",gap:6,flex:1}}>
                    {Array.from({length: Math.max(1, ex.setsPlanned)}).map((_,k) => {
                      const checked = k < ex.setsDone;
                      return (
                        <button key={k} onClick={()=>{
                          haptic("selection");
                          // Toggle: tap to fill up to that index, tap on filled — uncheck after
                          const newCount = checked ? k : k+1;
                          updateEx(idx, {setsDone: newCount, saved:false});
                        }}
                        style={{
                          flex:1,
                          height:34,
                          background: checked ? C.gradAcc : C.s2,
                          color: checked ? "#0a0a0a" : C.ts,
                          border: checked ? "none" : `1px solid ${C.bc}`,
                          borderRadius: R.sm,
                          fontSize:12,fontWeight:800,
                          cursor:"pointer",
                          boxShadow: checked ? SH.sm : "none",
                          transition: `all ${T.fast} ${E.out}`,
                        }}>{checked ? "✓" : k+1}</button>
                      );
                    })}
                  </div>
                  {/* Sets count adjuster */}
                  <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:8,fontSize:11,color:C.ts,fontWeight:700}}>
                    <button onClick={()=>{if(ex.setsPlanned>1){haptic("light");updateEx(idx, {setsPlanned: ex.setsPlanned-1, setsDone: Math.min(ex.setsDone, ex.setsPlanned-1), saved:false});}}}
                      style={{width:24,height:24,background:C.s2,border:`1px solid ${C.bc}`,color:C.ts,borderRadius:R.sm,fontSize:12,fontWeight:900,cursor:"pointer"}}>−</button>
                    <span style={{minWidth:14,textAlign:"center"}} className="num">{ex.setsPlanned}</span>
                    <button onClick={()=>{if(ex.setsPlanned<8){haptic("light");updateEx(idx, {setsPlanned: ex.setsPlanned+1, saved:false});}}}
                      style={{width:24,height:24,background:C.s2,border:`1px solid ${C.bc}`,color:C.ts,borderRadius:R.sm,fontSize:12,fontWeight:900,cursor:"pointer"}}>+</button>
                  </div>
                </div>

                {/* Save button */}
                <Btn variant={isSaved?"success":"secondary"} size="sm" onClick={()=>saveExercise(idx)} hapticKind={isSaved?"light":"success"}>
                  {isSaved ? "✓ Збережено · оновити" : "Зберегти результат"}
                </Btn>

                {/* Rest timer — у самій картці вправи */}
                <div style={{marginTop:10,padding:"10px 12px",background:C.s2,borderRadius:R.md,border:`1px solid ${activeTimerForIdx===idx?C.acc:C.bc}`,transition:`border-color ${T.fast} ${E.out}`}}>
                  {activeTimerForIdx===idx && timerActive ? (
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontSize:11,color:C.ts,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>⏱</div>
                      <div style={{fontSize:22,fontWeight:900,color:timerSeconds<10?C.red:C.acc,letterSpacing:-0.8,lineHeight:1,minWidth:62}} className="num">{fmtTime(timerSeconds)}</div>
                      <div style={{flex:1,height:5,background:C.s3,borderRadius:R.full,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(timerSeconds/timerPreset)*100}%`,background:timerSeconds<10?C.red:C.gradAcc,borderRadius:R.full,transition:"width 0.95s linear"}}/>
                      </div>
                      <button onClick={()=>stopTimer()} style={{width:32,height:32,background:"rgba(255,85,85,0.1)",border:`1px solid rgba(255,85,85,0.25)`,color:C.red,borderRadius:R.sm,fontSize:12,fontWeight:900,cursor:"pointer",flexShrink:0}}>×</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{fontSize:10,color:C.ts,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginRight:2}}>⏱ Відпочинок</div>
                      {[60, 90, 120].map(s => (
                        <button key={s} onClick={()=>startTimer(s, idx)} style={{flex:1,height:30,background:C.s3,border:`1px solid ${C.bc}`,color:C.tm,borderRadius:R.sm,fontSize:12,fontWeight:800,cursor:"pointer"}} className="num">{s}с</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note / technique */}
                {ex.technique && <div style={{fontSize:11,color:"rgba(200,245,58,0.7)",marginTop:8,lineHeight:1.5,fontStyle:"italic"}}>💡 {ex.technique}</div>}
              </>}
            </Card>
          );
        })}

        {/* Finish button */}
        {totalEx > 0 && (
          <Btn variant="primary" size="lg" onClick={()=>setShowFinish(true)} hapticKind="medium" style={{marginTop:16}}>
            ✓ Завершити тренування
          </Btn>
        )}
      </div>



      {/* Finish confirmation */}
      {showFinish && (
        <div onClick={()=>setShowFinish(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(20px) saturate(140%)",WebkitBackdropFilter:"blur(20px) saturate(140%)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:20}}>
          <Card onClick={e=>e.stopPropagation()} variant="elevated" padding={20} style={{maxWidth:340,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:8}}>{doneEx===totalEx?"🔥":doneEx>0?"💪":"🤔"}</div>
            <H level={2} style={{textAlign:"center",marginBottom:8}}>Завершити тренування?</H>
            <div style={{fontSize:14,color:C.ts,marginBottom:16,lineHeight:1.55}}>
              Виконано <b style={{color:C.acc,fontWeight:800}}>{doneEx} з {totalEx}</b> вправ.
              {doneEx<totalEx && <><br/>Незавершені вправи будуть пропущені.</>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Btn variant="primary" size="md" onClick={finishWorkout} loading={finishing} hapticKind="success">
                ✓ Завершити
              </Btn>
              <Btn variant="ghost" size="md" onClick={()=>setShowFinish(false)} hapticKind="light">
                Продовжити
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const TrainPlan = ({userId}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  const [gen,setGen]=useState(false);
  const [genErr,setGenErr]=useState("");
  const [selEx,setSelEx]=useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null); // { day, weekNumber }
  const load=useCallback(async()=>{
    try{setLoad(true);const r=await apiGet(`/api/client/${userId}/plan`);setData(r.plan);}
    catch(e){console.error(e);}finally{setLoad(false);}
  },[userId]);
  useEffect(()=>{load();},[load]);
  const generate=async()=>{
    setGen(true);setGenErr("");
    try{await apiPost(`/api/client/${userId}/generate-plan`,{});await load();}
    catch(e){setGenErr(e.message);}
    setGen(false);
  };
  if(loading)return <Spin/>;
  if(!data)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"0 24px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.ts,textAlign:"center"}}>План ще не готовий</div>
      {genErr&&<div style={{fontSize:14,color:"#ff6b6b",textAlign:"center",padding:"8px 16px",background:"rgba(255,107,107,0.1)",borderRadius:10}}>{genErr}</div>}
      <PBtn onClick={generate} loading={gen} style={{maxWidth:260}}>{gen?"Генерую...":"Згенерувати план"}</PBtn>
    </div>
  );
  let days=[],weekNote="";
  try{const p=JSON.parse(data.plan_text||"{}");days=p.training?.days||[];weekNote=p.training?.week_note||"";}catch{}

  // Якщо активне тренування — показуємо WorkoutScreen замість плану
  if (activeWorkout) {
    return <WorkoutScreen
      userId={userId}
      day={activeWorkout.day}
      weekNumber={data.week_number || 1}
      onClose={()=>setActiveWorkout(null)}
    />;
  }

  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:200,flexShrink:0,overflow:"hidden"}}>
        <img src={PHOTOS.trainer_plan} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
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
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px 110px",display:"flex",flexDirection:"column",gap:10}}>
        <ProgressionSuggestion userId={userId} onUpdate={load}/>
        {days.length>0?days.map((d,i)=>{
          const hasExercises = (d.exercises||[]).length>0;
          return (
          <div key={i} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,overflow:"hidden"}}>
            <div style={{background:C.s2,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.bc}`}}>
              <div style={{fontSize:17,fontWeight:800,color:C.tm}}>{d.day}</div>
              {d.muscle_group&&<div style={{fontSize:11,color:"#0a0a0a",background:C.acc,padding:"4px 12px",borderRadius:20,fontWeight:800}}>{d.muscle_group}</div>}
            </div>
            {hasExercises&&(
              <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {(d.exercises||[]).map((ex,j)=>(
                  <div key={j}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:C.acc,flexShrink:0}}/>
                        <div style={{fontSize:14,color:C.tm}}>{ex.name}</div>
                        {getExTip(ex.name)&&(
                          <div onClick={e=>{e.stopPropagation();setSelEx(ex);}}
                            style={{fontSize:10,color:"#0a0a0a",background:C.acc,borderRadius:6,padding:"1px 7px",fontWeight:900,flexShrink:0,cursor:"pointer",userSelect:"none"}}>?</div>
                        )}
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
            {!hasExercises&&<div style={{padding:"12px 16px",fontSize:14,color:C.ts}}>День відпочинку · активне відновлення</div>}
            {/* Кнопка Почати тренування */}
            {hasExercises && (
              <div style={{padding:"0 16px 12px"}}>
                <Btn variant="primary" size="md" onClick={()=>{haptic("medium");setActiveWorkout({day: d, weekNumber: data.week_number || 1});}} hapticKind="medium">
                  ▶ Почати тренування
                </Btn>
              </div>
            )}
          </div>
          );
        }):(
          <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
            <div style={{fontSize:14,color:C.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.plan_text}</div>
          </div>
        )}
        {weekNote&&<div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:14,padding:"12px 14px",display:"flex",gap:8}}>
          <div style={{width:3,background:C.acc,borderRadius:2,flexShrink:0}}/>
          <div style={{fontSize:13,color:C.ts,lineHeight:1.6}}>{weekNote}</div>
        </div>}
      </div>
      {selEx&&<ExModal ex={selEx} onClose={()=>setSelEx(null)}/>}
    </div>
  );
};

// ═══ NUTRITION ═══
const Nutrition = ({userId, questionnaire}) => {
  const [data,setData]=useState(null);
  const [loading,setLoad]=useState(true);
  useEffect(()=>{apiGet(`/api/client/${userId}/plan`).then(r=>{setData(r.plan);setLoad(false);}).catch(()=>setLoad(false));},[userId]);
  if(loading)return <Spin/>;
  if(!data)return <Scr><div style={{padding:"50px 0",textAlign:"center",color:C.ts,fontSize:15}}>Харчування не призначено</div></Scr>;
  let nut=null;
  try{const p=JSON.parse(data.plan_text||"{}");nut=p.nutrition||null;}catch{}
  if(!nut)return <Scr><div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}><div style={{fontSize:14,color:C.tm,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.nutrition_text||"Не знайдено"}</div></div></Scr>;
  // Реальні % від КБЖУ-норми: якщо є questionnaire — відносно цілей, інакше — відносно калорій плану
  const tProt = questionnaire?.protein_g || 0;
  const tFat  = questionnaire?.fat_g    || 0;
  const tCarb = questionnaire?.carbs_g  || 0;
  const totalCal = (nut.protein||0)*4 + (nut.fat||0)*9 + (nut.carbs||0)*4 || 1;
  const pProt = tProt ? Math.min(100,Math.round((nut.protein||0)/tProt*100)) : Math.round((nut.protein||0)*4/totalCal*100);
  const pFat  = tFat  ? Math.min(100,Math.round((nut.fat||0)/tFat*100))    : Math.round((nut.fat||0)*9/totalCal*100);
  const pCarb = tCarb ? Math.min(100,Math.round((nut.carbs||0)/tCarb*100)) : Math.round((nut.carbs||0)*4/totalCal*100);
  const macros=[{l:"Білок",v:`${nut.protein}г`,pct:pProt,c:C.acc},{l:"Жири",v:`${nut.fat}г`,pct:pFat,c:C.amber},{l:"Вуглеводи",v:`${nut.carbs}г`,pct:pCarb,c:C.blue}];
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
  const [showHero,setShowHero] = useState(false);
  const submit=async()=>{
    if(!w||!e)return;setLoad(true);
    try{
      const r=await apiPost(`/api/client/${userId}/checkin`,{weight_kg:parseFloat(w),energy_level:e,sleep_hours:s?parseFloat(s):null,comment:c||null});
      setResult(r);
      setShowHero(true);
    }
    catch(err){alert("Помилка: "+err.message);}
    setLoad(false);
  };
  if(showHero && result) return (
    <>
      <HeroMoment
        title={`+1 ДЕНЬ СТРІКУ!`}
        subtitle={`${result.streak} ${result.streak === 1 ? "день" : result.streak < 5 ? "дні" : "днів"} підряд 🔥`}
        icon="✓"
        color={C.acc}
        duration={2400}
        onClose={() => setShowHero(false)}
      />
      <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 24px",opacity:0.3}}>
        {/* Background placeholder */}
      </div>
    </>
  );
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
      {/* BENTO: hero — стрік на повну ширину з вогником */}
      <Card variant="accent" glow padding={18} style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-10,top:-20,fontSize:120,opacity:0.08,filter:"blur(2px)"}}>🔥</div>
        <SectionLabel accent style={{marginBottom:8}}>Поточний стрік</SectionLabel>
        <div style={{display:"flex",alignItems:"baseline",gap:8,position:"relative",zIndex:1}}>
          <span style={{fontSize:56,fontWeight:900,color:C.acc,letterSpacing:-2.4,lineHeight:1}} className="num">
            <AnimatedNum value={data.streak||0}/>
          </span>
          <span style={{fontSize:18,color:C.ts,fontWeight:800}}>{data.streak===1?"день":data.streak<5?"дні":"днів"}</span>
        </div>
        <div style={{fontSize:12,color:C.ts,marginTop:6,fontWeight:600}}>тренуєшся регулярно — продовжуй!</div>
      </Card>

      {/* Bento row: Старт | Зараз | Прогрес */}
      <div className="stg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gridAutoRows:"minmax(80px,auto)",gap:SP[2]}}>
        {/* Старт */}
        <Card variant="elevated" padding={14}>
          <SectionLabel>Старт</SectionLabel>
          <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
            {data.start_weight ? (
              <><span style={{fontSize:24,fontWeight:900,color:C.ts,letterSpacing:-0.6,lineHeight:1.1}} className="num">{data.start_weight}</span>
              <span style={{fontSize:11,color:C.ts,fontWeight:700}}>кг</span></>
            ) : <span style={{fontSize:24,fontWeight:900,color:C.td}}>—</span>}
          </div>
        </Card>

        {/* Зараз */}
        <Card variant="elevated" padding={14}>
          <SectionLabel>Зараз</SectionLabel>
          <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
            {data.last_weight ? (
              <><span style={{fontSize:24,fontWeight:900,color:C.acc,letterSpacing:-0.6,lineHeight:1.1}} className="num">
                <AnimatedNum value={Number(data.last_weight)} decimals={(""+data.last_weight).includes(".")?1:0}/>
              </span><span style={{fontSize:11,color:C.ts,fontWeight:700}}>кг</span></>
            ) : <span style={{fontSize:24,fontWeight:900,color:C.td}}>—</span>}
          </div>
        </Card>

        {/* Прогрес — на 2 колонки, з градієнтом */}
        <Card variant={data.start_weight&&data.last_weight?"accent":"elevated"} padding={14} style={{gridColumn:"span 2"}}>
          <SectionLabel accent={!!(data.start_weight&&data.last_weight)}>Прогрес</SectionLabel>
          {data.start_weight && data.last_weight ? (
            <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
              <span style={{fontSize:30,fontWeight:900,color:Math.round((data.last_weight-data.start_weight)*10)/10<0?C.acc:C.amber,letterSpacing:-1,lineHeight:1}} className="num">
                {Math.round((data.last_weight-data.start_weight)*10)/10>0?"+":""}<AnimatedNum value={Math.round((data.last_weight-data.start_weight)*10)/10} decimals={1}/>
              </span>
              <span style={{fontSize:14,color:C.ts,fontWeight:700}}>кг</span>
              <span style={{fontSize:13,color:C.ts,marginLeft:"auto"}}>{Math.round((data.last_weight-data.start_weight)*10)/10<0?"💪 рухаєшся вниз":"↗ рухаєшся вгору"}</span>
            </div>
          ) : (
            <div style={{fontSize:24,fontWeight:900,color:C.td,marginTop:4}}>—</div>
          )}
        </Card>
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
const Profile = ({client,questionnaire,isAdmin,onAdminAccess,onCheckin,onBuyPlan,onSupplements,userId,onMacros}) => {
  const planV={start:"green",premium:"blue",vip:"purple",trial:"amber"};
  const [profileTab,setProfileTab]=useState(0);
  const [wallet, setWallet] = useState(null);
  const [bossInfo, setBossInfo] = useState(null);
  useEffect(() => {
    apiGet(`/api/client/${userId}/wallet`).then(r=>setWallet(r)).catch(()=>{});
    apiGet(`/api/client/${userId}/boss-progress`).then(r=>setBossInfo(r)).catch(()=>{});
  }, [userId]);
  const totalBosses = bossInfo?.total_bosses_passed || 0;
  const monthBosses = bossInfo?.month_bosses_passed || 0;
  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:220,flexShrink:0,overflow:"hidden"}}>
        <img className="parallax" src={PHOTOS.trainer_profile} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(10,10,10,0.2) 0%,rgba(10,10,10,0.5) 50%,rgba(10,10,10,0.95) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 18px",display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <SectionLabel accent style={{marginBottom:4,color:"rgba(200,245,58,0.85)"}}>МІЙ ПРОФІЛЬ</SectionLabel>
            <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-1,lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:8}}>
              {client?.full_name||"Клієнт"}
              {totalBosses > 0 && <span title={`${totalBosses} босів пройдено`} style={{fontSize:18,filter:"drop-shadow(0 0 8px rgba(200,245,58,0.5))"}}>🏆</span>}
            </div>
            {client?.username && <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:3,fontWeight:500}}>@{client.username}</div>}
          </div>
          <div style={{
            padding:"5px 12px",
            borderRadius:R.full,
            background:client?.plan==="vip"?"linear-gradient(135deg,#a855f7,#7e22ce)":client?.plan==="premium"?"linear-gradient(135deg,#4a9fdf,#2563eb)":client?.plan==="start"?"linear-gradient(135deg,#4ade80,#16a34a)":"linear-gradient(135deg,#e8a832,#ca8a04)",
            color:"#fff",fontSize:11,fontWeight:900,letterSpacing:0.6,
            boxShadow:SH.md,flexShrink:0,
          }}>
            {(client?.plan||"trial").toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 120px",display:"flex",flexDirection:"column",gap:SP[3]}}>
        <Card variant="elevated" padding={"14px 16px"} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <SectionLabel style={{marginBottom:2}}>Доступ</SectionLabel>
            <div style={{fontSize:14,color:C.tm,fontWeight:700}}>{(client?.status||"trial").toUpperCase()}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <SectionLabel style={{marginBottom:2}}>Діє до</SectionLabel>
            <div style={{fontSize:14,color:C.amber,fontWeight:700}}>{(client?.expires_at||"").slice(0,10)}</div>
          </div>
        </Card>

        {/* Bosses + FitCoins — gamification */}
        <div style={{display:"grid",gridTemplateColumns:totalBosses > 0 ? "1fr 1fr" : "1fr",gap:SP[2]}}>
          {totalBosses > 0 && (
            <Card variant="accent" glow padding={14}>
              <SectionLabel accent>Бос. за місяць</SectionLabel>
              <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
                <span style={{fontSize:30,fontWeight:900,color:C.acc,letterSpacing:-1,lineHeight:1.1}} className="num">
                  <AnimatedNum value={monthBosses}/>
                </span>
                <span style={{fontSize:18}}>🏆</span>
              </div>
              <div style={{fontSize:11,color:C.ts,marginTop:2,fontWeight:600}}>всього: <span className="num">{totalBosses}</span></div>
            </Card>
          )}
          <Card variant={(wallet?.balance_eur||0) > 0 ? "accent" : "elevated"} glow={(wallet?.balance_eur||0) > 0} padding={14}>
            <SectionLabel accent={(wallet?.balance_eur||0) > 0}>FitCoins</SectionLabel>
            <div style={{display:"flex",alignItems:"baseline",gap:4,marginTop:4}}>
              <span style={{fontSize:30,fontWeight:900,color:(wallet?.balance_eur||0) > 0 ? C.acc : C.td,letterSpacing:-1,lineHeight:1.1}} className="num">
                <AnimatedNum value={Math.floor(wallet?.balance_eur||0)}/>
              </span>
              <span style={{fontSize:14,color:(wallet?.balance_eur||0) > 0 ? C.acc : C.td,fontWeight:800}}>FC</span>
            </div>
            <div style={{fontSize:11,color:C.ts,marginTop:2,fontWeight:600,lineHeight:1.3}}>
              {(wallet?.balance_eur||0) > 0
                ? `= ${Math.floor(wallet.balance_eur)} ₴ знижки на підписку`
                : "запрошуй друзів → +50 FC"}
            </div>
          </Card>
        </div>
        <div style={{display:"flex",gap:7}}>
          {["Дані","Відгуки","Сповіщення"].map((t,i)=>(
            <button key={t} onClick={()=>setProfileTab(i)}
              style={{flex:1,padding:"9px 0",borderRadius:12,fontSize:13,fontWeight:700,background:profileTab===i?C.acc:C.s1,color:profileTab===i?"#080808":C.ts,border:`1px solid ${profileTab===i?C.acc:C.bc}`}}>
              {t}
            </button>
          ))}
        </div>
        {profileTab===0&&questionnaire&&(
          <div className="stg" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gridAutoRows:"minmax(80px,auto)",gap:SP[2]}}>
            {/* BIG: Цільова вага — 6 cols × 2 rows — hero card */}
            <Card variant="accent" glow padding={16} style={{gridColumn:"span 6",gridRow:"span 1",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-20,top:-20,fontSize:90,opacity:0.08}}>🎯</div>
              <div style={{position:"relative",zIndex:1}}>
                <SectionLabel accent>Ціль</SectionLabel>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:4}}>
                  <span style={{fontSize:36,fontWeight:900,color:C.tm,letterSpacing:-1.4,lineHeight:1}} className="num">
                    <AnimatedNum value={Number(questionnaire.target_weight)||0} decimals={(""+questionnaire.target_weight).includes(".")?1:0}/>
                  </span>
                  <span style={{fontSize:14,color:C.ts,fontWeight:700}}>кг</span>
                </div>
                {questionnaire.weight_kg && questionnaire.target_weight && (
                  <div style={{fontSize:12,color:C.ts,marginTop:4,fontWeight:600}}>
                    від {questionnaire.weight_kg} кг
                    <span style={{color:Number(questionnaire.target_weight)<Number(questionnaire.weight_kg)?C.acc:C.amber,marginLeft:6}}>
                      ({Number(questionnaire.target_weight)>Number(questionnaire.weight_kg)?"+":""}{Math.round((Number(questionnaire.target_weight)-Number(questionnaire.weight_kg))*10)/10})
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* MEDIUM: Вік — 2 cols */}
            <Card variant="elevated" padding={14} style={{gridColumn:"span 2"}}>
              <SectionLabel>Вік</SectionLabel>
              <div style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-0.6,lineHeight:1.1,marginTop:4}} className="num">{questionnaire.age||"—"}</div>
              <div style={{fontSize:11,color:C.ts,fontWeight:600,marginTop:1}}>років</div>
            </Card>

            {/* MEDIUM: Стать — 2 cols */}
            <Card variant="elevated" padding={14} style={{gridColumn:"span 2"}}>
              <SectionLabel>Стать</SectionLabel>
              <div style={{fontSize:18,fontWeight:800,color:C.tm,marginTop:6,letterSpacing:-0.3}}>
                {questionnaire.gender==="female"?"♀ Жінка":"♂ Чоловік"}
              </div>
            </Card>

            {/* MEDIUM: Вага — 2 cols */}
            <Card variant="elevated" padding={14} style={{gridColumn:"span 2"}}>
              <SectionLabel>Вага</SectionLabel>
              <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
                <span style={{fontSize:22,fontWeight:900,color:C.acc,letterSpacing:-0.6,lineHeight:1}} className="num">{questionnaire.weight_kg||"—"}</span>
                <span style={{fontSize:11,color:C.ts,fontWeight:700}}>кг</span>
              </div>
            </Card>

            {/* WIDE: Обладнання — 4 cols */}
            <Card variant="elevated" padding={14} style={{gridColumn:"span 4"}}>
              <SectionLabel>Обладнання</SectionLabel>
              <div style={{fontSize:15,fontWeight:800,color:C.tm,marginTop:4,letterSpacing:-0.2}}>
                {{"gym":"🏋 Тренажерний зал","home_dumbs":"🏠 Гантелі вдома","home_no_eq":"🛋 Без обладнання","outdoor":"🌳 Вулиця"}[questionnaire.equipment]||questionnaire.equipment||"—"}
              </div>
            </Card>

            {/* SMALL: Тренувань на тиждень — 2 cols */}
            <Card variant="elevated" padding={14} style={{gridColumn:"span 2",display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
              <SectionLabel>На тижд.</SectionLabel>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginTop:4}}>
                <span style={{fontSize:24,fontWeight:900,color:C.amber,letterSpacing:-0.6,lineHeight:1}} className="num">{questionnaire.workouts_pw||"—"}</span>
                <span style={{fontSize:14,color:C.ts,fontWeight:700}}>×</span>
              </div>
            </Card>

            {/* КБЖУ — full width */}
            {questionnaire?.calories_tdee > 0 ? (
              <Card variant="elevated" padding={14} style={{gridColumn:"span 6",display:"flex",alignItems:"center",gap:14}}>
                <div style={{flex:1}}>
                  <SectionLabel accent>Мій КБЖУ</SectionLabel>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
                    <span style={{fontSize:22,fontWeight:900,color:C.tm,letterSpacing:-0.6}} className="num">{questionnaire.calories_tdee}</span>
                    <span style={{fontSize:12,color:C.ts,fontWeight:600}}>ккал / день</span>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    {[{l:"Б",v:questionnaire.protein_g,c:C.acc},{l:"Ж",v:questionnaire.fat_g,c:C.amber},{l:"В",v:questionnaire.carbs_g,c:C.blue}].map(m=>(
                      <div key={m.l} style={{background:C.s2,borderRadius:R.sm,padding:"4px 8px",display:"flex",gap:4,alignItems:"baseline"}}>
                        <span style={{fontSize:11,color:m.c,fontWeight:800}}>{m.l}</span>
                        <span style={{fontSize:13,fontWeight:900,color:C.tm}} className="num">{m.v}</span>
                        <span style={{fontSize:10,color:C.ts}}>г</span>
                      </div>
                    ))}
                  </div>
                </div>
                {onMacros&&<button onClick={()=>{haptic("selection");onMacros();}} style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:R.md,padding:"8px 14px",color:C.ts,fontSize:12,fontWeight:700,flexShrink:0,cursor:"pointer"}}>Змінити</button>}
              </Card>
            ) : (
              <Card variant="elevated" padding={14} style={{gridColumn:"span 6",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <SectionLabel>КБЖУ не розраховано</SectionLabel>
                  <div style={{fontSize:12,color:C.ts,marginTop:3}}>Розрахуй персональну норму калорій</div>
                </div>
                {onMacros&&<button onClick={()=>{haptic("selection");onMacros();}} style={{background:C.gradAcc,border:"none",borderRadius:R.md,padding:"8px 14px",color:"#0a0a0a",fontSize:12,fontWeight:800,flexShrink:0,cursor:"pointer"}}>Розрахувати</button>}
              </Card>
            )}
          </div>
        )}
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
      {/* Hero — viruchka misjacja */}
      <Card variant="accent" padding={20} glow style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",background:C.acc,opacity:0.06,filter:"blur(20px)"}}/>
        <SectionLabel accent>Виручка місяця</SectionLabel>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:4}}>
          <span style={{fontSize:48,fontWeight:900,color:C.tm,letterSpacing:-2,lineHeight:1}} className="num">
            <AnimatedNum value={stats.revenue_month||0}/>
          </span>
          <span style={{fontSize:18,color:C.ts,fontWeight:700}}>₴</span>
        </div>
      </Card>

      <div className="stg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP[2]}}>
        {[
          ["Активні",     stats.active,           C.acc,   "💪"],
          ["Trial",        stats.trial,            C.amber, "⏳"],
          ["Очікують",     stats.pending,          C.red,   "🔔"],
          ["Чекіни сьогодні", stats.checkins_today, C.tm,   "✓"],
        ].map(([l,v,c,ic])=>(
          <Card key={l} variant="elevated" padding={14}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <SectionLabel style={{marginBottom:0}}>{l}</SectionLabel>
              <span style={{fontSize:14,opacity:0.6}}>{ic}</span>
            </div>
            <div style={{fontSize:30,fontWeight:900,color:c,letterSpacing:-1,lineHeight:1.1}} className="num">
              <AnimatedNum value={v||0}/>
            </div>
          </Card>
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
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
        {[["all","Всі"],["active","Активні"],["trial","Trial"],["pending_approval","Очікують"]].map(([v,l])=>{
          const active = filter===v;
          return (
          <button key={v} onClick={()=>{haptic("selection");setFilter(v);}}
            style={{
              padding:"8px 14px",borderRadius:R.full,
              border:active?"none":`1px solid ${C.bc}`,
              background:active?C.gradAcc:C.s1,
              color:active?"#0a0a0a":C.ts,
              fontSize:12,fontWeight:800,
              whiteSpace:"nowrap",flexShrink:0,
              boxShadow:active?SH.sm:"none",
              transition:`all ${T.base} ${E.out}`,
              letterSpacing:0.2,
            }}>{l}</button>
          );
        })}
      </div>
      <div style={{fontSize:12,color:C.ts,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>Знайдено: <span style={{color:C.tm}}>{filtered.length}</span></div>
      {loading ? <Spin/> : filtered.length===0 ? (
        <Empty icon="🔍" title="Нікого не знайдено" subtitle="Спробуй змінити фільтр або пошук"/>
      ) : (
      <div className="stg" style={{display:"flex",flexDirection:"column",gap:SP[2]}}>
      {filtered.map(c=>(
        <button key={c.user_id} onClick={()=>{haptic("light");onSelect(c);}}
          style={{
            background:C.s1,borderRadius:R.md,border:`1px solid ${C.bc}`,
            padding:"14px 16px",display:"flex",alignItems:"center",gap:12,
            width:"100%",textAlign:"left",
            transition:`transform ${T.fast} ${E.out}`,
            boxShadow:SH.inner,
          }}>
          <Ava name={c.full_name||"?"} size={46}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:800,color:C.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:-0.1}}>{c.full_name}</div>
            <div style={{fontSize:12,color:C.ts,marginTop:3,fontWeight:500}}>{c.username?`@${c.username}`:`ID ${c.user_id}`} · 🔥 {c.streak||0} днів</div>
          </div>
          <Bdg v={planV[c.plan]||"green"}>{(c.plan||"").toUpperCase()}</Bdg>
        </button>
      ))}
      </div>
      )}
    </Scr>
  );
};

// ═══ ADMIN: CLIENT DETAIL ═══
// ═══ Message Modal — персональне повідомлення клієнту ═══
const MessageModal = ({client, onClose}) => {
  const [text,setText] = useState("");
  const [sending,setSending] = useState(false);
  const [done,setDone] = useState(false);
  const [err,setErr] = useState("");
  const [visible,setVisible] = useState(false);

  useEffect(()=>{
    requestAnimationFrame(()=>setVisible(true));
    const prev=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=prev;};
  },[]);

  const handleClose=()=>{setVisible(false);setTimeout(onClose,160);};
  const send=async()=>{
    if(!text.trim()) return;
    setSending(true); setErr("");
    try{
      await apiPost(`/api/admin/message/${client.user_id}`,{text:text.trim()});
      setDone(true);
      setTimeout(handleClose, 1200);
    }catch(e){setErr(e.message||"Помилка");}
    setSending(false);
  };

  const overlay = (
    <div onClick={handleClose}
      style={{
        position:"fixed",inset:0,
        background:visible?"rgba(0,0,0,.7)":"rgba(0,0,0,0)",
        backdropFilter:visible?"blur(20px) saturate(140%)":"blur(0)",
        WebkitBackdropFilter:visible?"blur(20px) saturate(140%)":"blur(0)",
        zIndex:9999,
        display:"flex",alignItems:"center",justifyContent:"center",
        padding:16,
        transition:"background .18s ease-out, backdrop-filter .18s ease-out",
      }}>
      <div onClick={e=>e.stopPropagation()}
        style={{
          width:"100%",maxWidth:420,
          background:C.s1,borderRadius:18,
          border:`1px solid ${C.bc}`,padding:"18px",
          boxShadow:"0 16px 48px rgba(0,0,0,.6)",
          opacity:visible?1:0,
          transform:`scale(${visible?1:0.94})`,
          transition:"opacity .18s ease-out, transform .18s ease-out",
        }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:17,fontWeight:900,color:C.tm}}>Повідомлення клієнту</div>
            <div style={{fontSize:13,color:C.ts,marginTop:2}}>{client.full_name} {client.username?`· @${client.username}`:""}</div>
          </div>
          <button onClick={handleClose} style={{background:C.s2,border:`1px solid ${C.bc}`,borderRadius:10,width:30,height:30,color:C.ts,fontSize:18,flexShrink:0}}>×</button>
        </div>

        {done ? (
          <div style={{background:"rgba(200,245,58,.1)",border:"1px solid rgba(200,245,58,.3)",borderRadius:12,padding:"16px",fontSize:15,color:C.acc,fontWeight:700,textAlign:"center"}}>
            ✓ Повідомлення надіслано
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder="Текст повідомлення..."
              rows={5}
              style={{width:"100%",background:C.s2,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px 14px",color:C.tm,fontSize:15,lineHeight:1.6,resize:"none",fontFamily:"inherit",boxSizing:"border-box"}}
            />
            {err && <div style={{color:C.red,fontSize:13,marginTop:8}}>{err}</div>}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={handleClose} style={{flex:1,background:C.s2,color:C.ts,border:`1px solid ${C.bc}`,borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:700}}>Скасувати</button>
              <button onClick={send} disabled={!text.trim()||sending} style={{flex:2,background:C.acc,color:"#0a0a0a",border:"none",borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:800,opacity:(!text.trim()||sending)?.5:1}}>
                {sending?"Надсилаю...":"Надіслати"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};


// ═══════════════════════════════════════════════════════════════
// АДМІН ЧАТ — діалоги з клієнтами
// ═══════════════════════════════════════════════════════════════
const AdminChat = () => {
  const [convs,setConvs] = useState([]);
  const [sel,setSel] = useState(null);
  const [messages,setMsgs] = useState([]);
  const [input,setInput] = useState("");
  const [loading,setLoad] = useState(true);
  const [sending,setSend] = useState(false);
  const scrollRef = useRef();

  const loadList = async()=>{
    try{
      const r = await apiGet("/api/admin/conversations");
      setConvs(r.conversations||[]);
    }catch(e){console.error(e);}
    setLoad(false);
  };

  useEffect(()=>{loadList();const t=setInterval(loadList,15000);return()=>clearInterval(t);},[]);

  const openConv = async(c)=>{
    setSel(c);
    try{
      const r = await apiGet(`/api/admin/conversation/${c.user_id}`);
      setMsgs(r.messages||[]);
      setTimeout(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},50);
    }catch(e){}
  };

  const send = async()=>{
    const text = input.trim();
    if(!text || sending || !sel) return;
    setSend(true);
    try{
      await apiPost(`/api/admin/conversation/${sel.user_id}/reply`, {text});
      setMsgs(m=>[...m,{direction:"out",text,created_at:new Date().toISOString()}]);
      setInput("");
      setTimeout(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},50);
    }catch(e){}
    setSend(false);
  };

  // Відкрито конкретний чат — бачимо повідомлення
  if(sel){
    return(
      <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.bc}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <button onClick={()=>{setSel(null);loadList();}} style={{background:"transparent",color:C.acc,fontSize:14,fontWeight:600,border:"none"}}>← Назад</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:C.tm}}>{sel.full_name || `User ${sel.user_id}`}</div>
            <div style={{fontSize:11,color:C.ts}}>{sel.username?`@${sel.username}`:""} {sel.plan && <span style={{color:C.acc}}>· {sel.plan.toUpperCase()}</span>}</div>
          </div>
        </div>
        <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {messages.length===0 && <div style={{textAlign:"center",color:C.td,fontSize:13,padding:"20px 0"}}>Історія порожня</div>}
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.direction==="out"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:14,background:m.direction==="out"?C.acc:C.s1,color:m.direction==="out"?"#0a0a0a":C.tm,border:m.direction==="in"?`1px solid ${C.bc}`:"none",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>
                {m.text}
                <div style={{fontSize:10,opacity:.6,marginTop:4}}>{(m.created_at||"").slice(11,16)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${C.bc}`,display:"flex",gap:8,background:C.bg,flexShrink:0}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Написати відповідь..." disabled={sending} style={{flex:1,background:C.s1,border:`1px solid ${C.bc}`,borderRadius:14,padding:"12px 14px",color:C.tm,fontSize:14,outline:"none"}}/>
          <button onClick={send} disabled={!input.trim()||sending} style={{background:C.acc,color:"#0a0a0a",border:"none",borderRadius:12,padding:"0 18px",fontSize:14,fontWeight:800,opacity:(!input.trim()||sending)?.5:1}}>↑</button>
        </div>
      </div>
    );
  }

  // Список діалогів
  if(loading) return <Spin/>;

  return(
    <Scr>
      <div style={{fontSize:22,fontWeight:900,color:C.tm,letterSpacing:-.5}}>Чат з клієнтами</div>
      {convs.length===0 ? (
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"30px 18px",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>💬</div>
          <div style={{fontSize:15,fontWeight:700,color:C.tm,marginBottom:4}}>Поки немає повідомлень</div>
          <div style={{fontSize:13,color:C.ts,lineHeight:1.5}}>Коли клієнт напише в бот — зʼявиться тут</div>
        </div>
      ) : convs.map(c=>(
        <div key={c.user_id} onClick={()=>openConv(c)} style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"12px 14px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
          <Ava name={c.full_name||"?"} size={44}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:6}}>
              <div style={{fontSize:14,fontWeight:700,color:C.tm,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.full_name||`User ${c.user_id}`}</div>
              <div style={{fontSize:11,color:C.td,flexShrink:0}}>{(c.last_at||"").slice(11,16) || (c.last_at||"").slice(0,10)}</div>
            </div>
            <div style={{fontSize:12,color:C.ts,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>
              {c.last_dir==="out" && <span style={{color:C.acc,fontWeight:700}}>Ти: </span>}
              {c.last_text}
            </div>
          </div>
          {(c.unread||0) > 0 && (
            <div style={{background:C.acc,color:"#0a0a0a",fontSize:11,fontWeight:800,padding:"2px 7px",borderRadius:10,minWidth:20,textAlign:"center"}}>{c.unread}</div>
          )}
        </div>
      ))}
    </Scr>
  );
};


// ═══════════════════════════════════════════════════════════════
// ГРАФІКИ ПРОГРЕСУ (АДМІН) — вкладка в картці клієнта
// ═══════════════════════════════════════════════════════════════
const ProgressCharts = ({userId}) => {
  const [data,setData] = useState(null);
  const [weeks,setWeeks] = useState(8);
  const [loading,setLoad] = useState(true);

  const load = async()=>{
    setLoad(true);
    try{
      const r = await apiGet(`/api/admin/client/${userId}/progress-charts?weeks=${weeks}`);
      setData(r);
    }catch(e){}
    setLoad(false);
  };

  useEffect(()=>{load();const t=setInterval(load,30000);return()=>clearInterval(t);},[userId,weeks]);

  const Chart = ({title, series, unit, color, formatY=v=>v}) => {
    if(!series || series.length===0) return(
      <div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"16px"}}>
        <div style={{fontSize:13,color:C.ts,fontWeight:600,marginBottom:6}}>{title}</div>
        <div style={{color:C.td,fontSize:12,textAlign:"center",padding:"20px 0"}}>Немає даних</div>
      </div>
    );
    const values = series.map(p=>Number(p.v)||0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max-min || 1;
    const W = 260, H = 90, pad = 6;
    const step = series.length>1 ? (W - 2*pad) / (series.length-1) : 0;
    const points = series.map((p,i)=>{
      const x = pad + i*step;
      const y = H - pad - ((Number(p.v)-min)/range) * (H - 2*pad);
      return [x,y];
    });
    const path = points.map(([x,y],i) => (i===0?"M":"L")+x.toFixed(1)+","+y.toFixed(1)).join(" ");
    const last = series[series.length-1];
    const first = series[0];
    const delta = Number(last.v) - Number(first.v);
    return(
      <div style={{background:C.s1,borderRadius:14,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <div style={{fontSize:13,color:C.ts,fontWeight:600}}>{title}</div>
          <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
            <span style={{fontSize:18,fontWeight:900,color:C.tm}}>{formatY(Number(last.v))}{unit}</span>
            {series.length>1 && <span style={{fontSize:12,fontWeight:700,color:delta>0?C.acc:delta<0?C.red:C.ts}}>{delta>0?"+":""}{formatY(delta)}</span>}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:90,display:"block"}}>
          <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.5" fill={color}/>)}
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.td,marginTop:4}}>
          <span>{(first.t||"").slice(5)}</span>
          <span>{(last.t||"").slice(5)}</span>
        </div>
      </div>
    );
  };

  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[4,8,12,26].map(w=>(
          <button key={w} onClick={()=>setWeeks(w)} style={{flex:1,background:weeks===w?C.acc:C.s1,color:weeks===w?"#0a0a0a":C.ts,border:`1px solid ${weeks===w?C.acc:C.bc}`,borderRadius:10,padding:"8px 0",fontSize:12,fontWeight:700}}>{w} тижнів</button>
        ))}
      </div>
      {loading && !data ? <Spin/> : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Chart title="Вага" series={data?.weight} unit=" кг" color={C.acc} formatY={v=>v.toFixed(1)}/>
          <Chart title="Енергія" series={data?.energy} unit="/5" color="#4a9fdf"/>
          <Chart title="Сон" series={data?.sleep} unit=" год" color="#a855f7" formatY={v=>v.toFixed(1)}/>
          <Chart title="Чекінів на тиждень" series={data?.checkins_per_week} unit="" color="#e8a832"/>
          <div style={{fontSize:11,color:C.td,textAlign:"center",marginTop:4}}>Оновлюється кожні 30 сек</div>
        </div>
      )}
    </div>
  );
};

const AdminClientDetail = ({client,onBack}) => {
  const [detail,setDetail]=useState(null);
  const [loading,setLoad]=useState(true);
  const [msg,setMsg]=useState("");
  const [gen,setGen]=useState(false);
  const [showMsgModal,setShowMsgModal]=useState(false);
  const [period, setPeriod] = useState("all"); // 7d / 30d / all
  const [activateMonths, setActivateMonths] = useState(1);

  useEffect(()=>{
    setLoad(true);
    apiGet(`/api/admin/client/${client.user_id}?period=${period}`).then(r=>{setDetail(r);setLoad(false);}).catch(()=>setLoad(false));
  },[client.user_id, period]);

  const activate=async plan=>{
    await apiPost(`/api/admin/client/${client.user_id}/activate`,{plan, months: activateMonths});
    const exp=new Date(); exp.setDate(exp.getDate()+activateMonths*30);
    const expStr=exp.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric'});
    const mLabel=activateMonths===1?"місяць":activateMonths<5?"місяці":"місяців";
    setMsg(`✓ Активовано ${plan.toUpperCase()} на ${activateMonths} ${mLabel} до ${expStr}`);
  };
  const block=async()=>{
    if(!confirm("Заблокувати клієнта? Він втратить доступ до додатку."))return;
    await apiPost(`/api/admin/client/${client.user_id}/block`,{});
    setMsg("✓ Заблоковано");
    // Локально оновлюємо статус щоб кнопки одразу перемкнулися
    if(detail?.client) setDetail({...detail, client:{...detail.client, status:"blocked"}});
  };
  const unblockReset=async()=>{
    if(!confirm("Розблокувати і скинути? Клієнт зможе пройти анкету заново і отримати trial 3 дні. Анкета, план і AI-чат будуть видалені."))return;
    try{
      await apiPost(`/api/admin/client/${client.user_id}/unblock-and-reset`,{});
      setMsg("✓ Розблоковано. Клієнт може пройти анкету заново");
      if(detail?.client) setDetail({...detail, client:{...detail.client, status:"pending_questionnaire", plan:null}});
    }catch(e){setMsg("Помилка: "+e.message);}
  };
  const generate=async()=>{setGen(true);try{await apiPost(`/api/client/${client.user_id}/generate-plan`,{});setMsg("✓ Новий план згенеровано");}catch(e){setMsg("Помилка: "+e.message);}setGen(false);};

  if(loading) return <Spin/>;

  const qst = detail?.questionnaire;
  const sub = detail?.subscription || {};
  const trial = detail?.trial || {};
  const act = detail?.activity || {};
  const lastPay = detail?.last_payment;
  const planV = {start:"green",premium:"blue",vip:"purple",trial:"amber"};

  const fmtDate = s => s ? (s.slice(0,10) + (s.length>10 ? " " + s.slice(11,16) : "")) : "—";
  const fmtRel = s => {
    if(!s) return "—";
    try{
      const d = new Date(s.replace(" ","T"));
      const diff = (Date.now() - d.getTime()) / 1000;
      if(diff < 60) return "щойно";
      if(diff < 3600) return `${Math.floor(diff/60)} хв тому`;
      if(diff < 86400) return `${Math.floor(diff/3600)} год тому`;
      if(diff < 86400*7) return `${Math.floor(diff/86400)} д тому`;
      return s.slice(0,10);
    }catch{return s.slice(0,10);}
  };

  return(
    <Scr>
      {/* Header card */}
      <div style={{background:C.s1,borderRadius:18,border:`1px solid rgba(200,245,58,.2)`,padding:"16px",display:"flex",gap:14,alignItems:"center"}}>
        <Ava name={client.full_name||"?"} size={56}/>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:900,color:C.tm,letterSpacing:-.5}}>{client.full_name}</div>
          <div style={{fontSize:13,color:C.ts,marginTop:2}}>{client.username?`@${client.username}`:`ID: ${client.user_id}`}</div>
          <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
            <Bdg v={planV[client.plan]||"green"}>{(client.plan||"—").toUpperCase()}</Bdg>
            <Bdg v={client.status==="active"?"green":"amber"}>{client.status}</Bdg>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
        <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Підписка</div>
        {client.status === "trial" && trial.days_left !== null ? (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:14,color:C.ts}}>Пробний період</span>
            <span style={{fontSize:18,fontWeight:800,color:C.amber}}>{trial.days_left} д залишилось</span>
          </div>
        ) : client.status === "active" && sub.days_left !== null ? (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:14,color:C.ts}}>Залишилось днів</span>
              <span style={{fontSize:22,fontWeight:900,color:sub.days_left<7?C.red:sub.days_left<30?C.amber:C.acc}}>{sub.days_left}</span>
            </div>
            {sub.total_days && (
              <div style={{height:6,background:C.s2,borderRadius:3,overflow:"hidden",marginTop:6}}>
                <div style={{height:"100%",width:`${Math.max(5, 100-100*sub.days_left/sub.total_days)}%`,background:sub.days_left<7?C.red:sub.days_left<30?C.amber:C.acc}}/>
              </div>
            )}
            <div style={{fontSize:12,color:C.td,marginTop:6}}>До: {fmtDate(sub.expires_at)}</div>
          </>
        ) : (
          <div style={{fontSize:14,color:C.td}}>{client.status === "expired" ? "Підписка закінчилась" : "Немає активної підписки"}</div>
        )}
      </div>

      {/* Last payment */}
      {lastPay && (
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Остання оплата</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <div style={{fontSize:12,color:C.ts}}>Сума</div>
              <div style={{fontSize:18,fontWeight:800,color:C.tm,marginTop:2}}>{lastPay.amount ? `${lastPay.amount.toLocaleString()} ₴` : "—"}</div>
            </div>
            <div>
              <div style={{fontSize:12,color:C.ts}}>Тариф</div>
              <div style={{fontSize:15,fontWeight:700,color:C.tm,marginTop:2}}>{(lastPay.plan||"").toUpperCase()}</div>
            </div>
            <div>
              <div style={{fontSize:12,color:C.ts}}>Тривалість</div>
              <div style={{fontSize:15,fontWeight:700,color:C.tm,marginTop:2}}>{lastPay.duration_months||1} міс.</div>
            </div>
            <div>
              <div style={{fontSize:12,color:C.ts}}>Метод</div>
              <div style={{fontSize:15,fontWeight:700,color:C.tm,marginTop:2}}>{lastPay.method === "stars" ? "⭐ Stars" : "💳 Monobank"}</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.td,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.bc}`}}>Підтверджено: {fmtDate(lastPay.confirmed_at)}</div>
        </div>
      )}

      {/* Activity — period switcher + bento metrics */}
      <Card variant="elevated" padding={"14px 16px"}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>Активність в додатку</div>
          {/* Period switcher */}
          <div style={{display:"flex",gap:4,background:C.s2,borderRadius:R.full,padding:3}}>
            {[["all","Весь час"],["30d","30д"],["7d","7д"]].map(([v,l])=>{
              const active = period===v;
              return (
                <button key={v} onClick={()=>setPeriod(v)} style={{
                  background:active?C.gradAcc:"transparent",
                  color:active?"#0a0a0a":C.ts,
                  border:"none",borderRadius:R.full,
                  padding:"4px 10px",fontSize:11,fontWeight:800,
                  letterSpacing:0.3,cursor:"pointer",
                  transition:`all ${T.fast} ${E.out}`,
                }}>{l}</button>
              );
            })}
          </div>
        </div>

        {/* BENTO metrics */}
        <div className="stg" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gridAutoRows:"minmax(72px,auto)",gap:SP[2]}}>
          {/* HERO: Стрік + Останній візит — wide */}
          <Card variant="accent" glow padding={14} style={{gridColumn:"span 6",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
            <div style={{position:"absolute",right:-10,top:-15,fontSize:78,opacity:0.1}}>🔥</div>
            <div style={{position:"relative",zIndex:1}}>
              <SectionLabel accent style={{marginBottom:4}}>Стрік</SectionLabel>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <span style={{fontSize:36,fontWeight:900,color:C.acc,letterSpacing:-1.4,lineHeight:1}} className="num">
                  <AnimatedNum value={act.streak||0}/>
                </span>
                <span style={{fontSize:13,color:C.ts,fontWeight:700}}>{act.streak===1?"день":(act.streak||0)<5?"дні":"днів"}</span>
              </div>
            </div>
            <div style={{position:"relative",zIndex:1,textAlign:"right"}}>
              <SectionLabel style={{marginBottom:4}}>Останній візит</SectionLabel>
              <div style={{fontSize:15,fontWeight:800,color:C.tm,letterSpacing:-0.2}}>{fmtRel(act.last_active)}</div>
              {act.days_since_last_visit > 2 && (
                <div style={{fontSize:11,color:C.amber,fontWeight:700,marginTop:2}}>⚠ {act.days_since_last_visit} д відсутній</div>
              )}
            </div>
          </Card>

          {/* Period block — Відкриттів */}
          <Card variant="elevated" padding={12} style={{gridColumn:"span 2"}}>
            <SectionLabel>Сесій{period!=="all"?` · ${period==="7d"?"7д":"30д"}`:""}</SectionLabel>
            <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
              <span style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-0.6,lineHeight:1.1}} className="num">
                <AnimatedNum value={period==="all"?(act.total_opens||0):"—"}/>
              </span>
            </div>
            {period==="all" && <div style={{fontSize:10,color:C.td,marginTop:1}}>всього</div>}
          </Card>

          {/* Period block — Чекінів */}
          <Card variant="elevated" padding={12} style={{gridColumn:"span 2"}}>
            <SectionLabel>Чекінів{period!=="all"?` · ${period==="7d"?"7д":"30д"}`:""}</SectionLabel>
            <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
              <span style={{fontSize:24,fontWeight:900,color:C.tm,letterSpacing:-0.6,lineHeight:1.1}} className="num">
                <AnimatedNum value={period==="all"?(act.total_checkins||0):(act.period_checkins||0)}/>
              </span>
            </div>
            {period==="all" && <div style={{fontSize:10,color:C.td,marginTop:1}}>всього</div>}
          </Card>

          {/* Period block — AI чат */}
          <Card variant="elevated" padding={12} style={{gridColumn:"span 2"}}>
            <SectionLabel>AI-чат{period!=="all"?` · ${period==="7d"?"7д":"30д"}`:""}</SectionLabel>
            <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
              <span style={{fontSize:24,fontWeight:900,color:"#a855f7",letterSpacing:-0.6,lineHeight:1.1}} className="num">
                <AnimatedNum value={act.period_ai_messages||0}/>
              </span>
            </div>
            <div style={{fontSize:10,color:C.td,marginTop:1}}>повідомлень</div>
          </Card>

          {/* Bottom row: Тривалість сесії + Останнє фото */}
          <Card variant="elevated" padding={12} style={{gridColumn:"span 3"}}>
            <SectionLabel>Тривалість сесії</SectionLabel>
            <div style={{display:"flex",alignItems:"baseline",gap:3,marginTop:4}}>
              {act.last_session_minutes!=null ? (
                <>
                  <span style={{fontSize:22,fontWeight:900,color:C.blue,letterSpacing:-0.5,lineHeight:1.1}} className="num">
                    <AnimatedNum value={act.last_session_minutes} decimals={act.last_session_minutes<10?1:0}/>
                  </span>
                  <span style={{fontSize:11,color:C.ts,fontWeight:700}}>хв</span>
                </>
              ) : <span style={{fontSize:18,fontWeight:800,color:C.td}}>—</span>}
            </div>
            <div style={{fontSize:10,color:C.td,marginTop:1}}>остання</div>
          </Card>

          <Card variant="elevated" padding={12} style={{gridColumn:"span 3"}}>
            <SectionLabel>Останнє фото</SectionLabel>
            <div style={{fontSize:14,fontWeight:800,color:act.last_photo_at?C.tm:C.td,marginTop:4,letterSpacing:-0.2}}>
              {act.last_photo_at ? fmtRel(act.last_photo_at) : "—"}
            </div>
          </Card>
        </div>

        {/* Footer — registration info */}
        <div style={{fontSize:11,color:C.td,marginTop:14,paddingTop:10,borderTop:`1px solid ${C.bc}`,fontWeight:600}}>
          Реєстрація: {fmtDate(act.registered_at)}
          {act.activated_at && <span> · Активація: {fmtDate(act.activated_at)}</span>}
        </div>
      </Card>

      {/* Questionnaire */}
      {qst && (
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Анкета</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              ["Вік", qst.age ? `${qst.age} р.` : "—"],
              ["Стать", qst.gender==="female"?"Жінка":"Чоловік"],
              ["Зріст", qst.height_cm ? `${qst.height_cm} см` : "—"],
              ["Вага → Ціль", `${qst.weight_kg||"?"} → ${qst.target_weight||"?"} кг`],
              ["Ціль", qst.goal||"—"],
              ["Досвід", qst.experience||"—"],
              ["Обладнання", qst.equipment||"—"],
              ["Трен./тиждень", qst.workouts_pw ? `${qst.workouts_pw}×` : "—"],
              ["Пріор. час", qst.pref_time||"—"],
              ["Бюджет", qst.budget||"—"],
            ].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:11,color:C.ts}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:C.tm,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          {qst.health_issues && qst.health_issues !== "none" && (
            <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.bc}`}}>
              <div style={{fontSize:11,color:C.ts,marginBottom:3}}>Проблеми зі здоровʼям</div>
              <div style={{fontSize:13,color:C.tm}}>{qst.health_issues}</div>
            </div>
          )}
          {qst.allergies && qst.allergies !== "none" && (
            <div style={{marginTop:8}}>
              <div style={{fontSize:11,color:C.ts,marginBottom:3}}>Алергії</div>
              <div style={{fontSize:13,color:C.tm}}>{qst.allergies}</div>
            </div>
          )}
        </div>
      )}

      {/* Message button */}
      <button onClick={()=>setShowMsgModal(true)} style={{background:"rgba(200,245,58,.1)",border:"1.5px solid rgba(200,245,58,.3)",color:C.acc,borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        ✉️ Написати повідомлення
      </button>

      <Div/>

      {/* Management actions */}
      <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Керування</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button onClick={generate} disabled={gen} className={gen?"":"pu"} style={{background:C.acc,borderRadius:14,padding:"14px 0",fontSize:14,fontWeight:800,color:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",gap:6,gridColumn:"1/-1"}}>
          {gen&&<div className="sp" style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(0,0,0,.2)",borderTopColor:"#0a0a0a"}}/>}
          Згенерувати план
        </button>
        {/* Duration switcher for activation */}
        <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {[1,3,6,12].map(m=>{
            const on=activateMonths===m;
            const disc={3:"-15%",6:"-25%",12:"-35%"}[m];
            return(
              <button key={m} onClick={()=>setActivateMonths(m)} style={{background:on?C.gradAccSubtle:C.s2,border:`1.5px solid ${on?C.acc:C.bc}`,color:on?C.acc:C.ts,borderRadius:R.md,padding:"10px 4px",fontSize:12,fontWeight:800,cursor:"pointer",position:"relative",textAlign:"center"}}>
                {m===12?"1 рік":`${m}міс`}
                {disc&&<span style={{display:"block",fontSize:9,color:on?C.acc:C.td,marginTop:2}}>{disc}</span>}
              </button>
            );
          })}
        </div>
        {["start","premium","vip"].map(p=>(
          <button key={p} onClick={()=>activate(p)} style={{background:C.s1,color:C.ts,border:`1px solid ${C.bc}`,borderRadius:14,padding:"12px 0",fontSize:13,fontWeight:700}}>Активувати {p.toUpperCase()}</button>
        ))}
        {(detail?.client?.status||client.status)==="blocked" ? (
          <button onClick={unblockReset} style={{background:"rgba(74,159,223,.1)",color:"#4a9fdf",border:"1px solid rgba(74,159,223,.3)",borderRadius:14,padding:"12px 8px",fontSize:13,fontWeight:700,gridColumn:"1/-1",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🔓 Розблокувати + скинути на trial</button>
        ) : (
          <button onClick={block} style={{background:"rgba(255,85,85,.08)",color:C.red,border:"1px solid rgba(255,85,85,.2)",borderRadius:14,padding:"12px 0",fontSize:13,fontWeight:700}}>Заблокувати</button>
        )}
      </div>

      {msg && <div style={{background:"rgba(200,245,58,.08)",border:"1px solid rgba(200,245,58,.2)",borderRadius:14,padding:"14px 16px",fontSize:15,color:C.acc,fontWeight:600}}>{msg}</div>}

      {/* Графіки прогресу */}
      <div>
        <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Графіки прогресу</div>
        <ProgressCharts userId={client.user_id}/>
      </div>

      {/* Recent checkins */}
      {(detail?.checkins||[]).length>0 && (
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{fontSize:15,fontWeight:700,color:C.tm,marginBottom:10}}>Останні чекіни</div>
          {detail.checkins.slice(0,5).map((c,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,borderBottom:i<Math.min(detail.checkins.length,5)-1?`1px solid ${C.bc}`:"none"}}>
              <span style={{color:C.ts}}>{(c.submitted_at||"").slice(0,10)}</span>
              <span style={{color:C.tm,fontWeight:600}}>{c.weight_kg} кг · {c.energy_level}/5</span>
            </div>
          ))}
        </div>
      )}

      {/* Payments history */}
      {(detail?.payments||[]).length>0 && (
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{fontSize:15,fontWeight:700,color:C.tm,marginBottom:10}}>Історія оплат</div>
          {detail.payments.map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",fontSize:13,borderBottom:i<detail.payments.length-1?`1px solid ${C.bc}`:"none"}}>
              <div>
                <div style={{color:C.tm,fontWeight:600}}>{(p.plan||"").toUpperCase()} · {p.duration_months||1} міс.</div>
                <div style={{color:C.td,fontSize:11,marginTop:2}}>{(p.submitted_at||"").slice(0,10)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.tm,fontWeight:700}}>{p.amount ? `${p.amount.toLocaleString()} ₴` : "—"}</div>
                <Bdg v={p.status==="confirmed"?"green":p.status==="rejected"?"red":"amber"}>{p.status}</Bdg>
              </div>
            </div>
          ))}
        </div>
      )}

      {showMsgModal && <MessageModal client={client} onClose={()=>setShowMsgModal(false)}/>}
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
const AdminSettings = ({settings,onExitAdmin,onFillQuestionnaire}) => {
  return(
    <Scr>
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Профіль тренера</div>
      <button onClick={onFillQuestionnaire} style={{background:"rgba(200,245,58,.06)",border:"1px solid rgba(200,245,58,.2)",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4a4 4 0 100 8 4 4 0 000-8zm-7 14c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={C.acc} strokeWidth="1.8" strokeLinecap="round"/></svg>
        <div style={{textAlign:"left"}}><div style={{fontSize:15,fontWeight:700,color:C.acc}}>Заповнити / оновити мою анкету</div><div style={{fontSize:12,color:C.ts,marginTop:2}}>Потрібно для AI-генерації твого особистого плану</div></div>
      </button>
      <div style={{height:1,background:C.bc}}/>
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Автоматизація</div>
      <div style={{background:"rgba(200,245,58,.05)",border:"1px solid rgba(200,245,58,.15)",borderRadius:16,padding:"14px 16px"}}>
        <div style={{fontSize:13,color:C.ts,lineHeight:1.7}}>Всі автоматичні функції запущені на сервері постійно:</div>
      </div>
      {[{l:"✅ Авто-план щопонеділка",s:"Генерація через Claude AI о 07:00"},{l:"✅ Нагадування про чекін",s:"Ср та Пт о 19:00 (активним клієнтам)"},{l:"✅ Оффер на день 3",s:"Trial → платний тариф о 12:00"},{l:"✅ Нагадування за 3 дні до кінця",s:"Про закінчення підписки о 10:00"},{l:"✅ Автоблокування",s:"Прострочені пакети о 00:01"}].map(item=>(
        <div key={item.l} style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 16px"}}>
          <div style={{fontSize:15,fontWeight:600,color:C.tm}}>{item.l}</div>
          <div style={{fontSize:13,color:C.ts,marginTop:3}}>{item.s}</div>
        </div>
      ))}
      <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Тарифи</div>
      {Object.entries(settings?.plans||{start:{name:"START",price:123},premium:{name:"PREMIUM",price:164},vip:{name:"VIP",price:287}}).map(([k,plan])=>(
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

// ═══ EXPIRED SCREEN — повноцінний екран з тарифами для клієнтів з закінченим пакетом ═══
const ExpiredScreen = ({client, plans, onSelectPlan}) => {
  const [months, setMonths] = useState(3); // дефолт 3 — підказуємо вигідну тривалість
  const isTrialExpired = client?.status === "trial_expired";
  const p = plans || PLANS_STATIC;

  const monthsOptions = [
    {m:1, label:"1 міс"},
    {m:3, label:"3 міс"},
    {m:6, label:"6 міс"},
    {m:12, label:"1 рік"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{padding:"24px 18px 40px",display:"flex",flexDirection:"column",gap:18}}>

        {/* Header */}
        <div style={{textAlign:"center",paddingTop:12}}>
          <div className="si" style={{
            width:84,height:84,borderRadius:R.full,
            background:isTrialExpired?"rgba(232,168,50,0.1)":"rgba(255,85,85,0.1)",
            border:`2.5px solid ${isTrialExpired?C.amber:C.red}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:38,margin:"0 auto 18px",
            boxShadow:isTrialExpired?"0 0 30px rgba(232,168,50,0.25)":"0 0 30px rgba(255,85,85,0.25)",
          }}>
            {isTrialExpired ? "⏳" : "🔒"}
          </div>
          <H level={1} style={{textAlign:"center",marginBottom:10}}>
            {isTrialExpired ? "Пробний доступ завершено" : "Пакет закінчився"}
          </H>
          <div style={{fontSize:F.bodyLg.size,color:C.ts,lineHeight:1.6,maxWidth:340,margin:"0 auto"}}>
            {isTrialExpired
              ? "Щоб продовжити користуватись додатком — обери тариф нижче."
              : "Щоб відновити доступ до додатку — обери новий пакет."
            }
          </div>
        </div>

        {/* Інструкція */}
        <div style={{background:"rgba(200,245,58,.06)",border:"1px solid rgba(200,245,58,.2)",borderRadius:14,padding:"12px 14px",fontSize:13,color:C.ts,lineHeight:1.6}}>
          <div style={{color:C.acc,fontWeight:700,marginBottom:6}}>Як відновити доступ:</div>
          <div>1. Обери тривалість пакета</div>
          <div>2. Натисни на тариф</div>
          <div>3. Сплати через Monobank або Telegram Stars</div>
          <div style={{marginTop:6,fontSize:12,color:C.td}}>Усі твої дані збережені — після оплати все на місці.</div>
        </div>

        {/* Перемикач тривалості */}
        <div style={{background:C.s1,borderRadius:16,border:`1px solid ${C.bc}`,padding:"14px 14px"}}>
          <div style={{fontSize:11,color:C.ts,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>На скільки часу</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {monthsOptions.map(opt=>{
              const isAct = months === opt.m;
              const disc = DUR_DISC[opt.m];
              return (
                <div key={opt.m} onClick={()=>setMonths(opt.m)}
                  style={{position:"relative",borderRadius:12,border:`2px solid ${isAct?C.acc:C.bc}`,background:isAct?"rgba(200,245,58,.08)":C.s2,padding:"10px 4px",cursor:"pointer",textAlign:"center"}}>
                  {disc>0 && (
                    <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",background:opt.m===12?C.acc:opt.m===6?"#e8a832":"#4a9fdf",color:"#080808",fontSize:9,fontWeight:900,padding:"2px 6px",borderRadius:6,whiteSpace:"nowrap",lineHeight:1.4}}>−{disc}%</div>
                  )}
                  <div style={{fontSize:13,fontWeight:800,color:isAct?C.acc:C.ts}}>{opt.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Тарифи */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(p).map(([key, plan])=>{
            const monthly = plan.price * months;
            const total = dCalc(plan.price, months);
            const stars = dStars(plan.stars||250, months);
            const saved = monthly - total;
            const perMonth = months > 1 ? Math.round(total / months) : null;

            return (
              <div key={key} onClick={()=>onSelectPlan(key, months)}
                style={{background:C.s1,borderRadius:16,border:`1.5px solid ${plan.hot?C.acc:C.bc}`,padding:"14px 16px",cursor:"pointer",position:"relative"}}>
                {plan.hot && (
                  <div style={{position:"absolute",top:14,right:14,fontSize:10,color:"#0a0a0a",background:C.acc,borderRadius:8,padding:"3px 8px",fontWeight:800}}>Популярний</div>
                )}

                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <div style={{fontSize:18,fontWeight:900,color:C.tm,letterSpacing:-.3}}>{plan.name}</div>
                </div>

                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:perMonth?4:8}}>
                  <span style={{fontSize:26,fontWeight:900,color:C.acc,letterSpacing:-1}}>{total.toLocaleString()}</span>
                  <span style={{fontSize:13,color:C.ts}}>₴ за {DUR_LABEL[months]||"1 міс"}</span>
                </div>

                {perMonth && (
                  <div style={{fontSize:12,color:C.ts,marginBottom:6}}>= {perMonth.toLocaleString()} ₴/міс</div>
                )}

                {saved > 0 && (
                  <div style={{display:"inline-block",background:"rgba(200,245,58,.1)",border:"1px solid rgba(200,245,58,.25)",borderRadius:8,padding:"4px 10px",fontSize:11,color:C.acc,fontWeight:700,marginBottom:8}}>
                    Економія {saved.toLocaleString()} ₴ проти місячного
                  </div>
                )}

                <div style={{fontSize:11,color:"#f6c90e",marginTop:saved>0?0:6}}>⭐ або {stars.toLocaleString()} зірок Telegram</div>

                {(plan.features||[]).slice(0,3).map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.ts,marginTop:5}}>
                    <div style={{width:3,height:3,borderRadius:"50%",background:C.acc,flexShrink:0}}/>{f}
                  </div>
                ))}

                <div style={{marginTop:12,padding:"10px 0",background:"rgba(200,245,58,.08)",border:"1px solid rgba(200,245,58,.2)",borderRadius:10,textAlign:"center",fontSize:13,fontWeight:800,color:C.acc}}>
                  Обрати — {total.toLocaleString()} ₴
                </div>
              </div>
            );
          })}
        </div>

        <div style={{fontSize:11,color:C.td,textAlign:"center",lineHeight:1.6,padding:"4px 12px"}}>
          Питання? Напиши тренеру через бот @fitcore_matias_bot
        </div>
      </div>
    </div>
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
  const [selClient,setSelClient]=useState(null);const [selPlan,setSelPlan]=useState(null);const [selMonths,setSelMonths]=useState(1);
  const [checkinMode,setCheckin]=useState(false);
  const contentRef=useRef(null);const touchX=useRef(0);const touchY=useRef(0);const swiping=useRef(false);

  useEffect(()=>{
    // Telegram Mini App — розтягнути на весь екран і вимкнути свайпи які згортають додаток
    try{
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready?.();
        tg.expand?.();
        tg.disableVerticalSwipes?.();
      }
    }catch{}
    const init=async()=>{
      try{
        const auth=await apiPost("/api/auth",{});
        setUserId(auth.user_id);setIsAdmin(auth.is_admin);setPlans(auth.plans);setPayLinks(auth.payment_links);setClient(auth.client);
        if(auth.is_admin){try{const s=await apiGet("/api/admin/settings");setSettings(s);}catch{}}
        if(auth.client){
          try{const d=await apiGet(`/api/client/${auth.user_id}`);setQst(d.questionnaire);}catch{}
          const st=auth.client.status;
          if(["active","trial"].includes(st))setScreen("client");
          else if(st==="pending_approval")setScreen("pending_approval");
          else if(st==="pending_payment")setScreen("pending_payment");
          else if(["expired","trial_expired"].includes(st))setScreen("expired");
          else if(st==="blocked")setScreen("blocked");
          else if(st==="pending_questionnaire")setScreen("welcome");
          else setScreen("connection_error");
        }else{
          // auth.client === null означає — новий клієнт, його ще нема в БД
          setScreen("welcome");
        }
      }catch(e){
        console.error("Init:",e);
        // Не кидаємо новачку анкету — показуємо помилку звʼязку з retry
        setScreen("connection_error");
      }
    };
    init();

    // Перевіряти статус кожну 1 хв — швидке перенаправлення при зміні статусу
    const statusCheckInterval = setInterval(async () => {
      try {
        const r = await apiPost("/api/auth", {});
        if (r.client) {
          setClient(r.client);
          const st = r.client.status;
          if (["expired","trial_expired"].includes(st) && screen !== "expired") {
            setScreen("expired");
          } else if (st === "blocked" && screen !== "blocked") {
            setScreen("blocked");
          } else if (["active","trial"].includes(st) && ["pending_payment","pending_approval"].includes(screen)) {
            setScreen("client");
            setClientTab("plan");
          }
        }
      } catch(e) {
        console.error("Status check error:", e);
      }
    }, 60000);
    return () => clearInterval(statusCheckInterval);
  },[]);

  if(screen==="loading")return(
    <>
      <G/>
      <style>{`
        @keyframes dbSpin{0%{transform:rotate(0deg) scale(1);}80%{transform:rotate(360deg) scale(1);}100%{transform:rotate(360deg) scale(0) translateY(-40px);opacity:0;}}
        @keyframes dbAppear{from{opacity:0;transform:scale(.6);}to{opacity:1;transform:scale(1);}}
        .db-spin{animation:dbSpin 1.4s ease-in-out forwards;}
        .db-appear{animation:dbAppear .5s ease forwards;}
        @keyframes gravityFall{0%{transform:translateY(-240px);opacity:0;}10%{opacity:1;}100%{transform:translateY(0);opacity:1;}}
        @keyframes springSettle{0%{transform:translateY(0);}40%{transform:translateY(-15px);}70%{transform:translateY(4px);}100%{transform:translateY(0);}}
        @keyframes impactFlash{0%{opacity:0;}20%{opacity:0.6;}100%{opacity:0;}}
        @keyframes impactShake{0%{transform:translateY(0);}20%{transform:translateY(-7px);}45%{transform:translateY(5px);}65%{transform:translateY(-3px);}82%{transform:translateY(2px);}100%{transform:translateY(0);}}
        @keyframes underlineCenter{from{transform:scaleX(0);}to{transform:scaleX(1);}}
        @keyframes riseFromBelow{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",position:"relative",overflow:"hidden",animation:"impactShake 200ms ease-out 395ms both"}}>
        <img src="/photo3.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(8,8,8,.4) 0%,rgba(8,8,8,.75) 50%,rgba(8,8,8,.97) 100%)"}}/>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
          <div style={{display:"inline-block",position:"relative",animation:"gravityFall 350ms ease-in 50ms both, springSettle 320ms ease-out 400ms both"}}>
            <div style={{fontSize:42,fontWeight:900,color:C.tm,letterSpacing:-2,lineHeight:1}}>FITCORE</div>
            <div style={{
              height:2,background:C.acc,borderRadius:1,marginTop:8,
              transformOrigin:"center",transform:"scaleX(0)",
              animation:"underlineCenter 300ms cubic-bezier(0.34,1.2,0.64,1) 450ms forwards",
              boxShadow:`0 0 12px ${C.acc}, 0 0 24px rgba(200,245,58,0.4)`,
            }}/>
          </div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.4)",letterSpacing:2,textTransform:"uppercase",opacity:0,animation:"riseFromBelow 400ms ease-out 700ms forwards"}}>AI Trainer by Matias</div>
          <DumbbellLoader/>
        </div>
      </div>
    </>
  );

  const isAdminMode=screen==="admin";
  const showNav=["client","admin"].includes(screen)&&!checkinMode&&!["expired","trial_expired"].includes(clientData?.status||"")&&!["welcome","onboarding","onboarding_success","pending_approval","pending_payment"].includes(screen);
  const titles={ranking: "Рейтинг", plan:"Мій план",nutrition:"Харчування",progress:"Прогрес",menu:"Тарифи і меню",supplements:"БАДи",profile:"Профіль",aichat:"Чат з Матіасом",more:"Додатково",photos:"Прогрес у фото",recipes:"Рецепти",schedule:"Календар",macros:"КБЖУ калькулятор",referral:"Запроси друга",dashboard:"Дашборд",clients:"Клієнти",payments:"Оплати",broadcast:"Розсилка",settings:"Налаштування",chat:"Чат з клієнтами"};
  const topTitle=checkinMode?"Чекін":isAdminMode?(selClient?"Профіль клієнта":titles[adminTab]):titles[clientTab];
  const showTopNav=["client","admin"].includes(screen)&&clientTab!=="profile"&&!(isAdminMode&&adminTab==="dashboard")&&!["expired","trial_expired"].includes(clientData?.status||"")&&!["welcome","onboarding","onboarding_success","pending_approval","pending_payment"].includes(screen);

  const C_TABS=["plan","nutrition","aichat","ranking","more","profile"];
  const A_TABS=["dashboard","clients","payments"];
  const onTouchStart=e=>{touchX.current=e.touches[0].clientX;touchY.current=e.touches[0].clientY;};
  const onTouchEnd=e=>{
    if(swiping.current)return;
    if(screen!=="client"&&screen!=="admin")return;
    if(checkinMode||selClient)return;
    const tg=e.target.tagName;
    if(tg==="INPUT"||tg==="TEXTAREA"||e.target.isContentEditable)return;
    const dx=e.changedTouches[0].clientX-touchX.current;
    const dy=e.changedTouches[0].clientY-touchY.current;
    if(Math.abs(dx)<=50||Math.abs(dx)<=Math.abs(dy)*1.5)return;
    const dir=dx<0?"left":"right";
    const tabs=isAdminMode?A_TABS:C_TABS;
    const cur=isAdminMode?adminTab:clientTab;
    const i=tabs.indexOf(cur);
    if(i===-1)return;
    const ni=dir==="left"?Math.min(i+1,tabs.length-1):Math.max(i-1,0);
    if(ni===i)return;
    const nt=tabs[ni];
    haptic("selection");
    swiping.current=true;
    const el=contentRef.current;
    if(el){el.style.transition="transform 120ms ease-in";el.style.transform=dir==="left"?"translateX(-100%)":"translateX(100%)";}
    setTimeout(()=>{
      if(isAdminMode){setAdminTab(nt);setSelClient(null);}else setClientTab(nt);
      if(el){
        el.style.transition="none";
        el.style.transform=dir==="left"?"translateX(100%)":"translateX(-100%)";
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          el.style.transition="transform 130ms ease-out";
          el.style.transform="translateX(0)";
          setTimeout(()=>{el.style.transition="";el.style.transform="";swiping.current=false;},140);
        }));
      }else swiping.current=false;
    },125);
  };

  const renderContent=()=>{
    // Експерійовані клієнти — рендеримо ExpiredScreen напряму, не змінюючи screen state
    if(clientData && ["expired","trial_expired"].includes(clientData.status) && !["plans","payment"].includes(screen)){
      return <ExpiredScreen client={clientData} plans={plans} onSelectPlan={(p,m)=>{setSelPlan(p);setSelMonths(m||1);setScreen("payment");}}/>;
    }
    // Заблоковані клієнти — окремий екран без можливості обходу
    if(clientData && clientData.status === "blocked"){
      return (
        <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
          <div style={{width:84,height:84,borderRadius:"50%",background:"rgba(255,85,85,0.1)",border:`2.5px solid ${C.red}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,boxShadow:"0 0 30px rgba(255,85,85,0.25)"}}>⛔</div>
          <H level={1} style={{textAlign:"center"}}>Доступ заблоковано</H>
          <div style={{fontSize:F.bodyLg.size,color:C.ts,lineHeight:1.6,maxWidth:340}}>Звернись до тренера для відновлення доступу.</div>
          <a href="https://t.me/fitcore_matias_bot" style={{textDecoration:"none",width:"100%",maxWidth:280}}>
            <Btn variant="ghost" size="md" hapticKind="light">📩 Написати тренеру</Btn>
          </a>
        </div>
      );
    }
    // Помилка зʼєднання — retry, не кидаємо на анкету
    if(screen==="connection_error"){
      return (
        <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
          <div style={{width:84,height:84,borderRadius:"50%",background:"rgba(232,168,50,0.1)",border:`2.5px solid ${C.amber}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38}}>📡</div>
          <H level={1} style={{textAlign:"center"}}>Помилка зʼєднання</H>
          <div style={{fontSize:F.bodyLg.size,color:C.ts,lineHeight:1.6,maxWidth:340}}>Не вдалося звʼязатися з сервером. Перевір інтернет і спробуй ще раз.</div>
          <Btn variant="primary" size="md" onClick={()=>{setScreen("loading"); window.location.reload();}} style={{maxWidth:280}}>🔄 Спробувати ще раз</Btn>
        </div>
      );
    }
    if(screen==="welcome")return <WelcomeScreen onStart={()=>setScreen("onboarding")}/>;
    if(screen==="onboarding")return <OnboardingFlow userId={userId} onComplete={(newClient)=>{
      setClient(newClient);
      setScreen("onboarding_success");
    }}/>;
    if(screen==="onboarding_success")return <OnboardingSuccess onContinue={async()=>{
      try{
        const auth = await apiPost("/api/auth", {});
        if(auth?.client) setClient(auth.client);
        try{const d=await apiGet(`/api/client/${userId}`);setQst(d.questionnaire);}catch{}
      }catch{}
      setScreen("client");setClientTab("plan");
    }}/>;
    if(screen==="pending_approval")return(
      <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(232,168,50,.1)",border:`2px solid ${C.amber}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="32" height="32" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke={C.amber} strokeWidth="1.6"/><path d="M9 5.5v4l2.5 2.5" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
        <div style={{fontSize:24,fontWeight:900,color:C.tm}}>Очікуємо підтвердження</div>
        <div style={{fontSize:15,color:C.ts,textAlign:"center",lineHeight:1.7,maxWidth:340}}>Тренер перевіряє твою оплату.<br/>Доступ відкриється одразу після підтвердження.</div>
        <div style={{fontSize:13,color:C.td,marginTop:8}}>Якщо потрібно — напиши <a href="https://t.me/fitcore_matias_bot" style={{color:C.acc,textDecoration:"none"}}>@fitcore_matias_bot</a></div>
      </div>
    );
    if(screen==="pending_payment")return <PendingPaymentScreen onRefresh={async()=>{
      try{
        const auth = await apiPost("/api/auth", {});
        if(auth?.client){
          setClient(auth.client);
          const st = auth.client.status;
          if(["active","trial"].includes(st)){setScreen("client");setClientTab("plan");}
        }
      }catch{}
    }}/>;
    if(screen==="plans"){
      return(
        <div style={{minHeight:"100vh",background:C.bg}}>
          <div style={{position:"sticky",top:0,zIndex:10,background:C.bg,padding:"12px 16px",borderBottom:`1px solid ${C.bc}`,display:"flex",alignItems:"center",gap:12}}>
            {clientData && ["expired","trial_expired"].includes(clientData.status) ? (
              <button onClick={()=>setScreen("expired")} style={{background:"transparent",border:"none",color:C.acc,fontSize:15,fontWeight:600,padding:0}}>← Назад</button>
            ) : (
              <button onClick={()=>{setClientTab("menu");setScreen("client");}} style={{background:"transparent",border:"none",color:C.acc,fontSize:15,fontWeight:600,padding:0}}>← Назад</button>
            )}
            <div style={{fontSize:16,fontWeight:700,color:C.tm}}>Обери тариф</div>
          </div>
          <PlanSelect plans={plans} payLinks={payLinks} onSelect={(p,m)=>{setSelPlan(p);setSelMonths(m||1);setScreen("payment");}}/>
        </div>
      );
    }
    if(screen==="payment")return <Payment planKey={selPlan} months={selMonths||1} plans={plans} payLinks={payLinks} onBack={()=>{setClientTab("menu");setScreen("client");}} onPaid={()=>setScreen("pending_payment")} userId={userId}/>;
    if(screen==="expired"){
      return <ExpiredScreen client={clientData} plans={plans} onSelectPlan={(p,m)=>{setSelPlan(p);setSelMonths(m||1);setScreen("payment");}}/>;
    }

    if(screen==="admin"){
      if(selClient)return <AdminClientDetail client={selClient} onBack={()=>setSelClient(null)}/>;
      const onExitAdmin=()=>{setScreen("client");setAdminTab("dashboard");};
      if(adminTab==="dashboard")return <AdminDash/>;
      if(adminTab==="clients")return <AdminClients onSelect={c=>setSelClient(c)}/>;
      if(adminTab==="chat")return <AdminChat/>;
      if(adminTab==="payments")return <AdminPayments/>;
      if(adminTab==="broadcast")return <AdminBroadcast/>;
      if(adminTab==="settings")return <AdminSettings settings={settings} onExitAdmin={onExitAdmin} onFillQuestionnaire={()=>setScreen("onboarding")}/>;
    }
    if(screen==="client"){
      if(checkinMode)return <Checkin userId={userId} onDone={()=>setCheckin(false)}/>;
      if(clientTab==="plan")return <TrainPlan userId={userId}/>;
      if(clientTab==="nutrition")return <Nutrition userId={userId} questionnaire={questionnaire}/>;
      if(clientTab==="aichat")return <AIChat userId={userId} clientData={clientData}/>;
      if(clientTab==="ranking")return <Leaderboard userId={userId}/>;
      if(clientTab==="photos")return <ProgressPhotos userId={userId}/>;
      if(clientTab==="recipes")return <Recipes userId={userId} clientData={clientData}/>;
      if(clientTab==="schedule")return <TrainingSchedule userId={userId}/>;
      if(clientTab==="macros")return <MacrosCalculator userId={userId} questionnaire={questionnaire} onBack={()=>setClientTab("more")}/>;
      if(clientTab==="more")return <MoreScreen clientData={clientData} onNav={setClientTab}/>;
      if(clientTab==="referral")return <ReferralScreen userId={userId} onBack={()=>setClientTab("more")}/>;
      if(clientTab==="progress")return <Progress userId={userId}/>;
      if(clientTab==="menu")return <MenuScreen plans={plans} payLinks={payLinks} onSelectPlan={(p,m)=>{setSelPlan(p);setSelMonths(m||1);setScreen("payment");}} clientPlan={clientData?.plan} onShowReviews={()=>setClientTab("reviews")}/>;
      if(clientTab==="supplements")return <SupplementsScreen userId={userId} clientPlan={clientData?.plan} isAdmin={isAdmin}/>;
      if(clientTab==="reviews")return <ReviewsScreen userId={userId}/>;
      if(clientTab==="notifications")return <NotificationsScreen userId={userId}/>;
      if(clientTab==="profile")return <Profile client={clientData} questionnaire={questionnaire} isAdmin={isAdmin} onAdminAccess={()=>setScreen("admin")} onCheckin={()=>setCheckin(true)} onBuyPlan={()=>{setClientTab("menu");}} onSupplements={clientData?.plan==="vip"?()=>setClientTab("supplements"):null} userId={userId} onMacros={()=>setClientTab("macros")}/>;
    }
  };

  return(
    <>
      <G/>
      <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
        {/* Глобальний living background — за всім додатком */}
        <LivingBackground intensity={0.7}/>
        <FloatingParticles count={10}/>
        {showTopNav&&(
          <TNav title={topTitle}
            onBack={selClient?()=>setSelClient(null):checkinMode?()=>setCheckin(false):isAdminMode?()=>setScreen("client"):clientTab==="referral"?()=>setClientTab("more"):undefined}
            rightEl={isAdminMode&&adminTab==="payments"&&!selClient&&<div style={{fontSize:12,background:"rgba(232,168,50,.1)",color:C.amber,border:"1px solid rgba(232,168,50,.3)",borderRadius:20,padding:"4px 12px",fontWeight:700}}>оплати</div>}
          />
        )}
        <div ref={contentRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative",zIndex:2}}>{renderContent()}</div>
        {showNav&&<BNav active={isAdminMode?adminTab:clientTab} onChange={id=>{if(isAdminMode){setAdminTab(id);setSelClient(null);}else setClientTab(id);}} isAdmin={isAdminMode}/>}
      </div>
    </>
  );
}
