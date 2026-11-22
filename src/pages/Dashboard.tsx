import {
  SquareParking,
  CircleCheck,
  CircleX,
  Car,
  Coins,
  Gauge,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import {
  TOTAL_SLOTS,
  SLOT_IDS,
  HOURLY_RATE,
  formatCurrency,
  type ActiveVehicle,
  type HistoryRecord,
} from '@/lib/parking';

interface DashboardProps {
  active: ActiveVehicle[];
  history: HistoryRecord[];
  onNavigate: (page: 'entry' | 'exit' | 'history') => void;
}

export default function Dashboard({ active, history, onNavigate }: DashboardProps) {
  const occupied = active.length;
  const available = TOTAL_SLOTS - occupied;
  const revenue = history.reduce((sum, r) => sum + r.fee, 0);
  const occupancyPct = Math.round((occupied / TOTAL_SLOTS) * 100);
  const isFull = available === 0;

  const gaugeColor =
    occupancyPct >= 90
      ? 'text-neon-red stroke-neon-red'
      : occupancyPct >= 60
        ? 'text-neon-amber stroke-neon-amber'
        : 'text-neon-green stroke-neon-green';
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - occupied / TOTAL_SLOTS);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Control <span className="neon-text">Centre</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Live overview of the smart parking facility • Flat rate {formatCurrency(HOURLY_RATE)}/hr
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('entry')} className="btn-primary !py-2.5">
            Register Entry
          </button>
          <button onClick={() => onNavigate('exit')} className="btn-danger !py-2.5">
            Register Exit
          </button>
        </div>
      </header>

      {isFull && (
        <div className="glass flex items-center gap-3 border-neon-red/50 p-4 shadow-glow-red animate-fade-in">
          <CircleX className="h-6 w-6 shrink-0 text-neon-red" />
          <div>
            <p className="font-display font-semibold text-neon-red">Parking Full</p>
            <p className="text-sm text-slate-300">
              All {TOTAL_SLOTS} slots are occupied. New vehicles cannot be registered until one
              exits.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={SquareParking}
          label="Total Slots"
          value={String(TOTAL_SLOTS)}
          accent="violet"
          sub="Fixed capacity facility"
        />
        <StatCard
          icon={CircleCheck}
          label="Available"
          value={String(available)}
          accent="green"
          sub={isFull ? 'Facility at capacity' : 'Ready for new vehicles'}
        />
        <StatCard
          icon={CircleX}
          label="Occupied"
          value={String(occupied)}
          accent="red"
          sub={`${occupancyPct}% of facility in use`}
        />
        <StatCard
          icon={Car}
          label="Vehicles Parked"
          value={String(occupied)}
          accent="cyan"
          sub="Currently inside the facility"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Occupancy gauge */}
        <div className="glass flex flex-col items-center justify-center p-6">
          <div className="flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Gauge className="h-4 w-4" /> Occupancy
          </div>
          <div className="relative mt-4">
            <svg width="150" height="150" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-night-600" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className={`${gaugeColor} transition-all duration-700 drop-shadow-[0_0_6px_currentColor]`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display text-3xl font-bold tabular-nums ${gaugeColor.split(' ')[0]}`}>
                {occupancyPct}%
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">occupied</span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            {available} of {TOTAL_SLOTS} slots available
          </p>
        </div>

        {/* Revenue */}
        <div className="glass glass-hover group flex flex-col justify-center p-6 hover:border-neon-green/40 hover:shadow-glow-green">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Coins className="h-4 w-4" /> Total Revenue
          </div>
          <p className="mt-4 font-display text-4xl font-bold tabular-nums text-neon-green drop-shadow-[0_0_14px_rgba(52,245,165,0.45)]">
            {formatCurrency(revenue)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Collected from {history.length} completed {history.length === 1 ? 'trip' : 'trips'}
          </p>
          <button
            onClick={() => onNavigate('history')}
            className="mt-4 self-start text-xs font-semibold uppercase tracking-widest text-neon-cyan transition-colors hover:text-white"
          >
            View history →
          </button>
        </div>

        {/* Currently parked */}
        <div className="glass p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Parked Vehicles
          </p>
          {active.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No vehicles inside. Register an entry to get started.
            </p>
          ) : (
            <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
              {active.map((v) => (
                <li
                  key={v.regNo}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-night-800/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold text-slate-100">
                      {v.regNo}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      {v.vehicleType} • since {v.entryTime}
                    </p>
                  </div>
                  <span className="ml-2 rounded-md bg-neon-red/15 px-2 py-1 font-mono text-xs font-bold text-neon-red">
                    {v.slot}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Availability overview */}
      <section className="glass p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Slot Availability Map
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neon-green">
              <span className="h-2.5 w-2.5 rounded-full bg-neon-green shadow-glow-green" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-neon-red">
              <span className="h-2.5 w-2.5 rounded-full bg-neon-red shadow-glow-red" /> Occupied
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SLOT_IDS.map((slot) => {
            const vehicle = active.find((v) => v.slot === slot);
            const isOccupied = Boolean(vehicle);
            return (
              <div
                key={slot}
                className={`rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.03] ${
                  isOccupied
                    ? 'border-neon-red/50 bg-neon-red/10 shadow-glow-red'
                    : 'border-neon-green/40 bg-neon-green/[0.07] shadow-glow-green'
                }`}
              >
                <p
                  className={`font-mono text-sm font-bold ${
                    isOccupied ? 'text-neon-red' : 'text-neon-green'
                  }`}
                >
                  {slot}
                </p>
                {vehicle ? (
                  <>
                    <p className="mt-1 truncate font-mono text-[11px] text-slate-200">
                      {vehicle.regNo}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-neon-red/80">
                      {vehicle.vehicleType}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">—</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
