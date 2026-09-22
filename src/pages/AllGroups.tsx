import React, { useMemo, useState } from "react";
import { Folder, Plus, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../store/AppContext";
import { useLocale } from "../lib/locale";
import { GroupActionsMenu } from "../components/GroupActionsMenu";
import type { Group } from "../types";

function getGroupUpdatedAt(
  groupId: string,
  notes: { groupId: string | null; updatedAt: string }[],
  createdAt: string
) {
  const latest = notes
    .filter(note => note.groupId === groupId)
    .map(note => new Date(note.updatedAt).getTime())
    .filter(time => Number.isFinite(time))
    .sort((a, b) => b - a)[0];

  return latest ? new Date(latest).toISOString() : createdAt;
}

// Same column template as AllNotes' NotesTable (checkbox slot swapped for
// nothing, since groups have no bulk selection) — Name | Updated | Date | actions —
// so the header row and every body row line up exactly.
const ROW_GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)_150px_180px_36px] items-center gap-4";

export function AllGroups() {
  const navigate = useNavigate();
  const {
    groups,
    notes,
    openCreateGroupModal,
    renameGroup,
    deleteGroup,
  } = useAppContext();
  const { t, formatDate } = useLocale();

  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    return groups
      .filter(group => !q || group.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aUpdated = new Date(
          getGroupUpdatedAt(a.id, notes, a.createdAt)
        ).getTime();
        const bUpdated = new Date(
          getGroupUpdatedAt(b.id, notes, b.createdAt)
        ).getTime();
        return bUpdated - aUpdated;
      });
  }, [groups, notes, search]);

  const startRename = (group: Group) => {
    setEditingGroupId(group.id);
    setEditingName(group.name);
  };

  const saveRename = async (group: Group) => {
    const name = editingName.trim();

    if (name && name !== group.name) {
      await renameGroup(group.id, name);
    }

    setEditingGroupId(null);
    setEditingName("");
  };

  const handleDelete = async (group: Group) => {
    await deleteGroup(group.id);
  };

  return (
    // Single scrolling container — same as AllNotes — so the vertical
    // rhythm (pt-12/pb-12) matches exactly instead of a sticky header +
    // separate scroll area with its own padding.
    <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-surface">
      <div className="w-full max-w-[1050px] mx-auto px-6 md:px-8 lg:px-[52px] pt-12 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-8 py-[3px]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] leading-[34px] font-medium text-text-primary">
                {t("All Groups")}
              </h1>
              <span className="inline-flex items-center rounded-[6px] bg-surface-hover px-2.5 py-0.5 text-[12px] leading-[16px] font-medium text-text-secondary">
                {groups.length}{" "}
                {groups.length === 1 ? t("group") : t("groups")}
              </span>
            </div>
            <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
              {t("All your groups in one place.")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isSearchOpen ? (
              <div className="flex h-9 w-[220px] items-center gap-2 rounded-[8px] border border-border-default bg-surface px-3">
                <Search className="h-[15px] w-[15px] shrink-0 text-icon-secondary" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("Search groups")}
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
                aria-label={t("Search groups")}
                title={t("Search groups")}
              >
                <Search className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
            )}

            <button
              type="button"
              onClick={openCreateGroupModal}
              className="inline-flex items-center gap-2 rounded-[12px] bg-action-primary px-4 py-2 text-[14px] leading-[20px] font-medium text-action-on-primary transition-colors hover:bg-action-primary-hover"
            >
              <Plus className="h-[15px] w-[15px]" strokeWidth={2} />
              <span>{t("Create Group")}</span>
            </button>
          </div>
        </div>

        {/* Groups table — mirrors AllNotes' NotesTable spacing exactly */}
        <div className="mt-6 flex flex-col gap-1">
          <div className={`${ROW_GRID_CLASS} px-4 py-2`}>
            <span className="text-[14px] leading-[20px] text-text-primary">
              {t("Name")}
            </span>
            <span className="text-[14px] leading-[20px] text-text-primary">
              {t("Updated")}
            </span>
            <span className="text-[14px] leading-[20px] text-text-primary">
              {t("Date created")}
            </span>
            <span />
          </div>

          {visibleGroups.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <p className="text-[15px] font-medium text-text-primary">
                {search ? t("No matching groups") : t("No groups found")}
              </p>
              <p className="mt-1 text-[13px] text-text-muted">
                {search
                  ? t("Try searching with a different group name.")
                  : t("Create your first group to get started.")}
              </p>
            </div>
          ) : (
            <div>
              {visibleGroups.map(group => {
                const editing = editingGroupId === group.id;
                const updatedAt = getGroupUpdatedAt(
                  group.id,
                  notes,
                  group.createdAt
                );
                const noteCount = notes.filter(
                  note => note.groupId === group.id && !note.isDeleted
                ).length;

                return (
                  <div
                    key={group.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!editing) navigate(`/dashboard/group/${group.id}`);
                    }}
                    onKeyDown={event => {
                      if (!editing && event.key === "Enter") {
                        navigate(`/dashboard/group/${group.id}`);
                      }
                    }}
                    className={[
                      "group cursor-pointer rounded-[12px] px-4 py-3 transition-colors hover:bg-surface-subtle",
                      ROW_GRID_CLASS,
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border-default bg-surface">
                        <Folder className="h-[16px] w-[16px] text-text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {editing ? (
                          <input
                            autoFocus
                            value={editingName}
                            onChange={event =>
                              setEditingName(event.target.value)
                            }
                            onClick={event => event.stopPropagation()}
                            onKeyDown={event => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void saveRename(group);
                              }
                              if (event.key === "Escape") {
                                setEditingGroupId(null);
                                setEditingName("");
                              }
                            }}
                            onBlur={() => void saveRename(group)}
                            className="block w-full min-w-0 bg-transparent p-0 text-[14px] leading-[20px] font-medium text-text-primary outline-none border-none"
                          />
                        ) : (
                          <span className="block truncate text-[14px] leading-[20px] font-medium text-text-primary">
                            {group.name}
                          </span>
                        )}

                        <span className="mt-1 block text-[12px] leading-[16px] text-text-secondary">
                           {noteCount} {t("Notes")} {/*· {formatDate(group.createdAt)} */}
                        </span>
                      </div>
                    </div>

                    <span className="text-[14px] leading-[20px] text-text-secondary">
                      {formatDate(updatedAt)}
                    </span>

                    <span className="text-[14px] leading-[20px] text-text-secondary">
                      {formatDate(group.createdAt)}
                    </span>

                    <div
                      className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                      onClick={event => event.stopPropagation()}
                    >
                      <GroupActionsMenu
                        onRename={() => startRename(group)}
                        onDelete={() => handleDelete(group)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}