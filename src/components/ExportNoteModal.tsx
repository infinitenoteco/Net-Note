import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useLocale } from "../lib/locale";

export type ExportFormat = "pdf" | "html" | "markdown" | "csv";

interface ExportNoteModalProps {
  isOpen: boolean;
  isExporting?: boolean;
  onClose: () => void;
  onExport: (
    format: ExportFormat,
    options: {
      pageFormat: "A4" | "Letter";
      scale: number;
      includeStyling: boolean;
    }
  ) => void;
}

export function ExportNoteModal({
  isOpen,
  isExporting = false,
  onClose,
  onExport,
}: ExportNoteModalProps) {
  const { t } = useLocale();

  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [pageFormat, setPageFormat] = useState<"A4" | "Letter">("A4");
  const [scale, setScale] = useState(100);
  const [includeStyling, setIncludeStyling] = useState(true);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showPageFormatMenu, setShowPageFormatMenu] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowFormatMenu(false);
      setShowPageFormatMenu(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isExporting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isExporting, onClose]);

  const formatLabel = {
    pdf: "PDF",
    html: "HTML",
    markdown: "Markdown",
    csv: "CSV",
  }[format];

  const handleExport = () => {
    onExport(format, {
      pageFormat,
      scale,
      includeStyling,
    });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] bg-overlay-medium backdrop-blur-[2px]"
            onClick={() => {
              if (!isExporting) onClose();
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-note-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16 }}
            className="fixed left-1/2 top-1/2 z-[10001] w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-2xl border border-border-default bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <div>
                <h2
                  id="export-note-title"
                  className="text-[16px] font-semibold text-text-primary"
                >
                  {t("Export Note")}
                </h2>
                <p className="mt-0.5 text-[12px] text-text-muted">
                  {t("Choose a format for this note")}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                aria-label={t("Close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-text-secondary">
                  {t("Export format")}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFormatMenu(prev => !prev);
                      setShowPageFormatMenu(false);
                    }}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border-default bg-surface px-3.5 text-sm text-text-primary outline-none transition-colors hover:border-border-strong focus:border-border-focus"
                    aria-expanded={showFormatMenu}
                    aria-haspopup="listbox"
                  >
                    <span>{formatLabel}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-text-muted transition-transform ${
                        showFormatMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showFormatMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                        className="absolute left-0 right-0 top-full z-[10003] mt-1.5 overflow-hidden rounded-xl border border-border-default bg-surface p-1 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                        role="listbox"
                      >
                        {(
                          [
                            ["pdf", "PDF"],
                            ["html", "HTML"],
                            ["markdown", "Markdown"],
                            ["csv", "CSV"],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setFormat(value);
                              setShowFormatMenu(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                              format === value
                                ? "bg-surface-hover font-medium text-text-primary"
                                : "text-text-primary hover:bg-surface-hover"
                            }`}
                            role="option"
                            aria-selected={format === value}
                          >
                            <span>{label}</span>
                            {format === value && (
                              <span className="text-[11px] text-text-muted">
                                {t("Selected")}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {format === "pdf" && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-text-secondary">
                      {t("Page format")}
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPageFormatMenu(prev => !prev);
                          setShowFormatMenu(false);
                        }}
                        className="flex h-11 w-full items-center justify-between rounded-xl border border-border-default bg-surface px-3.5 text-sm text-text-primary outline-none transition-colors hover:border-border-strong focus:border-border-focus"
                        aria-expanded={showPageFormatMenu}
                        aria-haspopup="listbox"
                      >
                        <span>{pageFormat}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-text-muted transition-transform ${
                            showPageFormatMenu ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {showPageFormatMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.1 }}
                            className="absolute left-0 right-0 top-full z-[10003] mt-1.5 overflow-hidden rounded-xl border border-border-default bg-surface p-1 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                            role="listbox"
                          >
                            {(["A4", "Letter"] as const).map(value => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => {
                                  setPageFormat(value);
                                  setShowPageFormatMenu(false);
                                }}
                                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                  pageFormat === value
                                    ? "bg-surface-hover font-medium text-text-primary"
                                    : "text-text-primary hover:bg-surface-hover"
                                }`}
                                role="option"
                                aria-selected={pageFormat === value}
                              >
                                {value}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="export-scale"
                      className="block text-[13px] font-medium text-text-secondary"
                    >
                      {t("Scale percent")}
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        id="export-scale"
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={scale}
                        onChange={event =>
                          setScale(Number(event.target.value))
                        }
                        className="min-w-0 flex-1 accent-controls"
                      />

                      <div className="flex h-9 w-[62px] items-center justify-center rounded-lg border border-border-default bg-surface-subtle text-sm text-text-primary">
                        {scale}%
                      </div>
                    </div>
                  </div>
                </>
              )}

              {format === "html" && (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-surface-subtle px-3.5 py-3">
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {t("Include styling")}
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted">
                      {t("Keep the NotePad look in the exported HTML")}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={includeStyling}
                    onClick={() => setIncludeStyling(prev => !prev)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      includeStyling ? "bg-action-primary" : "bg-surface-disabled"
                    }`}
                  >
                    <span
                      className={`absolute top-1 size-4 rounded-full bg-surface shadow-sm transition-transform ${
                        includeStyling ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              {(format === "markdown" || format === "csv") && (
                <div className="rounded-xl border border-border-soft bg-surface-subtle px-3.5 py-3 text-xs leading-5 text-text-secondary">
                  {format === "markdown"
                    ? t("Rich text will be converted to Markdown.")
                    : t("Each editor block will be exported as a CSV row.")}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border-soft px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className="h-9 rounded-lg px-3.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
              >
                {t("Cancel")}
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="h-9 rounded-lg bg-action-primary px-4 text-sm font-medium text-action-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? t("Exporting...") : t("Export")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}