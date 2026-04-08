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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { icon: BookOpen, label: "Lessons Done", value: stats?.total_lessons || 0, accent: "bg-[#60A5FA]/10 text-[#60A5FA]" },
    { icon: TrendingUp, label: "Courses", value: stats?.total_courses || 0, accent: "bg-[#1E3A8A]/10 text-[#1E3A8A]" },
    { icon: Trophy, label: "Badges", value: stats?.badges_earned || 0, accent: "bg-[#34D399]/10 text-[#34D399]" },
    { icon: Zap, label: "XP", value: stats?.xp || 0, accent: "bg-[#60A5FA]/10 text-[#60A5FA]" },
    { icon: CheckCircle, label: "Tasks Done", value: stats?.tasks_done || 0, accent: "bg-[#34D399]/10 text-[#34D399]" },
    { icon: Clock, label: "Pending", value: stats?.tasks_pending || 0, accent: "bg-[#94A3B8]/10 text-[#94A3B8]" },
  ];

  const quickLinks = [
    { to: "/learning-path", label: "AI Learning Path", desc: "Get personalized recommendations", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=150&fit=crop" },
    { to: "/sandbox", label: "Code Sandbox", desc: "Practice coding in-browser", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=150&fit=crop" },
    { to: "/study-rooms", label: "Study Rooms", desc: "Join a live video session", img: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=300&h=150&fit=crop" },
    { to: "/forum", label: "Q&A Forum", desc: "Ask questions, get answers", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=150&fit=crop" },
  ];

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8 animate-fade-in-up stagger-1">
        <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">Dashboard</p>
        <h2 className="font-['Outfit'] text-3xl md:text-4xl font-bold tracking-tight text-[#1E293B]">
          Welcome back, <span className="text-[#1E3A8A]">{user?.name}</span>
        </h2>
        <p className="text-sm text-[#94A3B8] font-mono mt-1">Level {stats?.level || 1} &middot; {stats?.xp || 0} XP</p>
      </div>

      {/* XP Progress */}
      <div className="mb-8 bg-white rounded-xl border border-[#E2E8F0] p-4 animate-fade-in-up stagger-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-[#64748B] font-mono">Level Progress</span>
          <span className="text-xs text-[#1E3A8A] font-mono font-semibold">{(stats?.xp || 0) % 100}/100 XP</span>
        </div>
        <div className="h-2 bg-[#F1F5F9] rounded-full w-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#60A5FA] rounded-full transition-all duration-1000 ease-out" style={{ width: `${(stats?.xp || 0) % 100}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8" data-testid="stats-grid">
        {statCards.map(({ icon: Icon, label, value, accent }, i) => (
          <div key={label} className={`bg-white rounded-xl border border-[#E2E8F0] p-4 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
            <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="font-['Outfit'] text-2xl font-bold text-[#1E293B]">{value}</p>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <p className="text-sm font-semibold text-[#1E3A8A] mb-3 font-['Outfit']">Quick Access</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map(({ to, label, desc, img }, i) => (
          <Link key={to} to={to} className={`bg-white rounded-xl border border-[#E2E8F0] overflow-hidden group card-hover block animate-fade-in-up stagger-${Math.min(i + 1, 4)}`} data-testid={`quick-link-${to.slice(1)}`}>
            <div className="h-24 overflow-hidden relative">
              <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
              <div className="absolute inset-0 flex items-center px-5">
                <div>
                  <h3 className="font-['Outfit'] text-base font-semibold text-[#1E293B] group-hover:text-[#1E3A8A] transition-colors">{label}</h3>
                  <p className="text-xs text-[#64748B] font-mono">{desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
