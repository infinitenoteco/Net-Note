// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Archive, Check, Folder, Minus, Plus, Search, Trash2, X } from "lucide-react";
// import { createPortal } from "react-dom";
// import { useAppContext } from "../store/AppContext";
// import { useLocale } from "../lib/locale";
// import { Note } from "../types";
// import { NoteActionsMenu } from "../components/NoteActionsMenu";
// import { ShareNoteModal } from "../components/ShareNoteModal";

// function getPreview(content: string): string {
//   if (!content?.trim()) return "No additional text";

//   try {
//     const parsed = JSON.parse(content);

//     if (Array.isArray(parsed?.blocks)) {
//       const text = parsed.blocks
//         .map((block: any) => {
//           if (typeof block?.content === "string") return block.content;
//           if (typeof block?.text === "string") return block.text;
//           return "";
//         })
//         .filter(Boolean)
//         .join(" ")
//         .replace(/\s+/g, " ")
//         .trim();

//       return text || "No additional text";
//     }

//     if (typeof parsed === "string") {
//       return parsed.replace(/\s+/g, " ").trim() || "No additional text";
//     }
//   } catch {
//     // Keep raw text as fallback.
//   }

//   return content.replace(/\s+/g, " ").trim() || "No additional text";
// }

// function formatReferenceDate(
//   date: string,
//   language: string
// ): string {
//   const value = new Date(date);

//   if (Number.isNaN(value.getTime())) return date;

//   return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }).format(value);
// }

// // Shared grid template so the header row and every body row line up
// // under the exact same columns: checkbox | name+preview | date | actions
// const ROW_GRID_CLASS =
//   "grid grid-cols-[16px_minmax(0,1fr)_180px_36px] items-center gap-4";

// type MenuPosition = { top: number; left: number };

// const GROUP_POPUP_WIDTH = 220;
// const GROUP_POPUP_HEIGHT = 260;
// const VIEWPORT_PADDING = 12;

// // Same viewport-aware placement approach used by NoteActionsMenu — keeps the
// // bulk "Move to Group" popup fully on-screen regardless of where the button sits.
// function getSafeGroupPopupPosition(rect: DOMRect): MenuPosition {
//   let left = rect.right - GROUP_POPUP_WIDTH;
//   let top = rect.bottom + 8;

//   if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
//   if (left + GROUP_POPUP_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
//     left = window.innerWidth - GROUP_POPUP_WIDTH - VIEWPORT_PADDING;
//   }

//   if (top + GROUP_POPUP_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
//     top = rect.top - GROUP_POPUP_HEIGHT - 8;
//   }
//   if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;

//   return { top, left };
// }

// // Minimal, low-contrast checkbox — no bright/native blue or heavy black fill,
// // just a soft border that turns into a quiet dark chip with a thin check mark.
// function Checkbox({
//   checked,
//   indeterminate = false,
//   onChange,
//   ariaLabel,
// }: {
//   checked: boolean;
//   indeterminate?: boolean;
//   onChange: () => void;
//   ariaLabel: string;
// }) {
//   const isActive = checked || indeterminate;

//   return (
//     <label
//       onClick={(event) => event.stopPropagation()}
//       className="relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center"
//     >
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={onChange}
//         aria-label={ariaLabel}
//         className="peer sr-only"
//       />
//       <span
//         className={[
//           "flex h-4 w-4 items-center justify-center rounded-[5px] border transition-colors",
//           isActive
//             ? "border-[#8a8f98] bg-[#111111]"
//             : "border-[#d6d8dc] bg-white peer-hover:border-[#b7bbc2]",
//         ].join(" ")}
//       >
//         {indeterminate ? (
//           <Minus className="h-[10px] w-[10px] text-white" strokeWidth={3} />
//         ) : checked ? (
//           <Check className="h-[10px] w-[10px] text-white" strokeWidth={3} />
//         ) : null}
//       </span>
//     </label>
//   );
// }

// export function AllNotes() {
//   const {
//     notes,
//     groups,
//     addNote,
//     updateNote,
//     togglePinNote,
//     toggleArchiveNote,
//     moveNoteToGroup,
//     removeNoteFromGroup,
//     deleteNote,
//     createShare,
//     openCreateGroupModal,
//     setActiveNoteId,
//   } = useAppContext();

//   const { t, language } = useLocale();

//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState("");
//   const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
//   const [editingTitle, setEditingTitle] = useState("");

//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [shareUrl, setShareUrl] = useState("");
//   const [shareNoteTitle, setShareNoteTitle] = useState("");
//   const [isLinkCopied, setIsLinkCopied] = useState(false);

//   // Selection state — powers the bulk "Move to Archive" / "Move to Trash" / "Move to Group" actions
//   const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
//     new Set()
//   );

//   // Bulk "Move to Group" popup
//   const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false);
//   const [groupPopupPosition, setGroupPopupPosition] =
//     useState<MenuPosition | null>(null);
//   const groupButtonRef = useRef<HTMLButtonElement>(null);

//   const eligibleNotes = useMemo(
//     () =>
//       notes
//         .filter((note) => !note.isArchived && !note.isDeleted)
//         .sort(
//           (a, b) =>
//             new Date(b.updatedAt).getTime() -
//             new Date(a.updatedAt).getTime()
//         ),
//     [notes]
//   );

//   const filteredNotes = useMemo(() => {
//     const query = searchValue.trim().toLowerCase();

