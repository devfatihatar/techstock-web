<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">
        Uygulama Ayarları
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Firma adı ve kullanıcı adını buradan değiştirebilirsiniz.
      </p>
    </header>

    <section class="bg-white rounded-xl shadow p-6 w-full max-w-xl text-sm">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">
            Firma Adı
          </label>
          <input
            v-model="settingsForm.companyName"
            type="text"
            class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Örn: Simge Bilgisayar"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Kullanıcı Adı
          </label>
          <input
            v-model="settingsForm.userName"
            type="text"
            class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Örn: Fatih"
          />
        </div>

        <button
          @click="saveSettings"
          class="mt-2 bg-slate-900 text-white font-medium py-2.5 rounded-md text-sm hover:bg-slate-800 active:scale-[0.99] transition w-full md:w-auto px-6"
        >
          Ayarları Kaydet
        </button>

        <p class="text-[11px] text-slate-500 mt-2">
          Bu bilgiler stok ve satış ekranlarının üst kısmında görüntülenir.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const SETTINGS_STORAGE_KEY = "simge-settings";

const settingsForm = ref({
  companyName: "",
  userName: "",
});

onMounted(() => {
  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      settingsForm.value = {
        companyName: parsed.companyName || "Simge Bilgisayar",
        userName: parsed.userName || "Fatih",
      };
    } catch (e) {
      console.error("Settings parse error:", e);
      settingsForm.value = {
        companyName: "Simge Bilgisayar",
        userName: "Fatih",
      };
    }
  } else {
    settingsForm.value = {
      companyName: "Simge Bilgisayar",
      userName: "Fatih",
    };
  }
});

function saveSettings() {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settingsForm.value)
  );
  alert("Ayarlar kaydedildi.");
}
</script>
