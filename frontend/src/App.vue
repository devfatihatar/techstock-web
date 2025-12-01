<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- GİRİŞ YAPILMIŞ VE LOGIN SAYFASINDA DEĞİLSE -->
    <div v-if="isAuthenticated && !isLoginRoute">
      <!-- 📱 Mobil ÜST BAR (sadece md altı) -->
      <header
        class="fixed top-0 left-0 right-0 h-12 bg-slate-950 text-slate-100 flex items-center justify-between px-3 md:hidden z-40"
      >
        <button
          type="button"
          @click="toggleSidebar"
          class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-700 bg-slate-900 text-slate-100"
        >
          <!-- basit hamburger -->
          <span class="text-lg">☰</span>
        </button>
        <span class="text-xs font-semibold tracking-wide">
          TechStock Panel
        </span>
        <div class="w-8"></div>
      </header>

      <!-- 🧱 Sidebar (mobilde slide-in, desktop’ta sabit) -->
      <Sidebar :open="sidebarOpen" @close="closeSidebar" />

      <!-- 📱 Mobilde sidebar açıksa arka plan blur/overlay -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/40 z-40 md:hidden"
        @click="closeSidebar"
      ></div>

      <!-- Sağ: içerik alanı -->
      <main class="min-h-screen pt-12 md:pt-0 md:ml-64">
        <RouterView />
      </main>
    </div>

    <!-- LOGIN SAYFALARI veya AUTH YOKSA -->
    <div v-else>
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "./stores/auth";

import Sidebar from "./components/Sidebar.vue";

const route = useRoute();
const auth = useAuthStore();

const isAuthenticated = computed(() => auth.isAuthenticated);

// Login sayfalarının route name'leri
const loginRouteNames = ["company-login", "admin-login"];
const isLoginRoute = computed(() => loginRouteNames.includes(route.name));

// 🔀 Sidebar aç/kapa state'i
const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<style>
</style>
