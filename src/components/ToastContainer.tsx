import React from 'react';
import { useFarm } from '../context/FarmContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useFarm();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let style = 'bg-slate-900 text-emerald-400 border-slate-800';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          style = 'bg-rose-950 text-rose-300 border-rose-900';
        } else if (toast.type === 'info') {
          Icon = Info;
          style = 'bg-slate-900 text-sky-400 border-slate-800';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 ${style}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
