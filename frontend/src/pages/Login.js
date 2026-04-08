import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

function formatError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex" data-testid="login-page">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-white/15 items-center justify-center p-12">
        <div>
          <h1 className="font-['Outfit'] text-5xl font-bold tracking-tighter mb-4">
            <span className="text-[#FACC15]">LEARN</span>HUB
          </h1>
          <p className="text-white/40 font-mono text-sm max-w-md leading-relaxed">
            Your personalized learning journey awaits. Master coding, earn achievements, and collaborate with peers.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight mb-2">SIGN IN</h2>
          <p className="text-sm text-white/40 font-mono mb-8">Enter your credentials to continue.</p>

          {error && (
            <div className="border border-red-500/50 bg-red-500/10 p-3 mb-6 text-sm text-red-400 font-mono" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] transition-colors"
                placeholder="you@example.com"
                required
                data-testid="login-email-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] transition-colors pr-12"
                  placeholder="Enter password"
                  required
                  data-testid="login-password-input"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FACC15] text-[#0A0A0A] py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit'] disabled:opacity-50"
              data-testid="login-submit-button"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <p className="text-sm text-white/40 font-mono mt-6 text-center">
            No account?{" "}
            <Link to="/register" className="text-[#FACC15] hover:underline" data-testid="login-register-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