//     if (!query) return eligibleNotes;

//     return eligibleNotes.filter((note) => {
//       const preview = getPreview(note.content);

//       return (
//         note.title.toLowerCase().includes(query) ||
//         note.content.toLowerCase().includes(query) ||
//         preview.toLowerCase().includes(query)
//       );
//     });
//   }, [eligibleNotes, searchValue]);

//   const selectedCount = selectedNoteIds.size;
//   const isAllSelected =
//     renderedNotes.length > 0 && selectedCount === renderedNotes.length;
//   const isSomeSelected = selectedCount > 0 && !isAllSelected;

//   const handleOpenNote = (note: Note) => {
//     setActiveNoteId(note.id);
//   };

//   const handleStartRename = (note: Note) => {
//     setEditingNoteId(note.id);
//     setEditingTitle(note.title || t("Untitled"));
//   };

//   const handleFinishRename = async () => {
//     if (!editingNoteId) return;

//     const noteId = editingNoteId;
//     const nextTitle = editingTitle.trim() || t("Untitled");

//     setEditingNoteId(null);
//     setEditingTitle("");

//     await updateNote(noteId, { title: nextTitle });
//   };

//   const handleCancelRename = () => {
//     setEditingNoteId(null);
//     setEditingTitle("");
//   };

//   const handleShare = async (note: Note) => {
//     try {
//       const shareId = await createShare(note.id);

//       if (!shareId) return;

//       setShareUrl(`${window.location.origin}/share/${shareId}`);
//       setShareNoteTitle(note.title || t("Untitled"));
//       setIsLinkCopied(false);
//       setIsShareModalOpen(true);
//     } catch (error) {
//       console.error("Share note error:", error);
//     }
//   };

//   const toggleNoteSelected = (noteId: string) => {
//     setSelectedNoteIds((prev) => {
//       const next = new Set(prev);

//       if (next.has(noteId)) {
//         next.delete(noteId);
//       } else {
//         next.add(noteId);
//       }

//       return next;
//     });
//   };

//   const toggleSelectAll = useCallback(() => {
//     setSelectedNoteIds((prev) => {
//       if (prev.size === renderedNotes.length) {
//         return new Set();
//       }

//       return new Set(renderedNotes.map((note) => note.id));
//     });
//   };

//   const clearSelection = useCallback(() => setSelectedNoteIds(new Set()), []);

//   const closeGroupPopup = () => {
//     setIsGroupPopupOpen(false);
//     setGroupPopupPosition(null);
//   };

//   const handleToggleGroupPopup = () => {
//     if (isGroupPopupOpen) {
//       closeGroupPopup();
//       return;
//     }

//     if (!groupButtonRef.current) return;

//     const rect = groupButtonRef.current.getBoundingClientRect();
//     setGroupPopupPosition(getSafeGroupPopupPosition(rect));
//     setIsGroupPopupOpen(true);
//   };

//   // Close the bulk group popup on outside click
//   useEffect(() => {
//     if (!isGroupPopupOpen) return;

//     const handleOutsideClick = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;

//       if (
//         !target.closest("[data-bulk-group-popup]") &&
//         !target.closest("[data-bulk-group-trigger]")
//       ) {
//         closeGroupPopup();
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, [isGroupPopupOpen]);

//   const handleBulkArchive = useCallback(async () => {
//     const ids = Array.from(selectedNoteIds);

//     clearSelection();

//     await bulkArchiveNotes(ids, true);
//   };

//   const handleBulkMoveToGroup = useCallback(async (groupId: string) => {
//     const ids = Array.from(selectedNoteIds);

//     clearSelection();
//     closeGroupPopup();

//     await bulkMoveNotesToGroup(ids, groupId);
//   };

//   const handleBulkTrash = useCallback(async () => {
//     const ids = Array.from(selectedNoteIds);

//     clearSelection();

//     await bulkTrashNotes(ids);
//   };

//   return (
//     <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-white">
//       <div className="w-full max-w-[1050px] mx-auto px-6 md:px-8 lg:px-[52px] pt-12 pb-12">
//         {/* Header */}
//         <div className="flex items-center justify-between gap-8 py-[3px]">
//           <div className="min-w-0">
//             <div className="flex items-center gap-3">
//               <h1 className="text-[28px] leading-[34px] font-medium text-[#111827]">
//                 {t("All Notes")}
//               </h1>

//               <span className="inline-flex items-center rounded-[6px] bg-[#ededf0] px-2.5 py-0.5 text-[12px] leading-[16px] font-medium text-[#4b5563]">
//                 {eligibleNotes.length} {eligibleNotes.length === 1 ? "note" : "notes"}
//               </span>
//             </div>

//             <p className="mt-1 text-[14px] leading-[20px] text-[#6b7280]">
//               {t("All your notes in one place.")}
//             </p>
//           </div>

