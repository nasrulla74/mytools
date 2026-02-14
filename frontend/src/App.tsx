import { useState, useEffect } from "react";
import { Code, Zap, Bot, Settings, LayoutDashboard, LogOut, User } from "lucide-react";
import CodeRunner from "./pages/CodeRunner";
import ApiDashboard from "./pages/ApiDashboard";
import AiChat from "./pages/AiChat";
import SettingsPage from "./pages/SettingsPage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "code", label: "Code Runner", icon: Code },
  { id: "apis", label: "API Caller", icon: Zap },
  { id: "ai", label: "AI Chat", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    // Decode JWT to get user (basic approach for now)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      localStorage.setItem("user", payload.sub);
      setUser(payload.sub);
    } catch (e) { console.error("Token error", e); }
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      const apiBase = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");
      fetch(`${apiBase}/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      }).then(res => {
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        } else {
          res.json().then(data => {
            localStorage.setItem("user", data.username);
            setUser(data.username);
          }).catch(() => {});
        }
      }).catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      });
    }
  }, [token]);

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <nav className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-black px-3 py-6 text-emerald-400 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">⚡</div>
            PyTool
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer
                  ${active === item.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="text-zinc-400" size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-black text-white truncate">{user || "Developer"}</div>
              <div className="text-[10px] font-bold text-zinc-500">Active Session</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-zinc-950 p-6 md:p-10">
        <div className="max-w-[1600px] mx-auto">
          {active === "dashboard" && <Dashboard />}
          {active === "code" && <CodeRunner />}
          {active === "apis" && <ApiDashboard />}
          {active === "ai" && <AiChat />}
          {active === "settings" && <SettingsPage />}
        </div>
      </main>

    </div>
  );
}