import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
          });

          // Stocker dans localStorage pour l'intercepteur axios
          if (typeof window !== 'undefined') {
            localStorage.setItem('nexus_token', data.access_token);
            localStorage.setItem('nexus_user', JSON.stringify(data.user));
          }
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('nexus_token', data.access_token);
            localStorage.setItem('nexus_user', JSON.stringify(data.user));
          }
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_user');
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'nexus-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
