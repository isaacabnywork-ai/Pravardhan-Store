import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 lg:left-auto lg:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm
              animate-in slide-in-from-bottom-5 duration-200
              ${
                isSuccess
                  ? 'bg-[#1B5E20] text-white border-[#2E7D32]'
                  : isError
                  ? 'bg-rose-900 text-white border-rose-800'
                  : 'bg-gray-900 text-white border-gray-800'
              }
            `}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#F9C74F] shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-300 shrink-0" />}
              <span className="font-medium text-xs sm:text-sm leading-tight">{toast.message}</span>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/70 hover:text-white p-1 rounded transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
