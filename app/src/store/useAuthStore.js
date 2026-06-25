// src/store/useAuthStore.js
// State global untuk status login, dipakai di seluruh app untuk menentukan
// apakah user diarahkan ke Auth flow atau Main app (lihat src/navigation).

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth';
import { TOKEN_KEY } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,       // true saat pertama cek token tersimpan (splash screen)
  isAuthenticated: false,
  error: null,

  // Dipanggil sekali saat app pertama dibuka untuk cek apakah ada token tersimpan
  bootstrapAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const res = await authApi.getProfile();
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  register: async (name, email, password) => {
    set({ error: null });
    const res = await authApi.register(name, email, password);
    const { token, user } = res.data.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ user, isAuthenticated: true });
  },

  login: async (email, password) => {
    set({ error: null });
    const res = await authApi.login(email, password);
    const { token, user } = res.data.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },

  refreshProfile: async () => {
    const res = await authApi.getProfile();
    set({ user: res.data.data });
  },

  updateLocalUser: (partial) => {
    set({ user: { ...get().user, ...partial } });
  },
}));
