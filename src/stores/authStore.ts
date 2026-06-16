import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setAuth: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