//           <div className="flex items-center gap-4">
//             {selectedCount > 0 ? (
//               <>
//                 <button
//                   ref={groupButtonRef}
//                   type="button"
//                   data-bulk-group-trigger
//                   onClick={handleToggleGroupPopup}
//                   className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e1e3e7] px-3 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:bg-black/[0.03]"
//                 >
//                   <Folder className="h-[15px] w-[15px]" strokeWidth={1.8} />
//                   <span>{t("Move to Group")}</span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleBulkArchive}
//                   className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e1e3e7] px-3 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:bg-black/[0.03]"
//                 >
//                   <Archive className="h-[15px] w-[15px]" strokeWidth={1.8} />
//                   <span>{t("Move to Archive")}</span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleBulkTrash}
//                   className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#f3d0d0] px-3 py-2 text-[13px] font-medium text-[#b42318] transition-colors hover:bg-[#fef3f2]"
//                 >
//                   <Trash2 className="h-[15px] w-[15px]" strokeWidth={1.8} />
//                   <span>{t("Move to Trash")}</span>
//                 </button>
//               </>
//             ) : isSearchOpen ? (
//               <div className="flex h-9 w-[220px] items-center gap-2 rounded-[8px] border border-[#e1e3e7] bg-white px-3">
//                 <Search className="h-[15px] w-[15px] shrink-0 text-[#747b87]" />

//                 <input
//                   autoFocus
//                   value={searchValue}
//                   onChange={(event) => setSearchValue(event.target.value)}
//                   placeholder={t("Search by title or content")}
//                   className="min-w-0 flex-1 bg-transparent text-[13px] text-[#20242d] placeholder:text-[#a0a5ae] outline-none"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSearchValue("");
//                     setIsSearchOpen(false);
//                   }}
//                   className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#8a909a] hover:bg-black/5 hover:text-[#20242d]"
//                   aria-label={t("Close")}
//                 >
//                   <X className="h-3.5 w-3.5" />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 type="button"
//                 onClick={() => setIsSearchOpen(true)}
//                 className="flex items-center justify-center text-[#0d0d0d] transition-opacity hover:opacity-60"
//                 aria-label={t("Search Notes")}
//                 title={t("Search Notes")}
//               >
//                 <Search className="h-[17px] w-[17px]" strokeWidth={1.8} />
//               </button>
//             )}

//             <button
//               type="button"
//               onClick={() => addNote(null)}
//               className="inline-flex items-center gap-2 rounded-[12px] bg-[#0d0d0d] px-4 py-2 text-[14px] leading-[20px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
//             >
//               <Plus className="h-[15px] w-[15px]" strokeWidth={2} />
//               <span>{t("New Note")}</span>
//             </button>
//           </div>
//         </div>

//         {/* Notes table */}
//         <div className="mt-6 flex flex-col gap-1">
//           <div className={`${ROW_GRID_CLASS} px-4 py-2`}>
//             <Checkbox
//               checked={isAllSelected}
//               indeterminate={isSomeSelected}
//               onChange={toggleSelectAll}
//               ariaLabel={t("Select all notes")}
//             />

//             <span className="flex items-center gap-2 text-[14px] leading-[20px] text-[#0b0b0b]">
//               {t("Name")}
//               {selectedCount > 0 && (
//                 <span className="text-[13px] font-normal text-[#6b7280]">
//                   · {selectedCount} {t("selected")}
//                 </span>
//               )}
//             </span>

//             <span className="text-[14px] leading-[20px] text-[#0b0b0b]">
//               {t("Date created")}
//             </span>

//             <span />
//           </div>

//           {renderedNotes.length === 0 ? (
//             <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
//               <p className="text-[15px] font-medium text-[#30343c]">
//                 {searchValue.trim()
//                   ? t("No matching notes")
//                   : t("No notes yet")}
//               </p>

//               <p className="mt-1 text-[13px] text-[#9297a0]">
//                 {searchValue.trim()
//                   ? t("Try searching with different keywords.")
//                   : t("Create your first note to get started.")}
//               </p>
//             </div>
//           ) : (
//             <div>
//               {filteredNotes.map((note) => {
//                 const isEditing = editingNoteId === note.id;
//                 const isSelected = selectedNoteIds.has(note.id);

//                 return (
//                   <div
//                     key={note.id}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => handleOpenNote(note)}
//                     onKeyDown={(event) => {
//                       if (
//                         event.key === "Enter" ||
//                         event.key === " "
//                       ) {
//                         event.preventDefault();
//                         handleOpenNote(note);
//                       }
//                     }}
//                     className={[
//                       "group cursor-pointer rounded-[12px] px-4 py-3 transition-colors hover:bg-black/[0.02]",
//                       ROW_GRID_CLASS,
//                       isSelected ? "bg-black/[0.02]" : "",
//                     ].join(" ")}
//                   >
//                     {/* Checkbox */}
//                     <Checkbox
//                       checked={isSelected}
//                       onChange={() => toggleNoteSelected(note.id)}
//                       ariaLabel={t("Select note")}
//                     />

//                     {/* Title + preview (stacked, matches design) */}
//                     <div className="min-w-0">
//                       {isEditing ? (
//                         <input
//                           autoFocus
//                           value={editingTitle}
//                           onChange={(event) =>
//                             setEditingTitle(event.target.value)
//                           }
//                           onClick={(event) => event.stopPropagation()}
//                           onBlur={handleFinishRename}
//                           onKeyDown={(event) => {
//                             if (event.key === "Enter") {
//                               event.preventDefault();
//                               event.currentTarget.blur();
//                             }

