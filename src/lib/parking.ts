export const TOTAL_SLOTS = 10;
export const HOURLY_RATE = 20;
export const SLOT_IDS = Array.from({ length: TOTAL_SLOTS }, (_, i) =>
  `P${String(i + 1).padStart(2, '0')}`,
);

export type VehicleType = 'Car' | 'Bike' | 'SUV';

export interface ActiveVehicle {
  regNo: string;
  vehicleType: VehicleType;
  entryTime: string; // "HH:MM"
  entryDate: string; // ISO date the entry happened
  slot: string; // "P01".."P10"
}

export interface HistoryRecord {
  id: string;
  regNo: string;
  vehicleType: VehicleType;
  slot: string;
  entryTime: string;
  exitTime: string;
  entryDate: string;
  exitDate: string;
  durationMinutes: number;
  billableHours: number;
  fee: number;
}

const ACTIVE_KEY = 'smartpark.active';
const HISTORY_KEY = 'smartpark.history';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; session-only
  }
}

export function loadActive(): ActiveVehicle[] {
  return safeGet<ActiveVehicle[]>(ACTIVE_KEY, []);
}

export function saveActive(list: ActiveVehicle[]) {
  safeSet(ACTIVE_KEY, list);
}

export function loadHistory(): HistoryRecord[] {
  return safeGet<HistoryRecord[]>(HISTORY_KEY, []);
}

export function saveHistory(list: HistoryRecord[]) {
  safeSet(HISTORY_KEY, list);
}

const VALID_REG = /^[A-Za-z0-9][A-Za-z0-9 -]{3,11}$/;

export function validateRegNo(raw: string): string | null {
  const regNo = raw.trim().toUpperCase();
  if (!regNo) return 'Vehicle registration number is required.';
  if (!VALID_REG.test(regNo))
    return 'Enter a valid registration number (4–12 letters, digits or hyphens).';
  return null;
}

export function normalizeRegNo(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validateEntryTime(value: string): string | null {
  if (!value) return 'Entry time is required.';
  if (!/^\d{2}:\d{2}$/.test(value)) return 'Entry time must be in HH:MM format.';
  return null;
}

export function findFreeSlot(active: ActiveVehicle[]): string | null {
  const used = new Set(active.map((v) => v.slot));
  return SLOT_IDS.find((id) => !used.has(id)) ?? null;
}

export type EntryResult =
  | { ok: true; slot: string }
  | { ok: false; error: string };

export function registerVehicle(
  active: ActiveVehicle[],
  rawRegNo: string,
  vehicleType: VehicleType,
  entryTime: string,
  entryDate: string,
): EntryResult {
  const regNo = normalizeRegNo(rawRegNo);

  const regError = validateRegNo(regNo);
  if (regError) return { ok: false, error: regError };

  const timeError = validateEntryTime(entryTime);
  if (timeError) return { ok: false, error: timeError };

  if (active.some((v) => v.regNo === regNo))
    return {
      ok: false,
      error: `Vehicle ${regNo} is already parked in slot ${
        active.find((v) => v.regNo === regNo)!.slot
      }. Duplicate entries are not allowed.`,
    };

  const slot = findFreeSlot(active);
  if (!slot)
    return {
      ok: false,
      error: 'Parking Full! All 10 slots are occupied. Please try again later.',
    };

  return { ok: true, slot };
}

export interface ExitCalculation {
  durationMinutes: number;
  billableHours: number;
  fee: number;
}

export function minutesAfterMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function calculateExit(
  entryTime: string,
  exitTime: string,
): ExitCalculation {
  let durationMinutes = minutesAfterMidnight(exitTime) - minutesAfterMidnight(entryTime);
  if (durationMinutes < 0) durationMinutes += 24 * 60; // overnight parking
  // Every started hour is billable, minimum one hour.
  const billableHours = Math.max(1, Math.ceil(durationMinutes / 60));
  return { durationMinutes, billableHours, fee: billableHours * HOURLY_RATE };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
