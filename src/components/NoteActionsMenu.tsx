import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, ArchiveRestore, ChevronRight, Folder, FolderMinus, MoreVertical, Pencil, Pin, PinOff, Plus, Share2, Trash2 } from "lucide-react";
import type { Group, Note } from "../types";
import { useLocale } from "../lib/locale";

interface NoteActionsMenuProps {
  note: Note;
  groups: Group[];
  onShare: () => void | Promise<void>;
  onRename: () => void;
  onArchive: () => void | Promise<void>;
  onTogglePin: () => void | Promise<void>;
  onMoveToGroup: (groupId: string) => void | Promise<void>;
  onRemoveFromGroup: () => void | Promise<void>;
  onMoveToTrash: () => void | Promise<void>;
  onCreateGroup?: () => void;
}

type MenuPosition = { top: number; left: number };

const MENU_WIDTH = 210;
const MENU_HEIGHT = 270;
const SUBMENU_WIDTH = 210;
const SUBMENU_HEIGHT = 260;
const VIEWPORT_PADDING = 12;

// Same viewport-aware placement logic used by the Sidebar's note menu —
// keeps the popup fully on-screen and lets it escape any scroll/overflow
// container since it renders through a portal.
function getSafeMenuPosition(
  rect: DOMRect,
  menuWidth = MENU_WIDTH,
  menuHeight = MENU_HEIGHT
): MenuPosition {
  let left = rect.right - menuWidth;
  let top = rect.bottom + 6;

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  if (left + menuWidth > window.innerWidth - VIEWPORT_PADDING) {
    left = window.innerWidth - menuWidth - VIEWPORT_PADDING;
  }

  if (top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
    top = rect.top - menuHeight - 6;
  }

  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }

  return { top, left };
}

function getSafeSubmenuPosition(rect: DOMRect): MenuPosition {
  let left = rect.right + 6;
  let top = rect.top;

  if (left + SUBMENU_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = rect.left - SUBMENU_WIDTH - 6;
  }

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  if (top + SUBMENU_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
    top = window.innerHeight - SUBMENU_HEIGHT - VIEWPORT_PADDING;
  }

  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }

  return { top, left };
}

export const NoteActionsMenu = memo(function NoteActionsMenu(props: NoteActionsMenuProps) {
  const { note, groups, onShare, onRename, onArchive, onTogglePin, onMoveToGroup, onRemoveFromGroup, onMoveToTrash, onCreateGroup } = props;
  const { t } = useLocale();

  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const groupTriggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setMenuPosition(null);
    setShowGroups(false);
    setSubmenuPosition(null);
  }, []);

  const run = useCallback(async (fn: () => void | Promise<void>) => {
    await fn();
    close();
  }, [close]);

  // Close on outside click — same pattern as the Sidebar's portal menus.
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest("[data-note-actions-menu]") &&
        !target.closest("[data-note-actions-submenu]") &&
        !target.closest("[data-note-actions-trigger]")
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const handleToggleOpen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();

    if (open) {
      close();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition(getSafeMenuPosition(rect));
    setOpen(true);
    setShowGroups(false);
  }, [close, open]);

  const handleShowGroups = useCallback(() => {
    if (!groupTriggerRef.current) return;

    const rect = groupTriggerRef.current.getBoundingClientRect();
    setSubmenuPosition(getSafeSubmenuPosition(rect));
    setShowGroups(true);
  }, []);

  const handleHideGroups = useCallback(() => {
    setShowGroups(false);
  }, []);

  const handleShare = useCallback(() => run(onShare), [run, onShare]);
  const handleRename = useCallback(() => run(onRename), [run, onRename]);
  const handleTogglePin = useCallback(() => run(onTogglePin), [run, onTogglePin]);
  const handleArchive = useCallback(() => run(onArchive), [run, onArchive]);
  const handleRemoveFromGroup = useCallback(() => run(onRemoveFromGroup), [run, onRemoveFromGroup]);
  const handleMoveToTrash = useCallback(() => run(onMoveToTrash), [run, onMoveToTrash]);
  const handleCreateGroup = useCallback(() => {
    if (onCreateGroup) {
      void run(onCreateGroup);
    }
  }, [onCreateGroup, run]);
  const handleMoveToGroup = useCallback((groupId: string) => run(() => onMoveToGroup(groupId)), [run, onMoveToGroup]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-note-actions-trigger
        aria-label={t("More options")}
        onClick={handleToggleOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted hover:bg-surface-hover hover:text-text-primary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            data-note-actions-menu
            className="fixed z-[10001] w-[210px] rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <MenuButton icon={<Share2 className="h-4 w-4" />} label={t("Share")} onClick={handleShare} />
            <MenuButton icon={<Pencil className="h-4 w-4" />} label={t("Rename")} onClick={handleRename} />
            <MenuButton icon={note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />} label={note.isPinned ? t("Unpin") : t("Pin")} onClick={handleTogglePin} />
            <MenuButton icon={note.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />} label={note.isArchived ? t("Unarchive") : t("Archive")} onClick={handleArchive} />

            <button
              ref={groupTriggerRef}
              type="button"
              onMouseEnter={handleShowGroups}
              onClick={(event) => {
                event.stopPropagation();
                handleShowGroups();
              }}
              className="flex w-full items-center justify-between gap-2.5 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-hover"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Folder className="h-4 w-4 shrink-0 text-icon-secondary" />
                <span className="truncate">{t("Move to Group")}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-icon-muted" />
            </button>

            {note.groupId && (
              <MenuButton icon={<FolderMinus className="h-4 w-4" />} label={t("Remove from Group")} onClick={handleRemoveFromGroup} />
            )}

            <div className="my-1 border-t border-border-soft" />

            <MenuButton danger icon={<Trash2 className="h-4 w-4" />} label={t("Move to Trash")} onClick={handleMoveToTrash} />
          </div>,
          document.body
        )}

      {open &&
        showGroups &&
        submenuPosition &&
        createPortal(
          <div
            data-note-actions-submenu
            className="fixed z-[10002] w-[210px] max-h-64 overflow-y-auto rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
            style={{ top: submenuPosition.top, left: submenuPosition.left }}
            onMouseLeave={handleHideGroups}
            onClick={(event) => event.stopPropagation()}
          >
            {onCreateGroup && (
              <>
                <MenuButton icon={<Plus className="h-4 w-4" />} label={t("Create Group")} onClick={handleCreateGroup} />
                <div className="my-1 border-t border-border-soft" />
              </>
            )}

            {groups.length === 0 ? (
              <div className="px-3.5 py-2.5 text-sm text-icon-secondary">{t("No groups found")}</div>
            ) : (
              groups.map((group) => (
                <MenuButton key={group.id} icon={<Folder className="h-4 w-4" />} label={group.name} onClick={() => handleMoveToGroup(group.id)} />
              ))
            )}
          </div>,
          document.body
        )}
    </>
  );
});

function MenuButton({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-surface-hover ${
        danger ? "text-danger-text hover:bg-danger-surface" : "text-text-primary"
      }`}
    >
      <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center ${danger ? "" : "text-icon-secondary"}`}>{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
