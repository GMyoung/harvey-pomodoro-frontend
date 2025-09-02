// src/api.ts
export type PomodoroSetting = {
  workTimeDuration: number;
  longBreakDuration: number;
  shortBreakDuration: number;
  scheduling: string;
};
export type SystemState = {
  pomodoroSetting: PomodoroSetting;
  currentSession: number;
  endTime: string;    // ISO
  serverTime: string; // ISO
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/** 接收 Promise<Response>，在这里 await 掉 */
async function asJson<T>(respPromise: Promise<Response>): Promise<T> {
  const r = await respPromise;
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText} ${txt}`);
  }
  return r.json() as Promise<T>;
}

export async function register(username: string, password: string, email: string) {
  return asJson<{ token: string }>(
    fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    })
  );
}

export async function login(username: string, password: string) {
  return asJson<{ token: string }>(
    fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
  );
}

export async function getSystemState(token: string) {
  return asJson<SystemState>(
    fetch(`${API}/system/state`, {
      headers: { Authorization: `Bearer ${token}` }, // ← 注意这里是空格
    })
  );
}
