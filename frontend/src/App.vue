<template>
  <!-- Eğer giriş yapılmamışsa Login ekranı -->
  <LoginPage v-if="!isLoggedIn" @login-success="handleLoginSuccess" />

  <!-- Giriş yapıldıysa asıl uygulama -->
  <div v-else class="min-h-screen bg-slate-100 flex flex-col">
    <!-- 🔹 Mobil üst bar (sadece md altı) -->
    <header
      class="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/90 backdrop-blur"
    >
      <div class="flex flex-col">
        <span class="text-xs font-semibold text-slate-800">TechStock</span>
        <span class="text-[11px] text-slate-500">
          {{ currentCompanyName || "Aktif firma yok" }}
        </span>
      </div>

      <button
        @click="toggleSidebar"
        class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-300 bg-white active:scale-95 transition"
      >
        <span class="sr-only">Menüyü aç</span>
        <span class="text-lg leading-none text-slate-800">☰</span>
      </button>
    </header>

    <!-- 🔹 Mobil sidebar overlay -->
    <transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/40 md:hidden"
        @click.self="closeSidebar"
      >
        <div class="relative h-full">
          <!-- Sağ üstte X butonu -->
          <button
            @click="closeSidebar"
            class="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 bg-slate-900/80 text-slate-100 text-base leading-none"
          >
            ✕
          </button>

          <!-- Sidebar kendisi -->
          <Sidebar
            class="absolute left-0 top-0 h-full w-64 bg-slate-900"
            :active-page="activePage"
            @change-page="handleChangePage"
          />
        </div>
      </div>
    </transition>

    <!-- 🔹 Ana layout (desktop + içerik) -->
    <div class="flex flex-1 md:min-h-screen">
      <!-- Sol: Sidebar (sadece md ve üzeri) -->
      <Sidebar
        class="hidden md:flex md:flex-col md:w-64"
        :active-page="activePage"
        @change-page="handleChangePage"
      />

      <!-- Sağ: içerik -->
      <main class="flex-1 p-4 sm:p-6">
        <!-- Üst bar (sadece md ve üzeri) -->
        <div
          class="hidden md:flex items-center justify-between mb-4 text-xs text-slate-600"
        >
          <div>
            Aktif Firma:
            <span class="font-semibold text-slate-900">
              {{ currentCompanyName || "—" }}
            </span>
          </div>

          <button
            @click="logout"
            class="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Çıkış yap
          </button>
        </div>

        <!-- Mobilde küçük logout alanı -->
        <div
          class="md:hidden flex items-center justify-end mb-3 px-1 text-[11px] text-slate-500"
        >
          <button
            @click="logout"
            class="px-2 py-1 rounded-md border border-slate-300 bg-white/70"
          >
            Çıkış
          </button>
        </div>

        <!-- Sayfa içerikleri -->
        <DevicesPage v-if="activePage === 'devices'" />
        <RepairsPage v-else-if="activePage === 'repairs'" />
        <SalesPage v-else-if="activePage === 'sales'" />
        <StockPage v-else-if="activePage === 'stock'" />
        <SuppliersPage v-else-if="activePage === 'suppliers'" />
        <SettingsPage v-else-if="activePage === 'settings'" />
        <!-- default -->
        <DevicesPage v-else />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

import Sidebar from "./components/Sidebar.vue";
import DevicesPage from "./views/DevicesPage.vue";
import RepairsPage from "./views/RepairsPage.vue";
import SalesPage from "./views/SalesPage.vue";
import StockPage from "./views/StokPage.vue";
import SuppliersPage from "./views/SuppliersPage.vue";
import SettingsPage from "./views/SettingsPage.vue";
import LoginPage from "./views/LoginPage.vue";

// 🔑 Artık backend token sistemini kullanıyoruz
const TOKEN_KEY = "ts_token";
const COMPANY_KEY = "ts_company";

const activePage = ref("devices");
const isLoggedIn = ref(false);
const currentCompany = ref(null);

// 🔹 Mobil sidebar state
const isSidebarOpen = ref(false);

// Uygulama açılınca daha önce giriş yapılmış mı bak
onMounted(() => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const companyRaw = localStorage.getItem(COMPANY_KEY);

    if (!token || !companyRaw) {
      isLoggedIn.value = false;
      return;
    }

    const company = JSON.parse(companyRaw);
    if (company && company.id) {
      currentCompany.value = company;
      isLoggedIn.value = true;
    } else {
      isLoggedIn.value = false;
    }
  } catch (e) {
    console.error("Init auth error:", e);
    isLoggedIn.value = false;
  }
});

// LoginPage'den gelen event
function handleLoginSuccess(company) {
  currentCompany.value = company;
  isLoggedIn.value = true;
  activePage.value = "devices"; // girişten sonra açılacak varsayılan sayfa
}

function logout() {
  isLoggedIn.value = false;
  currentCompany.value = null;

  // Token ve firma bilgisini temizle
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(COMPANY_KEY);

  // İstersen sayfayı komple yenileyebilirsin:
  // window.location.reload();
}

// 🔹 Sidebar kontrol fonksiyonları
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  console.log("toggleSidebar:", isSidebarOpen.value);
}

function closeSidebar() {
  console.log("closeSidebar çağrıldı");
  isSidebarOpen.value = false;
}

function handleChangePage(page) {
  activePage.value = page;
  console.log("sayfa değişti:", page);
  // mobilde sayfa değişince sidebar’ı kapat
  closeSidebar();
}

const currentCompanyName = computed(() => currentCompany.value?.name || "");
</script>
