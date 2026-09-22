import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
   X,
  Sun,
  Moon,
  Monitor,
  Globe,
  Clock3,
  User,
  Mail,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { useLocale } from "../lib/locale";
import { useAuthStore } from "../store/authStore";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

export function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { settings, updateSettings } = useAppContext();
  const { t } = useLocale();
  const { user, logout } = useAuthStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = async () => {
  if (!user?.token) {
    setDeleteError("Your session has expired. Please login again.");
    return;
  }

  setIsDeletingAccount(true);
  setDeleteError("");

  try {
    const response = await api.deleteAccount(user.token);

    if (!response?.success) {
      setDeleteError(
        response?.message || "Unable to delete your account."
      );
      return;
    }

    // Clear authentication state
    logout();

    // Clear account-specific local data
    localStorage.removeItem(`notepad-settings-${user.id}`);
    localStorage.removeItem("notepad-auth-storage");

    // Clear last opened note
    localStorage.removeItem(
      `creatorflow-last-opened-note-${user.id}`
    );

    // Redirect to login
    window.location.href = "/login";

  } catch (error) {
    console.error("Delete account error:", error);

    setDeleteError(
      "Something went wrong while deleting your account."
    );
  } finally {
    setIsDeletingAccount(false);
  }
};
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (
    value: string,
    field: string
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);

      setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-overlay-soft backdrop-blur-[2px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-[620px] max-h-[88vh] overflow-hidden rounded-2xl bg-surface border border-border-default shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft">
            <div>
              <h2 className="text-[18px] font-semibold text-text-primary">
                {t("Settings")}
              </h2>
              <p className="mt-1 text-[13px] text-text-muted">
                Manage your preferences and account
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-icon-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
              aria-label="Close settings"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(88vh-82px)] overflow-y-auto px-6 py-6 space-y-8">

            {/* Preferences */}
            <section>
              <div className="mb-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  {t("Preferences")}
                </h3>
              </div>

              <div className="rounded-xl border border-border-default overflow-hidden">

                {/* Theme */}
                <div className="px-4 py-4 border-b border-border-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover">
                      <Sun className="w-4 h-4 text-icon-secondary" />
                    </div>

                    <div>
                      <p className="text-[14px] font-medium text-text-primary">
                        {t("Theme")}
                      </p>
                      <p className="text-[12px] text-text-muted">
                        {t("Choose how NotePad looks")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(["light", "dark", "system"] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() =>
                          updateSettings({ theme })
                        }
                        className={cn(
                          "flex items-center justify-center gap-2 h-10 rounded-lg border text-[13px] font-medium transition-colors",
                          settings.theme === theme
                            ? "border-action-primary bg-action-primary text-action-on-primary"
                            : "border-border-default text-text-secondary hover:bg-surface-hover"
                        )}
                      >
                        {theme === "light" && (
                          <Sun className="w-4 h-4" />
                        )}

                        {theme === "dark" && (
                          <Moon className="w-4 h-4" />
                        )}

                        {theme === "system" && (
                          <Monitor className="w-4 h-4" />
                        )}

                        <span className="capitalize">
                           {t(theme)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border-soft">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                      <Globe className="w-4 h-4 text-icon-secondary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-text-primary">
                         {t("Language")}
                      </p>
                      <p className="text-[12px] text-text-muted">
                        {t("Select your preferred language")}
                      </p>
                    </div>
                  </div>

                  <select
                    value={settings.language}
                    onChange={(e) => {
                      const nextLanguage = e.target.value === "hi" ? "hi" : "en";

                      if (nextLanguage === settings.language) return;

                      updateSettings({
                        language: nextLanguage,
                      });
                    }}
                    className="h-9 min-w-[120px] rounded-lg border border-border-default bg-surface px-3 text-[13px] text-text-secondary outline-none focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="en">{t("English")}</option>
                    <option value="hi">{t("Hindi")}</option>
                  </select>
                </div>


                {/* Time Zone */}
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                      <Clock3 className="w-4 h-4 text-icon-secondary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-text-primary">
                        {t("Time Zone")}
                      </p>
                      <p className="text-[12px] text-text-muted truncate max-w-[280px]">
                        {t("Used for dates and times")}
                      </p>
                    </div>
                  </div>

                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      updateSettings({
                        timezone: e.target.value,
                      })
                    }
                    className="h-9 max-w-[220px] rounded-lg border border-border-default bg-surface px-3 text-[13px] text-text-secondary outline-none focus:border-border-focus"
                  >
                    <option value="Asia/Kolkata">
                      India Standard Time
                    </option>
                    <option value="UTC">
                      UTC
                    </option>
                    <option value="America/New_York">
                      Eastern Time
                    </option>
                    <option value="America/Chicago">
                      Central Time
                    </option>
                    <option value="America/Denver">
                      Mountain Time
                    </option>
                    <option value="America/Los_Angeles">
                      Pacific Time
                    </option>
                    <option value="Europe/London">
                      London
                    </option>
                    <option value="Europe/Paris">
                      Paris
                    </option>
                    <option value="Asia/Dubai">
                      Dubai
                    </option>
                    <option value="Asia/Singapore">
                      Singapore
                    </option>
                    <option value="Asia/Tokyo">
                      Tokyo
                    </option>
                  </select>
                </div>

              </div>
            </section>

            {/* Account */}
            <section>
              <div className="mb-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Account
                </h3>
              </div>

              <div className="rounded-xl border border-border-default overflow-hidden">

                {/* User Name */}
                <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border-soft">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                      <User className="w-4 h-4 text-icon-secondary" />
                    </div>

                    <div>
                      <p className="text-[12px] text-text-muted">
                        User Name
                      </p>
                      <p className="text-[14px] font-medium text-text-primary truncate max-w-[300px]">
                        {user?.name || "Not available"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[12px] text-text-muted">
                    Not editable
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border-soft">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                      <Mail className="w-4 h-4 text-icon-secondary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[12px] text-text-muted">
                        Email ID
                      </p>
                      <p className="text-[14px] font-medium text-text-primary truncate max-w-[300px]">
                        {user?.email || "Not available"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      user?.email &&
                      copyToClipboard(user.email, "email")
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-icon-muted hover:bg-surface-hover transition-colors"
                    aria-label="Copy email"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* User ID */}
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                      <User className="w-4 h-4 text-icon-secondary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[12px] text-text-muted">
                        User ID
                      </p>
                      <p className="text-[13px] font-mono text-text-primary truncate max-w-[300px]">
                        {user?.id || "Not available"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      user?.id &&
                      copyToClipboard(user.id, "userId")
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-icon-muted hover:bg-surface-hover transition-colors"
                    aria-label="Copy user ID"
                  >
                    {copiedField === "userId" ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Delete account */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4 w-full flex items-center justify-between gap-4 rounded-xl border border-danger-border bg-danger-soft px-4 py-4 text-left hover:bg-danger-soft transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft">
                    <Trash2 className="w-4 h-4 text-danger" />
                  </div>

                  <div>
                    <p className="text-[14px] font-medium text-danger">
                      Delete my account
                    </p>
                    <p className="text-[12px] text-danger">
                      Permanently delete your account and data
                    </p>
                  </div>
                </div>
              </button>
            </section>
          </div>
        </motion.div>

        {/* Delete confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-overlay-strong backdrop-blur-[2px]"
                onClick={() => setShowDeleteConfirm(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="relative w-full max-w-[420px] rounded-2xl bg-surface border border-border-default shadow-[0_20px_60px_rgba(0,0,0,0.16)]"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
                  <h3 className="text-[16px] font-semibold text-text-primary">
                    Delete account
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted hover:bg-surface-hover"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-5">
                  <div className="flex gap-3 rounded-xl bg-danger-soft border border-danger-border p-4">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-danger" />

                    <div>
                      <p className="text-[14px] font-medium text-danger-hover">
                        Are you sure you want to delete your account?
                      </p>

                      <p className="mt-1.5 text-[12px] leading-5 text-danger">
                        This action permanently deletes your account and
                        associated data. This cannot be undone.
                      </p>
                    </div>
                  </div>

                  {deleteError && (
                    <div className="mt-3 rounded-lg border border-danger-border bg-danger-soft px-3 py-2.5 text-[12px] text-danger">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-10 px-4 rounded-lg border border-border-default text-[13px] font-medium text-text-secondary hover:bg-surface-hover"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className={cn(
                        "h-10 px-4 rounded-lg text-action-on-primary text-[13px] font-medium transition-colors",
                        isDeletingAccount
                          ? "bg-danger-border cursor-not-allowed"
                          : "bg-danger hover:bg-danger-hover"
                      )}
                    >


                      {isDeletingAccount
                        ? "Deleting..."
                        : "Yes, delete account"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}