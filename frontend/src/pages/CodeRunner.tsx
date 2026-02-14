import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Play, Loader2, Terminal, Shield } from "lucide-react";

export default function CodeRunner() {
  const [code, setCode] = useState(`# System ready: PyTool Neural Environment\nprint("PyTool Kernel 2.0.1 Initialized... 🚀")\n\n# Secure code sandbox\ndef security_audit():\n    print("Access Granted: Authorized Environment")\n\nsecurity_audit()`);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    try {
      const apiBase = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");
      const res = await fetch(`${apiBase}/run-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setOutput(data.success ? data.output : `❌ System Error:\n${data.error}`);
    } catch (e: any) {
      setOutput(`❌ Sandbox connection failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
            <Terminal size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Kernel Sandbox</h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield size={10} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Secure execution active</span>
            </div>
          </div>
        </div>
        <button
          onClick={runCode}
          disabled={loading}
          className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-8 py-3 rounded-2xl text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} className="group-hover:translate-x-0.5 transition-transform" />}
          {loading ? "EXECUTING..." : "DEPLOY & RUN"}
        </button>
      </div>

      <div className="flex-1 rounded-[2.5rem] overflow-hidden border-4 border-zinc-900 shadow-2xl min-h-[400px]">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            padding: { top: 32, bottom: 32 },
            fontFamily: "JetBrains Mono, Fira Code, monospace",
            fontWeight: "bold",
            cursorBlinking: "phase",
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System Standby</div>
        </div>
        <pre className="text-zinc-300 font-bold font-mono text-sm h-40 overflow-auto whitespace-pre-wrap custom-scrollbar selection:bg-emerald-500/30">
          {output || ">>> Initialize kernel to see stdout results..."}
        </pre>
      </div>
    </div>
  );
}