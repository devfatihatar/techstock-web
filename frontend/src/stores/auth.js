// src/stores/auth.js
import { defineStore } from "pinia";

const TOKEN_KEY = "ts_token";
const USER_KEY = "ts_user";
const COMPANY_KEY = "ts_company";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,   // { id, email, role, companyId? }
    token: null,
    company: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role || null,

    // Admin mi?
    isAdmin() {
      return this.role === "ADMIN";
    },

    // Firma kullanıcısı mı?
    isCompanyUser() {
      return this.role === "COMPANY";
    },

    // Eski isimler (router’da kullanıyordun)
    isSuperAdmin() {
      return this.isAdmin;
    },
  },

  actions: {
    setAuth({ user, token, company = null }) {
      this.user = user;
      this.token = token;
      this.company = company;

      // localStorage senkron
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }

      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }

      if (company) {
        localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
      } else {
        localStorage.removeItem(COMPANY_KEY);
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.company = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(COMPANY_KEY);
    },

    // Sayfa yenilenince localStorage'dan geri yüklemek için
    hydrateFromStorage() {
      const token = localStorage.getItem(TOKEN_KEY);
      const rawUser = localStorage.getItem(USER_KEY);
      const rawCompany = localStorage.getItem(COMPANY_KEY);

      let user = null;
      let company = null;

      try {
        user = rawUser ? JSON.parse(rawUser) : null;
      } catch {
        user = null;
      }

      try {
        company = rawCompany ? JSON.parse(rawCompany) : null;
      } catch {
        company = null;
      }

      this.token = token || null;
      this.user = user;
      this.company = company;
    },
  },
});
