import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Group, Note, UserSettings } from '../types';
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { setLocale, translate, getLocale } from "../lib/locale";

interface AppContextType extends AppState {
  addNote: (groupId?: string | null) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  deleteForever: (id: string) => void;
  togglePinNote: (id: string) => void;
  moveNoteToGroup: (
  noteId: string,
  groupId: string
) => Promise<boolean>;

removeNoteFromGroup: (
  noteId: string
) => Promise<boolean>;
  toggleArchiveNote: (id: string) => void;
  bulkArchiveNotes: (ids: string[], archived: boolean) => Promise<boolean>;
  bulkTrashNotes: (ids: string[]) => Promise<boolean>;
  bulkMoveNotesToGroup: (ids: string[], groupId: string) => Promise<boolean>;
  createShare: (id: string) => Promise<string | null>;
  addGroup: (name: string) => Promise<boolean>;
  renameGroup: (id: string, name: string) => void;
  isCreateGroupModalOpen: boolean;
  openCreateGroupModal: () => void;
  closeCreateGroupModal: () => void;
  deleteGroup: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
  setActiveGroupId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  addToast: (
  message: string,
  type?: "info" | "success" | "error",
  actionLabel?: string,
  onAction?: () => void
) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error";

  actionLabel?: string;

  onAction?: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
};

const initialState: AppState = {
  notes: [],
  groups: [{ id: '1', name: 'Personal', createdAt: new Date().toISOString() }],
  settings: defaultSettings,
  activeNoteId: null,
  activeGroupId: null,
  searchQuery: '',
  isSidebarOpen: false,
};

const getLastOpenedNoteKey = (userId: string) =>
  `creatorflow-last-opened-note-${userId}`;

const getSettingsKey = (userId: string) =>
  `notepad-settings-${userId}`;

