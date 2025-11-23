<template>
  <div class="min-h-screen flex bg-slate-100">
    <Sidebar
      :active-page="activePage"
      @change-page="activePage = $event"
    />

    <main class="flex-1 p-8">
      <component :is="activeComponent" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Sidebar from "../components/Sidebar.vue";
import StokPage from "./StokPage.vue";
import SalesPage from "./SalesPage.vue";

const activePage = ref("stok");

const activeComponent = computed(() =>
  activePage.value === "satis" ? SalesPage : StokPage
);
</script>
