import { Link } from "react-router-dom";
import { ArrowRight, Code2, Brain, Trophy, CalendarDays, MessageSquare, Video } from "lucide-react";

const features = [
  { icon: Brain, title: "AI LEARNING PATH", desc: "Personalized curriculum powered by AI that adapts to your strengths and weaknesses.", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop" },
  { icon: Code2, title: "CODE SANDBOX", desc: "Write and execute Python code directly in your browser. No setup required.", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop" },
  { icon: Trophy, title: "GAMIFIED PROGRESS", desc: "Earn badges, track XP, and climb the leaderboard as you learn.", img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=200&fit=crop" },
  { icon: CalendarDays, title: "SMART PLANNER", desc: "Drag-and-drop study scheduler with AI-generated prep plans.", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=200&fit=crop" },
  { icon: MessageSquare, title: "Q&A FORUM", desc: "Ask questions, get peer and AI-powered answers instantly.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop" },
  { icon: Video, title: "STUDY ROOMS", desc: "Join live video rooms to study and collaborate with peers in real time.", img: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=400&h=200&fit=crop" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white grain-overlay relative" data-testid="landing-page">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/15 relative z-10 animate-fade-in">
        <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight">
          <span className="text-[#FACC15]">LEARN</span>HUB
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors font-mono" data-testid="nav-login-link">
            LOG IN
          </Link>
          <Link
            to="/register"
            className="bg-[#FACC15] text-[#0A0A0A] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-all btn-press font-['Outfit']"
            data-testid="nav-register-link"
          >
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 py-20 md:py-32 overflow-hidden z-10">
        {/* Background accent */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#FACC15]/5 blur-[128px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#FACC15]/3 blur-[96px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl relative">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-6 font-mono animate-fade-in-up stagger-1">NEXT-GEN LEARNING PLATFORM</p>
          <h2 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95] mb-8 animate-fade-in-up stagger-2">
            LEARN TO CODE.<br />
            <span className="text-[#FACC15] inline-block">BUILD THE FUTURE.</span>
          </h2>
          <p className="text-base md:text-lg text-white/60 font-mono max-w-xl mb-10 leading-relaxed animate-fade-in-up stagger-3">
            AI-personalized tutoring, live study rooms, interactive coding sandbox, and gamified progress tracking. Everything a student needs.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#FACC15] text-[#0A0A0A] px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-all btn-press font-['Outfit'] animate-pulse-glow"
              data-testid="hero-cta-button"
            >
              START LEARNING <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-white/15 text-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-white/5 hover:border-white/30 transition-all btn-press font-['Outfit']"
              data-testid="hero-login-button"
            >
              SIGN IN
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hidden lg:block absolute top-8 right-12 w-[440px] animate-slide-right stagger-3">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop" 
              alt="Students studying" 
              className="w-full border border-white/10 opacity-70 hover:opacity-90 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FACC15] animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-[#FACC15] font-mono">LIVE STUDY ROOMS AVAILABLE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 py-16 border-t border-white/15 relative z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-10 font-mono animate-fade-in-up">CORE FEATURES</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/15">
          {features.map(({ icon: Icon, title, desc, img }, i) => (
            <div key={title} className={`bg-[#0A0A0A] group card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="h-32 overflow-hidden relative">
                <img src={img} alt={title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                <Icon size={28} className="absolute bottom-4 left-6 text-[#FACC15]" strokeWidth={1.5} />
              </div>
              <div className="p-6">
                <h3 className="font-['Outfit'] text-lg font-semibold mb-2 tracking-tight group-hover:text-[#FACC15] transition-colors">{title}</h3>
                <p className="text-sm text-white/50 font-mono leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 md:px-12 py-12 border-t border-white/15 relative z-10 shimmer-bg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: "5+", label: "Courses" },
            { val: "21", label: "Lessons" },
            { val: "6", label: "Badges" },
            { val: "AI", label: "Powered" },
          ].map(({ val, label }, i) => (
            <div key={label} className={`animate-fade-in-up stagger-${i + 1}`}>
              <p className="font-['Outfit'] text-3xl md:text-4xl font-bold text-[#FACC15]">{val}</p>
              <p className="text-sm text-white/40 font-mono mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 border-t border-white/15 relative z-10">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <h3 className="font-['Outfit'] text-3xl md:text-4xl font-bold tracking-tighter mb-4">Ready to level up?</h3>
          <p className="text-white/40 font-mono mb-8">Join students already learning smarter with AI-powered tools.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#FACC15] text-[#0A0A0A] px-10 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-all btn-press font-['Outfit']"
            data-testid="cta-register-button"
          >
            CREATE FREE ACCOUNT <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-white/15 relative z-10">
        <p className="text-xs text-white/30 font-mono">
          LEARNHUB &copy; {new Date().getFullYear()} &mdash; Built for students, by students.
        </p>
      </footer>
    </div>
  );
}
