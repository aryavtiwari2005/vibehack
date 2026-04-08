import { Link } from "react-router-dom";
import { ArrowRight, Code2, Brain, Trophy, CalendarDays, MessageSquare, Video } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Learning Path", desc: "Personalized curriculum powered by AI that adapts to your strengths and weaknesses.", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop" },
  { icon: Code2, title: "Code Sandbox", desc: "Write and execute Python code directly in your browser. No setup required.", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop" },
  { icon: Trophy, title: "Gamified Progress", desc: "Earn badges, track XP, and climb the leaderboard as you learn.", img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=200&fit=crop" },
  { icon: CalendarDays, title: "Smart Planner", desc: "Drag-and-drop study scheduler with AI-generated prep plans.", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=200&fit=crop" },
  { icon: MessageSquare, title: "Q&A Forum", desc: "Ask questions, get peer and AI-powered answers instantly.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop" },
  { icon: Video, title: "Study Rooms", desc: "Join live video rooms to study and collaborate with peers in real time.", img: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=400&h=200&fit=crop" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1E293B]" data-testid="landing-page">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-white border-b border-[#E2E8F0] animate-fade-in">
        <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight">
          <span className="text-[#1E3A8A]">Learn</span><span className="text-[#34D399]">Hub</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors font-mono" data-testid="nav-login-link">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-[#1E3A8A] text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-[#1E3A8A]/90 transition-all btn-press font-['Outfit']"
            data-testid="nav-register-link"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-[#60A5FA]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#34D399]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl relative flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#34D399] mb-4 font-mono animate-fade-in-up stagger-1">Next-Gen Learning Platform</p>
            <h2 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in-up stagger-2">
              Learn to Code.<br />
              <span className="text-[#1E3A8A]">Build the Future.</span>
            </h2>
            <p className="text-base md:text-lg text-[#64748B] font-mono max-w-lg mb-8 leading-relaxed animate-fade-in-up stagger-3">
              AI-personalized tutoring, live study rooms, interactive coding sandbox, and gamified progress tracking.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-7 py-3 text-sm font-semibold rounded-lg hover:bg-[#1E3A8A]/90 transition-all btn-press font-['Outfit'] animate-pulse-glow"
                data-testid="hero-cta-button"
              >
                Start Learning <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-[#E2E8F0] text-[#1E293B] px-7 py-3 text-sm font-semibold rounded-lg hover:bg-[#F1F5F9] transition-all btn-press font-['Outfit']"
                data-testid="hero-login-button"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="hidden lg:block w-[420px] animate-slide-right stagger-3">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop" alt="Students studying" className="w-full hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/60 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#34D399] rounded-full animate-pulse" />
                <span className="text-xs text-white font-mono font-semibold">Live Study Rooms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 py-16 bg-white border-t border-[#E2E8F0]">
        <p className="text-sm font-semibold text-[#1E3A8A] mb-10 font-['Outfit'] animate-fade-in-up">Core Features</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, img }, i) => (
            <div key={title} className={`rounded-xl overflow-hidden border border-[#E2E8F0] bg-white group card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="h-36 overflow-hidden relative">
                <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                <div className="absolute bottom-3 left-4 w-9 h-9 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
                  <Icon size={18} className="text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-['Outfit'] text-base font-semibold mb-1.5 text-[#1E293B]">{title}</h3>
                <p className="text-sm text-[#64748B] font-mono leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 py-14 border-t border-[#E2E8F0] shimmer-bg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: "5+", label: "Courses" },
            { val: "21", label: "Lessons" },
            { val: "6", label: "Badges" },
            { val: "AI", label: "Powered" },
          ].map(({ val, label }, i) => (
            <div key={label} className={`animate-fade-in-up stagger-${i + 1}`}>
              <p className="font-['Outfit'] text-3xl md:text-4xl font-bold text-[#1E3A8A]">{val}</p>
              <p className="text-sm text-[#94A3B8] font-mono mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 bg-[#1E3A8A]">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <h3 className="font-['Outfit'] text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">Ready to level up?</h3>
          <p className="text-[#93C5FD] font-mono mb-8">Join students already learning smarter with AI-powered tools.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#34D399] text-[#1E293B] px-8 py-3.5 text-sm font-bold rounded-lg hover:bg-[#34D399]/90 transition-all btn-press font-['Outfit']"
            data-testid="cta-register-button"
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-[#E2E8F0] bg-white">
        <p className="text-xs text-[#94A3B8] font-mono">
          LearnHub &copy; {new Date().getFullYear()} &mdash; Built for students, by students.
        </p>
      </footer>
    </div>
  );
}
