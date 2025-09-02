// src/BackendProbe.tsx
import { useEffect, useState } from "react";
import { login, register, getSystemState, type SystemState } from "./api";

export default function BackendProbe() {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("password");
  const [email, setEmail] = useState("user1@example.com");
  const [token, setToken] = useState<string | null>(localStorage.getItem("jwt"));
  const [state, setState] = useState<SystemState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 每5秒拉一次 /system/state（如果有 token）
  useEffect(() => {
    let id: number | undefined;
    async function fetchState() {
      if (!token) return;
      try {
        const s = await getSystemState(token);
        setState(s);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "fetch error");
      }
    }
    fetchState();
    if (token) id = window.setInterval(fetchState, 5000);
    return () => { if (id) window.clearInterval(id); };
  }, [token]);

  async function doRegister() {
    try {
      const { token } = await register(username, password, email);
      localStorage.setItem("jwt", token);
      setToken(token);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "register failed");
    }
  }
  async function doLogin() {
    try {
      const { token } = await login(username, password);
      localStorage.setItem("jwt", token);
      setToken(token);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "login failed");
    }
  }
  function signOut() {
    localStorage.removeItem("jwt");
    setToken(null);
    setState(null);
  }

  return (
    <div style={{
      position: "fixed", right: 12, bottom: 12, zIndex: 9999,
      width: 360, padding: 12, borderRadius: 10,
      background: "#111827", color: "#e5e7eb", boxShadow: "0 6px 20px rgba(0,0,0,.35)",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica"
    }}>
      <div style={{fontWeight:700, marginBottom: 8}}>Backend Probe（联调面板）</div>

      {!token ? (
        <>
          <div style={{display:"grid", gap: 6, fontSize: 14}}>
            <label>Username <input value={username} onChange={e=>setUsername(e.target.value)} style={ipt}/></label>
            <label>Password <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={ipt}/></label>
            <label>Email <input value={email} onChange={e=>setEmail(e.target.value)} style={ipt}/></label>
          </div>
          <div style={{display:"flex", gap: 8, marginTop: 8}}>
            <button onClick={doRegister} style={btn}>Register</button>
            <button onClick={doLogin} style={btn}>Login</button>
          </div>
        </>
      ) : (
        <>
          <div style={{fontSize:12, opacity:.8, marginBottom:6}}>已登录（JWT 已存在浏览器）</div>
          <div style={{display:"flex", gap: 8}}>
            <button onClick={()=>{
              navigator.clipboard.writeText(token!);
              alert("Token 已复制到剪贴板");
            }} style={btn}>复制 Token</button>
            <button onClick={signOut} style={btn}>Sign out</button>
          </div>
        </>
      )}

      {error && <div style={{color:"#fca5a5", marginTop:8, fontSize:12}}>Error: {error}</div>}

      <div style={{marginTop:10, fontSize:12, opacity:.8}}>System State（每5秒刷新）</div>
      <pre style={{
        marginTop:4, maxHeight:160, overflow:"auto",
        background:"#0b1220", padding:8, borderRadius:6, fontSize:12
      }}>
{JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}

const ipt: React.CSSProperties = { width: "100%", background:"#0b1220", color:"#e5e7eb", border:"1px solid #374151", padding:"6px 8px", borderRadius:8 };
const btn: React.CSSProperties = { background:"#1f2937", color:"#e5e7eb", border:"1px solid #374151", padding:"6px 10px", borderRadius:8, cursor:"pointer" };
