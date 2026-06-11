import { defineStore } from 'pinia';
import { useSettingsStore } from './settings';

interface User {
  email: string;
  password: string;
  name?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { email: string; name?: string },
    token: '' as string,
    users: [] as User[], // persisted list of registered users
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    // Helper to load users from localStorage
    loadUsers() {
      const stored = localStorage.getItem('authUsers');
      if (stored) {
        try {
          this.users = JSON.parse(stored);
        } catch {
          this.users = [];
        }
      }
    },
    // Persist users array
    persistUsers() {
      localStorage.setItem('authUsers', JSON.stringify(this.users));
    },
    register(email: string, password: string) {
      if (!email) throw new Error('Email is required');
      if (!password) throw new Error('Password is required');
      this.loadUsers();
      const exists = this.users.find((u) => u.email === email);
      if (exists) throw new Error('User already exists');
      const newUser: User = { email, password };
      this.users.push(newUser);
      this.persistUsers();
    },
    login(email: string, password: string) {
      if (!email) throw new Error('Email is required');
      this.loadUsers();
      const match = this.users.find((u) => u.email === email && u.password === password);
      if (!match) throw new Error('Invalid credentials');
      const mockToken = btoa(`${email}:${Date.now()}`);
      this.user = { email };
      this.token = mockToken;
      // Persist session
      localStorage.setItem('authUser', JSON.stringify(this.user));
      localStorage.setItem('authToken', this.token);
    },
    logout() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('disability');
      
      const settings = useSettingsStore();
      settings.disability = null;
    },
    loadFromStorage() {
      const storedUser = localStorage.getItem('authUser');
      const storedToken = localStorage.getItem('authToken');
      if (storedUser && storedToken) {
        this.user = JSON.parse(storedUser);
        this.token = storedToken;
      }
    },
  },
});
