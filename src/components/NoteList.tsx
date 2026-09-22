import React, { useCallback, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { useLocale } from "../lib/locale";
import {
  Plus,
  Pin,
  Archive,
  FileText,
  Menu,
  Trash2,
  Search
} from "lucide-react";
import { cn } from '../lib/utils';
import { Note } from '../types';

function getListTitle(
  activeGroupId: string | null,
  searchQuery: string,
  t: (key: string) => string
): string {
  if (searchQuery) return t("Search Results");

  if (activeGroupId === "pinned")
    return t("Pinned Notes");

  if (activeGroupId === "archived")
    return t("Archive");

  if (activeGroupId === "trash")
    return t("Trash");

  if (activeGroupId === null)
    return t("All Notes");

  return t("Group Notes");
}

const NoteListItem = React.memo(function NoteListItem({
  note,
  isActive,
  untitledLabel,
  noAdditionalTextLabel,
  formattedDate,
  onSelect,
}: {
  note: Note;
  isActive: boolean;
  untitledLabel: string;
  noAdditionalTextLabel: string;
  formattedDate: string;
  onSelect: (noteId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={cn(
        "w-full text-left p-4 rounded-2xl transition-all duration-200 group border",
        isActive
          ? "bg-secondary-bg border-border-default shadow-sm"
          : "bg-surface border-transparent hover:bg-secondary-bg/50 hover:border-border-soft"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-text-primary truncate pr-4 flex-1">
          {note.title || untitledLabel}
        </h3>
        {note.isPinned && <Pin className="w-3.5 h-3.5 text-primary-green flex-shrink-0 mt-1" fill="currentColor" />}
      </div>
      <p className="text-sm text-text-secondary line-clamp-2 mb-3 h-10">
        {note.content || noAdditionalTextLabel}
      </p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-medium text-text-muted">{formattedDate}</span>
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1 overflow-hidden ml-2">
            {note.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-border-soft text-text-secondary whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
});

export function NoteList() {
  const {
    notes,
    activeGroupId,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    addNote,
    setSidebarOpen
  } = useAppContext();

  const { t, formatDate } = useLocale();

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered: Note[] = [];

    for (const note of notes) {
      if (activeGroupId === "pinned") {
        if (!note.isPinned || note.isArchived || note.isDeleted) continue;
      } else if (activeGroupId === "archived") {
        if (!note.isArchived || note.isDeleted) continue;
      } else if (activeGroupId === "trash") {
        if (!note.isDeleted) continue;
      } else if (activeGroupId === null) {
        if (note.isArchived || note.isDeleted) continue;
      } else if (
        note.groupId !== activeGroupId ||
        note.isArchived ||
        note.isDeleted
      ) {
        continue;
      }

      if (
        q &&
        !note.title.toLowerCase().includes(q) &&
        !note.content.toLowerCase().includes(q)
      ) {
        continue;
      }

      filtered.push(note);
    }

    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, activeGroupId, searchQuery]);

  const title = useMemo(
    () => getListTitle(activeGroupId, searchQuery, t),
    [activeGroupId, searchQuery, t]
  );

  const handleSelectNote = useCallback(
    (noteId: string) => setActiveNoteId(noteId),
    [setActiveNoteId]
  );

  const handleCreateNote = useCallback(() => {
    const groupId =
      activeGroupId &&
      activeGroupId !== "pinned" &&
      activeGroupId !== "archived" &&
      activeGroupId !== "trash"
        ? activeGroupId
        : null;

    addNote(groupId);
  }, [activeGroupId, addNote]);

  const handleOpenSidebar = useCallback(
    () => setSidebarOpen(true),
    [setSidebarOpen]
  );

  const untitledLabel = t("Untitled");
  const noAdditionalTextLabel = t("No additional text");

  return (
    <div className="flex flex-col w-full md:w-[320px] lg:w-[360px] border-r border-border-default bg-surface h-full">
      <div className="p-4 flex items-center justify-between border-b border-border-soft md:hidden">
        <button onClick={handleOpenSidebar} className="p-2 -ml-2 rounded-lg hover:bg-surface-hover text-text-secondary">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">{title}</h2>
        <button
          onClick={handleCreateNote}
          className="p-2 -mr-2 rounded-lg hover:bg-surface-hover text-primary-green"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="hidden md:flex p-6 items-center justify-between border-b border-border-soft">
        <h2 className="font-bold text-2xl tracking-tight">{title}</h2>
        <button
          onClick={handleCreateNote}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-primary-green text-action-on-primary hover:bg-secondary-green transition-colors shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-text-muted">
            <div className="w-16 h-16 rounded-3xl bg-secondary-bg flex items-center justify-center mb-4">
              {activeGroupId === "trash" ? (
                <Trash2 className="w-8 h-8 opacity-50" />
              ) : activeGroupId === "archived" ? (
                <Archive className="w-8 h-8 opacity-50" />
              ) : searchQuery ? (
                <Search className="w-8 h-8 opacity-50" />
              ) : (
                <FileText className="w-8 h-8 opacity-50" />
              )}
            </div>
            {activeGroupId === "trash" ? (
              <>
                <p className="font-medium text-text-secondary">
                  {t("Trash is empty")}
                </p>

                <p className="text-sm mt-1">
                  {t("Deleted notes will appear here.")}
                </p>
              </>
            ) : activeGroupId === "archived" ? (
              <>
                <p className="font-medium text-text-secondary">
                  {t("No archived notes")}
                </p>

                <p className="text-sm mt-1">
                  {t("Archived notes will appear here.")}
                </p>
              </>
            ) : searchQuery ? (
              <>
                <p className="font-medium text-text-secondary">
                  {t("No results found")}
                </p>

                <p className="text-sm mt-1">
                  {t("Try searching with different keywords.")}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-text-secondary">
                  {t("No notes yet")}
                </p>

                <p className="text-sm mt-1">
                  {t("Create your first note to get started.")}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredNotes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                untitledLabel={untitledLabel}
                noAdditionalTextLabel={noAdditionalTextLabel}
                formattedDate={formatDate(note.updatedAt)}
                onSelect={handleSelectNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
