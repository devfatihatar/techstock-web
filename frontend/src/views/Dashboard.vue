<template>
  <div class="min-h-screen bg-slate-100 flex">
    <!-- Sol: Sidebar -->
    <Sidebar
      :active-page="activePage"
      @change-page="activePage = $event"
    />

    <!-- Sağ: içerik + footer -->
    <div class="flex-1 flex flex-col">
      <main class="flex-1 p-8">
        <component :is="activeComponent" />
      </main>

      <footer
        class="border-t border-slate-200 text-[11px] text-slate-400 text-center py-3"
      >
        Created by
        <span class="font-semibold"> Fatih Atar</span>
      </footer>
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

const activePage = ref("stok");

const activeComponent = computed(() => {
  if (activePage.value === "satis") return SalesPage;
  if (activePage.value === "suppliers") return SuppliersPage;
  if (activePage.value === "settings") return SettingsPage;
  return StokPage; // varsayılan: ürünler
});

</script>
