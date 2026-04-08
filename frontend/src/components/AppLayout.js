import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Route, Code2, Trophy, CalendarDays, MessageSquare, LogOut, Menu, X, Video } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learning-path", label: "Learning Path", icon: Route },
  { to: "/sandbox", label: "Code Sandbox", icon: Code2 },
  { to: "/badges", label: "Badges", icon: Trophy },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/study-rooms", label: "Study Rooms", icon: Video },
  { to: "/forum", label: "Q&A Forum", icon: MessageSquare },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex" data-testid="app-layout">
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} data-testid="sidebar">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h1 className="font-['Outfit'] text-xl font-bold tracking-tight">
            <span className="text-[#1E3A8A]">Learn</span><span className="text-[#34D399]">Hub</span>
          </h1>
          <button className="lg:hidden text-[#94A3B8] hover:text-[#1E293B]" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5" data-testid="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-mono rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#1E3A8A]/10 text-[#1E3A8A] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
                }`
              }
              data-testid={`nav-${to.slice(1)}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center text-white font-bold text-sm font-['Outfit']">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1E293B] truncate">{user?.name}</p>
              <p className="text-xs text-[#94A3B8] truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            data-testid="logout-button">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E2E8F0]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#64748B] hover:text-[#1E293B]" data-testid="mobile-menu-button"><Menu size={24} /></button>
          <h1 className="font-['Outfit'] text-lg font-bold"><span className="text-[#1E3A8A]">Learn</span><span className="text-[#34D399]">Hub</span></h1>
          <div className="w-6" />
        </div>
        <div className="p-6 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
