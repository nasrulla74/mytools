import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, provider }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.response || data.error }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">AI Chat</h2>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
          <option value="anthropic">Claude (Anthropic)</option>
          <option value="openai">GPT-4o (OpenAI)</option>
        </select>
      </div>
      <div className="flex-1 overflow-auto bg-zinc-900 rounded-lg border border-zinc-800 p-4 mb-4 flex flex-col gap-3">
        {messages.length === 0 && <div className="text-zinc-500 text-sm m-auto">Start a conversation...</div>}
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
            msg.role === "user" ? "bg-emerald-600/20 text-emerald-100 self-end" : "bg-zinc-800 self-start"
          }`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="self-start text-zinc-500"><Loader2 size={16} className="animate-spin" /></div>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask something..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
        <button onClick={send} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 px-4 rounded-lg cursor-pointer">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}