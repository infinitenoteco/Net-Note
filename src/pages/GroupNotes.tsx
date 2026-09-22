import React, { useCallback, useMemo, useState } from "react";
import {
  Archive,
  Check,
  ChevronLeft,
  FileText,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../store/AppContext";
import { useLocale } from "../lib/locale";
import { NoteActionsMenu } from "../components/NoteActionsMenu";
import { ShareNoteModal } from "../components/ShareNoteModal";
import type { Note } from "../types";

function preview(content: string, fallback: string) {
  if (!content?.trim()) return fallback;

  try {
    const parsed = JSON.parse(content);

    const collect = (value: unknown): string[] => {
      if (!value) return [];
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) return value.flatMap(collect);

      if (typeof value === "object") {
        const record = value as Record<string, unknown>;
        return [
          ...(typeof record.content === "string" ? [record.content] : []),
          ...collect(record.blocks),
          ...collect(record.children),
        ];
      }

      return [];
    };

    return collect(parsed).join(" ").replace(/\s+/g, " ").trim() || fallback;
  } catch {
    return content.replace(/\s+/g, " ").trim() || fallback;
  }
}

// Same column template as AllNotes' NotesTable — checkbox | title+preview | date | actions —
// so the header row and every body row line up exactly the same way.
const ROW_GRID_CLASS =
  "grid grid-cols-[16px_minmax(0,1fr)_180px_36px] items-center gap-4";

// Same low-contrast checkbox used in AllNotes.
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
      onClick={event => event.stopPropagation()}
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
            : "border-border-default bg-surface peer-hover:border-border-strong",
        ].join(" ")}
      >
        {indeterminate ? (
          <Minus className="h-[10px] w-[10px] text-action-on-primary" strokeWidth={3} />
        ) : checked ? (
          <Check className="h-[10px] w-[10px] text-action-on-primary" strokeWidth={3} />
        ) : null}
      </span>
    </label>
  );
}

