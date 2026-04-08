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

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex" data-testid="register-page">
      <div className="hidden lg:flex lg:w-1/2 border-r border-white/15 items-center justify-center p-12">
        <div>
          <h1 className="font-['Outfit'] text-5xl font-bold tracking-tighter mb-4">
            <span className="text-[#FACC15]">LEARN</span>HUB
          </h1>
          <p className="text-white/40 font-mono text-sm max-w-md leading-relaxed">
            Join thousands of students mastering programming through AI-powered personalized learning.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight mb-2">CREATE ACCOUNT</h2>
          <p className="text-sm text-white/40 font-mono mb-8">Start your learning journey today.</p>

          {error && (
            <div className="border border-red-500/50 bg-red-500/10 p-3 mb-6 text-sm text-red-400 font-mono" data-testid="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] transition-colors"
                placeholder="Your name"
                required
                data-testid="register-name-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15] transition-colors"
                placeholder="you@example.com"
                required
                data-testid="register-email-input"
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
                  placeholder="Min 6 characters"
                  required
                  data-testid="register-password-input"
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
              data-testid="register-submit-button"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="text-sm text-white/40 font-mono mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-[#FACC15] hover:underline" data-testid="register-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
