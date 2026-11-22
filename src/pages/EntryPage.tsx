import { useState } from 'react';
import { LogIn, Car, Bike, Truck, TicketCheck } from 'lucide-react';
import { useToast } from '@/components/Toast';
import {
  TOTAL_SLOTS,
  registerVehicle,
  validateRegNo,
  validateEntryTime,
  todayISO,
  formatCurrency,
  HOURLY_RATE,
  type ActiveVehicle,
  type VehicleType,
} from '@/lib/parking';

interface EntryPageProps {
  active: ActiveVehicle[];
  onRegister: (vehicle: ActiveVehicle) => void;
}

const TYPES: { value: VehicleType; icon: typeof Car }[] = [
  { value: 'Car', icon: Car },
  { value: 'Bike', icon: Bike },
  { value: 'SUV', icon: Truck },
];

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function EntryPage({ active, onRegister }: EntryPageProps) {
  const { push } = useToast();
  const [regNo, setRegNo] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [entryTime, setEntryTime] = useState(nowHHMM);
  const [errors, setErrors] = useState<{ regNo?: string; entryTime?: string }>({});

  const available = TOTAL_SLOTS - active.length;
  const isFull = available === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const regError = validateRegNo(regNo);
    if (regError) nextErrors.regNo = regError;
    const timeError = validateEntryTime(entryTime);
    if (timeError) nextErrors.entryTime = timeError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = registerVehicle(active, regNo, vehicleType, entryTime, todayISO());
    if (!result.ok) {
      push('error', result.error);
      return;
    }

    const normalized = regNo.trim().toUpperCase();
    onRegister({
      regNo: normalized,
      vehicleType,
      entryTime,
      entryDate: todayISO(),
      slot: result.slot,
    });
    push(
      'success',
      `Vehicle ${normalized} registered successfully. Assigned slot ${result.slot} at ${entryTime}. Rate: ${formatCurrency(HOURLY_RATE)}/hr.`,
    );
    setRegNo('');
    setEntryTime(nowHHMM());
    setErrors({});
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Vehicle <span className="neon-text">Entry</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Register an incoming vehicle — the system assigns the first available slot automatically.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="glass space-y-5 p-6 lg:col-span-2">
          <div>
            <label htmlFor="regNo" className="label">
              Vehicle Registration Number
            </label>
            <input
              id="regNo"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="e.g. MH12AB4321"
              className={`input-field uppercase ${errors.regNo ? 'border-neon-red/60' : ''}`}
              maxLength={12}
            />
            {errors.regNo && <p className="mt-2 text-xs text-neon-red">{errors.regNo}</p>}
          </div>

          <div>
            <span className="label">Vehicle Type</span>
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVehicleType(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all duration-200 ${
                    vehicleType === value
                      ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan'
                      : 'border-white/10 bg-night-800/60 text-slate-400 hover:border-white/25 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-semibold">{value}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="entryTime" className="label">
              Entry Time (HH:MM)
            </label>
            <input
              id="entryTime"
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className={`input-field ${errors.entryTime ? 'border-neon-red/60' : ''}`}
            />
            {errors.entryTime && <p className="mt-2 text-xs text-neon-red">{errors.entryTime}</p>}
          </div>

          <button type="submit" disabled={isFull} className="btn-primary w-full">
            <LogIn className="h-4 w-4" />
            Register Vehicle
          </button>
          {isFull && (
            <p className="rounded-xl border border-neon-red/40 bg-neon-red/10 px-4 py-3 text-center text-sm font-medium text-neon-red">
              Parking Full — all {TOTAL_SLOTS} slots are occupied.
            </p>
          )}
        </form>

        <aside className="space-y-4">
          <div className="glass p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <TicketCheck className="h-4 w-4" /> Live Slot Status
            </div>
            <p className="mt-3 font-display text-4xl font-bold tabular-nums text-neon-green">
              {available}
              <span className="ml-2 text-lg text-slate-500">/ {TOTAL_SLOTS} free</span>
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-night-600">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500"
                style={{ width: `${(available / TOTAL_SLOTS) * 100}%` }}
              />
            </div>
          </div>
          <div className="glass p-6 text-sm leading-relaxed text-slate-400">
            <p className="mb-2 font-display font-semibold text-slate-200">How assignment works</p>
            <ol className="list-inside list-decimal space-y-1.5">
              <li>The registration number is validated.</li>
              <li>Duplicate active vehicles are rejected.</li>
              <li>Slots are scanned P01 → P10 in order.</li>
              <li>The first free slot is assigned instantly.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