const getStoredSettings = (userId?: string): UserSettings => {
  if (!userId) {
    return defaultSettings;
  }

  try {
    const saved = localStorage.getItem(getSettingsKey(userId));

    if (!saved) {
      return defaultSettings;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultSettings,
      theme:
        parsed.theme === "dark" || parsed.theme === "system"
          ? parsed.theme
          : "light",
      language: parsed.language === "hi" ? "hi" : "en",
      timezone:
        typeof parsed.timezone === "string" && parsed.timezone
          ? parsed.timezone
          : defaultSettings.timezone,
    };
  } catch {
    return defaultSettings;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId } = useParams<{ noteId: string }>();
  const isSharedRoute = location.pathname.startsWith("/share/");

  const updateNoteTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingNoteUpdatesRef = useRef<
    Record<
      string,
      {
        title: string;
        content: string;
        groupId: string | null;
      }
    >
  >({});
  const pendingNotePreviousRef = useRef<
    Record<
      string,
      {
        title: string;
        content: string;
        groupId: string | null;
      }
    >
  >({});
  const updateNoteVersionsRef = useRef<Record<string, number>>({});
  const notesRef = useRef<Note[]>([]);
  const groupsRef = useRef<Group[]>([]);
  const notesLoadInFlightRef = useRef<string | null>(null);
  const groupsLoadInFlightRef = useRef<string | null>(null);
  const settingsHydratedForUserRef = useRef<string | null>(null);

  const cancelPendingNoteUpdate = useCallback((id: string) => {
    const timer = updateNoteTimersRef.current[id];

    if (timer) {
      clearTimeout(timer);
    }

    delete updateNoteTimersRef.current[id];
    delete pendingNoteUpdatesRef.current[id];
    delete pendingNotePreviousRef.current[id];
    delete updateNoteVersionsRef.current[id];
  }, []);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('creatorflow-notes');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return {
          ...initialState,
          ...parsed,
          settings: getStoredSettings(user?.id),
          activeNoteId: null,
          isSidebarOpen: false,
          searchQuery: '',
        };
      } catch (e) {
        return {
          ...initialState,
          settings: getStoredSettings(user?.id),
        };
      }
    }

    return {
      ...initialState,
      settings: getStoredSettings(user?.id),
    };
  });

  useEffect(() => {
    notesRef.current = state.notes;
  }, [state.notes]);

  useEffect(() => {
    groupsRef.current = state.groups;
  }, [state.groups]);

  useEffect(() => {
    return () => {
      Object.values(updateNoteTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] =
    useState(false);

  const openCreateGroupModal = useCallback(() => {
    setIsCreateGroupModalOpen(true);
  }, []);

  const closeCreateGroupModal = useCallback(() => {
    setIsCreateGroupModalOpen(false);
  }, []);

const [toasts, setToasts] = useState<Toast[]>([]);
useEffect(() => {
  const theme = state.settings.theme;

  const applyTheme = () => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      return;
    }

    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    root.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light"
    );
  };

  applyTheme();

  if (theme !== "system") return;

  const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  const handleChange = () => {
    const root = document.documentElement;

    root.setAttribute(
      "data-theme",
      mediaQuery.matches ? "dark" : "light"
    );
  };

  mediaQuery.addEventListener("change", handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}, [state.settings.theme]);

useEffect(() => {
  setLocale(state.settings.language === "hi" ? "hi" : "en");
}, [state.settings.language]);

useEffect(() => {
  if (!user?.id) {
    settingsHydratedForUserRef.current = null;

    setState((prev) => {
      if (
        prev.settings.theme === defaultSettings.theme &&
        prev.settings.language === defaultSettings.language &&
        prev.settings.timezone === defaultSettings.timezone
      ) {
        return prev;
      }

      return {
        ...prev,
        settings: defaultSettings,
      };
    });

    return;
  }

  const storedSettings = getStoredSettings(user.id);

  setState((prev) => {
    const currentSettings = prev.settings;

    if (
      currentSettings.theme === storedSettings.theme &&
      currentSettings.language === storedSettings.language &&
      currentSettings.timezone === storedSettings.timezone
    ) {
      return prev;
    }

    return {
      ...prev,
      settings: storedSettings,
    };
  });

  settingsHydratedForUserRef.current = user.id;
}, [user?.id]);


  // Persist local UI state without blocking the main thread on every keystroke.
  // The backend remains the source of truth for note data.
  const persistenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (persistenceTimerRef.current) {
      clearTimeout(persistenceTimerRef.current);
    }

    const notes = state.notes;
    const groups = state.groups;

    persistenceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          'creatorflow-notes',
          JSON.stringify({ notes, groups })
        );
      } catch (error) {
        console.warn('Local state persistence failed:', error);
      }
    }, 300);

    return () => {
      if (persistenceTimerRef.current) {
        clearTimeout(persistenceTimerRef.current);
      }
    };
  }, [state.notes, state.groups]);

  useEffect(() => {
  if (!user?.id) return;

  if (settingsHydratedForUserRef.current !== user.id) {
    return;
  }

  try {
    localStorage.setItem(
      getSettingsKey(user.id),
      JSON.stringify(state.settings)
    );
  } catch (error) {
    console.warn('Settings persistence failed:', error);
  }
}, [state.settings, user?.id]);

  useEffect(() => {
  // Shared notes are public and must not initialize the user's dashboard data.
  if (isSharedRoute) return;
  if (!user?.token || !user?.id) return;

  const loadKey = `${user.id}:${user.token}`;

  if (notesLoadInFlightRef.current === loadKey) return;

  async function loadNotes() {
    notesLoadInFlightRef.current = loadKey;

    try {
      const response = await api.getNotes(user.token);

      if (!response.success) return;

    const loadedNotes = (response.notes || []).map((note: any) => ({
      id: note.noteId,
      title: note.title,
      content: note.content,
      groupId: note.groupId || null,
      isPinned: note.pinned,
      isArchived: note.archived,
      isDeleted: note.deleted,
      tags: note.tags
        ? String(note.tags).split(",").filter(Boolean)
        : [],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      shareId: note.shareId || null,
      shareEnabled: note.shareEnabled === true,
    }));

    setState(prev => ({
      ...prev,
      notes: loadedNotes,
    }));

    // If URL already contains a note, let the route effect handle it.
    if (noteId) return;

      // Dedicated dashboard pages must not redirect to the last opened note.
      if (
        location.pathname === "/dashboard/all-notes" ||
        location.pathname === "/dashboard/all-groups" ||
        location.pathname.startsWith("/dashboard/group/")
      ) {
        return;
      }

      // Existing user's last opened note
      const lastOpenedNoteId = localStorage.getItem(
        getLastOpenedNoteKey(user.id)
      );

    if (lastOpenedNoteId) {
      const lastNoteExists = loadedNotes.some(
        note => note.id === lastOpenedNoteId
      );

      if (lastNoteExists) {
        setState(prev => ({
          ...prev,
          activeNoteId: lastOpenedNoteId,
        }));

        navigate(`/dashboard/note/${lastOpenedNoteId}`);
        return;
      }

      // Saved note no longer exists
      localStorage.removeItem(
        getLastOpenedNoteKey(user.id)
      );
    }

    // New user / no notes
    // Render the first note immediately, then persist it in the background.
    if (loadedNotes.length === 0) {
      const noteId = uuidv4();
      const createdAt = new Date().toISOString();

      const newNote: Note = {
        id: noteId,
        title: "",
        content: "",
        groupId: null,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        tags: [],
        createdAt,
        updatedAt: createdAt,
        shareId: null,
        shareEnabled: false,
      };

      setState(prev => ({
        ...prev,
        notes: [newNote],
        activeNoteId: noteId,
      }));

      localStorage.setItem(
        getLastOpenedNoteKey(user.id),
        noteId
      );

      navigate(`/dashboard/note/${noteId}`);

      void api.createNote(
        user.token,
        "",
        "",
        null,
        noteId
      ).then(response => {
        if (response.success) return;

        console.error("Initial note creation failed:", response.message);

        setState(prev => ({
          ...prev,
          notes: prev.notes.filter(note => note.id !== noteId),
          activeNoteId: prev.activeNoteId === noteId
            ? null
            : prev.activeNoteId,
        }));
      }).catch(error => {
        console.error("Initial note creation error:", error);

        setState(prev => ({
          ...prev,
          notes: prev.notes.filter(note => note.id !== noteId),
          activeNoteId: prev.activeNoteId === noteId
            ? null
            : prev.activeNoteId,
        }));
      });

      return;
    }

    // Fallback:
    // If user has notes but no remembered note,
    // open the most recently updated note.
    const fallbackNote = [...loadedNotes]
      .filter(note => !note.isDeleted)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      )[0];

      if (fallbackNote) {
        setState(prev => ({
          ...prev,
          activeNoteId: fallbackNote.id,
        }));

        localStorage.setItem(
          getLastOpenedNoteKey(user.id),
          fallbackNote.id
        );

        navigate(`/dashboard/note/${fallbackNote.id}`);
      }
    } finally {
      if (notesLoadInFlightRef.current === loadKey) {
        notesLoadInFlightRef.current = null;
      }
    }
  }

  loadNotes();
}, [
  user?.token,
  user?.id,
  navigate,
  isSharedRoute,
  location.pathname,
]);