//                             if (event.key === "Escape") {
//                               event.preventDefault();
//                               handleCancelRename();
//                             }
//                           }}
//                           className="block w-full bg-transparent p-0 text-[14px] leading-[20px] font-medium text-[#111827] outline-none border-none"
//                         />
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={(event) => {
//                             event.stopPropagation();
//                             handleOpenNote(note);
//                           }}
//                           className="block max-w-full text-left"
//                         >
//                           <span className="block truncate text-[14px] leading-[20px] font-medium text-[#111827]">
//                             {note.title || t("Untitled")}
//                           </span>
//                         </button>
//                       )}

//                       <p className="mt-1 truncate text-[12px] leading-[16px] text-[#6b7280]">
//                         {getPreview(note.content)}
//                       </p>
//                     </div>

//                     {/* Date — aligned to the same 180px column as the header */}
//                     <div className="min-w-0">
//                       <span className="text-[14px] leading-[20px] text-[#898781]">
//                         {formatReferenceDate(note.createdAt, language)}
//                       </span>
//                     </div>

//                     {/* Actions — only visible on row hover */}
//                     <div
//                       className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
//                       onClick={(event) => event.stopPropagation()}
//                     >
//                       <NoteActionsMenu
//                         note={note}
//                         groups={groups}
//                         onShare={() => handleShare(note)}
//                         onRename={() => handleStartRename(note)}
//                         onArchive={() => toggleArchiveNote(note.id)}
//                         onTogglePin={() => togglePinNote(note.id)}
//                         onMoveToGroup={(groupId) =>
//                           moveNoteToGroup(note.id, groupId)
//                         }
//                         onRemoveFromGroup={() =>
//                           removeNoteFromGroup(note.id)
//                         }
//                         onMoveToTrash={() => deleteNote(note.id)}
//                         onCreateGroup={openCreateGroupModal}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {isGroupPopupOpen &&
//         groupPopupPosition &&
//         createPortal(
//           <div
//             data-bulk-group-popup
//             className="fixed z-[10001] w-[220px] max-h-64 overflow-y-auto rounded-xl border border-[#dedede] bg-white py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
//             style={{ top: groupPopupPosition.top, left: groupPopupPosition.left }}
//           >
//             {groups.length === 0 ? (
//               <div className="px-3.5 py-2.5 text-sm text-gray-500">
//                 {t("No groups found")}
//               </div>
//             ) : (
//               groups.map((group) => (
//                 <button
//                   key={group.id}
//                   type="button"
//                   onClick={() => handleBulkMoveToGroup(group.id)}
//                   className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-[#222] hover:bg-black/5"
//                 >
//                   <Folder className="h-4 w-4 shrink-0 text-gray-500" />
//                   <span className="min-w-0 truncate">{group.name}</span>
//                 </button>
//               ))
//             )}
//           </div>,
//           document.body
//         )}

//       <ShareNoteModal
//         isOpen={isShareModalOpen}
//         shareUrl={shareUrl}
//         noteTitle={shareNoteTitle}
//         isLinkCopied={isLinkCopied}
//         onClose={() => {
//           setIsShareModalOpen(false);
//           setIsLinkCopied(false);
//         }}
//         onCopy={async () => {
//           if (!shareUrl) return;

//           try {
//             await navigator.clipboard.writeText(shareUrl);
//             setIsLinkCopied(true);

//             window.setTimeout(() => {
//               setIsLinkCopied(false);
//             }, 2200);
//           } catch (error) {
//             console.error("Copy share link error:", error);
//           }
//         }}
//       />
//     </div>
//   );
// }

















import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Archive, Check, Folder, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useAppContext } from "../store/AppContext";
import { useLocale } from "../lib/locale";
import { Group, Note } from "../types";
import { NoteActionsMenu } from "../components/NoteActionsMenu";
import { ShareNoteModal } from "../components/ShareNoteModal";

const NO_ADDITIONAL_TEXT = "No additional text";
const EN_REFERENCE_DATE_LOCALE = "en-GB";
const HI_REFERENCE_DATE_LOCALE = "hi-IN";
const REFERENCE_DATE_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function getPreview(content: string): string {
  if (!content?.trim()) return NO_ADDITIONAL_TEXT;

  try {
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed?.blocks)) {
      const parts: string[] = [];

      for (const block of parsed.blocks) {
        if (typeof block?.content === "string") {
          parts.push(block.content);
        } else if (typeof block?.text === "string") {
          parts.push(block.text);
        }
      }

      const text = parts.join(" ").replace(/\s+/g, " ").trim();
      return text || NO_ADDITIONAL_TEXT;
    }

    if (typeof parsed === "string") {
      return parsed.replace(/\s+/g, " ").trim() || NO_ADDITIONAL_TEXT;
    }
  } catch {
    // Keep raw text as fallback.
  }

  return content.replace(/\s+/g, " ").trim() || NO_ADDITIONAL_TEXT;
}

function formatReferenceDate(
  date: string,
  language: string
): string {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return date;

  const locale = language === "hi" ? HI_REFERENCE_DATE_LOCALE : EN_REFERENCE_DATE_LOCALE;
  let formatter = REFERENCE_DATE_FORMATTER_CACHE.get(locale);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    REFERENCE_DATE_FORMATTER_CACHE.set(locale, formatter);
  }

  return formatter.format(value);
}

// Shared grid template so the header row and every body row line up
// under the exact same columns: checkbox | name+preview | date | actions
const ROW_GRID_CLASS =
  "grid grid-cols-[16px_minmax(0,1fr)_180px_36px] items-center gap-4";

type MenuPosition = { top: number; left: number };

const GROUP_POPUP_WIDTH = 220;
const GROUP_POPUP_HEIGHT = 260;
const VIEWPORT_PADDING = 12;

