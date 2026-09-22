import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useLocale } from "../lib/locale";

interface GroupActionsMenuProps {
  onRename: () => void;
  onDelete: () => void | Promise<void>;
}

type MenuPosition = { top: number; left: number };

const MENU_WIDTH = 200;
const MENU_HEIGHT = 100;
const VIEWPORT_PADDING = 12;

// Same viewport-aware placement logic used by NoteActionsMenu — renders
// through a portal so the popup always sits fully on-screen and can never
// get clipped or overlapped by the row it belongs to.
function getSafeMenuPosition(rect: DOMRect): MenuPosition {
  let left = rect.right - MENU_WIDTH;
  let top = rect.bottom + 6;

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  if (left + MENU_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
  }

  if (top + MENU_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
    top = rect.top - MENU_HEIGHT - 6;
  }

  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }

  return { top, left };
}

export const GroupActionsMenu = memo(function GroupActionsMenu({
  onRename,
  onDelete,
}: GroupActionsMenuProps) {
  const { t } = useLocale();

  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setMenuPosition(null);
  }, []);

  const run = useCallback(
    async (fn: () => void | Promise<void>) => {
      await fn();
      close();
    },
    [close]
  );

  // Close on outside click — same pattern as NoteActionsMenu.
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest("[data-group-actions-menu]") &&
        !target.closest("[data-group-actions-trigger]")
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, close]);

  const handleToggleOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      if (open) {
        close();
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition(getSafeMenuPosition(rect));
      setOpen(true);
    },
    [close, open]
  );

  const handleRename = useCallback(() => run(onRename), [run, onRename]);
  const handleDelete = useCallback(() => run(onDelete), [run, onDelete]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-group-actions-trigger
        aria-label={t("More options")}
        onClick={handleToggleOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            data-group-actions-menu
            className="fixed z-[10001] w-[200px] rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={event => event.stopPropagation()}
          >
            <MenuButton
              icon={<Pencil className="h-4 w-4" />}
              label={t("Rename")}
              onClick={handleRename}
            />

            <div className="my-1 border-t border-border-soft" />

            <MenuButton
              danger
              icon={<Trash2 className="h-4 w-4" />}
              label={t("Delete Group")}
              onClick={handleDelete}
            />
          </div>,
          document.body
        )}
    </>
  );
});

function MenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-surface-hover ${
        danger ? "text-danger-text hover:bg-danger-surface" : "text-text-primary"
      }`}
    >
      <span
        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center ${
          danger ? "" : "text-icon-secondary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
