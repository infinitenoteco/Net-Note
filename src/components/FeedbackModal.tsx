import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleHelp, Send, X } from "lucide-react";
import { useLocale } from "../lib/locale";
import { useAuthStore } from "../store/authStore";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FeedbackModal({
  open,
  onClose,
}: FeedbackModalProps) {
  const { t } = useLocale();
  const { user } = useAuthStore();

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const userName = user?.name?.trim() || "Not available";
  const userEmail = user?.email?.trim() || "";

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && submitState !== "submitting") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, submitState]);

  useEffect(() => {
    if (!open) {
      setSubmitState("idle");
      setErrorMessage("");
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userEmail) {
      setSubmitState("error");
      setErrorMessage(t("Your account email is not available."));
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const recipientEmail = import.meta.env.VITE_FORMSUBMIT_EMAIL as
      | string
      | undefined;

    if (!recipientEmail) {
      setSubmitState("error");
      setErrorMessage(
        t("Feedback email is not configured yet.")
      );
      return;
    }

    // These values come directly from the authenticated account.
    formData.set("user_name", userName);
    formData.set("user_email", userEmail);

    // FormSubmit uses _replyto as the reply-to address.
    formData.set("_replyto", userEmail);
    formData.set("_subject", "New feedback from NotePad");
    formData.set("_captcha", "false");
    formData.set("_template", "table");

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Unable to send feedback."
        );
      }

      setSubmitState("success");
      form.reset();
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setSubmitState("error");
      setErrorMessage(
        t("Unable to send feedback right now. Please try again.")
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[100] bg-overlay-medium backdrop-blur-[2px]"
            onMouseDown={submitState === "submitting" ? undefined : onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-32px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border border-border-soft bg-surface shadow-[0_20px_70px_rgba(0,0,0,0.16)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {submitState === "success" ? (
              <div className="px-6 py-8 text-center sm:px-8">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover">
                  <Check className="h-5 w-5 text-text-primary" strokeWidth={2} />
                </div>

                <h2 className="text-[18px] font-semibold leading-[24px] text-text-primary">
                  {t("Thanks for your feedback")}
                </h2>

                <p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-[20px] text-text-secondary">
                  {t("Your feedback helps us improve the product.")}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 h-[38px] rounded-[10px] bg-action-primary px-5 text-[13px] font-medium text-action-on-primary transition-colors hover:bg-action-primary-hover"
                >
                  {t("Done")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="hidden"
                  name="_subject"
                  value="New feedback from NotePad"
                />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="user_name" value={userName} />
                <input type="hidden" name="user_email" value={userEmail} />

                <div className="flex items-start justify-between gap-4 border-b border-border-soft px-5 py-4 sm:px-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-hover">
                      <CircleHelp
                        className="h-[18px] w-[18px] text-text-secondary"
                        strokeWidth={1.7}
                      />
                    </div>

                    <div className="min-w-0">
                      <h2
                        id="feedback-modal-title"
                        className="text-[15px] font-semibold leading-[20px] text-text-primary"
                      >
                        {t("Send feedback")}
                      </h2>
                      <p className="mt-0.5 text-[12px] leading-[18px] text-text-muted">
                        {t("Tell us what we can improve.")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitState === "submitting"}
                    aria-label={t("Close")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-icon-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-[17px] w-[17px]" />
                  </button>
                </div>

                <div className="space-y-4 px-5 py-5 sm:px-6">
                  <div>
                    <label
                      htmlFor="feedback-type"
                      className="mb-1.5 block text-[12px] font-medium text-text-secondary"
                    >
                      {t("Feedback type")}
                    </label>

                    <select
                      id="feedback-type"
                      name="feedback_type"
                      defaultValue="General feedback"
                      disabled={submitState === "submitting"}
                      className="h-[40px] w-full rounded-[10px] border border-border-default bg-surface px-3 text-[13px] text-text-primary outline-none transition-colors focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="General feedback">
                        {t("General feedback")}
                      </option>
                      <option value="Bug report">
                        {t("Bug report")}
                      </option>
                      <option value="Feature request">
                        {t("Feature request")}
                      </option>
                      <option value="UI / UX feedback">
                        {t("UI / UX feedback")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-message"
                      className="mb-1.5 block text-[12px] font-medium text-text-secondary"
                    >
                      {t("Your feedback")}
                    </label>

                    <textarea
                      id="feedback-message"
                      name="message"
                      required
                      rows={5}
                      disabled={submitState === "submitting"}
                      placeholder={t("What would you like us to improve?")}
                      className="w-full resize-none rounded-[10px] border border-border-default bg-surface px-3 py-2.5 text-[13px] leading-[20px] text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div className="rounded-[10px] border border-border-soft bg-surface-subtle px-3.5 py-3">
                    <p className="text-[11px] font-medium text-text-secondary">
                      {t("Sending as")}
                    </p>

                    <p className="mt-1 truncate text-[13px] font-medium text-text-primary">
                      {userName}
                    </p>

                    <p className="truncate text-[12px] text-text-muted">
                      {userEmail || t("Email not available")}
                    </p>
                  </div>

                  {submitState === "error" && (
                    <p
                      role="alert"
                      className="rounded-[10px] bg-danger-surface px-3 py-2.5 text-[12px] leading-[18px] text-danger-text"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border-soft px-5 py-3.5 sm:px-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitState === "submitting"}
                    className="h-[36px] rounded-[9px] px-3.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("Cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={submitState === "submitting" || !userEmail}
                    className="inline-flex h-[36px] items-center gap-2 rounded-[9px] bg-action-primary px-4 text-[13px] font-medium text-action-on-primary transition-colors hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-[14px] w-[14px]" />
                    {submitState === "submitting"
                      ? t("Sending...")
                      : t("Send feedback")}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
