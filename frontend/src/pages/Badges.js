import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Zap, BookOpen, Compass, Map, GraduationCap, Brain } from "lucide-react";

const iconMap = { Zap, BookOpen, Brain, Compass, Map, GraduationCap };

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/badges").then(r => setBadges(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>;

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <div data-testid="badges-page">
      <div className="mb-8 animate-fade-in-up stagger-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">ACHIEVEMENTS</p>
        <h2 className="font-['Outfit'] text-3xl font-bold tracking-tighter">Badges & Rewards</h2>
        <p className="text-sm text-white/40 font-mono mt-2">{earned.length} of {badges.length} badges earned</p>
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.15em] text-[#FACC15] mb-4 font-mono">EARNED</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/15">
            {earned.map(badge => {
              const Icon = iconMap[badge.icon] || Zap;
              return (
                <div key={badge.id} className="bg-[#0A0A0A] p-6 text-center group card-hover animate-fade-in-up" data-testid={`badge-${badge.id}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-[#FACC15] mb-4 glow-accent animate-float">
                    <Icon size={28} className="text-[#FACC15]" />
                  </div>
                  <h3 className="font-['Outfit'] font-semibold text-sm">{badge.name}</h3>
                  <p className="text-[10px] text-white/40 font-mono mt-1">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/40 mb-4 font-mono">LOCKED</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/15">
            {locked.map(badge => {
              const Icon = iconMap[badge.icon] || Zap;
              return (
                <div key={badge.id} className="bg-[#0A0A0A] p-6 text-center opacity-40" data-testid={`badge-locked-${badge.id}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 border border-white/15 mb-4">
                    <Icon size={28} className="text-white/30" />
                  </div>
                  <h3 className="font-['Outfit'] font-semibold text-sm text-white/60">{badge.name}</h3>
                  <p className="text-[10px] text-white/30 font-mono mt-1">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
