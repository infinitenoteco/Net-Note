import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store/AppContext';
import { useLocale } from "../lib/locale";
import { useAuthStore } from "../store/authStore";
import { createPortal } from "react-dom";
import { AccountMenu } from "./AccountMenu";
import logoLight from "/assets/logow.svg";
import logoDark from "/assets/logod.svg";
import {
  Folder,
  FolderMinus,
  Plus,
  Search,
  Settings,
  FileText,
  Archive,
  Trash2,
  X,
  Pin,
  PinOff,
  MoreVertical,
  Share2,
  Pencil,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  Minus as MinusIcon
} from "lucide-react";
import { cn } from '../lib/utils';
import { SettingsModal } from './SettingsModal';
import { ShareNoteModal } from './ShareNoteModal';
import CreateGroupModal from "./CreateGroupModal";
import { SearchModal } from "./SearchModal";
// TODO: replace with your own logo asset path, e.g. import logo from '../assets/logo.svg'
// const logoSrc = '../assets/logo.svg';

// Minimal, low-contrast checkbox — matches the one used in the All Notes table,
// so selection controls feel consistent across the app.
function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  const isActive = checked || indeterminate;

  return (
    <label
      onClick={(e) => e.stopPropagation()}
      className="relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <span
        className={[
          "flex h-4 w-4 items-center justify-center rounded-[5px] border transition-colors",
          isActive
            ? "border-border-focus bg-action-primary"
            : "border-border-disabled bg-surface peer-hover:border-border-focus",
        ].join(" ")}
      >
        {indeterminate ? (
          <MinusIcon className="h-[10px] w-[10px] text-text-inverse" strokeWidth={3} />
        ) : checked ? (
          <Check className="h-[10px] w-[10px] text-text-inverse" strokeWidth={3} />
        ) : null}
      </span>
    </label>
  );
}

const NOTE_MENU_WIDTH = 210;
const NOTE_MENU_HEIGHT = 270;
const VIEWPORT_PADDING = 12;
const MORE_PANEL_WIDTH = 320;
const MORE_PANEL_HEADER_HEIGHT = 72;
const MORE_PANEL_ITEM_HEIGHT = 42;
const MORE_PANEL_PADDING = 16;
const MAX_MORE_PANEL_HEIGHT_RATIO = 0.7;

function getSafeMenuPosition(
  rect: DOMRect,
  menuWidth = NOTE_MENU_WIDTH,
  menuHeight = NOTE_MENU_HEIGHT
) {
  let left = rect.right + 6;
  let top = rect.top;

  // Right side me space nahi hai to menu left side me open hoga
  if (left + menuWidth > window.innerWidth - VIEWPORT_PADDING) {
    left = rect.left - menuWidth - 6;
  }

  // Agar left side bhi screen ke bahar ja raha hai
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  // Bottom se bahar ja raha hai to popup ko upar shift karo
  if (top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
    top = window.innerHeight - menuHeight - VIEWPORT_PADDING;
  }

  // Top se bahar na jaaye
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }

  return { top, left };
}

function getMorePanelPosition(rect: DOMRect, itemCount: number) {
  const MAX_PANEL_HEIGHT = window.innerHeight * MAX_MORE_PANEL_HEIGHT_RATIO;
  const estimatedHeight =
    MORE_PANEL_HEADER_HEIGHT +
    MORE_PANEL_PADDING +
    itemCount * MORE_PANEL_ITEM_HEIGHT;
  const panelHeight = Math.min(estimatedHeight, MAX_PANEL_HEIGHT);

  let top = rect.top;

  // Agar popup bottom se bahar ja raha hai,
  // to popup ko upar shift karo.
  if (top + panelHeight > window.innerHeight - VIEWPORT_PADDING) {
    top = window.innerHeight - panelHeight - VIEWPORT_PADDING;
  }

  // Top se bahar na jaaye
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }

  let left = rect.right + 8;

  // Right side par space na ho to left side
  if (left + MORE_PANEL_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = rect.left - MORE_PANEL_WIDTH - 8;
  }

  // Left side bhi screen se bahar na jaaye
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  return { top, left };
}

