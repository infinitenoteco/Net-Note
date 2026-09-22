import { ProfileModal } from "./ProfileModal";
import { FeedbackModal } from "./FeedbackModal";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCircle2,
  Settings,
  CircleHelp,
  MessageSquare,
  LogOut,
  ChevronRight
} from "lucide-react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useLocale } from "../lib/locale";

interface AccountMenuProps {
  open: boolean;
  onClose: () => void;
  onSettings: () => void;
}

export function AccountMenu({ open, onClose, onSettings }: AccountMenuProps) {
  const { user, logout } = useAuthStore();
  const { t } = useLocale();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="absolute bottom-14 left-4 z-50 w-[238px] overflow-hidden rounded-[20px] bg-surface py-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_2px_8px_0px_rgba(0,0,0,0.04),0px_4px_80px_8px_rgba(0,0,0,0.02)]"
          >
            {/* Header — px-20 py-6, matches Figma exactly */}
            <div className="flex items-center gap-[8px] px-[20px] py-[6px]">
              {/*<div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[0.4px] border-[rgba(84,72,49,0.15)] bg-[rgba(55,53,47,0.06)] text-[14px] font-normal text-[#383836]">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/*<p className="truncate text-[14px] font-normal leading-[20px] text-[#0d0d0d]">
                  {user?.name}
                </p> */}
                <p className="w-full truncate text-[12px] font-medium leading-[16px] text-text-muted">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="px-[16px] py-[8px]">
              <div className="h-px w-full bg-border-default" />
            </div>

            <div className="px-[10px]">
              <MenuItem
                icon={<UserCircle2 className="h-5 w-5" strokeWidth={1.5} />}
                label={t("Profile")}
                onClick={() => {
                  setIsProfileOpen(true);
                  onClose();
                }}
              />
              <MenuItem
                icon={<Settings className="h-5 w-5" strokeWidth={1.5} />}
                label={t("Settings")}
                onClick={() => {
                  onSettings();
                  onClose();
                }}
              />
            </div>

            {/* Divider */}
            <div className="px-[16px] py-[8px]">
              <div className="h-px w-full bg-border-default" />
            </div>

            <div className="px-[10px]">
              <MenuItem
                icon={<MessageSquare className="h-5 w-5" strokeWidth={1.5} />}
                label={t("Feedback")}
                onClick={() => {
                  setIsFeedbackOpen(true);
                  onClose();
                }}
              />
              <MenuItem
                icon={<CircleHelp className="h-5 w-5" strokeWidth={1.5} />}
                label={t("Help")}
                showArrow
              />
              <MenuItem
                icon={<LogOut className="h-5 w-5" strokeWidth={1.5} />}
                label={t("Log out")}
                danger
                onClick={async () => {
                  try {
                    if (user?.token) {
                      await api.logout(user.token);
                    }
                  } catch (e) {
                    console.error(e);
                  }

                  logout();
                  onClose();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <FeedbackModal
          open={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
  showArrow = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  showArrow?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[36px] w-full items-center justify-between gap-[6px] rounded-[12px] py-[6px] pl-[10px] transition-colors duration-150 ${
        showArrow ? "pr-[10px]" : "pr-[32px]"
      } ${
        danger
          ? "text-danger hover:bg-danger-soft"
          : "text-text-primary hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center gap-[6px]">
        <div className="flex h-[20px] w-[20px] shrink-0 items-center justify-center">
          {icon}
        </div>
        <span className="text-[14px] font-normal leading-[20px]">{label}</span>
      </div>

      {showArrow && <ChevronRight className="h-[16px] w-[15px] text-text-muted" />}
    </button>
  );
}