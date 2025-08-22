import React, { useEffect, useMemo, useState, createContext, useContext } from "react";

/**
 * Harvey's Pomodoro – Pure Frontend (No Backend)
 * - 居中大番茄钟：电脑/手机都在屏幕中央
 * - 顶栏：左侧标题，右侧 Sign in（本地随机 emoji 头像）
 * - 时钟下方：头像小人（头像=所选表情，身体用简单几何）
 * - ✅ 修复：每秒稳定更新倒计时 & 进度环（把 tick 作为依赖参与计算）
 */

/** 固定时长/顺序（分钟） */
const DEFAULT_DURATIONS = { W: 25, SB: 5, LB: 15 } as const;
type PhaseKey = keyof typeof DEFAULT_DURATIONS;
const DEFAULT_SCHEDULE: PhaseKey[] = ["W", "SB", "W", "SB", "W", "SB", "W", "LB"];

/** 标签/颜色（用于进度环） */
const PHASE_LABEL: Record<PhaseKey, string> = { W: "Work", SB: "Short Break", LB: "Long Break" };
const PHASE_COLOR: Record<PhaseKey, string> = { W: "#ef4444", SB: "#22c55e", LB: "#3b82f6" };

/** 芝加哥时间文本（仅展示） */
const chicagoFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
function chicagoNowText() {
  return chicagoFmt.format(new Date());
}

/** 每秒心跳；返回一个每秒变化的数值（tick） */
function useSecondTick() {
  const [tick, setTick] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

/** 本地番茄钟（按每天循环，离线可用；依赖 tick 保证每秒重算） */
function usePomodoroClock(schedule = DEFAULT_SCHEDULE, durations = DEFAULT_DURATIONS) {
  const tick = useSecondTick(); // 每秒变动
  return useMemo(() => {
    // 只用“秒”为单位，避免小数抖动
    const now = new Date();
    const totalSecsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const segMinutes = schedule.map((k) => durations[k]);
    const cycleMin = segMinutes.reduce((a, b) => a + b, 0);
    const cycleSec = cycleMin * 60;
    const secInCycle = ((totalSecsToday % cycleSec) + cycleSec) % cycleSec;

    let acc = 0;
    let index = 0;
    for (let i = 0; i < schedule.length; i++) {
      const segLenSec = segMinutes[i] * 60;
      if (secInCycle < acc + segLenSec) {
        index = i;
        break;
      }
      acc += segLenSec;
    }

    const segKey = schedule[index];
    const elapsedSec = secInCycle - acc;
    const totalSec = segMinutes[index] * 60;
    const remainingSec = Math.max(0, totalSec - Math.floor(elapsedSec));
    const progress = Math.min(1, Math.max(0, elapsedSec / totalSec));

    return { segKey, label: PHASE_LABEL[segKey], remainingSec, progress };
  }, [schedule, durations, tick]); // ★ 关键：把 tick 作为依赖
}

/** mm:ss */
function mmss(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** 本地“登录” & 头像（仅存 localStorage） */
const AVATAR_SET = ["🍅", "📚", "🎧", "🎯", "🧠", "📝", "☕", "🟢", "✨", "🧩"];
type User = { username: string; avatar: string };

const AuthCtx = createContext<{
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
  randomize: () => void;
} | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("pomodoroUser");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  useEffect(() => {
    if (user) localStorage.setItem("pomodoroUser", JSON.stringify(user));
    else localStorage.removeItem("pomodoroUser");
  }, [user]);

  const signIn = (u: User) => setUser(u);
  const signOut = () => setUser(null);
  const randomize = () =>
    setUser((u) => (u ? { ...u, avatar: AVATAR_SET[Math.floor(Math.random() * AVATAR_SET.length)] } : u));

  return <AuthCtx.Provider value={{ user, signIn, signOut, randomize }}>{children}</AuthCtx.Provider>;
};
function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("AuthCtx missing");
  return ctx;
}

/** 顶栏：左标题，右登录 */
const Header: React.FC = () => (
  <header className="header">
    <div className="brand">Harvey's Pomodoro</div>
    <AuthPill />
  </header>
);

/** 登录胶囊 + 面板（面板定位在按钮下方，不会遮挡） */
const SignInCard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATAR_SET[Math.floor(Math.random() * AVATAR_SET.length)]);
  return (
    <div className="panel" role="dialog" aria-modal="true">
      <div className="panel-head">
        <div className="small">Local sign-in (no backend)</div>
        <button className="btn" onClick={onClose}>✕</button>
      </div>

      <label className="label">Username</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Harvey" />

      <label className="label">Avatar</label>
      <div className="row">
        <div className="avatar big">{avatar}</div>
        <button className="btn" onClick={() => setAvatar(AVATAR_SET[Math.floor(Math.random() * AVATAR_SET.length)])}>
          Random
        </button>
      </div>

      <div className="row mt10">
        <button
          className="btn"
          onClick={() => {
            if (!name.trim()) return;
            signIn({ username: name.trim(), avatar });
            onClose();
          }}
        >
          Sign in
        </button>
      </div>
      <div className="small mt8">Stored only in this browser (localStorage).</div>
    </div>
  );
};

const AuthPill: React.FC = () => {
  const { user, signOut, randomize } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="auth-pillar">
      {user ? (
        <div className="pill">
          <div className="avatar">{user.avatar}</div>
          <div className="small truncate">{user.username}</div>
          <button className="btn" onClick={randomize}>Random</button>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <div className="pill">
          <button className="btn" onClick={() => setOpen((v) => !v)}>Sign in</button>
          {open && <SignInCard onClose={() => setOpen(false)} />}
        </div>
      )}
    </div>
  );
};

/** 头像小人（头=用户头像 emoji） */
const Mascot: React.FC<{ avatar: string }> = ({ avatar }) => {
  return (
    <div className="mascot" aria-label="your avatar buddy">
      <div className="mascot-head">{avatar}</div>
      <div className="mascot-body">
        <div className="torso" />
        <div className="arms">
          <span className="arm left" />
          <span className="arm right" />
        </div>
        <div className="legs">
          <span className="leg left" />
          <span className="leg right" />
        </div>
      </div>
    </div>
  );
};

/** 大时钟（进度环 + 文案 + 下方小人） */
const BigClock: React.FC = () => {
  const { segKey, label, remainingSec, progress } = usePomodoroClock();
  const { user } = useAuth();
  const avatar = (user?.avatar ?? "🍅");

  const ringStyle: React.CSSProperties = {
    background: `conic-gradient(${PHASE_COLOR[segKey]} ${Math.max(0, Math.min(99.999, progress * 100))}%, #121218 0)`,
  };

  return (
    <div className="clock-stack">
      <div className="now">Chicago time · {chicagoNowText()}</div>
      <div className="clock-wrap">
        <div className="ring" style={ringStyle} />
        <div className="face">
          <div className="phase">{label}</div>
          <div className="time">{mmss(remainingSec)}</div>
          <div className="meta">Phase: {segKey}</div>
        </div>
      </div>
      <Mascot avatar={avatar} />
    </div>
  );
};

/** 页面：顶栏 + 居中内容 */
const Page: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="center-stage">
        <BigClock />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Page />
    </AuthProvider>
  );
}
