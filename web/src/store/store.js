import { create } from 'zustand';

const storedUser = localStorage.getItem('brokerfinder_user');

export const store = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,

  login: (user) => {
    localStorage.setItem('brokerfinder_user', JSON.stringify(user));

    set({ user });
  },

  logout: () => {
    localStorage.removeItem('brokerfinder_user');

    set({ user: null });
  },
}));
