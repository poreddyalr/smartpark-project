import { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';
import { HOURLY_RATE, TOTAL_SLOTS } from '@/lib/parking';

const PROGRAMS = [
  {
    id: 'slot',
    title: 'Slot Allocation',
    filename: 'slot_allocation.c',
    description:
      `Scans the ${TOTAL_SLOTS} slots in order (P01 → P10) and assigns the first free one — exactly what the "Vehicle Entry" page does.`,
    code: `#include <stdio.h>
#include <string.h>

#define TOTAL_SLOTS ${TOTAL_SLOTS}

/* Returns the index of the first free slot, or -1 if parking is full */
int findFreeSlot(int occupied[]) {
    for (int i = 0; i < TOTAL_SLOTS; i++) {
        if (!occupied[i])
            return i;   /* first available slot */
    }
    return -1;          /* parking full */
}

int main(void) {
    int occupied[TOTAL_SLOTS] = {0};   /* 0 = free, 1 = occupied */
    char vehicles[TOTAL_SLOTS][16];    /* registration numbers */
    int slot;

    /* Demo: park two vehicles */
    slot = findFreeSlot(occupied);
    if (slot != -1) {
        occupied[slot] = 1;
        strcpy(vehicles[slot], "MH12AB4321");
        printf("Vehicle MH12AB4321 assigned to slot P%02d\\n", slot + 1);
    }

    slot = findFreeSlot(occupied);
    if (slot != -1) {
        occupied[slot] = 1;
        strcpy(vehicles[slot], "MH14XY9999");
        printf("Vehicle MH14XY9999 assigned to slot P%02d\\n", slot + 1);
    }

    if (findFreeSlot(occupied) == -1)
        printf("Parking Full!\\n");

    return 0;
}`,
  },
  {
    id: 'fee',
    title: 'Parking Fee Calculator',
    filename: 'fee_calculator.c',
    description:
      `Converts entry/exit times to minutes after midnight, handles overnight parking, rounds up to whole hours and charges ₹${HOURLY_RATE} per billable hour.`,
    code: `#include <stdio.h>
#include <math.h>

#define RATE ${HOURLY_RATE}

int minutesAfterMidnight(int h, int m) {
    return h * 60 + m;
}

int main(void) {
    int entryH, entryM, exitH, exitM;

    printf("Enter entry time (HH MM): ");
    scanf("%d %d", &entryH, &entryM);
    printf("Enter exit time  (HH MM): ");
    scanf("%d %d", &exitH, &exitM);

    int entry = minutesAfterMidnight(entryH, entryM);
    int exit  = minutesAfterMidnight(exitH, exitM);

    int duration = exit - entry;
    if (duration < 0)
        duration += 24 * 60;   /* overnight parking */

    /* every started hour is billable, minimum 1 hour */
    int billableHours = (duration + 59) / 60;
    if (billableHours < 1)
        billableHours = 1;

    int fee = billableHours * RATE;

    printf("Duration       : %d minutes\\n", duration);
    printf("Billable hours : %d\\n", billableHours);
    printf("Parking fee    : Rs. %d\\n", fee);

    return 0;
}`,
  },
  {
    id: 'records',
    title: 'Vehicle Records (Structures)',
    filename: 'vehicle_records.c',
    description:
      'Stores every parked vehicle in an array of structures — the C version of the dashboard\u2019s live vehicle list — and prints the current occupancy report.',
    code: `#include <stdio.h>
#include <string.h>

#define TOTAL_SLOTS ${TOTAL_SLOTS}

typedef struct {
    char regNo[16];
    char type[8];    /* Car / Bike / SUV */
    int  entryH, entryM;
    int  slot;       /* 1..TOTAL_SLOTS, 0 = not parked */
} Vehicle;

void printReport(Vehicle v[], int count) {
    int occupied = 0;
    printf("\\n%-12s %-6s %-8s %-7s\\n", "REG NO", "TYPE", "ENTRY", "SLOT");
    printf("------------------------------------\\n");
    for (int i = 0; i < count; i++) {
        if (v[i].slot > 0) {
            occupied++;
            printf("%-12s %-6s %02d:%02d    P%02d\\n",
                   v[i].regNo, v[i].type,
                   v[i].entryH, v[i].entryM, v[i].slot);
        }
    }
    printf("------------------------------------\\n");
    printf("Available: %d  Occupied: %d  Total: %d\\n",
           TOTAL_SLOTS - occupied, occupied, TOTAL_SLOTS);
}

int main(void) {
    Vehicle vehicles[3] = {
        { "MH12AB4321", "Car",  9, 20, 1 },
        { "MH14XY9999", "SUV", 10,  5, 2 },
        { "MH02CD7777", "Bike", 8, 45, 0 }   /* already exited */
    };

    printReport(vehicles, 3);
    return 0;
}`,
  },
];

export default function CodePage() {
  const [openId, setOpenId] = useState<string | null>('slot');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          C Program <span className="neon-text">Reference</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          The core algorithms behind this dashboard, implemented in C for the Programming for
          Problem Solving (PPS) project.
        </p>
      </header>

      <div className="glass mb-6 flex items-start gap-3 p-5">
        <Terminal className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan" />
        <p className="text-sm leading-relaxed text-slate-300">
          Each program below mirrors a feature of this website: the entry page uses the{' '}
          <span className="text-neon-cyan">first-free-slot scan</span>, the exit page uses the{' '}
          <span className="text-neon-cyan">minutes-after-midnight fee formula</span> with overnight
          handling, and the dashboard mirrors the{' '}
          <span className="text-neon-cyan">structure-based records</span>.
        </p>
      </div>

      <div className="space-y-4">
        {PROGRAMS.map((prog) => {
          const open = openId === prog.id;
          return (
            <div key={prog.id} className="glass overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : prog.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-xl p-2.5 transition-colors ${
                      open ? 'bg-neon-cyan/15 text-neon-cyan' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white">{prog.title}</p>
                    <p className="font-mono text-xs text-slate-500">{prog.filename}</p>
                  </div>
                </div>
                <span
                  className={`text-2xl leading-none text-slate-500 transition-transform duration-300 ${
                    open ? 'rotate-45 text-neon-cyan' : ''
                  }`}
                >
                  +
                </span>
              </button>

              {open && (
                <div className="border-t border-white/10 p-5 animate-fade-in">
                  <p className="mb-4 text-sm leading-relaxed text-slate-400">
                    {prog.description}
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => copy(prog.id, prog.code)}
                      className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-night-800/90 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                    >
                      {copiedId === prog.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-neon-green" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </button>
                    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-night-950/90 p-5 font-mono text-[13px] leading-relaxed text-slate-300">
                      <code>{prog.code}</code>
                    </pre>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Compile &amp; run: <code className="font-mono text-neon-cyan">gcc {prog.filename} -o program &amp;&amp; ./program</code>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
