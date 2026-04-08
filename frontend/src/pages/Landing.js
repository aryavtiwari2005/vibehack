import { Link } from "react-router-dom";
import { ArrowRight, Code2, Brain, Trophy, CalendarDays, MessageSquare } from "lucide-react";

const features = [
  { icon: Brain, title: "AI LEARNING PATH", desc: "Personalized curriculum powered by AI that adapts to your strengths and weaknesses." },
  { icon: Code2, title: "CODE SANDBOX", desc: "Write and execute Python code directly in your browser. No setup required." },
  { icon: Trophy, title: "GAMIFIED PROGRESS", desc: "Earn badges, track XP, and climb the leaderboard as you learn." },
  { icon: CalendarDays, title: "SMART PLANNER", desc: "Drag-and-drop study scheduler with AI-generated prep plans." },
  { icon: MessageSquare, title: "Q&A FORUM", desc: "Ask questions, get peer and AI-powered answers instantly." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" data-testid="landing-page">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/15">
        <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight">
          <span className="text-[#FACC15]">LEARN</span>HUB
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors font-mono" data-testid="nav-login-link">
            LOG IN
          </Link>
          <Link
            to="/register"
            className="bg-[#FACC15] text-[#0A0A0A] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit']"
            data-testid="nav-register-link"
          >
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-6 font-mono">NEXT-GEN LEARNING PLATFORM</p>
          <h2 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-8">
            LEARN TO CODE.<br />
            <span className="text-[#FACC15]">BUILD THE FUTURE.</span>
          </h2>
          <p className="text-base md:text-lg text-white/60 font-mono max-w-xl mb-10 leading-relaxed">
            AI-personalized tutoring, collaborative tools, and gamified progress tracking. Everything a student needs in one platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#FACC15] text-[#0A0A0A] px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit']"
              data-testid="hero-cta-button"
            >
              START LEARNING <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-white/15 text-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition-colors font-['Outfit']"
              data-testid="hero-login-button"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 py-16 border-t border-white/15">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-10 font-mono">CORE FEATURES</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/15">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#0A0A0A] p-8 hover:bg-[#121212] transition-colors group">
              <Icon size={24} className="text-[#FACC15] mb-4" strokeWidth={1.5} />
              <h3 className="font-['Outfit'] text-lg font-semibold mb-3 tracking-tight">{title}</h3>
              <p className="text-sm text-white/50 font-mono leading-relaxed">{desc}</p>
            </div>
          ))}
          <div className="bg-[#0A0A0A] p-8 flex items-center justify-center border-l border-white/15">
            <Link to="/register" className="text-[#FACC15] font-['Outfit'] font-bold text-lg hover:underline flex items-center gap-2" data-testid="features-cta-link">
              JOIN NOW <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 md:px-12 py-12 border-t border-white/15">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: "5+", label: "Courses" },
            { val: "20+", label: "Lessons" },
            { val: "6", label: "Badges" },
            { val: "AI", label: "Powered" },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="font-['Outfit'] text-3xl md:text-4xl font-bold text-[#FACC15]">{val}</p>
              <p className="text-sm text-white/40 font-mono mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-white/15">
        <p className="text-xs text-white/30 font-mono">
          LEARNHUB &copy; {new Date().getFullYear()} &mdash; Built for students, by students.
        </p>
      </footer>
    </div>
  );
}