// Same viewport-aware placement approach used by NoteActionsMenu — keeps the
// bulk "Move to Group" popup fully on-screen regardless of where the button sits.
function getSafeGroupPopupPosition(rect: DOMRect): MenuPosition {
  let left = rect.right - GROUP_POPUP_WIDTH;
  let top = rect.bottom + 8;

  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
  if (left + GROUP_POPUP_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = window.innerWidth - GROUP_POPUP_WIDTH - VIEWPORT_PADDING;
  }

  if (top + GROUP_POPUP_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
    top = rect.top - GROUP_POPUP_HEIGHT - 8;
  }
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;

  return { top, left };
}

// Minimal, low-contrast checkbox — no bright/native blue or heavy black fill,
// just a soft border that turns into a quiet dark chip with a thin check mark.
const Checkbox = memo(function Checkbox({
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
      onClick={(event) => event.stopPropagation()}
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
});

type RenderedNote = Note & {
  preview: string;
  formattedCreatedAt: string;
};

type NoteRowProps = {
  note: RenderedNote;
  isSelected: boolean;
  isEditing: boolean;
  editingTitle: string;
  groups: Group[];
  untitledLabel: string;
  selectNoteLabel: string;
  onOpen: (note: Note) => void;
  onToggleSelected: (noteId: string) => void;
  onFinishRename: () => void;
  onCancelRename: () => void;
  onEditingTitleChange: (value: string) => void;
  onShare: (note: Note) => void;
  onStartRename: (note: Note) => void;
  onArchive: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onMoveToGroup: (noteId: string, groupId: string) => void;
  onRemoveFromGroup: (noteId: string) => void;
  onMoveToTrash: (noteId: string) => void;
  onCreateGroup: () => void;
};

const NoteRow = memo(function NoteRow({
  note,
  isSelected,
  isEditing,
  editingTitle,
  groups,
  untitledLabel,
  selectNoteLabel,
  onOpen,
  onToggleSelected,
  onFinishRename,
  onCancelRename,
  onEditingTitleChange,
  onShare,
  onStartRename,
  onArchive,
  onTogglePin,
  onMoveToGroup,
  onRemoveFromGroup,
  onMoveToTrash,
  onCreateGroup,
}: NoteRowProps) {
  const handleOpen = useCallback(() => onOpen(note), [note, onOpen]);
  const handleToggleSelected = useCallback(
    () => onToggleSelected(note.id),
    [note.id, onToggleSelected]
  );
  const handleShare = useCallback(() => onShare(note), [note, onShare]);
  const handleStartRename = useCallback(
    () => onStartRename(note),
    [note, onStartRename]
  );
  const handleArchive = useCallback(
    () => onArchive(note.id),
    [note.id, onArchive]
  );
  const handleTogglePin = useCallback(
    () => onTogglePin(note.id),
    [note.id, onTogglePin]
  );
  const handleMoveToGroup = useCallback(
    (groupId: string) => onMoveToGroup(note.id, groupId),
    [note.id, onMoveToGroup]
  );
  const handleRemoveFromGroup = useCallback(
    () => onRemoveFromGroup(note.id),
    [note.id, onRemoveFromGroup]
  );
  const handleMoveToTrash = useCallback(
    () => onMoveToTrash(note.id),
    [note.id, onMoveToTrash]
  );

  return (
    <div
      className={[
        "group rounded-[12px] px-4 py-3 transition-colors hover:bg-surface-subtle [content-visibility:auto] [contain-intrinsic-size:0_64px]",
        ROW_GRID_CLASS,
        isSelected ? "bg-surface-subtle" : "",
      ].join(" ")}
    >
      <Checkbox
        checked={isSelected}
        onChange={handleToggleSelected}
        ariaLabel={selectNoteLabel}
      />

      <div className="min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editingTitle}
            onChange={(event) => onEditingTitleChange(event.target.value)}
            onBlur={onFinishRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                onCancelRename();
              }
            }}
            className="block w-full bg-transparent p-0 text-[14px] leading-[20px] font-medium text-text-primary outline-none border-none"
          />
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            className="block max-w-full text-left"
          >
            <span className="block truncate text-[14px] leading-[20px] font-medium text-text-primary">
              {note.title || untitledLabel}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleOpen}
          className="block max-w-full text-left"
        >
          <p className="mt-1 truncate text-[12px] leading-[16px] text-text-secondary">
            {note.preview}
          </p>
        </button>
      </div>

      <div className="min-w-0">
        <span className="text-[14px] leading-[20px] text-text-secondary">
          {note.formattedCreatedAt}
        </span>
      </div>

      <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <NoteActionsMenu
          note={note}
          groups={groups}
          onShare={handleShare}
          onRename={handleStartRename}
          onArchive={handleArchive}
          onTogglePin={handleTogglePin}
          onMoveToGroup={handleMoveToGroup}
          onRemoveFromGroup={handleRemoveFromGroup}
          onMoveToTrash={handleMoveToTrash}
          onCreateGroup={onCreateGroup}
        />
      </div>
    </div>
  );
});