useEffect(() => {
  if (!noteId) return;

  const noteExists = state.notes.some(
    note => note.id === noteId
  );

  if (!noteExists) return;

  setState(prev => ({
    ...prev,
    activeNoteId: noteId,
  }));

  if (user?.id) {
    localStorage.setItem(
      getLastOpenedNoteKey(user.id),
      noteId
    );
  }
}, [noteId, state.notes, user?.id]);

useEffect(() => {

  // Shared notes are public and do not need the authenticated user's groups.
  if (isSharedRoute) return;
  if (!user?.token || !user?.id) return;

  const loadKey = `${user.id}:${user.token}`;

  if (groupsLoadInFlightRef.current === loadKey) return;

  async function loadGroups() {
    groupsLoadInFlightRef.current = loadKey;

    try {
      const response = await api.getGroups(user.token);

      if (!response.success) return;

      setState(prev => ({
        ...prev,
        groups: (response.groups || []).map((group: any) => ({
          id: group.groupId,
          name: group.name,
          createdAt: group.createdAt
        }))
      }));
    } finally {
      if (groupsLoadInFlightRef.current === loadKey) {
        groupsLoadInFlightRef.current = null;
      }
    }
  }

  loadGroups();

}, [user?.token, isSharedRoute]);



  const addToast = useCallback(

(

message,

type: "info" | "success" | "error" = "info",

actionLabel?: string,

onAction?: () => void

) => {
    const id = uuidv4();
    setToasts(prev => [...prev, {id, message, type, actionLabel, onAction}]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveNoteId = useCallback(
  (id: string | null) => {
    setState(prev => ({
      ...prev,
      activeNoteId: id
    }));

    if (user?.id && id) {
      localStorage.setItem(
        getLastOpenedNoteKey(user.id),
        id
      );
    }

    if (id) {
      navigate(`/dashboard/note/${id}`);
    } else {
      navigate('/dashboard');
    }
  },
  [navigate, user?.id]
);

const addNote = useCallback(async (groupId: string | null = state.activeGroupId) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  try {

    const response = await api.createNote(
      user.token,
      "",
      "",
      groupId
    );

    if (!response.success || !response.noteId) {
      addToast(
        response.message ||
          translate("Unable to create note", getLocale()),
        "error"
      );
      return;
    }

    const now = new Date().toISOString();

    const newNote: Note = {
      id: response.noteId,
      title: "",
      content: "",
      groupId: groupId || null,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
      shareId: null,
      shareEnabled: false,
    };

    // Update UI immediately using the server-generated noteId
    setState(prev => ({
      ...prev,
      notes: [
        ...prev.notes,
        newNote
      ],
      activeNoteId: response.noteId
    }));

    if (user?.id) {
      localStorage.setItem(
        getLastOpenedNoteKey(user.id),
        response.noteId
      );
    }

    navigate(`/dashboard/note/${response.noteId}`);

    addToast(
      translate("Note created", getLocale()),
      "success"
    );

  } catch (error) {

    console.error("Create note error:", error);

    addToast(
      translate("Unable to create note", getLocale()),
      "error"
    );
  }

}, [
  user,
  state.activeGroupId,
  addToast,
  navigate
]);

const updateNote = useCallback(
  async (id: string, updates: Partial<Note>) => {
    const currentNote =
      notesRef.current.find(note => note.id === id) ||
      null;

    if (!currentNote) return;

    const pending = pendingNoteUpdatesRef.current[id];

    const nextValues = {
      title:
        updates.title !== undefined
          ? updates.title
          : pending?.title ?? currentNote.title,
      content:
        updates.content !== undefined
          ? updates.content
          : pending?.content ?? currentNote.content,
      groupId:
        updates.groupId !== undefined
          ? updates.groupId
          : pending?.groupId ?? currentNote.groupId,
    };

    if (!pendingNotePreviousRef.current[id]) {
      pendingNotePreviousRef.current[id] = {
        title: currentNote.title,
        content: currentNote.content,
        groupId: currentNote.groupId,
      };
    }

    pendingNoteUpdatesRef.current[id] = nextValues;

    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? {
              ...note,
              ...updates,
              title: nextValues.title,
              content: nextValues.content,
              groupId: nextValues.groupId,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    }));

    if (!user?.token) return;

    const nextVersion =
      (updateNoteVersionsRef.current[id] || 0) + 1;

    updateNoteVersionsRef.current[id] = nextVersion;

    const existingTimer =
      updateNoteTimersRef.current[id];

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    updateNoteTimersRef.current[id] = setTimeout(
      async () => {
        const version =
          updateNoteVersionsRef.current[id];

        if (version !== nextVersion) return;

        const payload =
          pendingNoteUpdatesRef.current[id];

        if (!payload) return;

        const response = await api.updateNote(
          user.token,
          id,
          payload.title,
          payload.content,
          payload.groupId
        );

        if (
          updateNoteVersionsRef.current[id] !==
          nextVersion
        ) {
          return;
        }

        if (!response.success) {
          const previous =
            pendingNotePreviousRef.current[id];

          if (previous) {
            setState(prev => ({
              ...prev,
              notes: prev.notes.map(note =>
                note.id === id
                  ? {
                      ...note,
                      title: previous.title,
                      content: previous.content,
                      groupId: previous.groupId
                    }
                  : note
              )
            }));
          }

          addToast(
            response.message ||
              translate(
                "Unable to update note",
                getLocale()
              ),
            "error"
          );
        }

        delete pendingNoteUpdatesRef.current[id];
        delete pendingNotePreviousRef.current[id];
        delete updateNoteTimersRef.current[id];
      },
      600
    );
  },
  [user?.token, addToast]
);

