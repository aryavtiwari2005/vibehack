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
    <div className="min-h-screen bg-[#F9FAFB] flex" data-testid="login-page">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] items-center justify-center p-12">
        <div className="animate-fade-in-up">
          <h1 className="font-['Outfit'] text-5xl font-bold tracking-tight mb-4 text-white">
            Learn<span className="text-[#34D399]">Hub</span>
          </h1>
          <p className="text-[#93C5FD] font-mono text-sm max-w-md leading-relaxed">
            Your personalized learning journey awaits. Master coding, earn achievements, and collaborate with peers.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight mb-2 text-[#1E293B]">Sign In</h2>
          <p className="text-sm text-[#64748B] font-mono mb-8">Enter your credentials to continue.</p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 mb-6 text-sm text-red-600 font-mono" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] px-4 py-3 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 transition-all"
                placeholder="you@example.com" required data-testid="login-email-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] px-4 py-3 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 transition-all pr-12"
                  placeholder="Enter password" required data-testid="login-password-input" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1E3A8A] text-white py-3 text-sm font-semibold rounded-lg hover:bg-[#1E3A8A]/90 transition-all btn-press font-['Outfit'] disabled:opacity-50"
              data-testid="login-submit-button">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-[#64748B] font-mono mt-6 text-center">
            No account?{" "}
            <Link to="/register" className="text-[#1E3A8A] font-semibold hover:underline" data-testid="login-register-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
