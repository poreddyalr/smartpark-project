import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const KIND_STYLES: Record<ToastKind, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-neon-green/50 shadow-glow-green' },
  error: { icon: XCircle, classes: 'border-neon-red/50 shadow-glow-red' },
  info: { icon: Info, classes: 'border-neon-cyan/50 shadow-glow-cyan' },
};

const KIND_ICON: Record<ToastKind, string> = {
  success: 'text-neon-green',
  error: 'text-neon-red',
  info: 'text-neon-cyan',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const { icon: Icon, classes } = KIND_STYLES[toast.kind];
          return (
            <div
              key={toast.id}
              className={`glass pointer-events-auto flex items-start gap-3 border p-4 animate-slide-in ${classes}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${KIND_ICON[toast.kind]}`} />
              <p className="flex-1 text-sm leading-relaxed text-slate-100">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-slate-500 transition-colors hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