const deleteNote = useCallback(async (id: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const note = notesRef.current.find(n => n.id === id);

  if (!note) return;

  const previousNote = note;

  // A pending editor update must not run after the note is moved to trash.
  cancelPendingNoteUpdate(id);

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      note.id === id
        ? {
            ...note,
            isDeleted: true,
            updatedAt: new Date().toISOString()
          }
        : note
    ),
    activeNoteId:
      prev.activeNoteId === id
        ? null
        : prev.activeNoteId
  }));

  try {

    const response = await api.deleteNote(
      user.token,
      id
    );

    if (!response.success) {

      // Rollback
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          note.id === id
            ? previousNote
            : note
        )
      }));

      addToast(
        response.message ||
          translate("Unable to delete note", getLocale()),
        "error"
      );

      return;
    }

    addToast(
      translate("Note deleted", getLocale()),
      "success"
    );

  } catch (error) {

    console.error("Delete note error:", error);

    // Rollback
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? previousNote
          : note
      )
    }));

    addToast(
      translate("Unable to delete note", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast, cancelPendingNoteUpdate]);


const togglePinNote = useCallback(async (id: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const note = notesRef.current.find(n => n.id === id);

  if (!note) return;

  const previousNote = note;
  const newPinnedState = !note.isPinned;

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      note.id === id
        ? {
            ...note,
            isPinned: newPinnedState,
            updatedAt: new Date().toISOString()
          }
        : note
    )
  }));

  try {

    const response = await api.pinNote(
      user.token,
      id,
      newPinnedState
    );

    if (!response.success) {

      // Rollback if API fails
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          note.id === id
            ? previousNote
            : note
        )
      }));

      addToast(
        response.message ||
          translate("Unable to update pin", getLocale()),
        "error"
      );

      return;
    }

    addToast(
      newPinnedState
        ? translate("Note pinned", getLocale())
        : translate("Note unpinned", getLocale()),
      "success"
    );

  } catch (error) {

    console.error("Toggle pin error:", error);

    // Rollback if request itself fails
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? previousNote
          : note
      )
    }));

    addToast(
      translate("Unable to update pin", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast]);

