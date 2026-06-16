/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#0F766E',
        light: '#14B8A6',
        dark: '#115E59',
      },

      secondary: {
        DEFAULT: '#334155',
        light: '#64748B',
        dark: '#1E293B',
      },

      success: '#16A34A',
      warning: '#D97706',
      danger: '#DC2626',

      background: '#F8FAFC',
      surface: '#FFFFFF',

      border: '#E2E8F0',

      text: {
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',
      },

      chat: {
        sender: '#0F766E',
        receiver: '#F1F5F9',
      },
    },
  },
};
export const plugins = [];
