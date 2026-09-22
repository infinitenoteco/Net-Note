import { AnimatePresence, motion } from "motion/react";
import { FileText, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useLocale } from "../lib/locale";

interface ShareNoteModalProps {
  isOpen: boolean;
  shareUrl: string;
  noteTitle: string;
  isLinkCopied: boolean;
  onClose: () => void;
  onCopy: () => void;
}

export function ShareNoteModal({
  isOpen,
  shareUrl,
  noteTitle,
  isLinkCopied,
  onClose,
  onCopy,
}: ShareNoteModalProps) {
  const { t } = useLocale();

  return createPortal(
  <AnimatePresence>
      {isOpen && (
        <motion.div
          className="
            fixed inset-0 z-[99999]
            flex items-center justify-center
            bg-overlay-soft
            backdrop-blur-[3px]
            p-6
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full
              max-w-[520px]
              rounded-2xl
              border border-border-default
              bg-surface
              shadow-[0_24px_70px_rgba(0,0,0,0.16)]
              overflow-hidden
            "
          >
            {/* Header */}
            <div
              className="
                flex items-center justify-between
                px-5 py-4
                border-b border-border-default
              "
            >
              <div>
                <h2 className="text-[17px] font-medium text-text-primary">
                  {t("Share note")}
                </h2>

                <p className="text-xs text-text-muted mt-1">
                  {t("Anyone with this link can view this note.")}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="
                  w-8 h-8
                  flex items-center justify-center
                  rounded-lg
                  text-text-secondary
                  hover:text-text-primary
                  hover:bg-surface-hover
                  transition-colors
                "
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Note Preview */}
              <div
                className="
                  rounded-xl
                  border border-border-default
                  bg-surface-subtle
                  px-4 py-3.5
                "
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-icon-secondary" />

                  <span className="text-xs font-medium text-icon-secondary">
                    {t("Note")}
                  </span>
                </div>

                <p className="text-sm font-medium text-text-primary truncate">
                  {noteTitle || t("Untitled Note")}
                </p>
              </div>

              {/* Share URL */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Share link
                </label>

                <div
                  className="
                    flex items-center gap-2
                    h-11
                    px-3
                    rounded-xl
                    border border-border-default
                    bg-surface
                  "
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary truncate">
                      {shareUrl}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onCopy}
                    disabled={!shareUrl}
                    className={`
                      relative
                      shrink-0
                      h-8
                      min-w-[92px]
                      px-3
                      rounded-lg
                      text-xs
                      font-medium
                      flex items-center justify-center
                      gap-1.5
                      transition-all
                      overflow-hidden
                      ${
                        isLinkCopied
                          ? "bg-success text-action-on-primary"
                          : "bg-action-primary text-action-on-primary hover:bg-action-primary-hover"
                      }
                      disabled:opacity-50
                    `}
                  >
                    <AnimatePresence
                      mode="wait"
                      initial={false}
                    >
                      {isLinkCopied ? (
                        <motion.span
                          key="copied"
                          initial={{
                            opacity: 0,
                            scale: 0.7,
                            y: 4,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.7,
                            y: -4,
                          }}
                          transition={{
                            duration: 0.18,
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 25,
                            }}
                            className="
                              w-4 h-4
                              rounded-full
                              bg-surface/20
                              flex items-center justify-center
                            "
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </motion.span>

                          Copied
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{
                            opacity: 0,
                            scale: 0.7,
                            y: 4,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.7,
                            y: -4,
                          }}
                          transition={{
                            duration: 0.18,
                          }}
                        >
                          Copy link
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                {/* Success message */}
                <AnimatePresence>
                  {isLinkCopied && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="
                        mt-3
                        flex items-center gap-2
                        text-xs
                        text-success-hover
                      "
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className="
                          w-5 h-5
                          rounded-full
                          bg-success-soft
                          flex items-center justify-center
                        "
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </motion.span>

                      Link copied to clipboard
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
            )}
    </AnimatePresence>,
    document.body
  );
}