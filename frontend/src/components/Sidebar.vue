<template>
  <aside
    class="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 text-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out z-50"
    :class="[open ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0']"
  >
    <!-- ÜST: Logo / başlık (tıklanabilir) -->
    <div
      class="px-4 py-4 border-b border-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-900/60"
      @click="goHome"
    >
      <div
        class="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300 text-lg font-bold"
      >
        TS
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <span class="text-sm font-semibold truncate">TechStock</span>
        <span class="text-[11px] text-slate-400 truncate">
          {{ isAdmin ? "Yönetici Paneli" : isCompany ? "Firma Paneli" : "Oturum Yok" }}
        </span>
      </div>

      <!-- 📱 Mobilde sağda X butonu -->
      <button
        type="button"
        class="ml-1 text-slate-400 hover:text-slate-100 md:hidden"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <!-- MENÜ -->
    <nav class="px-3 py-3 space-y-1 text-sm">
      <!-- ADMIN MENÜSÜ -->
      <template v-if="isAdmin">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition text-left text-xs"
          :class="
            isActiveRoute('settings')
              ? 'bg-sky-600/20 text-sky-100 border border-sky-500/40'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50 border border-transparent'
          "
          @click="go('settings')"
        >
          <span class="w-5 text-center">⚙️</span>
          <span class="truncate">Ayarlar</span>
        </button>
      </template>

      <!-- FİRMA MENÜSÜ -->
      <template v-else-if="isCompany">
        <button
          v-for="item in companyMenu"
          :key="item.route"
          type="button"
          class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition text-left text-xs"
          :class="
            isActiveRoute(item.route)
              ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/40'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50 border border-transparent'
          "
          @click="go(item.route)"
        >
          <span class="w-5 text-center">
            {{ item.icon }}
          </span>
          <span class="truncate">{{ item.label }}</span>
        </button>
      </template>

      <!-- Ne admin ne company -->
      <template v-else>
        <p class="text-[11px] text-slate-500 px-2">
          Oturum bulunamadı. Lütfen tekrar giriş yapın.
        </p>
      </template>
    </nav>

    <!-- ALT: kullanıcı bilgisi + çıkış -->
    <div
      class="border-t border-slate-800 px-3 py-3 text-[11px] flex items-center justify-between gap-2 mt-auto"
    >
      <div class="flex flex-col">
        <span class="text-slate-300 font-medium truncate max-w-[140px]">
          {{ userEmail || "Misafir" }}
        </span>
        <span class="text-slate-500">
          {{ isAdmin ? "Admin" : isCompany ? "Firma Kullanıcısı" : "Bilinmiyor" }}
        </span>
      </div>
      <button
        type="button"
        @click="logout"
        class="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md px-2 py-1 text-[11px]"
      >
        Çıkış
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

// 👉 props + emit
const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const localUser = ref(null);

onMounted(() => {
  try {
    const raw = localStorage.getItem("ts_user");
    localUser.value = raw ? JSON.parse(raw) : null;
    console.log("[Sidebar] ts_user:", localUser.value);
  } catch (e) {
    console.error("[Sidebar] ts_user parse error:", e);
    localUser.value = null;
  }
});

const role = computed(() => localUser.value?.role || null);
const isAdmin = computed(() => role.value === "ADMIN");
const isCompany = computed(() => role.value === "COMPANY");
const userEmail = computed(() => localUser.value?.email || "");

// FİRMA menüsü (router name'leri ile uyumlu)
const companyMenu = [
  { route: "dashboard", label: "Genel Bakış", icon: "🏠" },
  { route: "devices", label: "Cihazlar", icon: "💻" },
  { route: "repairs", label: "Tamirler", icon: "🛠️" },
  { route: "sales", label: "Satışlar", icon: "₺" },
  { route: "stock", label: "Stok", icon: "📦" },
  { route: "suppliers", label: "Tedarikçiler", icon: "🤝" },
];

function isActiveRoute(name) {
  return route.name === name;
}

function go(name) {
  if (route.name === name) return;
  router.push({ name });
  // Mobilde menüden bir yere gidince sidebar’ı kapat
  if (window.innerWidth < 768) {
    emit("close");
  }
}

function goHome() {
  if (isAdmin.value) {
    go("settings");
  } else if (isCompany.value) {
    go("dashboard");
  } else {
    router.push({ name: "company-login" });
  }
}

function logout() {
  if (typeof auth.logout === "function") {
    auth.logout();
  }

  localStorage.removeItem("ts_token");
  localStorage.removeItem("ts_user");
  localStorage.removeItem("ts_company");
  localUser.value = null;

  if (isAdmin.value) {
    router.push({ name: "admin-login" });
  } else {
    router.push({ name: "company-login" });
  }
}
</script>