const moveNoteToGroup = useCallback(async (
  noteId: string,
  groupId: string
): Promise<boolean> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return false;
  }

  const note = state.notes.find(n => n.id === noteId);

  if (!note) return false;

  const previousGroupId = note.groupId;

  // Keep any debounced note update aligned with the new group.
  if (pendingNoteUpdatesRef.current[noteId]) {
    pendingNoteUpdatesRef.current[noteId] = {
      ...pendingNoteUpdatesRef.current[noteId],
      groupId
    };
  }

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            groupId: groupId
          }
        : note
    )
  }));

  try {

    const response = await api.moveNoteToGroup(
      user.token,
      noteId,
      groupId
    );

    if (!response.success) {

      // Rollback
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          note.id === noteId
            ? {
                ...note,
                groupId: previousGroupId
              }
            : note
        )
      }));

      addToast(
        response.message ||
          translate("Unable to move note to group", getLocale()),
        "error"
      );

      return false;
    }

    return true;

  } catch (error) {

    console.error("Move note to group error:", error);

    // Rollback
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId
          ? {
              ...note,
              groupId: previousGroupId
            }
          : note
      )
    }));

    addToast(
      translate("Unable to move note to group", getLocale()),
      "error"
    );

    return false;
  }

}, [user?.token, addToast]);


const removeNoteFromGroup = useCallback(async (
  noteId: string
): Promise<boolean> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return false;
  }

  const note = state.notes.find(n => n.id === noteId);

  if (!note) return false;

  const previousGroupId = note.groupId;

  // Keep any debounced note update aligned with the removed group.
  if (pendingNoteUpdatesRef.current[noteId]) {
    pendingNoteUpdatesRef.current[noteId] = {
      ...pendingNoteUpdatesRef.current[noteId],
      groupId: null
    };
  }

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            groupId: null
          }
        : note
    )
  }));

  try {

    const response = await api.removeNoteFromGroup(
      user.token,
      noteId
    );

    if (!response.success) {

      // Rollback
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          note.id === noteId
            ? {
                ...note,
                groupId: previousGroupId
              }
            : note
        )
      }));

      addToast(
        response.message ||
          translate("Unable to remove note from group", getLocale()),
        "error"
      );

      return false;
    }

    return true;

  } catch (error) {

    console.error("Remove note from group error:", error);

    // Rollback
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId
          ? {
              ...note,
              groupId: previousGroupId
            }
          : note
      )
    }));

    addToast(
      translate("Unable to remove note from group", getLocale()),
      "error"
    );

    return false;
  }

}, [user?.token, addToast]);

