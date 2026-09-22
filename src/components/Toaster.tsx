import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppContext } from '../store/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
              initial={{
                opacity: 0,
                x: 40,
                scale: 0.96,
              }}

              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}

              exit={{
                opacity: 0,
                x: 40,
                scale: 0.96,
                transition: {
                  duration: 0.2,
                },
              }}
                          className={cn(
              "pointer-events-auto relative overflow-hidden flex items-center gap-3 px-5 py-4 rounded-2xl border bg-surface min-w-[340px] shadow-xl backdrop-blur-md",
              toast.type === "success" && "border-green-200",
              toast.type === "error" && "border-red-200",
              toast.type === "info" && "border-blue-200"
            )}
          >
            <div className="flex-shrink-0">

              {toast.type === "success" && (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}

              {toast.type === "error" && (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}

              {toast.type === "info" && (
                <Info className="w-6 h-6 text-blue-600" />
              )}

            </div>
            <div className="flex-1">

  <p className="text-sm font-semibold text-text-primary leading-5">
    {toast.message}
  </p>

  {toast.actionLabel && (
    <button
      onClick={() => {

        toast.onAction?.();

        removeToast(toast.id);

      }}
      className="mt-2 text-sm font-semibold text-primary-green hover:underline"
    >
      {toast.actionLabel}
    </button>
  )}

</div>

<button
  onClick={() => removeToast(toast.id)}
  className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-border-soft"
>
  <X className="w-4 h-4" />
</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
