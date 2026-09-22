import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  language?: string;
  occupation?: string;
  useCase?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  loading: boolean;

  setLoading: (loading: boolean) => void;

  login: (user: User) => void;

  updateUser: (data: Partial<User>) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
        user: null,

        isAuthenticated: false,

        loading: false,

        setLoading: (loading) =>
          set((state) =>
            state.loading === loading ? state : { loading }
          ),

        login: (user) =>
          set((state) => {
            if (
              state.user === user &&
              state.isAuthenticated &&
              !state.loading
            ) {
              return state;
            }

            return {
              user,
              isAuthenticated: true,
              loading: false,
            };
          }),

        updateUser: (data) =>
          set((state) => {
            const currentUser = state.user;

            if (!currentUser) {
              return state;
            }

            const keys = Object.keys(data) as Array<keyof User>;

            if (
              keys.length === 0 ||
              keys.every((key) => Object.is(currentUser[key], data[key]))
            ) {
              return state;
            }

            return {
              user: {
                ...currentUser,
                ...data,
              },
            };
          }),

        logout: () =>
          set((state) => {
            if (
              state.user === null &&
              !state.isAuthenticated &&
              !state.loading
            ) {
              return state;
            }

            return {
              user: null,
              isAuthenticated: false,
              loading: false,
            };
          }),
      }),
    {
      name: 'notepad-auth-storage',
    }
  )
);
