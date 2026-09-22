export interface Note {
  id: string;
  title: string;
  content: string;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  tags: string[];
  shareId: string | null;
  shareEnabled: boolean;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  icon?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}


export interface AppState {
  notes: Note[];
  groups: Group[];
  settings: UserSettings;
  activeNoteId: string | null;
  activeGroupId: string | null;
  searchQuery: string;
  isSidebarOpen: boolean;
}