type NotesTableProps = {
  renderedNotes: RenderedNote[];
  selectedNoteIds: Set<string>;
  editingNoteId: string | null;
  editingTitle: string;
  groups: Group[];
  untitledLabel: string;
  selectNoteLabel: string;
  noMatchingNotesLabel: string;
  noNotesYetLabel: string;
  searchValue: string;
  tryDifferentKeywordsLabel: string;
  createFirstNoteLabel: string;
  selectedLabel: string;
  nameLabel: string;
  dateCreatedLabel: string;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleSelectAll: () => void;
  onOpenNote: (note: Note) => void;
  onToggleSelected: (noteId: string) => void;
  onFinishRename: () => void;
  onCancelRename: () => void;
  onEditingTitleChange: (value: string) => void;
  onShare: (note: Note) => void;
  onStartRename: (note: Note) => void;
  onArchive: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onMoveToGroup: (noteId: string, groupId: string) => void;
  onRemoveFromGroup: (noteId: string) => void;
  onMoveToTrash: (noteId: string) => void;
  onCreateGroup: () => void;
};

const NotesTable = memo(function NotesTable({
  renderedNotes,
  selectedNoteIds,
  editingNoteId,
  editingTitle,
  groups,
  untitledLabel,
  selectNoteLabel,
  noMatchingNotesLabel,
  noNotesYetLabel,
  searchValue,
  tryDifferentKeywordsLabel,
  createFirstNoteLabel,
  selectedLabel,
  nameLabel,
  dateCreatedLabel,
  isAllSelected,
  isSomeSelected,
  onToggleSelectAll,
  onOpenNote,
  onToggleSelected,
  onFinishRename,
  onCancelRename,
  onEditingTitleChange,
  onShare,
  onStartRename,
  onArchive,
  onTogglePin,
  onMoveToGroup,
  onRemoveFromGroup,
  onMoveToTrash,
  onCreateGroup,
}: NotesTableProps) {
  return (
    <div className="mt-6 flex flex-col gap-1">
      <div className={`${ROW_GRID_CLASS} px-4 py-2`}>
        <Checkbox
          checked={isAllSelected}
          indeterminate={isSomeSelected}
          onChange={onToggleSelectAll}
          ariaLabel="Select all notes"
        />

        <span className="flex items-center gap-2 text-[14px] leading-[20px] text-text-primary">
          {nameLabel}
          {selectedNoteIds.size > 0 && (
            <span className="text-[13px] font-normal text-text-secondary">
              · {selectedNoteIds.size} {selectedLabel}
            </span>
          )}
        </span>

        <span className="text-[14px] leading-[20px] text-text-primary">
          {dateCreatedLabel}
        </span>

        <span />
      </div>

      {renderedNotes.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
          <p className="text-[15px] font-medium text-text-primary">
            {searchValue.trim()
              ? noMatchingNotesLabel
              : noNotesYetLabel}
          </p>

          <p className="mt-1 text-[13px] text-text-muted">
            {searchValue.trim()
              ? tryDifferentKeywordsLabel
              : createFirstNoteLabel}
          </p>
        </div>
      ) : (
        <div>
          {renderedNotes.map((note) => {
            const isEditing = editingNoteId === note.id;

            return (
              <NoteRow
                key={note.id}
                note={note}
                isSelected={selectedNoteIds.has(note.id)}
                isEditing={isEditing}
                editingTitle={isEditing ? editingTitle : ""}
                groups={groups}
                untitledLabel={untitledLabel}
                selectNoteLabel={selectNoteLabel}
                onOpen={onOpenNote}
                onToggleSelected={onToggleSelected}
                onFinishRename={onFinishRename}
                onCancelRename={onCancelRename}
                onEditingTitleChange={onEditingTitleChange}
                onShare={onShare}
                onStartRename={onStartRename}
                onArchive={onArchive}
                onTogglePin={onTogglePin}
                onMoveToGroup={onMoveToGroup}
                onRemoveFromGroup={onRemoveFromGroup}
                onMoveToTrash={onMoveToTrash}
                onCreateGroup={onCreateGroup}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

export function AllNotes() {
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
    bulkMoveNotesToGroup,
  } = useAppContext();

  const { t, language } = useLocale();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editingNoteIdRef = useRef<string | null>(null);
  const editingTitleRef = useRef("");

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareNoteTitle, setShareNoteTitle] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  // Selection state — powers the bulk "Move to Archive" / "Move to Trash" / "Move to Group" actions
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set()
  );
  const selectedNoteIdsRef = useRef(selectedNoteIds);

  // Bulk "Move to Group" popup
  const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false);
  const [groupPopupPosition, setGroupPopupPosition] =
    useState<MenuPosition | null>(null);
  const groupButtonRef = useRef<HTMLButtonElement>(null);

  const renderedNotesCache = useMemo<RenderedNote[]>(() => {
    const result: RenderedNote[] = [];

    for (const note of notes) {
      if (note.isArchived || note.isDeleted) continue;

      result.push({
        ...note,
        preview: getPreview(note.content),
        formattedCreatedAt: formatReferenceDate(note.createdAt, language),
      });
    }

    result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

    return result;
  }, [notes, language]);

  const searchQuery = searchValue.trim().toLowerCase();

  const renderedNotes = useMemo(() => {
    if (!searchQuery) return renderedNotesCache;

    return renderedNotesCache.filter((note) => {
      return (
        note.title.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery) ||
        note.preview.toLowerCase().includes(searchQuery)
      );
    });
  }, [renderedNotesCache, searchQuery]);

  const selectedCount = selectedNoteIds.size;
  const isAllSelected =
    renderedNotes.length > 0 && selectedCount === renderedNotes.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;

  useEffect(() => {
    selectedNoteIdsRef.current = selectedNoteIds;
  }, [selectedNoteIds]);

  const handleOpenNote = useCallback((note: Note) => {
    setActiveNoteId(note.id);
  }, [setActiveNoteId]);

  const handleStartRename = useCallback((note: Note) => {
    const nextTitle = note.title || t("Untitled");
    editingNoteIdRef.current = note.id;
    editingTitleRef.current = nextTitle;
    setEditingNoteId(note.id);
    setEditingTitle(nextTitle);
  }, [t]);

  const handleEditingTitleChange = useCallback((value: string) => {
    editingTitleRef.current = value;
    setEditingTitle(value);
  }, []);

  const handleFinishRename = useCallback(async () => {
    const noteId = editingNoteIdRef.current;
    if (!noteId) return;

    const nextTitle = editingTitleRef.current.trim() || t("Untitled");

    editingNoteIdRef.current = null;
    editingTitleRef.current = "";
    setEditingNoteId(null);
    setEditingTitle("");

    await updateNote(noteId, { title: nextTitle });
  }, [t, updateNote]);

  const handleCancelRename = useCallback(() => {
    editingNoteIdRef.current = null;
    editingTitleRef.current = "";
    setEditingNoteId(null);
    setEditingTitle("");
  }, []);

  const handleShare = useCallback(async (note: Note) => {
    try {
      const shareId = await createShare(note.id);

      if (!shareId) return;

      setShareUrl(`${window.location.origin}/share/${shareId}`);
      setShareNoteTitle(note.title || t("Untitled"));
      setIsLinkCopied(false);
      setIsShareModalOpen(true);
    } catch (error) {
      console.error("Share note error:", error);
    }
  }, [createShare, t]);

  const toggleNoteSelected = useCallback((noteId: string) => {
    setSelectedNoteIds((prev) => {
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
    setSelectedNoteIds((prev) => {
      if (prev.size === renderedNotes.length) {
        return new Set();
      }

      return new Set(renderedNotes.map((note) => note.id));
    });
  }, [renderedNotes]);

  const clearSelection = useCallback(() => {
    setSelectedNoteIds(new Set());
  }, []);

  const closeGroupPopup = useCallback(() => {
    setIsGroupPopupOpen(false);
    setGroupPopupPosition(null);
  }, []);

  const handleToggleGroupPopup = useCallback(() => {
    if (isGroupPopupOpen) {
      closeGroupPopup();
      return;
    }

    if (!groupButtonRef.current) return;

    const rect = groupButtonRef.current.getBoundingClientRect();
    setGroupPopupPosition(getSafeGroupPopupPosition(rect));
    setIsGroupPopupOpen(true);
  }, [closeGroupPopup, isGroupPopupOpen]);

  // Close the bulk group popup on outside click
  useEffect(() => {
    if (!isGroupPopupOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest("[data-bulk-group-popup]") &&
        !target.closest("[data-bulk-group-trigger]")
      ) {
        closeGroupPopup();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [closeGroupPopup, isGroupPopupOpen]);

  const handleBulkArchive = useCallback(async () => {
    const ids = Array.from(selectedNoteIdsRef.current);

    clearSelection();

    await bulkArchiveNotes(ids, true);
  }, [bulkArchiveNotes, clearSelection]);

  const handleBulkMoveToGroup = useCallback(async (groupId: string) => {
    const ids = Array.from(selectedNoteIdsRef.current);

    clearSelection();
    closeGroupPopup();

    await bulkMoveNotesToGroup(ids, groupId);
  }, [bulkMoveNotesToGroup, clearSelection, closeGroupPopup]);

  const handleBulkTrash = useCallback(async () => {
    const ids = Array.from(selectedNoteIdsRef.current);

    clearSelection();

    await bulkTrashNotes(ids);
  }, [bulkTrashNotes, clearSelection]);

  const handleShareClose = useCallback(() => {
    setIsShareModalOpen(false);
    setIsLinkCopied(false);

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, []);

  const handleCopyShareLink = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsLinkCopied(true);

      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setIsLinkCopied(false);
        copyTimeoutRef.current = null;
      }, 2200);
    } catch (error) {
      console.error("Copy share link error:", error);
    }
  }, [shareUrl]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const searchPlaceholder = useMemo(
    () => t("Search by title or content"),
    [t]
  );
  const allNotesLabel = useMemo(() => t("All Notes"), [t]);
  const allNotesDescription = useMemo(
    () => t("All your notes in one place."),
    [t]
  );
  const newNoteLabel = useMemo(() => t("New Note"), [t]);
  const searchNotesLabel = useMemo(() => t("Search Notes"), [t]);
  const closeLabel = useMemo(() => t("Close"), [t]);
  const moveToGroupLabel = useMemo(() => t("Move to Group"), [t]);
  const moveToArchiveLabel = useMemo(() => t("Move to Archive"), [t]);
  const moveToTrashLabel = useMemo(() => t("Move to Trash"), [t]);
  const noGroupsFoundLabel = useMemo(() => t("No groups found"), [t]);
  const selectNoteLabel = useMemo(() => t("Select note"), [t]);
  const untitledLabel = useMemo(() => t("Untitled"), [t]);
  const noMatchingNotesLabel = useMemo(() => t("No matching notes"), [t]);
  const noNotesYetLabel = useMemo(() => t("No notes yet"), [t]);
  const tryDifferentKeywordsLabel = useMemo(
    () => t("Try searching with different keywords."),
    [t]
  );
  const createFirstNoteLabel = useMemo(
    () => t("Create your first note to get started."),
    [t]
  );
  const selectedLabel = useMemo(() => t("selected"), [t]);
  const nameLabel = useMemo(() => t("Name"), [t]);
  const dateCreatedLabel = useMemo(() => t("Date created"), [t]);

  return (
    <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-surface">
      <div className="w-full max-w-[1050px] mx-auto px-6 md:px-8 lg:px-[52px] pt-12 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-8 py-[3px]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] leading-[34px] font-medium text-text-primary">
                {allNotesLabel}
              </h1>

              <span className="inline-flex items-center rounded-[6px] bg-surface-hover px-2.5 py-0.5 text-[12px] leading-[16px] font-medium text-text-secondary">
                {renderedNotesCache.length} {renderedNotesCache.length === 1 ? "note" : "notes"}
              </span>
            </div>

            <p className="mt-1 text-[14px] leading-[20px] text-text-secondary">
              {allNotesDescription}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {selectedCount > 0 ? (
              <>
                <button
                  ref={groupButtonRef}
                  type="button"
                  data-bulk-group-trigger
                  onClick={handleToggleGroupPopup}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-default px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                >
                  <Folder className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  <span>{moveToGroupLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkArchive}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-default px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                >
                  <Archive className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  <span>{moveToArchiveLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkTrash}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-danger-border px-3 py-2 text-[13px] font-medium text-danger-text transition-colors hover:bg-danger-surface"
                >
                  <Trash2 className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  <span>{moveToTrashLabel}</span>
                </button>
              </>
            ) : isSearchOpen ? (
              <div className="flex h-9 w-[220px] items-center gap-2 rounded-[8px] border border-border-default bg-surface px-3">
                <Search className="h-[15px] w-[15px] shrink-0 text-icon-secondary" />

                <input
                  autoFocus
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    setIsSearchOpen(false);
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-icon-muted hover:bg-surface-hover hover:text-text-primary"
                  aria-label={closeLabel}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center text-text-primary transition-opacity hover:opacity-60"
                aria-label={searchNotesLabel}
                title={searchNotesLabel}
              >
                <Search className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
            )}

            <button
              type="button"
              onClick={() => addNote(null)}
              className="inline-flex items-center gap-2 rounded-[12px] bg-action-primary px-4 py-2 text-[14px] leading-[20px] font-medium text-action-on-primary transition-colors hover:bg-action-primary-hover"
            >
              <Plus className="h-[15px] w-[15px]" strokeWidth={2} />
              <span>{newNoteLabel}</span>
            </button>
          </div>
        </div>

        {/* Notes table */}
        <NotesTable
          renderedNotes={renderedNotes}
          selectedNoteIds={selectedNoteIds}
          editingNoteId={editingNoteId}
          editingTitle={editingTitle}
          groups={groups}
          untitledLabel={untitledLabel}
          selectNoteLabel={selectNoteLabel}
          noMatchingNotesLabel={noMatchingNotesLabel}
          noNotesYetLabel={noNotesYetLabel}
          searchValue={searchValue}
          tryDifferentKeywordsLabel={tryDifferentKeywordsLabel}
          createFirstNoteLabel={createFirstNoteLabel}
          selectedLabel={selectedLabel}
          nameLabel={nameLabel}
          dateCreatedLabel={dateCreatedLabel}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onToggleSelectAll={toggleSelectAll}
          onOpenNote={handleOpenNote}
          onToggleSelected={toggleNoteSelected}
          onFinishRename={handleFinishRename}
          onCancelRename={handleCancelRename}
          onEditingTitleChange={handleEditingTitleChange}
          onShare={handleShare}
          onStartRename={handleStartRename}
          onArchive={toggleArchiveNote}
          onTogglePin={togglePinNote}
          onMoveToGroup={moveNoteToGroup}
          onRemoveFromGroup={removeNoteFromGroup}
          onMoveToTrash={deleteNote}
          onCreateGroup={openCreateGroupModal}
        />
      </div>

      {isGroupPopupOpen &&
        groupPopupPosition &&
        createPortal(
          <div
            data-bulk-group-popup
            className="fixed z-[10001] w-[220px] max-h-64 overflow-y-auto rounded-xl border border-border-default bg-surface py-1.5 shadow-[0_10px_30px_var(--color-overlay-soft)]"
            style={{ top: groupPopupPosition.top, left: groupPopupPosition.left }}
          >
            {groups.length === 0 ? (
              <div className="px-3.5 py-2.5 text-sm text-text-secondary">
                {noGroupsFoundLabel}
              </div>
            ) : (
              groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleBulkMoveToGroup(group.id)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-hover"
                >
                  <Folder className="h-4 w-4 shrink-0 text-text-secondary" />
                  <span className="min-w-0 truncate">{group.name}</span>
                </button>
              ))
            )}
          </div>,
          document.body
        )}

      <ShareNoteModal
        isOpen={isShareModalOpen}
        shareUrl={shareUrl}
        noteTitle={shareNoteTitle}
        isLinkCopied={isLinkCopied}
        onClose={handleShareClose}
        onCopy={handleCopyShareLink}
      />
    </div>
  );
}