export function Sidebar() {
  const {
    groups,
    activeGroupId,
    setActiveGroupId,
    isCreateGroupModalOpen,
    openCreateGroupModal,
    closeCreateGroupModal,
    renameGroup,
    deleteGroup,
    isSidebarOpen,
    setSidebarOpen,
    notes,
    activeNoteId,
    setActiveNoteId,
    createShare,
    addNote,
    updateNote,
    deleteNote,
    restoreNote,
    deleteForever,
    toggleArchiveNote,
    togglePinNote,
    removeNoteFromGroup,
    moveNoteToGroup,
  } = useAppContext();
  const { t, formatDate } = useLocale();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareNoteTitle, setShareNoteTitle] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
  return localStorage.getItem("sidebar-collapsed") === "true";
});
  useEffect(() => {
  if (isCollapsed) {
    document.body.setAttribute("data-sidebar-collapsed", "true");
  } else {
    document.body.removeAttribute("data-sidebar-collapsed");
  }
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));


  return () => {
    document.body.removeAttribute("data-sidebar-collapsed");
  };
}, [isCollapsed]);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [groupMenuPosition, setGroupMenuPosition] = useState<{
  top: number;
  left: number;
} | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [archivedMenuNoteId, setArchivedMenuNoteId] = useState<string | null>(null);
  const [noteMenuNoteId, setNoteMenuNoteId] = useState<string | null>(null);
  const [noteMenuSection, setNoteMenuSection] = useState<
    "pinned" | "group" | "all-notes" | null
  >(null);
  const [noteMenuPosition, setNoteMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");

  const [noteGroupMenuNoteId, setNoteGroupMenuNoteId] = useState<string | null>(null);

  const [noteGroupMenuPosition, setNoteGroupMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [archivedGroupMenuNoteId, setArchivedGroupMenuNoteId] = useState<string | null>(null);
  const [archivedMenuPosition, setArchivedMenuPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
  const [archivedGroupMenuPosition, setArchivedGroupMenuPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
  const [morePanel, setMorePanel] = useState<"pinned" | "groups" | null>(null);
  const [morePanelPosition, setMorePanelPosition] = useState<{
  top: number;
  left: number;
} | null>(null);
  const [isMoveToGroupHovered, setIsMoveToGroupHovered] = useState(false);
  const [isGroupSubmenuHovered, setIsGroupSubmenuHovered] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true);
  const [isAllNotesExpanded, setIsAllNotesExpanded] = useState(true);
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);

  // Bulk selection inside the Archived Notes modal
  const [selectedArchivedIds, setSelectedArchivedIds] = useState<Set<string>>(new Set());

  // Bulk selection inside the Trash modal
  const [selectedTrashIds, setSelectedTrashIds] = useState<Set<string>>(new Set());
  const [isConfirmDeleteForeverOpen, setIsConfirmDeleteForeverOpen] = useState(false);

  const handleCollapseSidebar = () => {
  // Close any open sidebar menus/panels before collapsing
  setMenuOpenId(null);

  setMorePanel(null);
  setMorePanelPosition(null);

  setNoteMenuNoteId(null);
  setNoteMenuPosition(null);

  setNoteGroupMenuNoteId(null);
  setNoteGroupMenuPosition(null);

  setArchivedMenuNoteId(null);
  setArchivedMenuPosition(null);

  setArchivedGroupMenuNoteId(null);
  setArchivedGroupMenuPosition(null);

  setIsMoveToGroupHovered(false);
  setIsGroupSubmenuHovered(false);
  setIsAccountMenuOpen(false);

  setIsCollapsed(true);
};

const handleExpandSidebar = () => {
  setIsCollapsed(false);
};

  const toggleGroupExpanded = useCallback((groupId: string) => {
    setExpandedGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);
const recentGroups = useMemo(() => {
  const getGroupActivityTime = (group: typeof groups[number]) => {
    const groupNotes = notes.filter(
      note =>
        note.groupId === group.id &&
        !note.isDeleted &&
        !note.isArchived
    );

    const latestNoteUpdate = groupNotes.reduce((latest, note) => {
      const noteTime = new Date(note.updatedAt).getTime();
      return Math.max(latest, noteTime);
    }, 0);

    const groupCreatedTime = new Date(group.createdAt).getTime();

    return Math.max(latestNoteUpdate, groupCreatedTime);
  };

  return [...groups].sort(
    (a, b) => getGroupActivityTime(b) - getGroupActivityTime(a)
  );
}, [groups, notes]);


  const {
    pinnedNotes,
    archivedNotesCount,
    archivedNotesList,
    trashNotes,
    ungroupedNotes,
    groupedNoteCounts,
    groupNotesById,
  } = useMemo(() => {
    
    const pinned: typeof notes = [];
    const archived: typeof notes = [];
    const trash: typeof notes = [];
    const ungrouped: typeof notes = [];
    const groupCounts = new Map<string, number>();
    const groupNotes = new Map<string, typeof notes>();

    for (const note of notes) {
      if (note.isDeleted) {
        trash.push(note);
        continue;
      }

      if (note.isArchived) {
        archived.push(note);
        continue;
      }

      if (note.isPinned) {
        pinned.push(note);
      }

      if (!note.groupId && !note.isPinned) {
        ungrouped.push(note);
      }

      if (note.groupId) {
        groupCounts.set(note.groupId, (groupCounts.get(note.groupId) ?? 0) + 1);
        const existing = groupNotes.get(note.groupId);
        if (existing) {
          existing.push(note);
        } else {
          groupNotes.set(note.groupId, [note]);
        }
      }
    }

    const byUpdatedDesc = (a: typeof notes[number], b: typeof notes[number]) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

    pinned.sort(byUpdatedDesc);
    archived.sort(byUpdatedDesc);
    trash.sort(byUpdatedDesc);
    ungrouped.sort(byUpdatedDesc);

    for (const groupList of groupNotes.values()) {
      groupList.sort(byUpdatedDesc);
    }

    return {
      pinnedNotes: pinned,
      archivedNotesCount: archived.length,
      archivedNotesList: archived,
      trashNotes: trash,
      trashNotesCount: trash.length,
      ungroupedNotes: ungrouped,
      groupedNoteCounts: groupCounts,
      groupNotesById: groupNotes,
    };
  }, [notes]);

  const getGroupNotes = useCallback(
    (groupId: string) => groupNotesById.get(groupId) ?? [],
    [groupNotesById]
  );


  useEffect(() => {
  if (!menuOpenId) return;

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      !target.closest("[data-group-menu]") &&
      !target.closest("[data-group-menu-trigger]")
    ) {
      setMenuOpenId(null);
      setGroupMenuPosition(null);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, [menuOpenId]);

  useEffect(() => {
    if (!morePanel) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("[data-more-panel]") &&
        !target.closest("[data-more-trigger]")
      ) {
        setMorePanel(null);
        setMorePanelPosition(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [morePanel]);

  useEffect(() => {
  if (!noteMenuNoteId) return;

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      !target.closest("[data-note-menu]") &&
      !target.closest("[data-note-group-menu]") &&
      !target.closest("[data-note-menu-trigger]")
    ) {
      setNoteMenuNoteId(null);
      setNoteMenuPosition(null);
      setNoteMenuSection(null);
      setNoteGroupMenuNoteId(null);
      setNoteGroupMenuPosition(null);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, [noteMenuNoteId]);

useEffect(() => {
  const scrollContainer = sidebarScrollRef.current;

  if (!scrollContainer) return;

  const handleSidebarScroll = () => {
    // Groups group popup close
    setMenuOpenId(null);
    setGroupMenuPosition(null);

    // Pinned / Group notes / All Notes popup close
    setNoteMenuNoteId(null);
    setNoteMenuPosition(null);
    setNoteMenuSection(null);

    // Move to Group submenu close
    setNoteGroupMenuNoteId(null);
    setNoteGroupMenuPosition(null);

    setIsMoveToGroupHovered(false);
    setIsGroupSubmenuHovered(false);
  };

  scrollContainer.addEventListener("scroll", handleSidebarScroll, {
    passive: true,
  });

  return () => {
    scrollContainer.removeEventListener("scroll", handleSidebarScroll);
  };
}, []);

    const handleCopyShareLink = useCallback(async () => {
        if (!shareUrl) return;

        try {
          await navigator.clipboard.writeText(shareUrl);

          setIsLinkCopied(true);

          setTimeout(() => {
            setIsLinkCopied(false);
          }, 2200);
        } catch (error) {
          console.error("CLIPBOARD ERROR:", error);

          window.prompt(
            "Copy this share link:",
            shareUrl
          );
        }
      }, [shareUrl]);

      const handleStartNoteRename = useCallback((noteId: string) => {
        const targetNote = notes.find((note) => note.id === noteId);

        if (!targetNote) return;

        setEditingNoteId(noteId);
        setEditingNoteTitle(targetNote.title || "");

        setNoteMenuNoteId(null);
        setNoteMenuPosition(null);
        setNoteMenuSection(null);
        setNoteGroupMenuNoteId(null);
        setNoteGroupMenuPosition(null);
        setIsMoveToGroupHovered(false);
        setIsGroupSubmenuHovered(false);
      }, [notes]);

      const handleFinishNoteRename = useCallback(async () => {
        if (!editingNoteId) return;

        const noteId = editingNoteId;
        const nextTitle = editingNoteTitle.trim() || "Untitled";

        setEditingNoteId(null);
        setEditingNoteTitle("");

        await updateNote(noteId, { title: nextTitle });
      }, [editingNoteId, editingNoteTitle, updateNote]);

      const handleCancelNoteRename = useCallback(() => {
        setEditingNoteId(null);
        setEditingNoteTitle("");
      }, []);


  const archivedSelectedCount = selectedArchivedIds.size;
  const isAllArchivedSelected =
    archivedNotesList.length > 0 &&
    archivedSelectedCount === archivedNotesList.length;
  const isSomeArchivedSelected =
    archivedSelectedCount > 0 && !isAllArchivedSelected;

  const toggleArchivedSelected = useCallback((noteId: string) => {
    setSelectedArchivedIds(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  }, []);

  const toggleSelectAllArchived = useCallback(() => {
    setSelectedArchivedIds(prev => {
      if (prev.size === archivedNotesList.length) {
        return new Set();
      }
      return new Set(archivedNotesList.map(note => note.id));
    });
  }, [archivedNotesList]);

  const clearArchivedSelection = useCallback(() => setSelectedArchivedIds(new Set()), []);

  const handleBulkUnarchive = useCallback(async () => {
    const ids = Array.from(selectedArchivedIds);
    clearArchivedSelection();
    // toggleArchiveNote flips isArchived off — since groupId/isPinned were
    // never touched while archived, each note lands back exactly where it
    // was (its group, pinned, or plain All Notes) with no extra logic needed.
    await Promise.all(ids.map(id => toggleArchiveNote(id)));
  }, [selectedArchivedIds, toggleArchiveNote, clearArchivedSelection]);

  const handleBulkTrashFromArchive = useCallback(async () => {
    const ids = Array.from(selectedArchivedIds);
    clearArchivedSelection();
    await Promise.all(ids.map(id => deleteNote(id)));
  }, [selectedArchivedIds, deleteNote, clearArchivedSelection]);


  const trashSelectedCount = selectedTrashIds.size;
  const isAllTrashSelected =
    trashNotes.length > 0 && trashSelectedCount === trashNotes.length;
  const isSomeTrashSelected =
    trashSelectedCount > 0 && !isAllTrashSelected;

  const toggleTrashSelected = useCallback((noteId: string) => {
    setSelectedTrashIds(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  }, []);

  const toggleSelectAllTrash = useCallback(() => {
    setSelectedTrashIds(prev => {
      if (prev.size === trashNotes.length) {
        return new Set();
      }
      return new Set(trashNotes.map(note => note.id));
    });
  }, [trashNotes]);

  const clearTrashSelection = useCallback(() => setSelectedTrashIds(new Set()), []);

  const handleBulkRestore = useCallback(async () => {
    const ids = Array.from(selectedTrashIds);
    clearTrashSelection();
    // restoreNote just clears isDeleted — group/pinned state was preserved
    // while in trash, so each note reappears exactly where it lived before.
    await Promise.all(ids.map(id => restoreNote(id)));
  }, [selectedTrashIds, restoreNote, clearTrashSelection]);

  const handleConfirmDeleteForever = useCallback(async () => {
    const ids = Array.from(selectedTrashIds);
    setIsConfirmDeleteForeverOpen(false);
    clearTrashSelection();
    await Promise.all(ids.map(id => deleteForever(id)));
  }, [selectedTrashIds, deleteForever, clearTrashSelection]);

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.18);
          border-radius: 9999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.32);
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
        }
      `}</style>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-text-primary/20 z-30 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

<motion.aside
  className={cn(
    "fixed inset-y-0 left-0 z-40 bg-surface border-r border-border-default transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:flex md:min-w-0 flex-col",
    isCollapsed
  ? "md:w-0 md:border-r-0 md:overflow-hidden w-[260px]"
  : "w-[260px]",
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  )}
>
        {/* Outer wrapper: fixed height, column layout */}
        <div
          className={cn(
            "px-2 pt-4 pb-1 flex flex-col h-full min-h-0 overflow-hidden",
            "transition-opacity duration-150 ease-out",
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >

          {/* Header (FIXED) */}
          <div className="flex items-center justify-between mb-5 min-w-0">
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-2 py-[5px] min-w-0">
                <img
                  src={logoLight}
                  alt="Logo"
                  className="logo-light h-[15px] w-8 object-contain shrink-0"
                />

                <img
                  src={logoDark}
                  alt="Logo"
                  className="logo-dark h-[15px] w-8 object-contain shrink-0"
                />
              </div>
            )}

            {/* Desktop / Tablet collapse button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={handleCollapseSidebar}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden md:inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-hover active:bg-surface-hover transition-colors duration-150"
              >
                <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </button>
            )}

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="md:hidden p-2 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Middle section: takes remaining height, itself a column so only the notes list scrolls */}
          <div className="flex-1 min-h-0 flex flex-col">

            {/* New Note / Search Notes */}
            <div className="flex flex-col items-start">
              <button
                type="button"
                onClick={async () => {
                  const note = await addNote();
                  if (note?.id) {
                    setActiveNoteId(note.id);
                  }
                  setActiveGroupId(null);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl",
                  "text-text-primary hover:bg-surface-hover",
                  "transition-all",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <FileText className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-normal">{t("New Note")}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl",
                  "text-text-primary hover:bg-surface-hover",
                  "transition-all",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Search className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-normal">{t("Search Notes")}</span>
                )}
              </button>
            </div>

            {/* SCROLLABLE AREA */}
            <div ref={sidebarScrollRef} className="sidebar-scroll flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 space-y-5 mt-1">

              {/* Archived + Trash */}
              <div className="flex flex-col items-start">
                <NavItem
                  icon={<Archive className="w-4 h-4" />}
                  label={t("Archived")}
                  count={archivedNotesCount}
                  isActive={false}
                  onClick={() => {
                    setIsArchivedModalOpen(true);
                    setArchivedMenuNoteId(null);
                    setArchivedGroupMenuNoteId(null);
                  }}
                />

                <NavItem
                  icon={<Trash2 className="w-4 h-4" />}
                  label={t("Trash")}
                  count={notes.filter(n => n.isDeleted).length}
                  isActive={false}
                  onClick={() => {
                    setIsTrashModalOpen(true);
                    setSidebarOpen(false);
                  }}
                />
              </div>

              {/* Pinned */}
                <div className="mt-7">
                    <div className="group/section flex items-center justify-between px-2 pb-[5px]">

                      {/* Pinned title + collapse/expand */}
                      <div className="flex items-center min-w-0">
                        <span className="text-sm font-semibold text-text-muted">
                          {t("Pinned")}
                        </span>

                        <button
                          type="button"
                          onClick={() => setIsPinnedExpanded(prev => !prev)}
                          className="
                            ml-1 p-0.5 rounded-md
                            text-text-muted
                            hover:bg-surface-hover
                            hover:text-text-primary
                            transition-all
                            opacity-0
                            pointer-events-none
                            group-hover/section:opacity-100
                            group-hover/section:pointer-events-auto
                          "
                          aria-label={
                            isPinnedExpanded ? "Collapse Pinned" : "Expand Pinned"
                          }
                          title={
                            isPinnedExpanded ? "Collapse Pinned" : "Expand Pinned"
                          }
                        >
                          {isPinnedExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                    </div>

                    {isPinnedExpanded && (
                      <div className="space-y-1">
                      {/* {pinnedNotes.slice(0, 5).map(note => ( */}
                      {pinnedNotes.map(note => (
                      <div
                        key={note.id}
                        className="relative group w-full"
                      >
                        <div
                        className={cn(
                          "relative flex items-center w-full rounded-xl transition-all",
                          noteMenuNoteId === note.id && noteMenuSection === "pinned"
                            ? "bg-surface-hover"
                            : "hover:bg-surface-hover"
                        )}
                      >

                          {editingNoteId === note.id ? (
                            <div className="min-w-0 flex-1 px-3 py-2">
                              <input
                                autoFocus
                                value={editingNoteTitle}
                                onChange={(e) => setEditingNoteTitle(e.target.value)}
                                onBlur={handleFinishNoteRename}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleCancelNoteRename();
                                    e.currentTarget.blur();
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-transparent border-0 p-0 text-sm font-normal text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                              />
                            </div>
                          ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMorePanel(null);
                              setNoteMenuNoteId(null);
                              setNoteGroupMenuNoteId(null);
                              setActiveGroupId(null);
                              setActiveNoteId(note.id);
                              setSidebarOpen(false);
                            }}
                            className="min-w-0 flex-1 text-left px-3 py-2 rounded-xl text-sm font-normal text-text-primary"
                          >
                            <span
                              className={cn(
                                  "block whitespace-nowrap overflow-hidden text-ellipsis",
                                  noteMenuNoteId === note.id && noteMenuSection === "pinned"
                                    ? "pr-16"
                                    : "group-hover:pr-16"
                                )}
                              >
                              {note.title || t("Untitled")}
                            </span>
                          </button>
                          )}

                          <div
                            className={cn(
                              `
                                absolute right-2 top-1/2 -translate-y-1/2
                                flex items-center gap-0.5
                                transition-opacity duration-150
                              `,
                              noteMenuNoteId === note.id && noteMenuSection === "pinned"
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                            )}
                          >
                            <button
                              type="button"
                              title={t("Unpin")}
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinNote(note.id);
                                setNoteMenuNoteId(null);
                                setNoteGroupMenuNoteId(null);
                              }}
                              className="
                                w-7 h-7 flex items-center justify-center
                                rounded-md
                                text-text-secondary
                                hover:text-text-primary
                                hover:bg-surface-hover
                              "
                            >
                              <PinOff className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              title={t("More")}
                              onClick={(e) => {
                                e.stopPropagation();

                                const rect = e.currentTarget.getBoundingClientRect();

                                if (
                                  noteMenuNoteId === note.id &&
                                  noteMenuSection === "pinned"
                                ) {
                                  setNoteMenuNoteId(null);
                                  setNoteMenuPosition(null);
                                  setNoteMenuSection(null);
                                  setNoteGroupMenuNoteId(null);
                                  setNoteGroupMenuPosition(null);
                                  return;
                                }

                                setNoteMenuNoteId(note.id);
                                setNoteMenuSection("pinned");

                                setNoteMenuPosition(
                                  getSafeMenuPosition(rect)
                                );
                                setNoteGroupMenuNoteId(null);
                                setNoteGroupMenuPosition(null);
                                setIsMoveToGroupHovered(false);
                                setIsGroupSubmenuHovered(false);
                              }}
                              className="
                                w-7 h-7 flex items-center justify-center
                                rounded-md
                                text-text-secondary
                                hover:text-text-primary
                                hover:bg-surface-hover
                              "
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* {pinnedNotes.length > 5 && (
                      <button
                        type="button"
                        data-more-trigger
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();

                          setMorePanelPosition(
                            getMorePanelPosition(
                              rect,
                              pinnedNotes.slice(5).length
                            )
                          );

                          setMorePanel("pinned");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                      >
                        Show more
                      </button>
                    )} */}
                  </div>
              )}
              </div>

              {/* Groups */}
              <div>
                <div className="group/section flex items-center justify-between px-2 pb-[5px]">
                  {/* Groups title + collapse/expand */}
                  <div className="flex items-center min-w-0">
                    <span className="text-sm font-semibold text-text-muted">
                      {t("Groups")}
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsGroupsExpanded(prev => !prev)}
                      className="
                        ml-1 p-0.5 rounded-md
                        text-text-muted
                        hover:bg-surface-hover
                        hover:text-text-primary
                        transition-all
                        opacity-0
                        pointer-events-none
                        group-hover/section:opacity-100
                        group-hover/section:pointer-events-auto
                      "
                      aria-label={isGroupsExpanded ? "Collapse Groups" : "Expand Groups"}
                      title={isGroupsExpanded ? "Collapse Groups" : "Expand Groups"}
                    >
                      {isGroupsExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Hover actions */}
                  <div className="flex items-center gap-0.5">
                    {/* Open All Groups */}
                    <button
                      type="button"
                      onClick={() => {
                        setMorePanel(null);
                        setMorePanelPosition(null);
                        navigate("/dashboard/all-groups");
                        setSidebarOpen(false);
                      }}
                      className="
                        p-1 rounded-md
                        text-text-muted
                        hover:bg-surface-hover
                        hover:text-text-primary
                        transition-all
                        opacity-0
                        pointer-events-none
                        group-hover/section:opacity-100
                        group-hover/section:pointer-events-auto
                      "
                      aria-label={t("All Groups")}
                      title={t("All Groups")}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Create Group */}
                    <button
                      type="button"
                      onClick={() => {
                        openCreateGroupModal();
                      }}
                      className="
                        p-1 rounded-md
                        text-text-muted
                        hover:bg-surface-hover
                        hover:text-text-primary
                        transition-all
                        opacity-0
                        pointer-events-none
                        group-hover/section:opacity-100
                        group-hover/section:pointer-events-auto
                      "
                      aria-label={t("Create Group")}
                      title={t("Create Group")}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              {isGroupsExpanded && (
                <div className="space-y-1">

                  {recentGroups.slice(0, 5).map(group => {
                    const groupNotes = getGroupNotes(group.id);
                    const isExpanded = expandedGroupIds.has(group.id);

                    return (
                      <div key={group.id} className="relative">
                        {editingGroupId === group.id ? (
                          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-normal text-text-primary">
                            <Folder className="w-4 h-4 shrink-0" />

                            <input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={() => {
                                if (editingName.trim()) {
                                  renameGroup(group.id, editingName.trim());
                                }
                                setEditingGroupId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (editingName.trim()) {
                                    renameGroup(group.id, editingName.trim());
                                  }
                                  setEditingGroupId(null);
                                }
                              }}
                              className="min-w-0 flex-1 bg-transparent border-0 p-0 text-sm font-normal text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                            />
                          </div>
                        ) : (
                          <>
                            <div
                              className={cn(
                                "relative flex items-center group rounded-xl",
                                menuOpenId === group.id
                                  ? "bg-surface-hover"
                                  : "hover:bg-surface-hover"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <NavItem
                                  icon={<Folder className="w-4 h-4 shrink-0" />}
                                  label={group.name}
                                  truncateLabel
                                  count={groupedNoteCounts.get(group.id) ?? 0}
                                  hideCountOnHover
                                  isActive={false}
                                  forceHideCount={menuOpenId === group.id} 
                                  onClick={() => {
                                    setMorePanel(null);
                                    toggleGroupExpanded(group.id);
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  if (menuOpenId === group.id) {
                                    setMenuOpenId(null);
                                    setGroupMenuPosition(null);
                                    return;
                                  }

                                  const rect = e.currentTarget.getBoundingClientRect();

                                  setMenuOpenId(group.id);

                                  setGroupMenuPosition(
                                    getSafeMenuPosition(rect, 200, 100)
                                  );

                                  // Close note-level popups
                                  setNoteMenuNoteId(null);
                                  setNoteMenuPosition(null);
                                  setNoteMenuSection(null);
                                  setNoteGroupMenuNoteId(null);
                                  setNoteGroupMenuPosition(null);
                                  setIsMoveToGroupHovered(false);
                                  setIsGroupSubmenuHovered(false);
                                }}
                                className={cn(
                                  "absolute right-2 top-1/2 -translate-y-1/2 transition-opacity p-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary z-10",
                                  menuOpenId === group.id
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                )}
                                aria-label={`More options for ${group.name}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {menuOpenId === group.id && (
                                <div
                                  data-group-menu
                                  className="absolute right-0 top-10 w-40 bg-surface border border-border-default rounded-xl shadow-lg z-50"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingGroupId(group.id);
                                      setEditingName(group.name);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-sm"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Rename
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm("Delete this group?")) {
                                        deleteGroup(group.id);
                                      }
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-danger-soft text-danger text-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                           {isExpanded && groupNotes.length > 0 && (
                            <div className="ml-7 space-y-0.5 mt-1">
                              {groupNotes.map(note => (
                                <div
                                  key={note.id}
                                  className="relative group w-full"
                                >
                                  <div
                                    className={cn(
                                      "relative flex items-center w-full rounded-lg transition-all",
                                      activeNoteId === note.id
                                        ? "bg-surface-selected"
                                        : noteMenuNoteId === note.id && noteMenuSection === "group"
                                          ? "bg-surface-hover"
                                          : "hover:bg-surface-hover"
                                    )}
                                  >
                                    {/* Note title */}
                                    {editingNoteId === note.id ? (
                                      <div className="min-w-0 flex-1 px-2.5 py-2">
                                        <input
                                          autoFocus
                                          value={editingNoteTitle}
                                          onChange={(e) => setEditingNoteTitle(e.target.value)}
                                          onBlur={handleFinishNoteRename}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              e.currentTarget.blur();
                                            }
                                            if (e.key === "Escape") {
                                              e.preventDefault();
                                              handleCancelNoteRename();
                                              e.currentTarget.blur();
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full bg-transparent border-0 p-0 text-sm font-normal text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                                        />
                                      </div>
                                    ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMorePanel(null);
                                        setNoteMenuNoteId(null);
                                        setNoteMenuPosition(null);
                                        setNoteGroupMenuNoteId(null);
                                        setNoteGroupMenuPosition(null);

                                        setActiveGroupId(group.id);
                                        setActiveNoteId(note.id);
                                        setSidebarOpen(false);
                                      }}
                                      className="min-w-0 flex-1 text-left px-2.5 py-2 rounded-lg text-sm font-normal text-text-primary"
                                    >
                                      <span
                                        className={cn(
                                          "block whitespace-nowrap overflow-hidden text-ellipsis",
                                          noteMenuNoteId === note.id && noteMenuSection === "group"
                                            ? "pr-16"
                                            : "group-hover:pr-16"
                                        )}
                                      >
                                        {note.title || "Untitled"}
                                      </span>
                                    </button>
                                    )}

                                    {/* Hover actions */}
                                    <div
                                      className={cn(
                                        `
                                          absolute right-1.5 top-1/2 -translate-y-1/2
                                          flex items-center gap-0.5
                                          transition-opacity duration-150
                                        `,
                                        noteMenuNoteId === note.id && noteMenuSection === "group"
                                          ? "opacity-100 pointer-events-auto"
                                          : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                                      )}
                                    >
                                      {/* Pin / Unpin */}
                                      <button
                                        type="button"
                                        title={note.isPinned ? t("Unpin") : t("Pin")}
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          togglePinNote(note.id);

                                          setNoteMenuNoteId(null);
                                          setNoteMenuPosition(null);
                                          setNoteMenuSection(null);
                                          setNoteGroupMenuNoteId(null);
                                          setNoteGroupMenuPosition(null);
                                        }}
                                        className="
                                          w-7 h-7
                                          flex items-center justify-center
                                          rounded-md
                                          text-text-secondary
                                          hover:text-text-primary
                                          hover:bg-surface-hover
                                        "
                                      >
                                        {note.isPinned ? (
                                          <PinOff className="w-4 h-4" />
                                        ) : (
                                          <Pin className="w-4 h-4" />
                                        )}
                                      </button>

                                      {/* More */}
                                      <button
                                        type="button"
                                        title={t("More")}
                                        data-note-menu-trigger
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          if (
                                            noteMenuNoteId === note.id &&
                                            noteMenuSection === "group"
                                          ) {
                                            setNoteMenuNoteId(null);
                                            setNoteMenuPosition(null);
                                            setNoteMenuSection(null);
                                            setNoteGroupMenuNoteId(null);
                                            setNoteGroupMenuPosition(null);
                                            setIsMoveToGroupHovered(false);
                                            setIsGroupSubmenuHovered(false);
                                            return;
                                          }

                                          const rect = e.currentTarget.getBoundingClientRect();

                                          setNoteMenuNoteId(note.id);
                                          setNoteMenuSection("group");

                                          setNoteMenuPosition(
                                            getSafeMenuPosition(rect)
                                          );

                                          setNoteGroupMenuNoteId(null);
                                          setNoteGroupMenuPosition(null);
                                          setIsMoveToGroupHovered(false);
                                          setIsGroupSubmenuHovered(false);
                                        }}
                                        className="
                                          w-7 h-7
                                          flex items-center justify-center
                                          rounded-md
                                          text-text-secondary
                                          hover:text-text-primary
                                          hover:bg-surface-hover
                                        "
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          </>
                        )}
                      </div>
                    );
                  })}

                  {groups.length > 5 && (
                    <button
                      type="button"
                      data-more-trigger
                      onClick={() => {
                        setMorePanel(null);
                        setMorePanelPosition(null);
                        navigate("/dashboard/all-groups");
                        setSidebarOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                    >
                      Show more
                    </button>
                  )}
                </div>
              )}
            </div>

              {/* All Notes */}
              <div className="mt-7">
               <div className="group/section flex items-center justify-between px-2 pb-[5px]">
                  {/* All Notes title + collapse/expand */}
                  <div className="flex items-center min-w-0">
                    <span className="text-sm font-semibold text-text-muted">
                      {t("All Notes")}
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsAllNotesExpanded(prev => !prev)}
                      className="
                        ml-1 p-0.5 rounded-md
                        text-text-muted
                        hover:bg-surface-hover
                        hover:text-text-primary
                        transition-all
                        opacity-0
                        pointer-events-none
                        group-hover/section:opacity-100
                        group-hover/section:pointer-events-auto
                      "
                      aria-label={
                        isAllNotesExpanded ? "Collapse All Notes" : "Expand All Notes"
                      }
                      title={
                        isAllNotesExpanded ? "Collapse All Notes" : "Expand All Notes"
                      }
                    >
                      {isAllNotesExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Hover actions */}
                  <div className="flex items-center gap-0.5">
                    {/* Open All Notes */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/dashboard/all-notes");
                        setSidebarOpen(false);
                      }}
                      className="
                        p-1 rounded-md
                        text-text-muted
                        hover:bg-surface-hover
                        hover:text-text-primary
                        transition-all
                        opacity-0
                        pointer-events-none
                        group-hover/section:opacity-100
                        group-hover/section:pointer-events-auto
                      "
                      aria-label={t("All Notes")}
                      title={t("All Notes")}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Create Note */}
                    <button
                      type="button"
                      onClick={() => {
                        addNote();
                        setSidebarOpen(false);
                      }}
                      className="
                        p-1 rounded-md
                        text-text-muted
                        hover:bg-surface-hover
                        hover:text-text-primary
                        transition-all
                        opacity-0
                        pointer-events-none
                        group-hover/section:opacity-100
                        group-hover/section:pointer-events-auto
                      "
                      aria-label="Create new note"
                      title="Create new note"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>


              {isAllNotesExpanded && (
                <div className="space-y-1">
                  {ungroupedNotes.slice(0, 20)
                    .map(note => (
                      <div
                        key={note.id}
                        className="relative group w-full"
                      >
                        {/* <div className="relative group w-full"> */}
                            <div
                              className={cn(
                                "relative flex items-center w-full rounded-xl transition-all",
                                noteMenuNoteId === note.id && noteMenuSection === "all-notes"
                                  ? "bg-surface-hover"
                                  : "hover:bg-surface-hover"
                              )}
                            >
                          {/* Note title */}
                          {editingNoteId === note.id ? (
                            <div className="min-w-0 flex-1 px-3 py-2">
                              <input
                                autoFocus
                                value={editingNoteTitle}
                                onChange={(e) => setEditingNoteTitle(e.target.value)}
                                onBlur={handleFinishNoteRename}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleCancelNoteRename();
                                    e.currentTarget.blur();
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-transparent border-0 p-0 text-sm font-normal text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                              />
                            </div>
                          ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setNoteMenuNoteId(null);
                              setNoteGroupMenuNoteId(null);
                              setActiveGroupId(null);
                              setActiveNoteId(note.id);
                              setSidebarOpen(false);
                            }}
                            className="min-w-0 flex-1 text-left px-3 py-2 rounded-xl text-sm font-normal text-text-primary"
                          >
                            <span
                              className={cn(
                                "block whitespace-nowrap overflow-hidden text-ellipsis",
                                noteMenuNoteId === note.id && noteMenuSection === "all-notes"
                                  ? "pr-16"
                                  : "group-hover:pr-16"
                              )}
                            >
                              {note.title || "Untitled"}
                            </span>
                          </button>
                          )}

                          {/* Hover actions */}
                          <div
                            className={cn(
                              `
                                absolute right-2 top-1/2 -translate-y-1/2
                                flex items-center gap-0.5
                                transition-opacity duration-150
                              `,
                              noteMenuNoteId === note.id && noteMenuSection === "all-notes"
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                            )}
                          >
                            {/* Pin / Unpin */}
                            <button
                              type="button"
                              title={note.isPinned ? t("Unpin") : t("Pin")}
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinNote(note.id);
                                setNoteMenuNoteId(null);
                                setNoteGroupMenuNoteId(null);
                              }}
                              className="
                                w-7 h-7 flex items-center justify-center
                                rounded-md
                                text-text-secondary
                                hover:text-text-primary
                                hover:bg-surface-hover
                              "
                            >
                              {note.isPinned ? (
                                <PinOff className="w-4 h-4" />
                              ) : (
                                <Pin className="w-4 h-4" />
                              )}
                            </button>

                            {/* More */}
                            <button
                              type="button"
                              title={t("More")}
                              data-note-menu-trigger
                              onClick={(e) => {
                                e.stopPropagation();

                                if (
                                  noteMenuNoteId === note.id &&
                                  noteMenuSection === "all-notes"
                                ) {
                                  setNoteMenuNoteId(null);
                                  setNoteMenuPosition(null);
                                  setNoteMenuSection(null);
                                  setNoteGroupMenuNoteId(null);
                                  setNoteGroupMenuPosition(null);
                                  setIsMoveToGroupHovered(false);
                                  setIsGroupSubmenuHovered(false);
                                  return;
                                }

                                const rect = e.currentTarget.getBoundingClientRect();

                                setNoteMenuNoteId(note.id);
                                setNoteMenuSection("all-notes");

                                setNoteMenuPosition(
                                  getSafeMenuPosition(rect)
                                );

                                setNoteGroupMenuNoteId(null);
                                setNoteGroupMenuPosition(null);
                                setIsMoveToGroupHovered(false);
                                setIsGroupSubmenuHovered(false);
                              }}
                              className="
                                w-7 h-7 flex items-center justify-center
                                rounded-md
                                text-text-secondary
                                hover:text-text-primary
                                hover:bg-surface-hover
                              "
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {ungroupedNotes.length > 20 && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/dashboard/all-notes");
                          setSidebarOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                      >
                        Show more
                      </button>
                    )}
                       </div>
                       )}
              </div>
            </div>
          </div>


          {/* Footer / Account */}
          <div className="mt-auto">
            <div className="-mx-4 border-t border-border-default" />
            <div className="pt-2 pb-2">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-full flex items-center justify-between pl-2 pr-1.5 py-1.5 rounded-xl hover:bg-surface-hover transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-[29px] h-[29px] shrink-0 overflow-hidden rounded-full border-[0.4px] border-border-soft bg-surface-hover flex items-center justify-center text-[12px] font-normal text-text-primary">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || t("Profile")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>

                  <div className="text-left">
                    <p className="font-normal text-sm text-text-primary">{user?.name}</p>
                  </div>
                </div>

                <Settings className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
          </div>

        </div>
      </motion.aside>

      {/* Floating expand button when sidebar is collapsed */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.16,
                ease: "easeOut",
              }}
              onClick={handleExpandSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className={cn(
                "hidden md:flex fixed z-[60] w-8 h-8 items-center justify-center rounded-md border-0 bg-transparent text-text-muted hover:text-text-secondary hover:bg-surface-hover active:bg-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-border-default transition-colors duration-150",
                activeNoteId ? "top-2 left-3" : "top-3 left-3"
              )}
                          >
              <PanelLeftOpen
                className="w-[18px] h-[18px]"
                strokeWidth={1.8}
              />
            </motion.button>
          )}
        </AnimatePresence>

      <AnimatePresence>
        {morePanel && !isCollapsed && (
          <motion.div
            data-more-panel
            initial={{ opacity: 0, x: -8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "fixed z-[80] w-[320px] max-w-[calc(100vw-24px)] max-h-[70vh] overflow-hidden rounded-2xl border border-border-default bg-surface shadow-[0_16px_45px_rgba(0,0,0,0.14)]",
              "max-md:left-3"
            )}
            style={{
              top: morePanelPosition?.top ?? 12,
              left: morePanelPosition?.left ?? 272,
            }}
          >
            <div className="max-h-[calc(70vh-72px)] overflow-y-auto p-2">
              {morePanel === "pinned"
                ? pinnedNotes.slice(5).map(note => (
      <div
        key={note.id}
        className="relative group w-full"
      >
        {/* Note row */}
        <div className="relative flex items-center w-full rounded-xl hover:bg-surface-hover transition-all">

          {/* Note title */}
          {editingNoteId === note.id ? (
            <div className="min-w-0 flex-1 px-3 py-2.5">
              <input
                autoFocus
                value={editingNoteTitle}
                onChange={(e) => setEditingNoteTitle(e.target.value)}
                onBlur={handleFinishNoteRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelNoteRename();
                    e.currentTarget.blur();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent border-0 p-0 text-sm font-normal text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
              />
            </div>
          ) : (
          <button
            type="button"
            onClick={() => {
              setMorePanel(null);
              setNoteMenuNoteId(null);
              setNoteGroupMenuNoteId(null);
              setActiveGroupId(null);
              setActiveNoteId(note.id);
              setSidebarOpen(false);
            }}
            className="min-w-0 flex-1 text-left px-3 py-2.5 rounded-xl text-sm font-normal text-text-primary"
          >
            <span className="block whitespace-nowrap overflow-hidden text-ellipsis group-hover:pr-16">
              {note.title || "Untitled"}
            </span>
          </button>
          )}

          {/* Hover actions */}
          <div
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              flex items-center gap-0.5
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              pointer-events-none group-hover:pointer-events-auto
            "
          >

            {/* Unpin */}
            <button
              type="button"
              title={t("Unpin")}
              onClick={(e) => {
                e.stopPropagation();

                togglePinNote(note.id);

                setNoteMenuNoteId(null);
                setNoteGroupMenuNoteId(null);
              }}
              className="
                w-7 h-7
                flex items-center justify-center
                rounded-md
                text-text-secondary
                hover:text-text-primary
                hover:bg-surface-hover
              "
            >
              <PinOff className="w-4 h-4" />
            </button>

            {/* More */}
            <button
              type="button"
              title={t("More")}
              data-note-menu-trigger
              onClick={(e) => {
                e.stopPropagation();

                if (noteMenuNoteId === note.id) {
                  setNoteMenuNoteId(null);
                  setNoteMenuPosition(null);
                  setNoteGroupMenuNoteId(null);
                  setNoteGroupMenuPosition(null);
                  setIsMoveToGroupHovered(false);
                  setIsGroupSubmenuHovered(false);
                  return;
                }

                const rect = e.currentTarget.getBoundingClientRect();

                setNoteMenuNoteId(note.id);
                setNoteMenuPosition(
                  getSafeMenuPosition(rect)
                );
                setNoteGroupMenuNoteId(null);
                setNoteGroupMenuPosition(null);
                setIsMoveToGroupHovered(false);
                setIsGroupSubmenuHovered(false);
              }}
              className="
                w-7 h-7
                flex items-center justify-center
                rounded-md
                text-text-secondary
                hover:text-text-primary
                hover:bg-surface-hover
              "
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    ))
                : groups.slice(5).map(group => {
                    const groupNotes = getGroupNotes(group.id);
                    const isExpanded = expandedGroupIds.has(group.id);

                    return (
                      <div key={group.id} className="mb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMorePanel(null);
                            toggleGroupExpanded(group.id);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 text-left px-3 py-2.5 rounded-xl text-sm transition-all",
                            "text-text-primary hover:bg-surface-hover"
                          )}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Folder className="w-4 h-4 shrink-0" />
                            <span className="truncate">{group.name}</span>
                          </span>

                            {(groupedNoteCounts.get(group.id) ?? 0) > 0 && (
                              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-surface-hover text-text-muted">
                                {groupedNoteCounts.get(group.id)}
                              </span>
                            )}
                        </button>

                        {isExpanded && groupNotes.length > 0 && (
                          <div className="ml-7 space-y-0.5 mt-0.5">
                            {groupNotes.map(note => (
                              <button
                                key={note.id}
                                type="button"
                                onClick={() => {
                                  setMorePanel(null);
                                  setActiveGroupId(group.id);
                                  setActiveNoteId(note.id);
                                  setSidebarOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-sm transition-all",
                                  activeNoteId === note.id
                                    ? "bg-surface-selected text-text-primary"
                                    : "text-text-primary hover:bg-surface-hover"
                                )}
                              >
                                <span className="block truncate">
                                  {note.title || "Untitled"}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}            </div>
          </motion.div>
        )}


      </AnimatePresence>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={closeCreateGroupModal}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <AccountMenu
        open={isAccountMenuOpen}
        onClose={() => setIsAccountMenuOpen(false)}
        onSettings={() => {
          setIsSettingsOpen(true);
          setIsAccountMenuOpen(false);
        }}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AnimatePresence>
        {isArchivedModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay-soft backdrop-blur-[2px] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsArchivedModalOpen(false);
              setArchivedMenuNoteId(null);
              setArchivedGroupMenuNoteId(null);
              clearArchivedSelection();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[1050px] max-h-[75vh] overflow-hidden rounded-2xl border border-border-default bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                <h2 className="text-[18px] font-medium text-text-primary">
                  Archived Notes
                </h2>

                <div className="flex items-center gap-3">
                  {/* Bulk actions — appear only once 1+ notes are checked below.
                      Placed right next to the close button so they read as the
                      "current mode" of the header without needing extra chrome. */}
                  {archivedSelectedCount > 1 && (
                    <>
                      <span className="text-[13px] text-text-secondary">
                        {archivedSelectedCount} {t("selected")}
                      </span>

                      <button
                        type="button"
                        onClick={handleBulkUnarchive}
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-disabled px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-action-primary-hover/[0.03]"
                      >
                        <Archive className="w-[15px] h-[15px]" strokeWidth={1.8} />
                        <span>{t("Unarchive All")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBulkTrashFromArchive}
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-danger-border px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger-soft"
                      >
                        <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.8} />
                        <span>{t("Move to Trash")}</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsArchivedModalOpen(false);
                      setArchivedMenuNoteId(null);
                      setArchivedGroupMenuNoteId(null);
                      clearArchivedSelection();
                    }}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-text-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1.5fr_1fr_1fr_80px] items-center gap-3 px-5 py-3 border-b border-border-default text-sm font-semibold text-text-primary">
                <Checkbox
                  checked={isAllArchivedSelected}
                  indeterminate={isSomeArchivedSelected}
                  onChange={toggleSelectAllArchived}
                  ariaLabel={t("Select all archived notes")}
                />
                <span>{t("Notes")}</span>
                <span>{t("Date created")}</span>
                <span>{t("Last edited")}</span>
                <span />
              </div>

              <div className="max-h-[calc(75vh-110px)] overflow-y-auto">
                {archivedNotesList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Archive className="w-8 h-8 text-text-muted mb-3" />
                    <p className="text-sm font-medium text-text-secondary">
                      {t("No archived notes")}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {t("Archived notes will appear here.")}
                    </p>
                  </div>
                ) : (
                  archivedNotesList.map(note => {
                    const isSelected = selectedArchivedIds.has(note.id);

                    return (
                      <div
                        key={note.id}
                        className={cn(
                          "relative grid grid-cols-[24px_1.5fr_1fr_1fr_80px] items-center gap-3 px-5 py-3 border-b border-border-default transition-colors",
                          isSelected ? "bg-action-primary/[0.02]" : "hover:bg-surface-hover"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleArchivedSelected(note.id)}
                          ariaLabel={t("Select note")}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveGroupId(null);
                            setActiveNoteId(note.id);
                            setIsArchivedModalOpen(false);
                            setArchivedMenuNoteId(null);
                            setArchivedGroupMenuNoteId(null);
                            clearArchivedSelection();
                          }}
                          className="text-left text-[15px] text-info hover:text-info-hover hover:underline truncate pr-4"
                        >
                          {note.title || t("Untitled Note")}
                        </button>

                        <span className="text-sm text-text-secondary">
                          {formatDate(note.createdAt)}
                        </span>

                        <span className="text-sm text-text-secondary">
                          {formatDate(note.updatedAt)}
                        </span>

                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title={t("Unarchive")}
                            onClick={() => {
                              toggleArchiveNote(note.id);
                              setArchivedMenuNoteId(null);
                              setArchivedGroupMenuNoteId(null);
                            }}
                            className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                          >
                            <Archive className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              title={t("More")}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();

                                if (archivedMenuNoteId === note.id) {
                                  setArchivedMenuNoteId(null);
                                  setArchivedMenuPosition(null);
                                } else {
                                  setArchivedMenuNoteId(note.id);
                                  setArchivedGroupMenuNoteId(null);

                                  setArchivedMenuPosition({
                                    top: rect.bottom + 6,
                                    left: rect.right - 190,
                                  });
                                }
                              }}
                              className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Trash Modal */}
      <AnimatePresence>
        {isTrashModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay-soft backdrop-blur-[2px] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsTrashModalOpen(false);
              clearTrashSelection();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[1050px] max-h-[75vh] overflow-hidden rounded-2xl border border-border-default bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            >

              <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                <h2 className="text-[18px] font-medium text-text-primary">
                  {t("Trash")}
                </h2>

                <div className="flex items-center gap-3">
                  {/* Bulk actions — same placement pattern as the Archived Notes
                      modal: next to the close button, only visible once 1+ rows
                      are checked, so the header reads as the "current mode". */}
                  {trashSelectedCount > 1 && (
                    <>
                      <span className="text-[13px] text-text-secondary">
                        {trashSelectedCount} {t("selected")}
                      </span>

                      <button
                        type="button"
                        onClick={handleBulkRestore}
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-disabled px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-action-primary-hover/[0.03]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 12a9 9 0 1 0 3-6.7" />
                          <path d="M3 4v5h5" />
                        </svg>
                        <span>{t("Restore All")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsConfirmDeleteForeverOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-danger-border px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger-soft"
                      >
                        <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.8} />
                        <span>{t("Delete forever")}</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsTrashModalOpen(false);
                      clearTrashSelection();
                    }}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-text-primary"
                    aria-label={t("Close")}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[24px_1.5fr_1fr_80px] items-center gap-3 px-5 py-3 border-b border-border-default text-sm font-semibold text-text-primary">
                <Checkbox
                  checked={isAllTrashSelected}
                  indeterminate={isSomeTrashSelected}
                  onChange={toggleSelectAllTrash}
                  ariaLabel={t("Select all trashed notes")}
                />
                <span>{t("Notes")}</span>
                <span>{t("Date created")}</span>
                <span />
              </div>

              <div className="max-h-[calc(75vh-110px)] overflow-y-auto">

                {trashNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Trash2 className="w-8 h-8 text-text-muted mb-3" />

                    <p className="text-sm font-medium text-text-secondary">
                      {t("Trash is empty")}
                    </p>

                    <p className="text-xs text-text-muted mt-1">
                      Deleted notes will appear here.
                    </p>
                  </div>
                ) : (
                  trashNotes.map(note => {
                    const isSelected = selectedTrashIds.has(note.id);

                    return (
                      <div
                        key={note.id}
                        className={cn(
                          "grid grid-cols-[24px_1.5fr_1fr_80px] items-center gap-3 px-5 py-3 border-b border-border-default transition-colors",
                          isSelected ? "bg-action-primary/[0.02]" : "hover:bg-surface-hover"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleTrashSelected(note.id)}
                          ariaLabel={t("Select note")}
                        />

                        <span className="text-[15px] text-text-primary truncate pr-4">
                          {note.title || t("Untitled Note")}
                        </span>

                        <span className="text-sm text-text-secondary">
                          {formatDate(note.createdAt)}
                        </span>

                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            title={t("Restore")}
                            onClick={async () => {
                              await restoreNote(note.id);
                            }}
                            className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 12a9 9 0 1 0 3-6.7" />
                              <path d="M3 4v5h5" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            title={t("Delete forever")}
                            onClick={async () => {
                              await deleteForever(note.id);
                            }}
                            className="p-2 rounded-lg text-danger hover:bg-danger-soft hover:text-danger-hover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm "Delete forever" — permanent + irreversible, so it always
          gets an explicit confirm step instead of firing straight from the
          bulk button. */}
      <AnimatePresence>
        {isConfirmDeleteForeverOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-overlay-medium backdrop-blur-[2px] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsConfirmDeleteForeverOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[380px] rounded-2xl border border-border-default bg-surface p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              <h3 className="text-[16px] font-semibold text-text-primary">
                {t("Delete forever")}?
              </h3>

              <p className="mt-2 text-[13px] leading-[19px] text-text-secondary">
                {trashSelectedCount === 1
                  ? t("This note will be permanently deleted. This action cannot be undone.")
                  : `${trashSelectedCount} ${t("notes will be permanently deleted. This action cannot be undone.")}`}
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteForeverOpen(false)}
                  className="rounded-[10px] px-3.5 py-2 text-[13px] font-medium text-text-secondary hover:bg-surface-hover"
                >
                  {t("Cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteForever}
                  className="rounded-[10px] bg-danger px-3.5 py-2 text-[13px] font-medium text-text-inverse hover:bg-danger-hover"
                >
                  {t("Yes, delete forever")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
<ShareNoteModal
  isOpen={isShareModalOpen}
  shareUrl={shareUrl}
  noteTitle={shareNoteTitle}
  isLinkCopied={isLinkCopied}
  onClose={() => {
    setIsShareModalOpen(false);
    setIsLinkCopied(false);
  }}
  onCopy={handleCopyShareLink}
/>
      {noteMenuNoteId &&
  noteMenuPosition &&
  createPortal(
    <div
      data-note-menu
      className="fixed z-[10001] w-[210px] rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
      style={{
        top: noteMenuPosition.top,
        left: noteMenuPosition.left,
      }}
      onClick={(e) => e.stopPropagation()}
          >
            {/* Share */}
<button
  type="button"
  onClick={async (e) => {
    e.stopPropagation();

    const note = notes.find((n) => n.id === noteMenuNoteId);

    if (!note) {
      console.error("NOTE NOT FOUND:", noteMenuNoteId);
      return;
    }

    setIsCreatingShare(true);
    setIsLinkCopied(false);

    try {
      const shareId = await createShare(note.id);

      if (!shareId) {
        console.error("SHARE ID NOT RECEIVED");
        return;
      }

      const generatedShareUrl =
        `${window.location.origin}/share/${shareId}`;

      setShareUrl(generatedShareUrl);
      setShareNoteTitle(note.title || "Untitled Note");

      // Close the three-dot menu
      setNoteMenuNoteId(null);
      setNoteMenuPosition(null);
      setNoteMenuSection(null);
      setNoteGroupMenuNoteId(null);
      setNoteGroupMenuPosition(null);

      // Open share preview
      setIsShareModalOpen(true);

    } catch (error) {
      console.error("SHARE ERROR:", error);
    } finally {
      setIsCreatingShare(false);
    }
  }}
  disabled={isCreatingShare}
  className="
    w-full flex items-center gap-2.5
    px-3.5 py-2.5
    text-sm text-left text-text-primary
    hover:bg-surface-hover
    disabled:opacity-50
  "
>
  <Share2 className="w-4 h-4 text-text-secondary" />
  <span>
    {isCreatingShare ? t("Creating...") : t("Share notes")}
  </span>
</button>

{/* Rename */}
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleStartNoteRename(noteMenuNoteId);
  }}
  className="
    w-full flex items-center gap-2.5
    px-3.5 py-2.5
    text-sm text-left text-text-primary
    hover:bg-surface-hover
  "
>
  <Pencil className="w-4 h-4 text-text-secondary" />
  <span>{t("Rename")}</span>
</button>

{/* Archive */}
<button
  type="button"
  onClick={async () => {
    await toggleArchiveNote(noteMenuNoteId);

    setNoteMenuNoteId(null);
    setNoteMenuPosition(null);
    setNoteGroupMenuNoteId(null);
    setNoteGroupMenuPosition(null);
  }}
  className="
    w-full flex items-center gap-2.5
    px-3.5 py-2.5
    text-sm text-left text-text-primary
    hover:bg-surface-hover
  "
>
  <Archive className="w-4 h-4 text-text-secondary" />
  <span>{t("Archive")}</span>
</button>

      {/* Pin / Unpin */}
      <button
        type="button"
        onClick={() => {
          togglePinNote(noteMenuNoteId);

          setNoteMenuNoteId(null);
          setNoteMenuPosition(null);
          setNoteGroupMenuNoteId(null);
          setNoteGroupMenuPosition(null);
        }}
        className="
          w-full flex items-center gap-2.5
          px-3.5 py-2.5
          text-sm text-left text-text-primary
          hover:bg-surface-hover
        "
      >
        {notes.find(n => n.id === noteMenuNoteId)?.isPinned ? (
          <PinOff className="w-4 h-4 text-text-secondary" />
        ) : (
          <Pin className="w-4 h-4 text-text-secondary" />
        )}
        <span>
          {notes.find(n => n.id === noteMenuNoteId)?.isPinned ? "Unpin" : "Pin"}
        </span>
      </button>

      {/* Move to Group */}
      <button
        type="button"
        onMouseEnter={(e) => {
          setIsMoveToGroupHovered(true);
          const rect = e.currentTarget.getBoundingClientRect();

          setNoteGroupMenuNoteId(noteMenuNoteId);

          const submenuHeight = 300;
          const viewportPadding = 12;

          const maxTop =
            window.innerHeight - submenuHeight - viewportPadding;

          const adjustedTop = Math.max(
            viewportPadding,
            Math.min(rect.top, maxTop)
          );

          setNoteGroupMenuPosition({
            top: adjustedTop,
            left: rect.right + 2,
          });
        }}
        onMouseLeave={() => {
          setIsMoveToGroupHovered(false);
          setTimeout(() => {
            setIsGroupSubmenuHovered(prev => {
              if (!prev) {
                setNoteGroupMenuNoteId(null);
                setNoteGroupMenuPosition(null);
              }
              return prev;
            });
          }, 80);
        }}
        className="
          w-full flex items-center justify-between
          gap-2.5 px-3.5 py-2.5
          text-sm text-left text-text-primary
          hover:bg-surface-hover
        "
      >
        <div className="flex items-center gap-2.5">
          <Folder className="w-4 h-4 text-text-secondary" />
          <span>{t("Move to Group")}</span>
        </div>

        <ChevronRight className="w-4 h-4 text-text-muted" />
      </button>

      {/* Remove from Group */}
      {notes.find(n => n.id === noteMenuNoteId)?.groupId && (
        <button
          type="button"
          onClick={async () => {
            const success = await removeNoteFromGroup(noteMenuNoteId);

            if (success) {
              setNoteMenuNoteId(null);
              setNoteMenuPosition(null);
              setNoteGroupMenuNoteId(null);
              setNoteGroupMenuPosition(null);
            }
          }}
          className="
            w-full flex items-center gap-2.5
            px-3.5 py-2.5
            text-sm text-left text-text-primary
            hover:bg-surface-hover
          "
        >
          <FolderMinus className="w-4 h-4 text-text-secondary" />
          <span>{t("Remove from Group")}</span>
        </button>
      )}

      <div className="my-1 border-t border-border-soft" />

      {/* Move to Trash */}
      <button
        type="button"
        onClick={() => {
          deleteNote(noteMenuNoteId);

          setNoteMenuNoteId(null);
          setNoteMenuPosition(null);
          setNoteGroupMenuNoteId(null);
          setNoteGroupMenuPosition(null);
        }}
        className="
          w-full flex items-center gap-2.5
          px-3.5 py-2.5
          text-sm text-left text-danger
          hover:bg-danger-soft
        "
      >
        <Trash2 className="w-4 h-4" />
        <span>{t("Move to Trash")}</span>
      </button>
    </div>,
    document.body
  )}

  {noteGroupMenuNoteId &&
  noteGroupMenuPosition &&
  createPortal(
    <div
      data-note-group-menu
      className="
        fixed z-[10002]
        w-[210px]
        max-h-64
        overflow-y-auto
        rounded-xl
        border border-border-default
        bg-surface
        py-1.5
        shadow-[0_10px_30px_rgba(0,0,0,0.14)]
      "
      style={{
        top: noteGroupMenuPosition.top,
        left: noteGroupMenuPosition.left,
      }}
      onMouseEnter={() => {
        setIsGroupSubmenuHovered(true);
        setNoteGroupMenuNoteId(noteMenuNoteId);
      }}
      onMouseLeave={() => {
        setIsGroupSubmenuHovered(false);
        setTimeout(() => {
          setIsMoveToGroupHovered(prev => {
            if (!prev) {
              setNoteGroupMenuNoteId(null);
              setNoteGroupMenuPosition(null);
            }
            return prev;
          });
        }, 80);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Create Group */}
      <button
        type="button"
        onClick={() => {
          setNoteGroupMenuNoteId(null);
          setNoteGroupMenuPosition(null);
          setNoteMenuNoteId(null);
          setNoteMenuPosition(null);
          openCreateGroupModal();
        }}
        className="
          w-full flex items-center gap-2.5
          px-3.5 py-2.5
          text-left text-sm text-text-primary
          hover:bg-surface-hover
        "
      >
        <Plus className="w-4 h-4 text-text-secondary" />
        <span>{t("Create Group")}</span>
      </button>

      <div className="my-1 border-t border-border-soft" />

      {groups.length === 0 ? (
        <p className="px-3.5 py-2.5 text-sm text-text-secondary">
          No groups found
        </p>
      ) : (
        groups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={async () => {
              const success = await moveNoteToGroup(
                noteGroupMenuNoteId,
                group.id
              );

              if (success) {
                setNoteGroupMenuNoteId(null);
                setNoteGroupMenuPosition(null);
                setNoteMenuNoteId(null);
                setNoteMenuPosition(null);
              }
            }}
            className="
              w-full flex items-center gap-2.5
              px-3.5 py-2.5
              text-left text-sm text-icon-primary
              hover:bg-surface-hover
              truncate
            "
          >
            <Folder className="w-4 h-4 text-text-secondary shrink-0" />

            <span className="truncate">
              {group.name}
            </span>
          </button>
        ))
      )}
    </div>,
    document.body
  )}

      {archivedMenuNoteId &&
  archivedMenuPosition &&
  createPortal(
    <div
      className="fixed z-[9999] w-48 rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
      style={{
        top: archivedMenuPosition.top,
        left: archivedMenuPosition.left,
      }}
    >
      {/* Move to Trash */}
      <button
        type="button"
        onClick={() => {
          deleteNote(archivedMenuNoteId);

          setArchivedMenuNoteId(null);
          setArchivedGroupMenuNoteId(null);
          setArchivedMenuPosition(null);
        }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-danger hover:bg-danger-soft"
      >
        <Trash2 className="w-4 h-4" />
        <span>{t("Move to Trash")}</span>
      </button>
    </div>,
    document.body
  )}
    {archivedGroupMenuNoteId &&
    archivedGroupMenuPosition &&
    createPortal(
      <div
        className="fixed z-[10000] w-48 max-h-64 overflow-y-auto rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
        style={{
          top: archivedGroupMenuPosition.top,
          left: archivedGroupMenuPosition.left,
        }}
        onMouseLeave={() => {
          setArchivedGroupMenuNoteId(null);
          setArchivedGroupMenuPosition(null);
        }}
      >
        {groups.length === 0 ? (
          <p className="px-3.5 py-2.5 text-sm text-text-secondary">
            No groups found
          </p>
        ) : (
          groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                updateNote(archivedGroupMenuNoteId, {
                  groupId: group.id,
                });

                setArchivedGroupMenuNoteId(null);
                setArchivedGroupMenuPosition(null);
                setArchivedMenuNoteId(null);
                setArchivedMenuPosition(null);
              }}
              className="w-full px-3.5 py-2.5 text-left text-sm text-icon-primary hover:bg-surface-hover truncate"
            >
              {group.name}
            </button>
          ))
        )}
      </div>,
      document.body
    )}
    </>
  );
}

function NavItem({
  icon,
  label,
  count,
  isActive,
  onClick,
  truncateLabel,
  hideCountOnHover,
  forceHideCount 
}: {
  key?: React.Key;
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick: () => void;
  truncateLabel?: boolean;
  hideCountOnHover?: boolean;
  forceHideCount?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-normal transition-all group",
        isActive
          ? "bg-surface-selected text-action-primary"
          : "text-text-primary hover:bg-surface-hover"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          truncateLabel && "min-w-0 flex-1"
        )}
      >
        {icon}
        <span
          className={cn(
            "truncate",
            truncateLabel && "min-w-0 pr-8"
          )}
        >
          {label}
        </span>
      </div>

      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full transition-all",
            hideCountOnHover &&
              "group-hover:opacity-0 group-hover:pointer-events-none",
              forceHideCount && "opacity-0 pointer-events-none",
            isActive
              ? "bg-action-secondary text-action-primary"
              : "bg-border-soft text-text-muted"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}