const toggleArchiveNote = useCallback(async (id: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const note = notesRef.current.find(n => n.id === id);

  if (!note) return;

  const previousNote = note;
  const newArchivedState = !note.isArchived;

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      note.id === id
        ? {
            ...note,
            isArchived: newArchivedState,
            updatedAt: new Date().toISOString()
          }
        : note
    ),
    activeNoteId:
      prev.activeNoteId === id
        ? null
        : prev.activeNoteId
  }));

  try {

    const response = await api.archiveNote(
      user.token,
      id,
      newArchivedState
    );

    if (!response.success) {

      // Rollback
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          note.id === id
            ? previousNote
            : note
        )
      }));

      addToast(
        response.message ||
          translate("Unable to archive note", getLocale()),
        "error"
      );

      return;
    }

    addToast(
      newArchivedState
        ? translate("Note archived", getLocale())
        : translate("Note restored", getLocale()),
      "success"
    );

  } catch (error) {

    console.error("Archive note error:", error);

    // Rollback
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? previousNote
          : note
      )
    }));

    addToast(
      translate("Unable to archive note", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast]);

const createShare = useCallback(async (id: string): Promise<string | null> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return null;
  }

  const response = await api.createShare(
    user.token,
    id
  );

  if (!response.success) {
    addToast(
      response.message || translate("Unable to share note", getLocale()),
      "error"
    );
    return null;
  }

  const shareId = response.shareId;

  if (!shareId) {
    addToast(
      translate("Share link could not be created", getLocale()),
      "error"
    );
    return null;
  }

  setState(prev => ({
    ...prev,

    notes: prev.notes.map(note =>
      note.id === id
        ? {
            ...note,
            shareId,
            shareEnabled: true
          }
        : note
    )
  }));

  return shareId;

}, [user?.token, addToast]);

const restoreNote = useCallback(async (id: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const note = notesRef.current.find(n => n.id === id);

  if (!note) return;

  const previousNote = note;

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      note.id === id
        ? {
            ...note,
            isDeleted: false,
            updatedAt: new Date().toISOString()
          }
        : note
    )
  }));

  try {

    const response = await api.restoreNote(
      user.token,
      id
    );

    if (!response.success) {

      // Rollback
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          note.id === id
            ? previousNote
            : note
        )
      }));

      addToast(
        response.message ||
          translate("Unable to restore note", getLocale()),
        "error"
      );

      return;
    }

    addToast(
      translate("Note restored", getLocale()),
      "success"
    );

  } catch (error) {

    console.error("Restore note error:", error);

    // Rollback
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? previousNote
          : note
      )
    }));

    addToast(
      translate("Unable to restore note", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast]);

const deleteForever = useCallback(async (id: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const note = notesRef.current.find(n => n.id === id);

  if (!note) return;

  // A pending editor update must not run after permanent deletion.
  cancelPendingNoteUpdate(id);

  // Update UI immediately
  setState(prev => ({
    ...prev,
    notes: prev.notes.filter(
      note => note.id !== id
    ),
    activeNoteId:
      prev.activeNoteId === id
        ? null
        : prev.activeNoteId
  }));

  try {

    const response = await api.deleteForever(
      user.token,
      id
    );

    if (!response.success) {

      // Rollback
      setState(prev => ({
        ...prev,
        notes: [
          ...prev.notes,
          note
        ]
      }));

      addToast(
        response.message ||
          translate("Unable to delete note", getLocale()),
        "error"
      );

      return;
    }

    addToast(
      translate("Note permanently deleted", getLocale()),
      "success"
    );

  } catch (error) {

    console.error("Delete forever error:", error);

    // Rollback
    setState(prev => ({
      ...prev,
      notes: [
        ...prev.notes,
        note
      ]
    }));

    addToast(
      translate("Unable to delete note", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast, cancelPendingNoteUpdate]);

const bulkArchiveNotes = useCallback(async (ids: string[], archived: boolean): Promise<boolean> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return false;
  }

  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) return true;

  const selectedIds = new Set(uniqueIds);
  const previousNotes = new Map(
    notesRef.current
      .filter(note => selectedIds.has(note.id))
      .map(note => [note.id, note])
  );
  const updatedAt = new Date().toISOString();

  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      selectedIds.has(note.id)
        ? {
            ...note,
            isArchived: archived,
            updatedAt
          }
        : note
    )
  }));

  try {
    const response = await api.bulkArchiveNotes(
      user.token,
      uniqueIds,
      archived
    );

    if (!response.success) {
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          previousNotes.get(note.id) || note
        )
      }));

      addToast(
        response.message || translate("Unable to update archive", getLocale()),
        "error"
      );
      return false;
    }

    addToast(
      archived
        ? translate("Notes archived", getLocale())
        : translate("Notes unarchived", getLocale()),
      "success"
    );

    return true;

  } catch (error) {
    console.error("Bulk archive error:", error);

    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        previousNotes.get(note.id) || note
      )
    }));

    addToast(translate("Unable to update archive", getLocale()), "error");
    return false;
  }

}, [user?.token, addToast]);


