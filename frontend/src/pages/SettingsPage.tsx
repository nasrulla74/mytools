import { useState } from "react";

export default function SettingsPage() {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Anthropic API Key</label>
          <input type="password" value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className={inputClass} placeholder="sk-ant-..." />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">OpenAI API Key</label>
          <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} className={inputClass} placeholder="sk-..." />
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm w-fit cursor-pointer"
        >
          {saved ? "✓ Saved!" : "Save Settings"}
        </button>
        <p className="text-xs text-zinc-500">
          Tip: You can also set keys as environment variables: ANTHROPIC_API_KEY and OPENAI_API_KEY
        </p>
      </div>
    </div>
  );
}