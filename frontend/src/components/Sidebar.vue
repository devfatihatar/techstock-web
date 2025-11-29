<template>
  <aside class="w-64 bg-slate-900 text-slate-100 px-4 py-6 flex flex-col">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-xl font-bold tracking-tight">
        TechStock
      </h1>
    </div>

    <nav>
      <ul class="space-y-2 text-sm">
        <!-- Cihazlar -->
        <li v-if="currentModules.devices">
          <button
            @click="changePage('devices')"
            class="w-full text-left px-2 py-1.5 rounded-md transition"
            :class="
              activePage === 'devices'
                ? 'bg-slate-700 text-white'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            "
          >
            Cihazlar
          </button>
        </li>

        <!-- Tamirler -->
        <li v-if="currentModules.repairs">
          <button
            @click="changePage('repairs')"
            class="w-full text-left px-2 py-1.5 rounded-md transition"
            :class="
              activePage === 'repairs'
                ? 'bg-slate-700 text-white'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            "
          >
            Tamirler
          </button>
        </li>

        <!-- Satış -->
        <li v-if="currentModules.sales">
          <button
            @click="changePage('sales')"
            class="w-full text-left px-2 py-1.5 rounded-md transition"
            :class="
              activePage === 'sales'
                ? 'bg-slate-700 text-white'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            "
          >
            Satışlar
          </button>
        </li>

        <!-- Stok -->
        <li v-if="currentModules.stock">
          <button
            @click="changePage('stock')"
            class="w-full text-left px-2 py-1.5 rounded-md transition"
            :class="
              activePage === 'stock' || activePage === 'stok'
                ? 'bg-slate-700 text-white'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            "
          >
            Stok
          </button>
        </li>

        <!-- Tedarikçiler -->
        <li v-if="currentModules.suppliers">
          <button
            @click="changePage('suppliers')"
            class="w-full text-left px-2 py-1.5 rounded-md transition"
            :class="
              activePage === 'suppliers'
                ? 'bg-slate-700 text-white'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            "
          >
            Tedarikçiler
          </button>
        </li>

        <!-- AYARLAR -->
        <li>
          <button
            @click="changePage('settings')"
            class="w-full text-left px-2 py-1.5 rounded-md transition mt-4 border-t border-slate-700 pt-3"
            :class="
              activePage === 'settings'
                ? 'bg-slate-700 text-white'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            "
          >
            Ayarlar
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  activePage: {
    type: String,
    default: "stock",
  },
  onClose: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["change-page"]);

function handleClose() {
  console.log("Sidebar X tıklandı");
  if (props.onClose) {
    props.onClose();
  }
}

function changePage(page) {
  emit("change-page", page);
  // mobilde sayfa seçince de varsa close fonksiyonunu çağır
  if (props.onClose) {
    props.onClose();
  }
}

const COMPANIES_STORAGE_KEY = "simge-companies";
const ACTIVE_COMPANY_KEY = "simge-active-company-id";

const currentModules = computed(() => {
  try {
    const companiesRaw = localStorage.getItem(COMPANIES_STORAGE_KEY);
    const activeIdRaw = localStorage.getItem(ACTIVE_COMPANY_KEY);

    if (!companiesRaw || !activeIdRaw) {
      return {
        devices: true,
        repairs: true,
        sales: true,
        stock: true,
        suppliers: true,
        reports: true,
      };
    }

    const companies = JSON.parse(companiesRaw);
    const activeId = Number(activeIdRaw);
    const active = Array.isArray(companies)
      ? companies.find((c) => c.id === activeId)
      : null;

    return active?.modules || {
      devices: true,
      repairs: true,
      sales: true,
      stock: true,
      suppliers: true,
      reports: true,
    };
  } catch (e) {
    console.error("currentModules error:", e);
    return {
      devices: true,
      repairs: true,
      sales: true,
      stock: true,
      suppliers: true,
      reports: true,
    };
  }
});
</script>
