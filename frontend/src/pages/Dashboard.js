import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";
import { BookOpen, Trophy, CheckCircle, Clock, Zap, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>;

  const statCards = [
    { icon: BookOpen, label: "LESSONS DONE", value: stats?.total_lessons || 0 },
    { icon: TrendingUp, label: "COURSES", value: stats?.total_courses || 0 },
    { icon: Trophy, label: "BADGES", value: stats?.badges_earned || 0 },
    { icon: Zap, label: "XP", value: stats?.xp || 0 },
    { icon: CheckCircle, label: "TASKS DONE", value: stats?.tasks_done || 0 },
    { icon: Clock, label: "PENDING", value: stats?.tasks_pending || 0 },
  ];

  const quickLinks = [
    { to: "/learning-path", label: "AI LEARNING PATH", desc: "Get personalized recommendations", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=150&fit=crop" },
    { to: "/sandbox", label: "CODE SANDBOX", desc: "Practice coding in-browser", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=150&fit=crop" },
    { to: "/study-rooms", label: "STUDY ROOMS", desc: "Join a live video session", img: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=300&h=150&fit=crop" },
    { to: "/forum", label: "Q&A FORUM", desc: "Ask questions, get answers", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=150&fit=crop" },
  ];

  return (
    <div data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up stagger-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">DASHBOARD</p>
        <h2 className="font-['Outfit'] text-3xl md:text-4xl font-bold tracking-tighter">
          Welcome back, <span className="text-[#FACC15]">{user?.name}</span>
        </h2>
        <p className="text-sm text-white/40 font-mono mt-2">Level {stats?.level || 1} &middot; {stats?.xp || 0} XP</p>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-10 border border-white/15 p-4 animate-fade-in-up stagger-2 shimmer-bg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-wider text-white/50 font-mono">LEVEL PROGRESS</span>
          <span className="text-xs text-[#FACC15] font-mono">{(stats?.xp || 0) % 100}/100 XP</span>
        </div>
        <div className="h-2 bg-white/10 w-full overflow-hidden">
          <div className="h-full bg-[#FACC15] transition-all duration-1000 ease-out" style={{ width: `${(stats?.xp || 0) % 100}%` }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/15 mb-10" data-testid="stats-grid">
        {statCards.map(({ icon: Icon, label, value }, i) => (
          <div key={label} className={`bg-[#0A0A0A] p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
            <Icon size={20} className="text-[#FACC15] mb-3" strokeWidth={1.5} />
            <p className="font-['Outfit'] text-2xl font-bold">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-mono mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links with Images */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-4 font-mono">QUICK ACCESS</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/15">
          {quickLinks.map(({ to, label, desc, img }, i) => (
            <Link key={to} to={to} className={`bg-[#0A0A0A] group card-hover block animate-fade-in-up stagger-${Math.min(i + 1, 4)}`} data-testid={`quick-link-${to.slice(1)}`}>
              <div className="h-24 overflow-hidden relative">
                <img src={img} alt={label} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
                <div className="absolute inset-0 flex items-center px-6">
                  <div>
                    <h3 className="font-['Outfit'] text-lg font-semibold tracking-tight group-hover:text-[#FACC15] transition-colors">{label}</h3>
                    <p className="text-sm text-white/40 font-mono">{desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
