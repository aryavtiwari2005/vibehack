import { useState } from "react";
import Editor from "@monaco-editor/react";
import API from "@/lib/api";
import { Play, Loader2, RotateCcw } from "lucide-react";

const STARTER_CODE = `# Welcome to the Code Sandbox!
# Write your Python code here and click RUN.

def greet(name):
    return f"Hello, {name}! Welcome to LearnHub."

print(greet("Student"))

# Try some exercises:
# 1. Write a function to calculate factorial
# 2. Create a list and sort it
# 3. Build a simple calculator
`;

export default function Sandbox() {
  const [code, setCode] = useState(STARTER_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setError("");
    try {
      const { data } = await API.post("/sandbox/execute", { code, language: "python" });
      setOutput(data.output || "");
      setError(data.error || "");
    } catch (err) {
      setError("Failed to execute code. Please try again.");
    }
    setRunning(false);
  };

  const resetCode = () => {
    setCode(STARTER_CODE);
    setOutput("");
    setError("");
  };

  return (
    <div data-testid="sandbox-page">
      <div className="mb-6 animate-fade-in-up stagger-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">CODE SANDBOX</p>
        <h2 className="font-['Outfit'] text-3xl font-bold tracking-tighter">Interactive Python Editor</h2>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 border border-white/15 p-3 animate-fade-in-up stagger-2">
        <button
          onClick={runCode}
          disabled={running}
          className="bg-[#FACC15] text-[#0A0A0A] px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit'] disabled:opacity-50 flex items-center gap-2"
          data-testid="run-code-button"
        >
          {running ? <><Loader2 size={14} className="animate-spin" /> RUNNING...</> : <><Play size={14} /> RUN CODE</>}
        </button>
        <button
          onClick={resetCode}
          className="border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors font-['Outfit'] flex items-center gap-2"
          data-testid="reset-code-button"
        >
          <RotateCcw size={14} /> RESET
        </button>
        <span className="text-xs text-white/30 font-mono ml-auto">PYTHON 3</span>
      </div>

      {/* Editor + Output split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/15 border border-white/15">
        {/* Editor */}
        <div className="bg-[#0A0A0A]" data-testid="code-editor-container">
          <div className="border-b border-white/15 px-4 py-2">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">EDITOR</span>
          </div>
          <Editor
            height="500px"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              renderLineHighlight: "none",
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
            }}
          />
        </div>

        {/* Output */}
        <div className="bg-[#0A0A0A]" data-testid="code-output-container">
          <div className="border-b border-white/15 px-4 py-2">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">OUTPUT</span>
          </div>
          <div className="h-[500px] overflow-auto p-4 font-mono text-sm">
            {running && (
              <div className="flex items-center gap-2 text-[#FACC15]">
                <Loader2 size={14} className="animate-spin" />
                <span>Executing...</span>
              </div>
            )}
            {output && <pre className="text-white/80 whitespace-pre-wrap" data-testid="code-output">{output}</pre>}
            {error && <pre className="text-red-400 whitespace-pre-wrap" data-testid="code-error">{error}</pre>}
            {!running && !output && !error && (
              <p className="text-white/20">Run your code to see output here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
