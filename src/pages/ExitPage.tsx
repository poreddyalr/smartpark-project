import { useState } from 'react';
import { LogOut, Search, Receipt, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import {
  HOURLY_RATE,
  calculateExit,
  formatCurrency,
  formatDuration,
  formatDate,
  normalizeRegNo,
  todayISO,
  type ActiveVehicle,
  type HistoryRecord,
} from '@/lib/parking';

interface ExitPageProps {
  active: ActiveVehicle[];
  onExit: (record: HistoryRecord) => void;
}

interface Quote {
  regNo: string;
  vehicleType: string;
  slot: string;
  entryTime: string;
  entryDate: string;
  exitTime: string;
  durationMinutes: number;
  billableHours: number;
  fee: number;
  overnight: boolean;
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ExitPage({ active, onExit }: ExitPageProps) {
  const { push } = useToast();
  const [search, setSearch] = useState('');
  const [exitTime, setExitTime] = useState(nowHHMM);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuote(null);
    const regNo = normalizeRegNo(search);
    if (!regNo) {
      setNotFound('Please enter a vehicle registration number.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(exitTime)) {
      setNotFound('Exit time must be in HH:MM format.');
      return;
    }
    const vehicle = active.find((v) => v.regNo === regNo);
    if (!vehicle) {
      setNotFound(
        `No active vehicle found for "${regNo}". Check the number or register an entry first.`,
      );
      return;
    }
    setNotFound(null);
    const calc = calculateExit(vehicle.entryTime, exitTime);
    setQuote({
      regNo: vehicle.regNo,
      vehicleType: vehicle.vehicleType,
      slot: vehicle.slot,
      entryTime: vehicle.entryTime,
      entryDate: vehicle.entryDate,
      exitTime,
      durationMinutes: calc.durationMinutes,
      billableHours: calc.billableHours,
      fee: calc.fee,
      overnight: minutes(exitTime) < minutes(vehicle.entryTime),
    });
  };

  const minutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const handleConfirm = () => {
    if (!quote) return;
    const record: HistoryRecord = {
      id: `${quote.regNo}-${Date.now()}`,
      regNo: quote.regNo,
      vehicleType: quote.vehicleType as HistoryRecord['vehicleType'],
      slot: quote.slot,
      entryTime: quote.entryTime,
      exitTime: quote.exitTime,
      entryDate: quote.entryDate,
      exitDate: todayISO(),
      durationMinutes: quote.durationMinutes,
      billableHours: quote.billableHours,
      fee: quote.fee,
    };
    onExit(record);
    push(
      'success',
      `Vehicle ${quote.regNo} exited from slot ${quote.slot}. Fee collected: ${formatCurrency(quote.fee)}. Slot is now free.`,
    );
    setQuote(null);
    setSearch('');
    setExitTime(nowHHMM());
    setNotFound(null);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Vehicle <span className="neon-text">Exit</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Search a parked vehicle, preview the bill at {formatCurrency(HOURLY_RATE)}/hr, then confirm
          the exit.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSearch} className="glass space-y-5 p-6 lg:col-span-1">
          <div>
            <label htmlFor="exitReg" className="label">
              Vehicle Registration Number
            </label>
            <input
              id="exitReg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. MH12AB4321"
              className="input-field uppercase"
              maxLength={12}
            />
          </div>
          <div>
            <label htmlFor="exitTime" className="label">
              Exit Time (HH:MM)
            </label>
            <input
              id="exitTime"
              type="time"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            <Search className="h-4 w-4" />
            Retrieve Details
          </button>

          {notFound && (
            <div className="flex items-start gap-2 rounded-xl border border-neon-red/40 bg-neon-red/10 p-4 text-sm text-neon-red animate-fade-in">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {notFound}
            </div>
          )}
        </form>

        <div className="lg:col-span-2">
          {quote ? (
            <div className="glass border-neon-cyan/30 p-6 shadow-glow-cyan animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neon-cyan">
                  <Receipt className="h-4 w-4" /> Parking Bill Preview
                </div>
                <span className="rounded-md bg-neon-red/15 px-2.5 py-1 font-mono text-xs font-bold text-neon-red">
                  Slot {quote.slot}
                </span>
              </div>

              <p className="mt-3 font-display text-2xl font-bold text-white">{quote.regNo}</p>
              <p className="text-sm text-slate-400">{quote.vehicleType}</p>

              <dl className="mt-5 space-y-2.5 text-sm">
                <Row label="Entry time" value={`${quote.entryTime}  •  ${formatDate(quote.entryDate)}`} />
                <Row label="Exit time" value={`${quote.exitTime}  •  ${formatDate(todayISO())}`} />
                <Row
                  label="Parking duration"
                  value={formatDuration(quote.durationMinutes)}
                  mono
                />
                <Row
                  label="Billable hours"
                  value={`${quote.billableHours} hr${quote.billableHours > 1 ? 's' : ''} (rounded up, min. 1 hr)`}
                />
                <Row label="Rate applied" value={`${formatCurrency(HOURLY_RATE)} per hour`} />
                {quote.overnight && (
                  <Row label="Overnight" value="Exit earlier than entry — +24 hrs applied" />
                )}
              </dl>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-neon-green/30 bg-neon-green/[0.07] px-5 py-4">
                <span className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                  Total Fee
                </span>
                <span className="font-display text-3xl font-bold tabular-nums text-neon-green drop-shadow-[0_0_12px_rgba(52,245,165,0.45)]">
                  {formatCurrency(quote.fee)}
                </span>
              </div>

              <button onClick={handleConfirm} className="btn-danger mt-5 w-full">
                <LogOut className="h-4 w-4" />
                Confirm Exit &amp; Release Slot {quote.slot}
              </button>
            </div>
          ) : (
            <div className="glass flex h-full min-h-64 flex-col items-center justify-center p-8 text-center">
              <Receipt className="h-10 w-10 text-slate-600" />
              <p className="mt-3 font-display font-semibold text-slate-300">No bill generated yet</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Enter a parked vehicle&apos;s registration number on the left and retrieve its
                details to preview the parking fee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2.5">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd className={`text-right text-slate-100 ${mono ? 'font-mono font-semibold' : 'font-medium'}`}>
        {value}
      </dd>
    </div>
  );
}
