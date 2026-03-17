import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'phyjio_pin';

interface AuthState {
  isAuthenticated: boolean;
  hasPin: boolean;
  checkPin: () => Promise<void>;
  login: (pin: string) => Promise<boolean>;
  loginWithBiometric: () => void;
  setPin: (pin: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  hasPin: false,

  checkPin: async () => {
    try {
      const savedPin = await AsyncStorage.getItem(PIN_KEY);
      set({ hasPin: savedPin !== null });
    } catch {
      set({ hasPin: false });
    }
  },

  login: async (pin: string) => {
    try {
      const savedPin = await AsyncStorage.getItem(PIN_KEY);
      if (savedPin === null) {
        // First-time setup: no PIN saved, allow login
        set({ isAuthenticated: true });
        return true;
      }
      const success = savedPin === pin;
      if (success) set({ isAuthenticated: true });
      return success;
    } catch {
      return false;
    }
  },

  loginWithBiometric: () => {
    set({ isAuthenticated: true });
  },

  setPin: async (pin: string) => {
    await AsyncStorage.setItem(PIN_KEY, pin);
    set({ hasPin: true, isAuthenticated: true });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },
}));
