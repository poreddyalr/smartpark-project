import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: 'cyan' | 'green' | 'red' | 'violet' | 'amber';
  sub?: string;
}

const ACCENTS = {
  cyan: {
    icon: 'bg-neon-cyan/10 text-neon-cyan',
    value: 'text-neon-cyan',
    glow: 'group-hover:shadow-glow-cyan group-hover:border-neon-cyan/40',
  },
  green: {
    icon: 'bg-neon-green/10 text-neon-green',
    value: 'text-neon-green',
    glow: 'group-hover:shadow-glow-green group-hover:border-neon-green/40',
  },
  red: {
    icon: 'bg-neon-red/10 text-neon-red',
    value: 'text-neon-red',
    glow: 'group-hover:shadow-glow-red group-hover:border-neon-red/40',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-400',
    value: 'text-violet-400',
    glow: 'group-hover:shadow-glow-cyan group-hover:border-violet-400/40',
  },
  amber: {
    icon: 'bg-neon-amber/10 text-neon-amber',
    value: 'text-neon-amber',
    glow: 'group-hover:shadow-glow-cyan group-hover:border-neon-amber/40',
  },
};

export default function StatCard({ icon: Icon, label, value, accent, sub }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <div className={`glass glass-hover group p-5 ${a.glow}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <p className={`mt-2 font-display text-3xl font-bold tabular-nums ${a.value}`}>
            {value}
          </p>
          {sub && <p className="mt-1 truncate text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`rounded-xl p-3 ${a.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
