import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

export default function CodeRunner() {
  const [code, setCode] = useState(`# Write your Python code here\nprint("Hello from PyTool! 🚀")\n\nfor i in range(5):\n    print(f"Count: {i}")`);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setOutput(data.success ? data.output : `❌ Error:\n${data.error}`);
    } catch (e: any) {
      setOutput(`❌ Connection error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Python Code Runner</h2>
        <button
          onClick={runCode}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border border-zinc-800 min-h-[300px]">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
        />
      </div>
      <div>
        <div className="text-sm text-zinc-400 mb-1">Output</div>
        <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-sm font-mono h-48 overflow-auto whitespace-pre-wrap">
          {output || "Click 'Run Code' to see output..."}
        </pre>
      </div>
    </div>
  );
}