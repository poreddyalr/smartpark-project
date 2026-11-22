import { useState } from 'react';
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  History,
  Code2,
  SquareParking,
  Menu,
  X,
} from 'lucide-react';

export type PageId = 'dashboard' | 'entry' | 'exit' | 'history' | 'code';

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'entry', label: 'Vehicle Entry', icon: LogIn },
  { id: 'exit', label: 'Vehicle Exit', icon: LogOut },
  { id: 'history', label: 'Parking History', icon: History },
  { id: 'code', label: 'C Programs', icon: Code2 },
];

interface LayoutProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

export default function Layout({ page, onNavigate, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (id: PageId) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = page === id;
        return (
          <button
            key={id}
            onClick={() => nav(id)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan ring-1 ring-inset ring-neon-cyan/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-night-900/80 px-4 py-6 backdrop-blur-xl lg:flex">
        <button
          onClick={() => nav('dashboard')}
          className="mb-8 flex items-center gap-3 px-2 text-left"
        >
          <div className="rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue p-2.5 shadow-glow-cyan">
            <SquareParking className="h-6 w-6 text-night-950" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-wide text-white">
              SMART<span className="neon-text">PARK</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Parking Control Centre
            </p>
          </div>
        </button>
        {navList}
        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-green" />
            </span>
            <p className="text-xs font-medium text-neon-green">All sensors online</p>
          </div>
          <p className="mt-2 text-[10px] text-slate-600">PPS Project • C + Web Dashboard</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-night-900/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue p-2">
            <SquareParking className="h-5 w-5 text-night-950" />
          </div>
          <p className="font-display text-base font-bold tracking-wide text-white">
            SMART<span className="neon-text">PARK</span>
          </p>
        </div>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg border border-white/10 p-2 text-slate-300"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-x-0 top-[57px] z-40 border-b border-white/10 bg-night-900/95 px-4 py-4 backdrop-blur-xl lg:hidden animate-fade-in">
          {navList}
        </div>
      )}

      <main className="w-full flex-1 px-4 pb-12 pt-20 sm:px-6 lg:ml-64 lg:max-w-[calc(100vw-16rem)] lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