export function GroupNotes() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const {
    notes,
    groups,
    addNote,
    updateNote,
    togglePinNote,
    toggleArchiveNote,
    moveNoteToGroup,
    removeNoteFromGroup,
    deleteNote,
    createShare,
    openCreateGroupModal,
    setActiveNoteId,
    bulkArchiveNotes,
    bulkTrashNotes,
  } = useAppContext();

  const { t, formatDate } = useLocale();

  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareNoteTitle, setShareNoteTitle] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set()
  );

  const group = groups.find(item => item.id === groupId);

  const groupNotes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return notes
      .filter(
        note =>
          note.groupId === groupId && !note.isArchived && !note.isDeleted
      )
      .filter(
        note =>
          !q ||
          note.title.toLowerCase().includes(q) ||
          preview(note.content, "").toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [notes, groupId, search]);

  const selectedCount = selectedNoteIds.size;
  const isAllSelected =
    groupNotes.length > 0 && selectedCount === groupNotes.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;

  const toggleNoteSelected = useCallback((noteId: string) => {
    setSelectedNoteIds(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedNoteIds(prev => {
      if (prev.size === groupNotes.length) return new Set();
      return new Set(groupNotes.map(note => note.id));
    });
  }, [groupNotes]);

  const clearSelection = useCallback(() => setSelectedNoteIds(new Set()), []);

  const handleBulkArchive = useCallback(async () => {
    const ids = Array.from(selectedNoteIds);
    clearSelection();
    await bulkArchiveNotes(ids, true);
  }, [selectedNoteIds, clearSelection, bulkArchiveNotes]);

  const handleBulkTrash = useCallback(async () => {
    const ids = Array.from(selectedNoteIds);
    clearSelection();
    await bulkTrashNotes(ids);
  }, [selectedNoteIds, clearSelection, bulkTrashNotes]);

  const startRename = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title || "");
  };

  const saveRename = async (note: Note) => {
    const title = editingTitle.trim();

    if (title) {
      await updateNote(note.id, { title });
    }

    setEditingNoteId(null);
    setEditingTitle("");
  };

  const share = async (note: Note) => {
    if (isCreatingShare) return;

    setIsCreatingShare(true);

    try {
      const shareId = await createShare(note.id);

      if (!shareId) return;

      setShareUrl(`${window.location.origin}/share/${shareId}`);
      setShareNoteTitle(note.title || t("Untitled"));
      setIsShareModalOpen(true);
    } finally {
      setIsCreatingShare(false);
    }
  };

  if (!group) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-surface px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-subtle">
          <FileText className="h-6 w-6 text-text-muted" />
        </div>
        <h1 className="text-[16px] font-semibold text-text-primary">
          {t("No groups found")}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/dashboard/all-groups")}
          className="mt-4 text-[13px] font-medium text-text-secondary underline underline-offset-4"
        >
          {t("Back")}
        </button>
      </div>
    );
  }

  return (
    // Single scrolling container — same as AllNotes — instead of a sticky
    // header + separate scroll area, so the vertical rhythm (pt-12/pb-12)
    // matches exactly.
    <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-surface">
      <div className="w-full max-w-[1050px] mx-auto px-6 md:px-8 lg:px-[52px] pt-12 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-8 py-[3px]">
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate("/dashboard/all-groups")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-surface-hover"
              aria-label={t("Back")}
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="truncate text-[28px] leading-[34px] font-medium text-text-primary">
                  {group.name}
                </h1>
                <span className="inline-flex shrink-0 items-center rounded-[6px] bg-surface-hover px-2.5 py-0.5 text-[12px] leading-[16px] font-medium text-text-secondary">
                  {groupNotes.length}{" "}
                  {groupNotes.length === 1 ? t("note") : t("notes")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedCount > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-default px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle"
                >
                  <Archive className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  <span>{t("Move to Archive")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkTrash}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-danger-border px-3 py-2 text-[13px] font-medium text-danger-text transition-colors hover:bg-danger-surface"
                >
                  <Trash2 className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  <span>{t("Move to Trash")}</span>
                </button>
              </>
            ) : isSearchOpen ? (
              <div className="flex h-9 w-[220px] items-center gap-2 rounded-[8px] border border-border-default bg-surface px-3">
                <Search className="h-[15px] w-[15px] shrink-0 text-icon-secondary" />
                <input
                  autoFocus
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder={t("Search by title or content")}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setIsSearchOpen(false);
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-icon-muted hover:bg-surface-hover hover:text-text-primary"
                  aria-label={t("Close")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center text-text-primary transition-opacity hover:opacity-60"
                aria-label={t("Search by title or content")}
                title={t("Search by title or content")}
              >
                <Search className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
            )}

            <button
              type="button"
              onClick={() => addNote(group.id)}
              className="inline-flex items-center gap-2 rounded-[12px] bg-action-primary px-4 py-2 text-[14px] leading-[20px] font-medium text-action-on-primary transition-colors hover:bg-action-primary-hover"
            >
              <Plus className="h-[15px] w-[15px]" strokeWidth={2} />
              <span>{t("New Note")}</span>
            </button>
          </div>
        </div>

        {/* Notes table — mirrors AllNotes' NotesTable spacing exactly */}
        <div className="mt-6 flex flex-col gap-1">
          <div className={`${ROW_GRID_CLASS} px-4 py-2`}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={toggleSelectAll}
              ariaLabel={t("Select all")}
            />

            <span className="flex items-center gap-2 text-[14px] leading-[20px] text-text-primary">
              {t("Name")}
              {selectedCount > 0 && (
                <span className="text-[13px] font-normal text-text-secondary">
                  · {selectedCount} {t("selected")}
                </span>
              )}
            </span>

            <span className="text-[14px] leading-[20px] text-text-primary">
              {t("Date created")}
            </span>

            <span />
          </div>

          {groupNotes.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <p className="text-[15px] font-medium text-text-primary">
                {search ? t("No matching notes") : t("No notes in this group")}
              </p>
              <p className="mt-1 text-[13px] text-text-muted">
                {search
                  ? t("Try searching with different keywords.")
                  : t("Add a note to this group to get started.")}
              </p>
            </div>
          ) : (
            <div>
              {groupNotes.map(note => {
                const editing = editingNoteId === note.id;
                const isSelected = selectedNoteIds.has(note.id);

                return (
                  <div
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !editing && setActiveNoteId(note.id)}
                    onKeyDown={event => {
                      if (!editing && event.key === "Enter") {
                        setActiveNoteId(note.id);
                      }
                    }}
                    className={[
                      "group rounded-[12px] px-4 py-3 transition-colors hover:bg-surface-subtle",
                      ROW_GRID_CLASS,
                      isSelected ? "bg-surface-subtle" : "",
                    ].join(" ")}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleNoteSelected(note.id)}
                      ariaLabel={t("Select note")}
                    />

                    <div className="min-w-0">
                      {editing ? (
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={event =>
                            setEditingTitle(event.target.value)
                          }
                          onClick={event => event.stopPropagation()}
                          onKeyDown={event => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void saveRename(note);
                            }
                            if (event.key === "Escape") {
                              setEditingNoteId(null);
                              setEditingTitle("");
                            }
                          }}
                          onBlur={() => void saveRename(note)}
                          className="block w-full bg-transparent p-0 text-[14px] leading-[20px] font-medium text-text-primary outline-none border-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation();
                            setActiveNoteId(note.id);
                          }}
                          className="block max-w-full text-left"
                        >
                          <span className="block truncate text-[14px] leading-[20px] font-medium text-text-primary">
                            {note.title || t("Untitled")}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={event => {
                          event.stopPropagation();
                          setActiveNoteId(note.id);
                        }}
                        className="block max-w-full text-left"
                      >
                        <p className="mt-1 truncate text-[12px] leading-[16px] text-text-secondary">
                          {preview(note.content, t("No additional text"))}
                        </p>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <span className="text-[14px] leading-[20px] text-text-secondary">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      onClick={event => event.stopPropagation()}
                    >
                      <NoteActionsMenu
                        note={note}
                        groups={groups}
                        onShare={() => share(note)}
                        onRename={() => startRename(note)}
                        onArchive={() => toggleArchiveNote(note.id)}
                        onTogglePin={() => togglePinNote(note.id)}
                        onMoveToGroup={id => moveNoteToGroup(note.id, id)}
                        onRemoveFromGroup={() => removeNoteFromGroup(note.id)}
                        onMoveToTrash={() => deleteNote(note.id)}
                        onCreateGroup={openCreateGroupModal}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ShareNoteModal
        isOpen={isShareModalOpen}
        shareUrl={shareUrl}
        noteTitle={shareNoteTitle}
        isLinkCopied={false}
        onClose={() => setIsShareModalOpen(false)}
        onCopy={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
          } catch {
            window.prompt(t("Copy this share link:"), shareUrl);
          }
        }}
      />
    </div>
  );
}
