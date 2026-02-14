import { useState } from "react";
import { Send, Loader2, Bot } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleAuthError = (res: Response) => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
      return true;
    }
    return false;
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    // Get the key for the current provider
    const apiKey = localStorage.getItem(`${provider}_api_key`);

    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const apiBase = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");
      const res = await fetch(`${apiBase}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: input,
          provider,
          api_key: apiKey
        }),
      });
      if (handleAuthError(res)) return;
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.response || data.error }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">AI Neural Chat</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">Multi-Model Processing Interface</p>
        </div>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-400 focus:border-emerald-500/50 transition-all outline-none">
          <option value="anthropic">Claude-3.5 Sonnet</option>
          <option value="openai">GPT-4o Omnimodel</option>
          <option value="deepseek">DeepSeek-V3 Coder</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto p-8 flex flex-col gap-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="m-auto text-center space-y-4 opacity-20">
            <Bot size={64} className="mx-auto text-emerald-500" />
            <div className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Awaiting Input...</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-xl ${msg.role === "user"
                ? "bg-emerald-600 text-white rounded-br-none"
                : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-zinc-950/50 border-t border-zinc-900">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Initialize query..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 pr-16 text-white outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700"
          />
          <button
            onClick={send}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}