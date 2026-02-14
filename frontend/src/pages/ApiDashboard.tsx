import { useState } from "react";
import { Send, Loader2, Zap, ShieldAlert, Code2 } from "lucide-react";

export default function ApiDashboard() {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
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

  const callApi = async () => {
    setLoading(true);
    setResponse("");
    try {
      const apiBase = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");
      const res = await fetch(`${apiBase}/call-api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          method,
          headers: JSON.parse(headers || "{}"),
          body: body ? JSON.parse(body) : null,
        }),
      });
      if (handleAuthError(res)) return;
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResponse(`System Exception: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">API Interface</h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldAlert size={10} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Secure proxy routing enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 p-4 bg-zinc-900/20 rounded-[2rem] border border-zinc-900 shadow-inner">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-emerald-500 hover:border-emerald-500/30 transition-all outline-none">
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ENTER TARGET ENDPOINT URL..." className={`${inputClass} flex-1`} />
        <button onClick={callApi} disabled={loading} className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? "REQUESTING..." : "DISPATCH"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-2">
            <Code2 size={12} className="text-zinc-600" />
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Headers (JSON)</label>
          </div>
          <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={4} className={`${inputClass} font-mono`} placeholder='{"Authorization": "Bearer key"}' />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-2">
            <Code2 size={12} className="text-zinc-600" />
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Payload (JSON)</label>
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={`${inputClass} font-mono`} placeholder='{"data": "content"}' />
        </div>
      </div>

      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-inner overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Response Buffer</div>
        </div>
        <pre className="flex-1 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl text-sm font-bold font-mono text-zinc-400 overflow-auto whitespace-pre-wrap custom-scrollbar selection:bg-emerald-500/20">
          {response || "Ready to intercept response headers and body..."}
        </pre>
      </div>
    </div>
  );
}