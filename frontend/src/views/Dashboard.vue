<template>
  <div class="min-h-screen bg-slate-100 flex flex-col md:flex-row">
    <!-- 🔹 Mobil üst bar -->
    <header
      class="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/80 backdrop-blur z-20"
    >
      <div class="font-semibold text-slate-800 text-sm">
        TechStock
      </div>

      <!-- HAMBURGER BUTON -->
      <button
        @click="toggleSidebar"
        class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-300 bg-white/60 active:scale-95 transition"
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
        <!-- Sağ üst köşede kapatma butonu -->
        <div class="absolute top-3 right-3">
          <button
            @click="closeSidebar"
            class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 bg-slate-900/80 text-slate-100 text-base leading-none"
          >
            ✕
          </button>
        </div>

        <transition name="slide-left">
          <Sidebar
            class="h-full w-64 bg-slate-900"
            :active-page="activePage"
            :on-close="closeSidebar"
            @change-page="handleChangePage"
          />
        </transition>
      </div>
    </transition>

    <!-- 🔹 Desktop layout -->
    <div class="flex flex-1 md:min-h-screen">
      <!-- Sol: Sidebar (desktop) -->
      <Sidebar
        class="hidden md:flex md:flex-col md:w-64"
        :active-page="activePage"
        @change-page="handleChangePage"
      />

      <!-- Sağ: içerik + footer -->
      <div class="flex-1 flex flex-col">
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <component :is="activeComponent" />
        </main>

        <footer
          class="border-t border-slate-200 text-[11px] text-slate-400 text-center py-3 px-2"
        >
          Created by
          <span class="font-semibold"> Fatih Atar</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Sidebar from "../components/Sidebar.vue";
import StokPage from "./StokPage.vue";
import SalesPage from "./SalesPage.vue";
import SuppliersPage from "./SuppliersPage.vue";
import SettingsPage from "./SettingsPage.vue";
import DevicesPage from "./DevicesPage.vue";
import RepairsPage from "./RepairsPage.vue";

const activePage = ref("stock");
const isSidebarOpen = ref(false);

const activeComponent = computed(() => {
  if (activePage.value === "satis" || activePage.value === "sales") return SalesPage;
  if (activePage.value === "devices") return DevicesPage;
  if (activePage.value === "repairs") return RepairsPage;
  if (activePage.value === "suppliers") return SuppliersPage;
  if (activePage.value === "settings") return SettingsPage;
  if (activePage.value === "stock" || activePage.value === "stok") return StokPage;
  return StokPage;
});

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
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.18s ease-out;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
