import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Zap, BookOpen, Compass, Map, GraduationCap, Brain } from "lucide-react";

const iconMap = { Zap, BookOpen, Brain, Compass, Map, GraduationCap };

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get("/badges").then(r => setBadges(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>;

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <div data-testid="badges-page">
      <div className="mb-8 animate-fade-in-up stagger-1">
        <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">Achievements</p>
        <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-[#1E293B]">Badges & Rewards</h2>
        <p className="text-sm text-[#94A3B8] font-mono mt-1">{earned.length} of {badges.length} badges earned</p>
      </div>

      {earned.length > 0 && (
        <div className="mb-10">
          <p className="text-sm font-semibold text-[#34D399] mb-4 font-['Outfit']">Earned</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earned.map(badge => {
              const Icon = iconMap[badge.icon] || Zap;
              return (
                <div key={badge.id} className="bg-white rounded-xl border border-[#34D399]/30 p-6 text-center card-hover animate-fade-in-up" data-testid={`badge-${badge.id}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#34D399]/10 mb-4 animate-float">
                    <Icon size={28} className="text-[#34D399]" />
                  </div>
                  <h3 className="font-['Outfit'] font-semibold text-sm text-[#1E293B]">{badge.name}</h3>
                  <p className="text-[10px] text-[#64748B] font-mono mt-1">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#94A3B8] mb-4 font-['Outfit']">Locked</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map(badge => {
              const Icon = iconMap[badge.icon] || Zap;
              return (
                <div key={badge.id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center opacity-50" data-testid={`badge-locked-${badge.id}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#F1F5F9] mb-4">
                    <Icon size={28} className="text-[#94A3B8]" />
                  </div>
                  <h3 className="font-['Outfit'] font-semibold text-sm text-[#64748B]">{badge.name}</h3>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-1">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
