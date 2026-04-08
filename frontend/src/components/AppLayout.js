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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex" data-testid="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/15 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} data-testid="sidebar">
        <div className="p-6 border-b border-white/15 flex items-center justify-between">
          <h1 className="font-['Outfit'] text-xl font-bold tracking-tight">
            <span className="text-[#FACC15]">LEARN</span>HUB
          </h1>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1" data-testid="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-mono transition-colors duration-200 ${
                  isActive
                    ? "bg-[#FACC15]/10 text-[#FACC15] border-l-2 border-[#FACC15]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`
              }
              data-testid={`nav-${to.slice(1)}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/15">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-[#FACC15] flex items-center justify-center text-[#0A0A0A] font-bold text-sm font-['Outfit']">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            data-testid="logout-button"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/15">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white" data-testid="mobile-menu-button">
            <Menu size={24} />
          </button>
          <h1 className="font-['Outfit'] text-lg font-bold">
            <span className="text-[#FACC15]">LEARN</span>HUB
          </h1>
          <div className="w-6" />
        </div>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
