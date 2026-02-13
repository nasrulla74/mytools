import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function ApiDashboard() {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const callApi = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          method,
          headers: JSON.parse(headers || "{}"),
          body: body ? JSON.parse(body) : null,
        }),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="text-xl font-semibold">API Caller</h2>
      <div className="flex gap-2">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/..." className={`${inputClass} flex-1`} />
        <button onClick={callApi} disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm cursor-pointer">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Headers (JSON)</label>
          <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={3} className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Body (JSON)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={inputClass} placeholder='{"key": "value"}' />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-zinc-400 mb-1">Response</div>
        <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-sm font-mono h-64 overflow-auto whitespace-pre-wrap">
          {response || "Send a request to see the response..."}
        </pre>
      </div>
    </div>
  );
}