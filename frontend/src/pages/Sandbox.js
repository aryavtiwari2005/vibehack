import { useState } from "react";
import Editor from "@monaco-editor/react";
import API from "@/lib/api";
import { Play, Loader2, RotateCcw } from "lucide-react";

const STARTER_CODE = `# Welcome to the Code Sandbox!\n# Write your Python code here and click RUN.\n\ndef greet(name):\n    return f"Hello, {name}! Welcome to LearnHub."\n\nprint(greet("Student"))\n`;

export default function Sandbox() {
  const [code, setCode] = useState(STARTER_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const runCode = async () => {
    setRunning(true); setOutput(""); setError("");
    try { const { data } = await API.post("/sandbox/execute", { code, language: "python" }); setOutput(data.output || ""); setError(data.error || ""); } catch { setError("Failed to execute code."); }
    setRunning(false);
  };

  return (
    <div data-testid="sandbox-page">
      <div className="mb-6 animate-fade-in-up stagger-1">
        <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">Code Sandbox</p>
        <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-[#1E293B]">Interactive Python Editor</h2>
      </div>

      <div className="flex items-center gap-3 mb-4 bg-white rounded-xl border border-[#E2E8F0] p-3 animate-fade-in-up stagger-2">
        <button onClick={runCode} disabled={running}
          className="bg-[#34D399] text-[#1E293B] px-5 py-2 text-xs font-semibold rounded-lg hover:bg-[#34D399]/90 btn-press font-['Outfit'] disabled:opacity-50 flex items-center gap-2"
          data-testid="run-code-button">
          {running ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Play size={14} /> Run Code</>}
        </button>
        <button onClick={() => { setCode(STARTER_CODE); setOutput(""); setError(""); }}
          className="border border-[#E2E8F0] px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#F1F5F9] btn-press font-['Outfit'] flex items-center gap-2 text-[#64748B]"
          data-testid="reset-code-button">
          <RotateCcw size={14} /> Reset
        </button>
        <span className="text-xs text-[#94A3B8] font-mono ml-auto">Python 3</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up stagger-3">
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" data-testid="code-editor-container">
          <div className="border-b border-[#E2E8F0] px-4 py-2"><span className="text-xs text-[#64748B] font-mono font-semibold">Editor</span></div>
          <Editor height="480px" language="python" theme="vs-light" value={code} onChange={(v) => setCode(v || "")}
            options={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 16 }, renderLineHighlight: "none" }} />
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" data-testid="code-output-container">
          <div className="border-b border-[#E2E8F0] px-4 py-2"><span className="text-xs text-[#64748B] font-mono font-semibold">Output</span></div>
          <div className="h-[480px] overflow-auto p-4 font-mono text-sm">
            {running && <div className="flex items-center gap-2 text-[#60A5FA]"><Loader2 size={14} className="animate-spin" /><span>Executing...</span></div>}
            {output && <pre className="text-[#1E293B] whitespace-pre-wrap" data-testid="code-output">{output}</pre>}
            {error && <pre className="text-red-500 whitespace-pre-wrap" data-testid="code-error">{error}</pre>}
            {!running && !output && !error && <p className="text-[#94A3B8]">Run your code to see output here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
