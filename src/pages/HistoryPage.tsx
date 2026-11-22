import { useState } from 'react';
import { History, Search, Trash2, ArrowUpDown } from 'lucide-react';
import {
  formatCurrency,
  formatDuration,
  formatDate,
  type HistoryRecord,
} from '@/lib/parking';

interface HistoryPageProps {
  history: HistoryRecord[];
  onClear: () => void;
}

type SortKey = 'recent' | 'fee' | 'duration';

export default function HistoryPage({ history, onClear }: HistoryPageProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [confirmingClear, setConfirmingClear] = useState(false);

  const filtered = history
    .filter(
      (r) =>
        r.regNo.toLowerCase().includes(query.toLowerCase()) ||
        r.slot.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortKey === 'fee') return b.fee - a.fee;
      if (sortKey === 'duration') return b.durationMinutes - a.durationMinutes;
      return b.id.localeCompare(a.id);
    });

  const totalRevenue = history.reduce((s, r) => s + r.fee, 0);
  const avgFee = history.length ? Math.round(totalRevenue / history.length) : 0;

  const handleClear = () => {
    onClear();
    setConfirmingClear(false);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Parking <span className="neon-text">History</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Every completed trip with its duration, billable hours and collected fee.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Completed Trips
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-neon-cyan">{history.length}</p>
        </div>
        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Total Revenue
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-neon-green">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Average Fee
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-neon-amber">
            {formatCurrency(avgFee)}
          </p>
        </div>
      </section>

      <div className="glass overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by vehicle number or slot…"
              className="input-field !py-2.5 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="input-field !w-auto !py-2.5"
              aria-label="Sort history"
            >
              <option value="recent">Most recent</option>
              <option value="fee">Highest fee</option>
              <option value="duration">Longest duration</option>
            </select>
          </div>
          {history.length > 0 &&
            (confirmingClear ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs text-slate-400">Clear all records?</span>
                <button
                  onClick={handleClear}
                  className="rounded-lg bg-neon-red/20 px-3 py-2 text-xs font-semibold text-neon-red transition hover:bg-neon-red/30"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-white/30"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingClear(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-neon-red/40 hover:text-neon-red"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <History className="h-10 w-10 text-slate-600" />
            <p className="mt-3 font-display font-semibold text-slate-300">
              {history.length === 0 ? 'No completed trips yet' : 'No matching records'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {history.length === 0
                ? 'History fills up automatically when vehicles exit the facility.'
                : 'Try a different vehicle number or slot.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="px-5 py-3 font-semibold">Vehicle</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Slot</th>
                  <th className="px-5 py-3 font-semibold">Entry</th>
                  <th className="px-5 py-3 font-semibold">Exit</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 font-semibold">Billable</th>
                  <th className="px-5 py-3 text-right font-semibold">Fee</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-100">{r.regNo}</td>
                    <td className="px-5 py-3.5 text-slate-400">{r.vehicleType}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-neon-cyan/10 px-2 py-1 font-mono text-xs font-bold text-neon-cyan">
                        {r.slot}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                      {r.entryTime}
                      <span className="block text-[10px] text-slate-500">
                        {formatDate(r.entryDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                      {r.exitTime}
                      <span className="block text-[10px] text-slate-500">
                        {formatDate(r.exitDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {formatDuration(r.durationMinutes)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{r.billableHours} hr</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-neon-green">
                      {formatCurrency(r.fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
