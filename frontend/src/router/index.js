import { createRouter, createWebHistory } from "vue-router";

// BURAYI DÜZELT ⬇⬇⬇
import LoginPage from "../views/LoginPage.vue";
import DevicesPage from "../views/DevicesPage.vue";
import RepairsPage from "../views/RepairsPage.vue"; // varsa
// Eğer diğer sayfaları da route olarak kullanacaksan:
import SalesPage from "../views/SalesPage.vue";
import StockPage from "../views/StokPage.vue";
import SuppliersPage from "../views/SuppliersPage.vue";
import SettingsPage from "../views/SettingsPage.vue";

const routes = [
  { path: "/login", name: "login", component: LoginPage },
  { path: "/devices", name: "devices", component: DevicesPage },
  { path: "/repairs", name: "repairs", component: RepairsPage },
  // Diğerleri istersen:
  // { path: "/sales", name: "sales", component: SalesPage },
  // ...
  { path: "/", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
