import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,

        setAuth: ({ user, accessToken, refreshToken }) => {
          localStorage.setItem('accessToken', accessToken)
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
          set({ user, accessToken, refreshToken, isAuthenticated: true })
        },

        updateUser: (updates) =>
          set((state) => ({ user: { ...state.user, ...updates } })),

        logout: () => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        },
      }),
      {
        name: 'pustak-auth',
        partialize: (state) => ({
          user: state.user,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
)

export const useThemeStore = create(
  devtools(
    persist(
      (set, get) => ({
        isDark: false,
        toggle: () => {
          const next = !get().isDark
          set({ isDark: next })
          if (next) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        },
        init: () => {
          const isDark = get().isDark
          if (isDark) {
            document.documentElement.classList.add('dark')
          }
        },
      }),
      { name: 'pustak-theme' }
    ),
    { name: 'ThemeStore' }
  )
)