const bulkTrashNotes = useCallback(async (ids: string[]): Promise<boolean> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return false;
  }

  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) return true;

  const selectedIds = new Set(uniqueIds);
  const previousNotes = new Map(
    notesRef.current
      .filter(note => selectedIds.has(note.id))
      .map(note => [note.id, note])
  );
  const updatedAt = new Date().toISOString();

  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      selectedIds.has(note.id)
        ? {
            ...note,
            isDeleted: true,
            updatedAt
          }
        : note
    ),
    activeNoteId:
      prev.activeNoteId && selectedIds.has(prev.activeNoteId)
        ? null
        : prev.activeNoteId
  }));

  try {
    const response = await api.bulkTrashNotes(
      user.token,
      uniqueIds
    );

    if (!response.success) {
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          previousNotes.get(note.id) || note
        )
      }));

      addToast(
        response.message || translate("Unable to move notes to trash", getLocale()),
        "error"
      );
      return false;
    }

    addToast(translate("Notes moved to trash", getLocale()), "success");
    return true;

  } catch (error) {
    console.error("Bulk trash error:", error);

    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        previousNotes.get(note.id) || note
      )
    }));

    addToast(translate("Unable to move notes to trash", getLocale()), "error");
    return false;
  }

}, [user?.token, addToast]);


const bulkMoveNotesToGroup = useCallback(async (ids: string[], groupId: string): Promise<boolean> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return false;
  }

  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) return true;

  const selectedIds = new Set(uniqueIds);
  const previousNotes = new Map(
    notesRef.current
      .filter(note => selectedIds.has(note.id))
      .map(note => [note.id, note])
  );
  const updatedAt = new Date().toISOString();

  uniqueIds.forEach(noteId => {
    if (pendingNoteUpdatesRef.current[noteId]) {
      pendingNoteUpdatesRef.current[noteId] = {
        ...pendingNoteUpdatesRef.current[noteId],
        groupId
      };
    }
  });

  setState(prev => ({
    ...prev,
    notes: prev.notes.map(note =>
      selectedIds.has(note.id)
        ? {
            ...note,
            groupId,
            updatedAt
          }
        : note
    )
  }));

  try {
    const response = await api.bulkMoveNotesToGroup(
      user.token,
      uniqueIds,
      groupId
    );

    if (!response.success) {
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note =>
          previousNotes.get(note.id) || note
        )
      }));

      addToast(
        response.message || translate("Unable to move notes to group", getLocale()),
        "error"
      );
      return false;
    }

    addToast(translate("Notes moved to group", getLocale()), "success");
    return true;

  } catch (error) {
    console.error("Bulk move error:", error);

    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        previousNotes.get(note.id) || note
      )
    }));

    addToast(translate("Unable to move notes to group", getLocale()), "error");
    return false;
  }

}, [user?.token, addToast]);


const addGroup = useCallback(async (name: string): Promise<boolean> => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return false;
  }

  const cleanName = name.trim();

  if (!cleanName) {
    addToast(translate("Group name is required", getLocale()), "error");
    return false;
  }

  try {
    const response = await api.createGroup(
      user.token,
      cleanName
    );

    if (!response.success) {
      addToast(
        response.message || translate("Unable to create group", getLocale()),
        "error"
      );
      return false;
    }

    // Backend se successful groupId mil gaya.
    // Dobara getGroups() call karne ki zaroorat nahi hai.
    const newGroup: Group = {
      id: response.groupId,
      name: cleanName,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));

    addToast(translate("Group created", getLocale()), "success");

    return true;

  } catch (error) {
    console.error("Create group error:", error);

    addToast(
      translate("Unable to create group. Please try again.", getLocale()),
      "error"
    );

    return false;
  }

}, [user?.token, addToast]);



