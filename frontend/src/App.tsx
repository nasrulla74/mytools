import { useState } from "react";
import { Code, Zap, Bot, Settings } from "lucide-react";
import CodeRunner from "./pages/CodeRunner";
import ApiDashboard from "./pages/ApiDashboard";
import AiChat from "./pages/AiChat";
import SettingsPage from "./pages/SettingsPage";

const navItems = [
  { id: "code", label: "Code Runner", icon: Code },
  { id: "apis", label: "API Caller", icon: Zap },
  { id: "ai", label: "AI Chat", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [active, setActive] = useState("code");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-56 bg-zinc-900 border-r border-zinc-800 p-3 flex flex-col gap-1">
        <div className="text-lg font-bold px-3 py-4 text-emerald-400">⚡ PyTool</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer
              ${active === item.id
                ? "bg-emerald-600/20 text-emerald-400"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 bg-zinc-950">
        {active === "code" && <CodeRunner />}
        {active === "apis" && <ApiDashboard />}
        {active === "ai" && <AiChat />}
        {active === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}