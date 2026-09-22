import { memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "../lib/locale";

const BACKDROP_INITIAL = { opacity: 0 };
const BACKDROP_ANIMATE = { opacity: 1 };
const BACKDROP_EXIT = { opacity: 0 };
const MODAL_INITIAL = { opacity: 0, scale: 0.96, y: 20 };
const MODAL_ANIMATE = { opacity: 1, scale: 1, y: 0 };
const MODAL_EXIT = { opacity: 0, scale: 0.96, y: 20 };

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: "red" | "green";
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmModalComponent({
  isOpen,
  title,
  message,
  confirmText,
  confirmColor = "red",
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const { t } = useLocale();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-overlay-strong z-[90]"
            initial={BACKDROP_INITIAL}
            animate={BACKDROP_ANIMATE}
            exit={BACKDROP_EXIT}
            onClick={onCancel}
          />

          <motion.div
            initial={MODAL_INITIAL}
            animate={MODAL_ANIMATE}
            exit={MODAL_EXIT}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-3xl shadow-2xl border border-border-soft w-[90%] max-w-md z-[100] p-6"
          >
            <h2 className="text-xl font-bold mb-2">
              {title}
            </h2>

            <p className="text-text-secondary mb-6">
              {message}
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-border-soft hover:bg-surface-hover"
              >
                {t("Cancel")}
              </button>

              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-action-on-primary ${
                  confirmColor === "red"
                    ? "bg-danger hover:bg-danger-hover"
                    : "bg-success hover:bg-success-hover"
                }`}
              >
                {confirmText}
              </button>

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const ConfirmModal = memo(ConfirmModalComponent);
