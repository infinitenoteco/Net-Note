import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { useLocale } from "../lib/locale";
import { useAuthStore } from "../store/authStore";
import {
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Share2,
  ChevronRight,
  MoreVertical,
  Menu,
  FileText,
  Folder,
  FolderMinus,
  Check,
  Upload,
  Download,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShareNoteModal } from "./ShareNoteModal";
import { BlockEditor } from "./BlockEditor";
import {
  ExportNoteModal,
  type ExportFormat,
} from "./ExportNoteModal";
import {
  exportNoteAsCsv,
  exportNoteAsHtml,
  exportNoteAsMarkdown,
  exportNoteAsPdf,
} from "../lib/exportNote";

export function Editor() {
  const {
    notes,
    groups,
    activeNoteId,
    activeGroupId,
    updateNote,
    togglePinNote,
    toggleArchiveNote,
    moveNoteToGroup,
    removeNoteFromGroup,
    createShare,
    setActiveNoteId,
    setSidebarOpen,
    openCreateGroupModal
  } = useAppContext();
  const { t, formatDate, formatTime } = useLocale();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const note = useMemo(
    () => notes.find(n => n.id === activeNoteId),
    [notes, activeNoteId]
  );

  const noteGroup = useMemo(
    () =>
      note?.groupId
        ? groups.find(g => g.id === note.groupId) ?? null
        : null,
    [groups, note?.groupId]
  );

  const groupNotes = useMemo(
    () =>
      noteGroup
        ? notes.filter(
            n =>
              n.groupId === noteGroup.id &&
              !n.isDeleted &&
              !n.isArchived
          )
        : [],
    [notes, noteGroup?.id]
  );

  const isTrashView = activeGroupId === "trash";
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showGroupNotes, setShowGroupNotes] = useState(false);
  const [moveMenuPosition, setMoveMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [showImportInput, setShowImportInput] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareNoteTitle, setShareNoteTitle] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const getEditedTime = useCallback((date: string) => {
    const diff = Date.now() - new Date(date).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return t("Edited just now");
    if (minutes < 60) return `${t("Edited")} ${minutes}${t("m ago")}`;
    if (hours < 24) return `${t("Edited")} ${hours}${t("h ago")}`;
    if (days < 7) return `${t("Edited")} ${days}${t("d ago")}`;

    return `${t("Edited")} ${formatDate(date)}`;
  }, [t, formatDate]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [activeNoteId, note?.title]);

  useEffect(() => {
    const textarea = titleRef.current;

    if (!textarea) return;

    const frameId = requestAnimationFrame(() => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });

    return () => cancelAnimationFrame(frameId);
  }, [title, activeNoteId]);

  useEffect(() => {
    if (!note) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        updateNote(note.id, { title, content });
      }
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, note?.id, updateNote]);

  const handleExport = useCallback(async (
    format: ExportFormat,
    options: {
      pageFormat: "A4" | "Letter";
      scale: number;
      includeStyling: boolean;
    }
  ) => {
    if (!note || isExporting) return;

    setIsExporting(true);

    try {
      if (format === "pdf") {
        exportNoteAsPdf(note, options.pageFormat, options.scale);
      } else if (format === "html") {
        exportNoteAsHtml(note, options.includeStyling);
      } else if (format === "markdown") {
        exportNoteAsMarkdown(note);
      } else {
        exportNoteAsCsv(note);
      }

      setIsExportModalOpen(false);
    } catch (error) {
      console.error("EXPORT ERROR:", error);
    } finally {
      setIsExporting(false);
    }
  }, [note, isExporting]);

  const handleShare = useCallback(async () => {
    if (!note || isCreatingShare) return;

    setIsCreatingShare(true);
    setIsLinkCopied(false);

    try {
      const shareId = await createShare(note.id);

      if (!shareId) {
        console.error("SHARE ID NOT RECEIVED");
        return;
      }

      const generatedShareUrl = `${window.location.origin}/share/${shareId}`;
      setShareUrl(generatedShareUrl);
      setShareNoteTitle(note.title || t("Untitled"));
      setIsShareModalOpen(true);

    } catch (error) {
      console.error("SHARE ERROR:", error);
    } finally {
      setIsCreatingShare(false);
    }
  }, [note, isCreatingShare, createShare, t]);

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
      window.prompt("Copy this share link:", shareUrl);
    }
  }, [shareUrl]);

  const closeEditorMenu = useCallback(() => {
    setShowMenu(false);
    setShowMoveMenu(false);
    setMoveMenuPosition(null);
  }, []);

  const handleMoveToGroupHover = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!note) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const submenuWidth = 210;
    const submenuHeight = Math.min(320, Math.max(120, groups.length * 44 + 55));

    const viewportPadding = 12;
    const gap = 6;

    let left = rect.right + gap;
    let top = rect.top;

    if (left + submenuWidth > window.innerWidth - viewportPadding) {
      left = rect.left - submenuWidth - gap;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    if (top + submenuHeight > window.innerHeight - viewportPadding) {
      top = window.innerHeight - submenuHeight - viewportPadding;
    }

    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMoveMenuPosition({ top, left });
    setShowMoveMenu(true);
  }, [note, groups.length]);

  const handleMoveToGroup = useCallback(async (groupId: string) => {
    if (!note) return;

    const success = await moveNoteToGroup(note.id, groupId);

    if (success) {
      closeEditorMenu();
    }
  }, [note, moveNoteToGroup, closeEditorMenu]);

  const handleRemoveFromGroup = useCallback(async () => {
    if (!note?.groupId) return;

    const success = await removeNoteFromGroup(note.id);

    if (success) {
      closeEditorMenu();
    }
  }, [note?.groupId, removeNoteFromGroup, closeEditorMenu]);

  return (
    <div className={cn(
      "flex-1 min-h-0 min-w-0 flex flex-col bg-surface h-full z-20 absolute inset-0 md:static transition-transform duration-300",
      activeNoteId ? "translate-x-0" : "translate-x-0"
    )}>
      {!note ? (
        <div className="relative flex flex-1 items-center justify-center bg-surface h-full">
          
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-30 p-2.5 rounded-xl text-text-muted hover:bg-surface-hover transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="text-center max-w-sm px-6">
            <div className="w-20 h-20 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {t("No note selected")}
            </h3>
            <p className="text-text-secondary text-sm">
              {t("Select a note from the list or create a new one to start writing.")}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Bar — Figma exact specs */}
          <div className="flex items-center justify-between px-[12px] py-[4px] border-b border-border-soft [body[data-sidebar-collapsed=true]_&]:md:pl-[52px] transition-[padding] duration-200">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-[8px] min-w-0">
              {/* <button 
                onClick={() => setActiveNoteId(null)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 text-[#999]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button> */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-text-muted hover:bg-surface-hover transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Header text spacing */}
              {/* <div className="flex items-center gap-[0px] min-w-0"> */}
              <div className="flex items-center min-w-0">
               {noteGroup && (
  <>
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setShowGroupNotes(true)}
        onMouseLeave={() => setShowGroupNotes(false)}
        onClick={() => {
          setShowGroupNotes(false);
          navigate(`/dashboard/group/${noteGroup.id}`);
        }}
        className="flex items-center gap-[4px] max-w-[220px] min-w-0 rounded-md px-1.5 py-1 -ml-1.5 text-[14px] font-normal leading-[20px] text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors"
        aria-expanded={showGroupNotes}
        aria-haspopup="menu"
      >
        <span className="truncate">
          {noteGroup.name}
        </span>


      </button>

      <AnimatePresence>
        {showGroupNotes && (
          <>

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 top-full mt-2 w-[260px] max-h-[320px] overflow-y-auto rounded-xl border border-border-soft bg-surface p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] z-[9999]"
              onMouseEnter={() => setShowGroupNotes(true)}
              onMouseLeave={() => setShowGroupNotes(false)}
              onClick={(e) => e.stopPropagation()}
            >
              {groupNotes.length === 0 ? (
                <div className="px-3.5 py-3 text-sm text-text-muted">
                  {t("No notes in this group")}
                </div>
              ) : (
                groupNotes.map((groupNote) => (
                  <button
                    key={groupNote.id}
                    type="button"
                    onClick={() => {
                      setShowGroupNotes(false);
                      setActiveNoteId(groupNote.id);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                      groupNote.id === activeNoteId
                        ? "bg-surface-subtle text-text-primary font-medium"
                        : "text-text-secondary hover:bg-surface-hover"
                    )}
                  >
                    <span className="block truncate">
                      {groupNote.title || t("Untitled")}
                    </span>
                  </button>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>

    {/* Header group > Totle spacing control */}
    <ChevronRight className="w-[16px] h-[16px] ml-[0px] mr-[6px] text-text-muted flex-shrink-0" />
  </>
)}
                <span className="text-[14px] font-normal leading-[20px] text-text-primary truncate">
                  {note.title || t("Untitled")}
                </span>
              </div>
            </div>

            {/* Right: Edit time + Share + More */}
            <div className="flex items-center gap-[8px] flex-shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowActivity(true)}
                  onMouseLeave={() => setShowActivity(false)}
                  className="text-[14px] font-normal leading-[20px] text-text-muted hover:text-text-secondary transition-colors"
                >
                  {getEditedTime(note.updatedAt)}
                </button>

                <AnimatePresence>
                  {showActivity && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-[370px] rounded-2xl border border-border-soft bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.10)] z-[100] overflow-hidden"
                      onMouseEnter={() => setShowActivity(true)}
                      onMouseLeave={() => setShowActivity(false)}
                    >
                      <div className="px-4 py-3 border-b border-border-soft">
                        <div className="text-sm font-medium text-text-primary">
                          {t("Activity")}
                        </div>
                      </div>

                      <div className="px-4 py-3 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm text-text-secondary">
                            {t("Edited by")}{" "}
                            <span className="font-semibold text-text-primary">
                              {user?.name || t("You")}
                            </span>
                          </div>
                          <div className="text-sm text-text-muted whitespace-nowrap">
                            {formatTime(note.updatedAt)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm text-text-secondary">
                            {t("Created by")}{" "}
                            <span className="font-semibold text-text-primary">
                              {user?.name || t("You")}
                            </span>
                          </div>
                          <div className="text-sm text-text-muted whitespace-nowrap">
                            {formatDate(note.createdAt)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isTrashView && (
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isCreatingShare}
                  className="flex items-center gap-[6px] h-[28px] px-[8px] rounded-[6px] text-[14px] font-normal text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  <Share2 className="w-[16px] h-[16px]" />
                  <span>
                    {isCreatingShare ? t("Creating...") : t("Share")}
                  </span>
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (showMenu) {
                      closeEditorMenu();
                    } else {
                      setShowMenu(true);
                      setShowMoveMenu(false);
                      setMoveMenuPosition(null);
                    }
                  }}
                  className="flex items-center justify-center size-[36px] rounded-[12px] text-text-muted hover:bg-surface-hover transition-colors"
                  aria-label={t("More options")}
                >
                  <MoreVertical className="w-[20px] h-[20px]" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={closeEditorMenu}
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[220px] rounded-xl border border-border-soft bg-surface shadow-[0_12px_35px_rgba(0,0,0,0.12)] z-[9999] py-1.5 overflow-visible"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* PIN / UNPIN */}
                        <button
                          type="button"
                          onClick={async () => {
                            await togglePinNote(note.id);
                            closeEditorMenu();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                        >
                          {note.isPinned ? (
                            <PinOff className="w-4 h-4 text-text-muted" />
                          ) : (
                            <Pin className="w-4 h-4 text-text-muted" />
                          )}
                          <span>
                            {note.isPinned ? t("Unpin") : t("Pin")}
                          </span>
                        </button>

                        {/* ARCHIVE / UNARCHIVE */}
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleArchiveNote(note.id);
                            closeEditorMenu();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                        >
                          {note.isArchived ? (
                            <ArchiveRestore className="w-4 h-4 text-text-muted" />
                          ) : (
                            <Archive className="w-4 h-4 text-text-muted" />
                          )}
                          <span>
                            {note.isArchived ? t("Unarchive") : t("Archive")}
                          </span>
                        </button>

                        {/* IMPORT */}
                        <button
                          type="button"
                          onClick={() => {
                            closeEditorMenu();
                            setShowImportInput(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                        >
                          <Upload className="w-4 h-4 text-text-muted" />
                          <span>{t("Import")}</span>
                        </button>

                        {/* EXPORT */}
                        <button
                          type="button"
                          onClick={() => {
                            closeEditorMenu();
                            setIsExportModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                        >
                          <Download className="w-4 h-4 text-text-muted" />
                          <span>{t("Export")}</span>
                        </button>

                        {/* MOVE TO GROUP - with submenu inside */}
                        <div className="relative">
                          <button
                            type="button"
                            onMouseEnter={handleMoveToGroupHover}
                            onMouseLeave={() => {
                              setShowMoveMenu(false);
                              setMoveMenuPosition(null);
                            }}
                            onClick={(e) => handleMoveToGroupHover(e)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="w-4 h-4 text-text-muted" />
                              <span>{t("Move to Group")}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted" />
                          </button>

                          {/* MOVE TO GROUP SUBMENU - positioned relative to menu */}
                          <AnimatePresence>
                            {showMoveMenu && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96, x: -8 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.96, x: -8 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-full top-0 mr-2 w-[210px] max-h-[320px] overflow-y-auto rounded-xl border border-border-soft bg-surface py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] z-[10000]"
                                onMouseEnter={() => setShowMoveMenu(true)}
                                onMouseLeave={() => {
                                  setShowMoveMenu(false);
                                  setMoveMenuPosition(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* CREATE GROUP */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    closeEditorMenu();
                                    setShowMoveMenu(false);
                                    openCreateGroupModal();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-text-muted" />
                                  <span>{t("Create Group")}</span>
                                </button>

                                <div className="my-1 border-t border-border-soft" />

                                {/* GROUPS */}
                                {groups.length === 0 ? (
                                  <div className="px-3.5 py-3 text-xs text-text-muted">
                                    {t("No groups found")}
                                  </div>
                                ) : (
                                  groups.map((group) => (
                                    <button
                                      key={group.id}
                                      type="button"
                                      onClick={() => handleMoveToGroup(group.id)}
                                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <Folder className="w-4 h-4 text-text-muted shrink-0" />
                                        <span className="truncate">
                                          {group.name}
                                        </span>
                                      </div>
                                      {note.groupId === group.id && (
                                        <Check className="w-4 h-4 text-success shrink-0" />
                                      )}
                                    </button>
                                  ))
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* REMOVE FROM GROUP */}
                        {note.groupId && (
                          <button
                            type="button"
                            onClick={handleRemoveFromGroup}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
                          >
                            <FolderMinus className="w-4 h-4 text-text-muted" />
                            <span>{t("Remove from Group")}</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-border-soft" />

                        {/* MOVE TO TRASH */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowTrashConfirm(true);
                            closeEditorMenu();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-danger hover:bg-danger-soft transition-colors rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{t("Move to Trash")}</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 min-h-0 overflow-y-auto w-full flex justify-center">
            <div className="w-full max-w-[900px] px-6 pt-8 md:px-12 md:pt-16 mx-auto min-w-0">
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("Untitled")}
                rows={1}
                spellCheck={false}
                className="w-full max-w-full min-h-[60px] bg-transparent text-4xl md:text-5xl font-bold leading-[1.15] text-text-primary placeholder:text-text-muted focus:outline-none resize-none overflow-hidden whitespace-pre-wrap break-words"
              />

              <div className="mt-4">
                <BlockEditor content={content} onChange={setContent} />
              </div>

              <div
                aria-hidden="true"
                className="h-[3px] w-full shrink-0"
              />
            </div>
          </div>
        </>
      )}

      <ExportNoteModal
        isOpen={isExportModalOpen}
        isExporting={isExporting}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

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
    </div>
  );
}