const renameGroup = useCallback(async (id: string, name: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const previousGroup = groupsRef.current.find(
    group => group.id === id
  );

  if (!previousGroup) return;

  setState(prev => ({
    ...prev,
    groups: prev.groups.map(group =>
      group.id === id
        ? {
            ...group,
            name
          }
        : group
    )
  }));

  try {
    const response = await api.renameGroup(
      user.token,
      id,
      name
    );

    if (!response.success) {
      setState(prev => ({
        ...prev,
        groups: prev.groups.map(group =>
          group.id === id
            ? previousGroup
            : group
        )
      }));

      addToast(
        response.message ||
          translate(
            "Unable to rename group",
            getLocale()
          ),
        "error"
      );

      return;
    }

    addToast(
      translate("Group renamed", getLocale()),
      "success"
    );

  } catch (error) {
    console.error("Rename group error:", error);

    setState(prev => ({
      ...prev,
      groups: prev.groups.map(group =>
        group.id === id
          ? previousGroup
          : group
      )
    }));

    addToast(
      translate("Unable to rename group", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast]);


const deleteGroup = useCallback(async (id: string) => {

  if (!user?.token) {
    addToast(translate("Please login first", getLocale()), "error");
    return;
  }

  const previousGroup = groupsRef.current.find(
    group => group.id === id
  );

  if (!previousGroup) return;

  const previousNoteGroups = notesRef.current
    .filter(note => note.groupId === id)
    .map(note => ({
      id: note.id,
      groupId: note.groupId
    }));

  // Prevent a pending editor update from restoring a deleted group.
  previousNoteGroups.forEach(({ id: noteId }) => {
    if (pendingNoteUpdatesRef.current[noteId]) {
      pendingNoteUpdatesRef.current[noteId] = {
        ...pendingNoteUpdatesRef.current[noteId],
        groupId: null
      };
    }
  });

  setState(prev => ({
    ...prev,
    groups: prev.groups.filter(group => group.id !== id),
    notes: prev.notes.map(note =>
      note.groupId === id
        ? { ...note, groupId: null }
        : note
    ),
    activeGroupId:
      prev.activeGroupId === id
        ? null
        : prev.activeGroupId
  }));

  try {
    const response = await api.deleteGroup(
      user.token,
      id
    );

    if (!response.success) {
      setState(prev => ({
        ...prev,
        groups: prev.groups.some(
          group => group.id === id
        )
          ? prev.groups
          : [...prev.groups, previousGroup],
        notes: prev.notes.map(note => {
          const previousNote = previousNoteGroups.find(
            item => item.id === note.id
          );

          return previousNote
            ? {
                ...note,
                groupId: previousNote.groupId
              }
            : note;
        })
      }));

      addToast(
        response.message ||
          translate(
            "Unable to delete group",
            getLocale()
          ),
        "error"
      );

      return;
    }

    addToast(
      translate("Group deleted", getLocale()),
      "success"
    );

  } catch (error) {
    console.error("Delete group error:", error);

    setState(prev => ({
      ...prev,
      groups: prev.groups.some(
        group => group.id === id
      )
        ? prev.groups
        : [...prev.groups, previousGroup],
      notes: prev.notes.map(note => {
        const previousNote = previousNoteGroups.find(
          item => item.id === note.id
        );

        return previousNote
          ? {
              ...note,
              groupId: previousNote.groupId
            }
          : note;
      })
    }));

    addToast(
      translate("Unable to delete group", getLocale()),
      "error"
    );
  }

}, [user?.token, addToast]);


const setActiveGroupId = useCallback(
    (id: string | null) => {
      setState(prev => ({
        ...prev,
        activeGroupId: id,
        activeNoteId: null
      }));

      if (location.pathname.startsWith('/dashboard/note/')) {
        navigate('/dashboard');
      }
    },
    [navigate, location.pathname]
  );
  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setSidebarOpen = useCallback((isOpen: boolean) => {
    setState((prev) => ({ ...prev, isSidebarOpen: isOpen }));
  }, []);



  const updateSettings = useCallback(
  (updates: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));

    if (updates.language) {
      setLocale(updates.language === "hi" ? "hi" : "en");
    }

    addToast(translate("Settings updated", getLocale()), "success");
  },
  [addToast]
);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addNote,
        updateNote,
        deleteNote,
        restoreNote,
        deleteForever,
        togglePinNote,
        toggleArchiveNote,
        bulkArchiveNotes,
        bulkTrashNotes,
        bulkMoveNotesToGroup,
        createShare,
        moveNoteToGroup,
        removeNoteFromGroup,
        addGroup,
        isCreateGroupModalOpen,
        openCreateGroupModal,
        closeCreateGroupModal,
        renameGroup,
        deleteGroup,
        setActiveNoteId,
        setActiveGroupId,
        setSearchQuery,
        setSidebarOpen,
        updateSettings,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
