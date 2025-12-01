<template>
  <div class="min-h-screen bg-[#f5f5f0] px-4 sm:px-6 lg:px-8 py-6 pb-10">
    <!-- ÜST BAR -->
    <header
      class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-slate-900">
          Cihazlar
        </h1>
        <p class="text-xs md:text-sm text-slate-500">
          Müşteri cihazlarını, durumlarını ve bilgilerini yönetin.
        </p>
      </div>

      <!-- Sağ üst: filtreler + Geçmiş cihazlar butonu -->
      <div
        class="flex flex-col items-stretch sm:flex-row sm:items-center gap-3"
      >
        <!-- Durum filtreleri -->
        <div
          class="inline-flex flex-wrap items-center bg-slate-100 rounded-full p-1 text-[11px] sm:text-xs border border-slate-200 shadow-sm"
        >
          <button
            type="button"
            @click="currentStatusFilter = 'all'"
            class="px-3 py-1 rounded-full transition"
            :class="currentStatusFilter === 'all'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'"
          >
            Tümü
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'bekleyen'"
            class="px-3 py-1 rounded-full transition"
            :class="currentStatusFilter === 'bekleyen'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'"
          >
            Bekleyen cihazlar
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'tamir'"
            class="px-3 py-1 rounded-full transition"
            :class="currentStatusFilter === 'tamir'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'"
          >
            Tamir bekleyen
          </button>
        </div>

        <!-- Geçmiş cihazlar butonu -->
        <button
          type="button"
          @click="showHistoryModal = true"
          class="text-xs px-3.5 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex items-center justify-center gap-1"
        >
          <span>Geçmiş Cihazlar</span>
        </button>
      </div>
    </header>

    <!-- KÜÇÜK DASHBOARD KUTULARI -->
    <div
      class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      <!-- Aktif cihaz -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3"
      >
        <div
          class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg"
        >
          💼
        </div>
        <div>
          <div class="text-[11px] text-slate-500 uppercase tracking-wide">
            Aktif
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalActive }}
          </div>
        </div>
      </div>

      <!-- Bekleyen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3"
      >
        <div
          class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg"
        >
          ⏳
        </div>
        <div>
          <div class="text-[11px] text-slate-500 uppercase tracking-wide">
            Bekleyen
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalBekleyen }}
          </div>
        </div>
      </div>

      <!-- Tamir Bekleyen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3"
      >
        <div
          class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg"
        >
          🛠️
        </div>
        <div>
          <div class="text-[11px] text-slate-500 uppercase tracking-wide">
            Tamir
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalTamir }}
          </div>
        </div>
      </div>

      <!-- Teslim Edilen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3"
      >
        <div
          class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg"
        >
          📦
        </div>
        <div>
          <div class="text-[11px] text-slate-500 uppercase tracking-wide">
            Teslim
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalArchived }}
          </div>
        </div>
      </div>
    </div>

    <!-- ANA LAYOUT: FORM + LİSTE -->
    <!-- xl'den önce dikey, xl ve üstü yan yana -->
    <section class="flex flex-col xl:flex-row gap-6">
      <!-- Sol: Cihaz ekleme / düzenleme formu -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 w-full xl:max-w-xl text-sm"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2"
        >
          <h2 class="text-sm sm:text-base font-semibold text-slate-900">
            {{ editingDeviceId ? "Cihaz Kaydı Düzenle" : "Yeni Cihaz Kaydı" }}
          </h2>

          <span
            v-if="editingDeviceId"
            class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 self-start sm:self-auto"
          >
            Düzenleme modu
          </span>
        </div>

        <div class="space-y-4">
          <!-- Müşteri adı -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Müşteri Adı
            </label>
            <input
              v-model="deviceForm.customerName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              placeholder="Örn: Ali Yılmaz"
            />
          </div>

          <!-- Telefon -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Telefon
            </label>
            <input
              v-model="deviceForm.phone"
              type="tel"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              placeholder="Örn: 05xx xxx xx xx"
            />
          </div>

          <!-- Tür / Marka / Model -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1 text-slate-700">
                Tür
              </label>
              <input
                v-model="deviceForm.type"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                placeholder="Örn: Telefon, Laptop"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-slate-700">
                Marka
              </label>
              <input
                v-model="deviceForm.brand"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                placeholder="Örn: Apple, Samsung"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-slate-700">
                Model
              </label>
              <input
                v-model="deviceForm.model"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                placeholder="Örn: iPhone 11"
              />
            </div>
          </div>

          <!-- Seri numarası -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Seri Numarası
            </label>
            <input
              v-model="deviceForm.serialNumber"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              placeholder="Örn: SN123456789"
            />
          </div>

          <!-- Açıklama / Not -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Açıklama / Not (isteğe bağlı)
            </label>
            <textarea
              v-model="deviceForm.description"
              rows="2"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              placeholder="Örn: Cihazda çizikler var, garanti dışı, müşteri yedek cihaz istemiyor..."
            ></textarea>
          </div>

          <!-- Durum -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Cihaz Durumu
            </label>
            <select
              v-model="deviceForm.status"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
            >
              <option>Serviste</option>
              <option>Bekliyor</option>
              <option>Yedek Parça Bekleniyor</option>
              <option>Teslim Edildi</option>
            </select>
          </div>

          <!-- Butonlar -->
          <div class="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              @click="saveDevice"
              class="flex-1 bg-slate-900 text-white font-medium py-2.5 rounded-md text-sm hover:bg-slate-800 active:scale-[0.99] transition"
            >
              {{ editingDeviceId ? "Kaydı Güncelle" : "Cihazı Kaydet" }}
            </button>

            <button
              v-if="editingDeviceId"
              type="button"
              @click="cancelEditDevice"
              class="px-4 py-2.5 rounded-md border text-sm text-slate-600 hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </div>
      </div>

      <!-- Sağ: GÜNCEL cihaz listesi (Teslim Edildi HARİÇ) -->
      <div
        class="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 text-sm"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
        >
          <h2 class="text-sm sm:text-base font-semibold text-slate-900">
            Güncel Cihazlar
          </h2>

          <input
            v-model="searchTerm"
            type="text"
            class="border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full sm:w-64 bg-white"
            placeholder="Müşteri, telefon, cihaz veya seri no ara..."
          />
        </div>

        <div
          v-if="filteredDevices.length === 0"
          class="text-slate-500 text-xs sm:text-sm"
        >
          Henüz güncel cihaz kaydı yok veya aramaya uygun kayıt bulunamadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <!-- Mobilde yatay kaydırılabilir tablo -->
          <div class="overflow-x-auto">
            <table
              class="w-full min-w-[640px] text-left text-[11px] sm:text-xs border-collapse"
            >
              <thead>
                <tr class="border-b text-slate-500 bg-slate-50">
                  <th class="py-2 pr-2 font-medium">Müşteri</th>
                  <th class="py-2 pr-2 font-medium">Telefon</th>
                  <th class="py-2 pr-2 font-medium">Cihaz</th>
                  <th class="py-2 pr-2 font-medium">Seri No</th>
                  <th class="py-2 pr-2 font-medium">Durum</th>
                  <th class="py-2 pl-2 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="d in filteredDevices"
                  :key="d.id"
                  class="border-b last:border-0 text-slate-700 align-top hover:bg-slate-50/60"
                >
                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ d.customerName || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="text-[11px] text-slate-600">
                      {{ d.phone || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ d.type }} {{ d.brand }} {{ d.model }}
                    </div>
                    <div
                      v-if="d.description"
                      class="text-[11px] text-slate-500 mt-1"
                    >
                      {{ d.description }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="text-[11px] text-slate-600">
                      {{ d.serialNumber || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
                      :class="statusClass(d.status)"
                    >
                      {{ d.status || "Serviste" }}
                    </span>
                  </td>

                  <td class="py-2 pl-2 text-right">
                    <button
                      type="button"
                      @click="startEditDevice(d)"
                      class="inline-flex items-center px-2 py-1 text-[11px] rounded-md border border-slate-300 hover:bg-slate-50"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- GEÇMİŞ CİHAZLAR MODAL -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col text-sm"
      >
        <!-- Modal header -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b"
        >
          <div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900">
              Geçmiş Cihazlar (Teslim Edilenler)
            </h3>
            <p class="text-[11px] text-slate-500">
              Teslim edilen tüm cihazların kaydı burada tutulur.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="historySearchTerm"
              type="text"
              class="border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-32 sm:w-48 bg-white"
              placeholder="Ara..."
            />
            <button
              type="button"
              @click="showHistoryModal = false"
              class="text-[11px] sm:text-xs px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Kapat
            </button>
          </div>
        </div>

        <!-- Modal content -->
        <div class="p-3 sm:p-4 overflow-y-auto">
          <div
            v-if="filteredArchivedDevices.length === 0"
            class="text-slate-500 text-xs sm:text-sm"
          >
            Henüz geçmiş cihaz kaydı yok.
          </div>

          <div v-else class="overflow-x-auto">
            <table
              class="w-full min-w-[640px] text-left text-[11px] sm:text-xs border-collapse"
            >
              <thead>
                <tr class="border-b text-slate-500 bg-slate-50">
                  <th class="py-2 pr-2 font-medium">Müşteri</th>
                  <th class="py-2 pr-2 font-medium">Telefon</th>
                  <th class="py-2 pr-2 font-medium">Cihaz</th>
                  <th class="py-2 pr-2 font-medium">Seri No</th>
                  <th class="py-2 pr-2 font-medium">Durum</th>
                  <th class="py-2 pr-2 font-medium">Teslim Tarihi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="d in filteredArchivedDevices"
                  :key="d.id"
                  class="border-b last:border-0 text-slate-700 align-top hover:bg-slate-50/60"
                >
                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ d.customerName || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="text-[11px] text-slate-600">
                      {{ d.phone || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ d.type }} {{ d.brand }} {{ d.model }}
                    </div>
                    <div
                      v-if="d.description"
                      class="text-[11px] text-slate-500 mt-1"
                    >
                      {{ d.description }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="text-[11px] text-slate-600">
                      {{ d.serialNumber || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
                      :class="statusClass(d.status)"
                    >
                      {{ d.status || "Teslim Edildi" }}
                    </span>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="text-[11px] text-slate-600">
                      {{
                        d.deliveredAt
                          ? new Date(d.deliveredAt).toLocaleDateString("tr-TR")
                          : d.updatedAt
                          ? new Date(d.updatedAt).toLocaleDateString("tr-TR")
                          : d.createdAt
                          ? new Date(d.createdAt).toLocaleDateString("tr-TR")
                          : "-"
                      }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api/client";

// Backend'ten gelen cihazlar (hepsi, aktif + teslim)
const devices = ref([]);

const deviceForm = ref({
  customerName: "",
  phone: "",
  type: "",
  brand: "",
  model: "",
  serialNumber: "",
  description: "",
  status: "Serviste",
});

const editingDeviceId = ref(null);
const searchTerm = ref("");
const historySearchTerm = ref("");
const showHistoryModal = ref(false);
const currentStatusFilter = ref("all"); // 'all' | 'bekleyen' | 'tamir'

const loading = ref(false);
const saving = ref(false);
const error = ref("");

// 📥 Sayfa açılınca cihazları backend'ten çek
onMounted(async () => {
  await loadDevices();
});

async function loadDevices() {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/devices");
    devices.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Cihazlar alınırken hata:", e);
    error.value = "Cihazlar alınırken bir hata oluştu.";
    devices.value = [];
  } finally {
    loading.value = false;
  }
}

// 🧹 Formu sıfırla
function resetDeviceForm() {
  deviceForm.value = {
    customerName: "",
    phone: "",
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    description: "",
    status: "Serviste",
  };
}

// 💾 Cihaz kaydet / güncelle (backend'e)
async function saveDevice() {
  if (!deviceForm.value.customerName || !deviceForm.value.type) {
    alert("En azından müşteri adı ve cihaz türü girilmelidir.");
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const payload = { ...deviceForm.value };

    if (editingDeviceId.value) {
      // Güncelleme
      const res = await api.put(`/devices/${editingDeviceId.value}`, payload);

      // Local listede güncelle
      const idx = devices.value.findIndex(
        (d) => d.id === editingDeviceId.value
      );
      if (idx !== -1) {
        devices.value[idx] = res.data;
      } else {
        // Emin olmak için tekrar tüm listeyi çekelim
        await loadDevices();
      }
    } else {
      // Yeni cihaz ekle
      const res = await api.post("/devices", payload);
      // En üste ekleyelim
      devices.value.unshift(res.data);
    }

    editingDeviceId.value = null;
    resetDeviceForm();
  } catch (e) {
    console.error("Cihaz kaydedilirken hata:", e);
    error.value =
      e?.response?.data?.message || "Cihaz kaydedilirken bir hata oluştu.";
  } finally {
    saving.value = false;
  }
}

// ✏️ Düzenleme başlat
function startEditDevice(device) {
  editingDeviceId.value = device.id;
  deviceForm.value = {
    customerName: device.customerName || "",
    phone: device.phone || "",
    type: device.type || "",
    brand: device.brand || "",
    model: device.model || "",
    serialNumber: device.serialNumber || "",
    description: device.description || "",
    status: device.status || "Serviste",
  };
}

// ❌ Düzenlemeyi iptal
function cancelEditDevice() {
  editingDeviceId.value = null;
  resetDeviceForm();
}

// 🔢 Dashboard metrikleri
const activeDevices = computed(() =>
  devices.value.filter((d) => d.status !== "Teslim Edildi")
);
const archivedDevices = computed(() =>
  devices.value.filter((d) => d.status === "Teslim Edildi")
);

const totalActive = computed(() => activeDevices.value.length);

const totalBekleyen = computed(
  () => activeDevices.value.filter((d) => d.status === "Bekliyor").length
);

const totalTamir = computed(
  () =>
    activeDevices.value.filter(
      (d) =>
        d.status === "Serviste" || d.status === "Yedek Parça Bekleniyor"
    ).length
);

const totalArchived = computed(() => archivedDevices.value.length);

// 🔍 Güncel cihazlar + durum filtresi + arama
const filteredDevices = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();

  let base = activeDevices.value;

  if (currentStatusFilter.value === "bekleyen") {
    base = base.filter((d) => d.status === "Bekliyor");
  } else if (currentStatusFilter.value === "tamir") {
    base = base.filter(
      (d) =>
        d.status === "Serviste" || d.status === "Yedek Parça Bekleniyor"
    );
  }

  if (!term) return base;

  return base.filter((d) => {
    const customer = d.customerName?.toLowerCase() || "";
    const phone = d.phone?.toLowerCase() || "";
    const deviceText = `${d.type || ""} ${d.brand || ""} ${
      d.model || ""
    } ${d.serialNumber || ""}`.toLowerCase();
    const desc = d.description?.toLowerCase() || "";

    return (
      customer.includes(term) ||
      phone.includes(term) ||
      deviceText.includes(term) ||
      desc.includes(term)
    );
  });
});

// 🔍 Geçmiş cihazlar (modal içi arama)
const filteredArchivedDevices = computed(() => {
  const term = historySearchTerm.value.trim().toLowerCase();
  const base = archivedDevices.value;

  if (!term) return base;

  return base.filter((d) => {
    const customer = d.customerName?.toLowerCase() || "";
    const phone = d.phone?.toLowerCase() || "";
    const deviceText = `${d.type || ""} ${d.brand || ""} ${
      d.model || ""
    } ${d.serialNumber || ""}`.toLowerCase();
    const desc = d.description?.toLowerCase() || "";

    return (
      customer.includes(term) ||
      phone.includes(term) ||
      deviceText.includes(term) ||
      desc.includes(term)
    );
  });
});

// Duruma göre rozet rengi
function statusClass(status) {
  if (status === "Teslim Edildi") {
    return "bg-green-100 text-green-700 border border-green-300";
  }
  if (status === "Yedek Parça Bekleniyor") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-300";
  }
  if (status === "Bekliyor") {
    return "bg-orange-100 text-orange-700 border border-orange-300";
  }
  return "bg-blue-100 text-blue-700 border border-blue-300";
}
</script>
