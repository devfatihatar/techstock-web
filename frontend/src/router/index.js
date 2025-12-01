// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// SAYFALAR
import LoginPage from "../views/LoginPage.vue";
import Dashboard from "../views/Dashboard.vue";
import DevicesPage from "../views/DevicesPage.vue";
import RepairsPage from "../views/RepairsPage.vue";
import SalesPage from "../views/SalesPage.vue";
import StockPage from "../views/StokPage.vue";
import SuppliersPage from "../views/SuppliersPage.vue";
import SettingsPage from "../views/SettingsPage.vue";

const routes = [
  // 🔐 GİRİŞ SAYFALARI
  {
    path: "/admin-login",
    name: "admin-login",
    component: LoginPage,
    meta: {
      loginType: "admin",
    },
  },
  {
    path: "/login",
    name: "company-login",
    component: LoginPage,
    meta: {
      loginType: "company",
    },
  },

  // 🏠 DASHBOARD (firma ana sayfası gibi)
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      onlyCompany: true,
    },
  },

  // 🏢 FİRMA PANELİ ROUTE'LARI
  {
    path: "/devices",
    name: "devices",
    component: DevicesPage,
    meta: {
      requiresAuth: true,
      onlyCompany: true,
    },
  },
  {
    path: "/repairs",
    name: "repairs",
    component: RepairsPage,
    meta: {
      requiresAuth: true,
      onlyCompany: true,
    },
  },
  {
    path: "/sales",
    name: "sales",
    component: SalesPage,
    meta: {
      requiresAuth: true,
      onlyCompany: true,
    },
  },
  {
    path: "/stock",
    name: "stock",
    component: StockPage,
    meta: {
      requiresAuth: true,
      onlyCompany: true,
    },
  },
  {
    path: "/suppliers",
    name: "suppliers",
    component: SuppliersPage,
    meta: {
      requiresAuth: true,
      onlyCompany: true,
    },
  },

  // ⚙️ SADECE ADMIN (SEN)
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
    meta: {
      requiresAuth: true,
      onlySuperAdmin: true,
    },
  },

  // ROOT
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🌍 GLOBAL GUARD
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  const isLoggedIn = auth.isAuthenticated;
  const role = auth.role;          // "ADMIN" veya "COMPANY"

  // Giriş gerekmiyorsa serbest
  if (!to.meta.requiresAuth) {
    return next();
  }

  // Giriş gerekli ama login yok
  if (!isLoggedIn) {
    if (to.meta.onlySuperAdmin) {
      return next({ name: "admin-login" });
    }
    return next({ name: "company-login" });
  }

  // Sadece ADMIN / Süper Admin sayfası
  if (to.meta.onlySuperAdmin) {
    if (role !== "ADMIN") {
      // Firma kullanıcısı admin sayfaya girmeye çalışıyorsa
      if (role === "COMPANY") {
        return next({ name: "devices" });
      }
      return next({ name: "admin-login" });
    }
  }

  // Sadece Firma sayfaları
  if (to.meta.onlyCompany) {
    if (role !== "COMPANY") {
      if (role === "ADMIN") {
        return next({ name: "settings" });
      }
      return next({ name: "company-login" });
    }
  }

  next();
});



export default router;
