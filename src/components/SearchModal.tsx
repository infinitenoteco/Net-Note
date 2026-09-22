import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, FileText, Folder } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { useLocale } from "../lib/locale";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = memo(function SearchModal({
  isOpen,
  onClose,
}: SearchModalProps) {
  const { notes, groups, setActiveNoteId } = useAppContext();
  const { t, formatDate } = useLocale();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const recentNotes = useMemo(() => {
    const eligible = notes.filter(
      note => !note.isDeleted && !note.isArchived
    );

    return eligible.slice().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [notes]);

  const cleanQuery = useMemo(
    () => query.trim().toLowerCase(),
    [query]
  );

  const filteredNotes = useMemo(() => {
    if (!cleanQuery) {
      return recentNotes.slice(0, 8);
    }

    return recentNotes.filter(note =>
      (note.title || "").toLowerCase().includes(cleanQuery)
    );
  }, [cleanQuery, recentNotes]);

  const filteredGroups = useMemo(() => {
    if (!cleanQuery) {
      return [];
    }

    return groups
      .filter(group =>
        group.name.toLowerCase().includes(cleanQuery)
      )
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [cleanQuery, groups]);

  const searchPlaceholder = useMemo(
    () => "Search notes or groups",
    []
  );
  const closeLabel = useMemo(() => t("Close"), [t]);
  const untitledLabel = useMemo(() => t("Untitled"), [t]);
  const hasQuery = cleanQuery.length > 0;
  const hasResults =
    filteredGroups.length > 0 || filteredNotes.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    setQuery("");

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      setActiveNoteId(noteId);
      onClose();
    },
    [setActiveNoteId, onClose]
  );

  const handleSelectGroup = useCallback(
    (groupId: string) => {
      onClose();
      navigate(`/dashboard/group/${groupId}`);
    },
    [navigate, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-surface-inverse/20 px-4 pt-[10vh] backdrop-blur-[2px] sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            onMouseDown={event => event.stopPropagation()}
            className="w-full max-w-[760px] overflow-hidden rounded-[22px] border border-border-default/10 bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.16)]"
          >
            {/* Search header */}
            <div className="border-b border-border-default px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 shrink-0 text-text-secondary" />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[16px] text-text-primary outline-none placeholder:text-text-muted"
                  aria-label={searchPlaceholder}
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-inverse/5 hover:text-text-primary"
                  aria-label={closeLabel}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
              {!hasQuery && (
                <div className="px-2 pb-2 pt-1">
                  <p className="text-[14px] font-semibold text-text-muted">
                    {t("Recent Notes")}
                  </p>
                </div>
              )}

              {hasQuery && filteredGroups.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 pb-2">
                    <p className="text-[14px] font-semibold text-text-muted">
                      {t("Groups")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {filteredGroups.map(group => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => handleSelectGroup(group.id)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-hover"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                          <Folder className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-text-primary">
                            {group.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasQuery && filteredNotes.length > 0 && (
                <div className="mb-1">
                  {filteredGroups.length > 0 && (
                    <div className="px-2 pb-2">
                      <p className="text-[14px] font-semibold text-text-muted">
                        {t("Notes")}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    {filteredNotes.map(note => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => handleSelectNote(note.id)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-hover"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-text-primary">
                            {note.title || untitledLabel}
                          </p>
                        </div>

                        <span className="shrink-0 text-[12px] text-text-muted">
                          {formatDate(note.createdAt)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!hasQuery && filteredNotes.length > 0 && (
                <div className="space-y-1">
                  {filteredNotes.map(note => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => handleSelectNote(note.id)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-text-primary">
                          {note.title || untitledLabel}
                        </p>
                      </div>

                      <span className="shrink-0 text-[12px] text-text-muted">
                        {formatDate(note.createdAt)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {hasQuery && !hasResults && (
                <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle">
                    <Search className="h-5 w-5 text-text-muted" />
                  </div>

                  <p className="text-sm font-medium text-text-secondary">
                    {t("No results found")}
                  </p>

                  <p className="mt-1 max-w-[280px] text-xs leading-5 text-text-muted">
                    {t("Try searching with different keywords.")}
                  </p>
                </div>
              )}

              {!hasQuery && filteredNotes.length === 0 && (
                <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle">
                    <FileText className="h-5 w-5 text-text-muted" />
                  </div>

                  <p className="text-sm font-medium text-text-secondary">
                    {t("No results found")}
                  </p>

                  <p className="mt-1 max-w-[280px] text-xs leading-5 text-text-muted">
                    {t("Start typing to search your notes.")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
