<template>
  <div class="min-h-screen bg-[#f5f5f0] px-4 sm:px-6 lg:px-8 py-6 pb-10">
    <!-- ÜST BAR -->
    <header
      class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-slate-900">
          Tamirler
        </h1>
        <p class="text-xs md:text-sm text-slate-500">
          Cihaz tamir süreçlerini, durumlarını ve ücretlerini takip edin.
        </p>
      </div>

      <!-- Sağ üst: durum filtreleri + Geçmiş Tamirler butonu -->
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
            :class="
              currentStatusFilter === 'all'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            Tümü
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'bekleyen'"
            class="px-3 py-1 rounded-full transition"
            :class="
              currentStatusFilter === 'bekleyen'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            Bekleyen
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'tamir'"
            class="px-3 py-1 rounded-full transition"
            :class="
              currentStatusFilter === 'tamir'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            Tamirde
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'tamamlandi'"
            class="px-3 py-1 rounded-full transition"
            :class="
              currentStatusFilter === 'tamamlandi'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            Tamamlandı
          </button>
        </div>

        <!-- Geçmiş tamirler butonu -->
        <button
          type="button"
          @click="showHistoryModal = true"
          class="text-xs px-3.5 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex items-center justify-center gap-1"
        >
          <span>Geçmiş Tamirler</span>
        </button>
      </div>
    </header>

    <!-- Mini dashboard (yan yana kutular) -->
    <div
      class="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
    >
      <!-- Aktif tamirler -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3"
      >
        <div
          class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg"
        >
          🛠️
        </div>
        <div>
          <div class="text-[11px] text-slate-500 uppercase tracking-wide">
            Aktif tamirler
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalActiveRepairs }}
          </div>
        </div>
      </div>

      <!-- Bekleyen tamirler -->
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
            {{ totalWaitingRepairs }}
          </div>
        </div>
      </div>

      <!-- Serviste / Parça bekleyen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-sm p-3"
      >
        <div
          class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg"
        >
          🔧
        </div>
        <div>
          <div class="text-[11px] text-slate-500 uppercase tracking-wide">
            Tamirde
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalInServiceRepairs }}
          </div>
        </div>
      </div>

      <!-- Geçmiş tamirler -->
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
            Geçmiş tamirler
          </div>
          <div class="text-lg md:text-xl font-semibold text-slate-900">
            {{ totalArchivedRepairs }}
          </div>
        </div>
      </div>
    </div>

    <!-- ANA LAYOUT: Sol form + Sağ liste -->
    <!-- xl'den önce dikey, xl ve üstü yan yana -->
    <section class="flex flex-col xl:flex-row gap-6">
      <!-- Sol: Tamir ekleme / düzenleme formu -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 w-full xl:max-w-xl text-sm"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2"
        >
          <h2 class="text-sm sm:text-base font-semibold text-slate-900">
            {{ editingRepairId ? "Tamir Kaydı Düzenle" : "Yeni Tamir Kaydı" }}
          </h2>

          <span
            v-if="editingRepairId"
            class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 self-start sm:self-auto"
          >
            Düzenleme modu
          </span>
        </div>

        <div class="space-y-4">
          <!-- Cihaz seçimi -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Cihaz (kayıtlı cihazlardan seç)
            </label>

            <select
              v-model.number="repairForm.deviceId"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
            >
              <option :value="null" disabled>Cihaz seçin...</option>

              <option v-for="d in selectableDevices" :key="d.id" :value="d.id">
                {{ d.customerName || "Müşteri" }} - {{ d.type }} {{ d.brand }}
                {{ d.model }}
              </option>
            </select>

            <p
              v-if="devices.length === 0"
              class="mt-1 text-[11px] text-slate-500"
            >
              Henüz cihaz eklenmemiş. Önce "Cihazlar" sekmesinden cihaz ekleyin.
            </p>

            <!-- Seçili cihaz bilgisi -->
            <div
              v-if="selectedDevice"
              class="mt-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
            >
              <div>
                <span class="font-semibold">Müşteri:</span>
                {{ selectedDevice.customerName || "-" }}
              </div>
              <div v-if="selectedDevice.phone">
                <span class="font-semibold">Telefon:</span>
                {{ selectedDevice.phone }}
              </div>
              <div class="mt-1">
                <span class="font-semibold">Cihaz durumu:</span>
                {{ selectedDevice.status || "Serviste" }}
              </div>
            </div>
          </div>

          <!-- Sorun açıklaması -->
          <div>
            <label class="block text-sm font-medium mb-1 text-slate-700">
              Sorun Açıklaması
            </label>
            <textarea
              v-model="repairForm.problem"
              rows="2"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              placeholder="Örn: Açılmıyor, ekran kırık, şarj olmuyor..."
            ></textarea>
          </div>

          <!-- Ücret + Durum -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-slate-700">
                Tahmini Ücret (₺)
              </label>
              <input
                v-model="repairForm.estimatedCost"
                type="number"
                min="0"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                placeholder="İsteğe bağlı"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-slate-700">
                Durum
              </label>
              <select
                v-model="repairForm.status"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option>Bekliyor</option>
                <option>Serviste</option>
                <option>Yedek Parça Bekleniyor</option>
                <option>Tamamlandı</option>
                <option>Teslim Edildi</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              @click="saveRepair"
              class="flex-1 bg-slate-900 text-white font-medium py-2.5 rounded-md text-sm hover:bg-slate-800 active:scale-[0.99] transition"
            >
              {{ editingRepairId ? "Kaydı Güncelle" : "Tamir Kaydını Oluştur" }}
            </button>

            <button
              v-if="editingRepairId"
              @click="cancelEditRepair"
              type="button"
              class="px-4 py-2.5 rounded-md border text-sm text-slate-600 hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </div>
      </div>

      <!-- Sağ: Tamir listesi -->
      <div
        class="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 text-sm"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
        >
          <h2 class="text-sm sm:text-base font-semibold text-slate-900">
            Tamir Kayıtları
          </h2>

          <input
            v-model="searchTerm"
            type="text"
            class="border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full sm:w-64 bg-white"
            placeholder="Müşteri, cihaz veya durum ara..."
          />
        </div>

        <div
          v-if="filteredRepairs.length === 0"
          class="text-slate-500 text-xs sm:text-sm"
        >
          Henüz tamir kaydı yok veya aramaya uygun kayıt bulunamadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <!-- Mobilde yatay kaydırılabilir tablo -->
          <div class="overflow-x-auto">
            <table
              class="w-full min-w-[640px] text-left text-[11px] sm:text-xs border-collapse"
            >
              <thead>
                <tr class="border-b text-slate-500 bg-slate-50">
                  <th class="py-2 pr-2 font-medium">Tarih</th>
                  <th class="py-2 pr-2 font-medium">Müşteri</th>
                  <th class="py-2 pr-2 font-medium">Cihaz</th>
                  <th class="py-2 pr-2 font-medium">Durum</th>
                  <th class="py-2 pr-2 font-medium">Tahmini Ücret</th>
                  <th class="py-2 pl-2 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(r, idx) in filteredRepairs"
                  :key="r?.id || idx"
                  class="border-b last:border-0 text-slate-700 align-top hover:bg-slate-50/60"
                >
                  <td class="py-2 pr-2">
                    {{ new Date(r.createdAt).toLocaleDateString("tr-TR") }}
                  </td>
                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ r.customerName || "-" }}
                    </div>
                    <div
                      v-if="r.customerPhone"
                      class="text-[11px] text-slate-500"
                    >
                      {{ r.customerPhone }}
                    </div>
                  </td>
                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ r.deviceInfo }}
                    </div>
                    <div
                      v-if="r.problem"
                      class="text-[11px] text-slate-500 mt-1"
                    >
                      {{ r.problem }}
                    </div>
                  </td>
                  <td class="py-2 pr-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
                      :class="statusBadgeClass(r.status)"
                    >
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="py-2 pr-2">
                    <span
                      v-if="
                        r.estimatedCost !== null &&
                        r.estimatedCost !== undefined
                      "
                    >
                      {{ Number(r.estimatedCost).toLocaleString("tr-TR") }} ₺
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="py-2 pl-2 text-right">
                    <button
                      type="button"
                      @click="startEditRepair(r)"
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

    <!-- GEÇMİŞ TAMİRLER MODAL -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col text-sm"
      >
        <!-- Modal header -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b gap-2"
        >
          <div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900">
              Geçmiş Tamirler (Teslim Edilenler)
            </h3>
            <p class="text-[11px] text-slate-500">
              Teslim edilen tüm tamir kayıtları burada tutulur.
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
            v-if="filteredArchivedRepairs.length === 0"
            class="text-slate-500 text-xs sm:text-sm"
          >
            Henüz geçmiş tamir kaydı yok.
          </div>

          <div v-else class="overflow-x-auto">
            <table
              class="w-full min-w-[640px] text-left text-[11px] sm:text-xs border-collapse"
            >
              <thead>
                <tr class="border-b text-slate-500 bg-slate-50">
                  <th class="py-2 pr-2 font-medium">Tarih</th>
                  <th class="py-2 pr-2 font-medium">Müşteri</th>
                  <th class="py-2 pr-2 font-medium">Cihaz</th>
                  <th class="py-2 pr-2 font-medium">Durum</th>
                  <th class="py-2 pr-2 font-medium">Tahmini Ücret</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in filteredArchivedRepairs"
                  :key="r.id"
                  class="border-b last:border-0 text-slate-700 align-top hover:bg-slate-50/60"
                >
                  <td class="py-2 pr-2">
                    {{
                      r.deliveredAt
                        ? new Date(r.deliveredAt).toLocaleDateString("tr-TR")
                        : r.updatedAt
                        ? new Date(r.updatedAt).toLocaleDateString("tr-TR")
                        : r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("tr-TR")
                        : "-"
                    }}
                  </td>
                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ r.customerName || "-" }}
                    </div>
                    <div
                      v-if="r.customerPhone"
                      class="text-[11px] text-slate-500"
                    >
                      {{ r.customerPhone }}
                    </div>
                  </td>
                  <td class="py-2 pr-2">
                    <div class="font-semibold text-slate-800">
                      {{ r.deviceInfo }}
                    </div>
                    <div
                      v-if="r.problem"
                      class="text-[11px] text-slate-500 mt-1"
                    >
                      {{ r.problem }}
                    </div>
                  </td>
                  <td class="py-2 pr-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
                      :class="statusBadgeClass(r.status)"
                    >
                      {{ r.status || "Teslim Edildi" }}
                    </span>
                  </td>
                  <td class="py-2 pr-2">
                    <span
                      v-if="
                        r.estimatedCost !== null &&
                        r.estimatedCost !== undefined
                      "
                    >
                      {{ Number(r.estimatedCost).toLocaleString("tr-TR") }} ₺
                    </span>
                    <span v-else>-</span>
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

// Backend'ten gelen tamirler
const repairs = ref([]);
// Backend'ten gelen cihazlar (select için)
const devices = ref([]);

const selectableDevices = computed(() =>
  devices.value.filter((d) => {
    const status = d.status || "";
    // "Teslim" ile başlayanları hariç tut (küçük/büyük harf fark etmez)
    return !status.toLowerCase().startsWith("teslim");
  })
);

// Form
const repairForm = ref({
  deviceId: null,
  problem: "",
  status: "Bekliyor",
  estimatedCost: "",
  notes: "",
});

const editingRepairId = ref(null);

// UI state
const searchTerm = ref("");
const historySearchTerm = ref("");
const currentStatusFilter = ref("all"); // all | bekleyen | tamir | tamamlandi
const showHistoryModal = ref(false);

const loading = ref(false);
const saving = ref(false);
const error = ref("");

// Seçili cihaz (formdaki deviceId'den)
const selectedDevice = computed(() => {
  if (!repairForm.value.deviceId) return null;
  return devices.value.find((d) => d.id === repairForm.value.deviceId) || null;
});

// 📥 Cihazları yükle
async function loadDevices() {
  try {
    const res = await api.get("/devices");
    devices.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Cihazlar alınırken hata:", e);
    devices.value = [];
  }
}

// 📥 Tamirleri yükle
async function loadRepairs() {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/repairs");
    const raw = Array.isArray(res.data) ? res.data : [];

    // Backend'ten gelen veriyi template'te beklediğimiz forma çeviriyoruz
    repairs.value = raw.map((r) => {
      const device = r.device || null;
      const deviceInfo = device
        ? `${device.type || ""} ${device.brand || ""} ${device.model || ""}`
            .trim() || "-"
        : "-";

      return {
        ...r,
        deviceInfo,
        customerName: r.customerName || device?.customerName || "",
        customerPhone: r.phone || device?.phone || "",
        estimatedCost:
          r.price !== null && r.price !== undefined ? Number(r.price) : null,
      };
    });
  } catch (e) {
    console.error("Tamirler alınırken hata:", e);
    error.value = "Tamirler alınırken bir hata oluştu.";
    repairs.value = [];
  } finally {
    loading.value = false;
  }
}

// Sayfa açılınca cihaz + tamirleri yükle
onMounted(async () => {
  await Promise.all([loadDevices(), loadRepairs()]);
});

// 🧹 Formu sıfırla
function resetRepairForm() {
  repairForm.value = {
    deviceId: null,
    problem: "",
    status: "Bekliyor",
    estimatedCost: "",
    notes: "",
  };
  editingRepairId.value = null;
}

// 💾 Tamir kaydet / güncelle
async function saveRepair() {
  if (!repairForm.value.problem) {
    alert("Lütfen en azından arıza / sorun açıklamasını girin.");
    return;
  }

  if (!repairForm.value.deviceId) {
    alert("Lütfen bir cihaz seçin.");
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const selected = selectedDevice.value;

    let price = null;
    if (
      repairForm.value.estimatedCost !== "" &&
      repairForm.value.estimatedCost !== null
    ) {
      const n = Number(repairForm.value.estimatedCost);
      price = Number.isFinite(n) ? n : null;
    }

    const payload = {
      deviceId: repairForm.value.deviceId,
      problem: repairForm.value.problem,
      status: repairForm.value.status || "Bekliyor",
      price,
      notes: repairForm.value.notes || "",
      customerName: selected?.customerName || null,
      phone: selected?.phone || null,
    };

    console.log("Gönderilen payload:", payload);

    if (editingRepairId.value) {
      await api.put(`/repairs/${editingRepairId.value}`, payload);
    } else {
      await api.post("/repairs", payload);
    }

    await loadRepairs();
    resetRepairForm();
  } catch (e) {
    console.error("Tamir kaydedilirken hata (raw):", e);
    console.error(
      "Tamir kaydedilirken hata (response):",
      e?.response?.status,
      e?.response?.data
    );

    error.value =
      e?.response?.data?.message ||
      "Tamir kaydı kaydedilirken bir hata oluştu.";
    alert(error.value);
  } finally {
    saving.value = false;
  }
}

// ✏️ Düzenleme başlat
function startEditRepair(r) {
  editingRepairId.value = r.id || null;

  repairForm.value = {
    deviceId: r.deviceId || null,
    problem: r.problem || "",
    status: r.status || "Bekliyor",
    estimatedCost:
      r.estimatedCost !== null && r.estimatedCost !== undefined
        ? r.estimatedCost
        : "",
    notes: r.notes || "",
  };
}

// ❌ Düzenlemeyi iptal
function cancelEditRepair() {
  resetRepairForm();
}

// 🗑 Sil (şimdilik template'te buton yok ama fonksiyon dursun)
async function deleteRepair(id) {
  if (!confirm("Bu tamir kaydını silmek istediğinize emin misiniz?")) return;

  try {
    await api.delete(`/repairs/${id}`);
    repairs.value = repairs.value.filter((r) => r.id !== id);
  } catch (e) {
    console.error("Tamir silinirken hata:", e);
    alert("Tamir kaydı silinirken bir hata oluştu.");
  }
}

// 🔢 Dashboard metrikleri
const activeRepairs = computed(() =>
  repairs.value.filter((r) => r.status !== "Teslim Edildi")
);
const archivedRepairs = computed(() =>
  repairs.value.filter((r) => r.status === "Teslim Edildi")
);

const totalActiveRepairs = computed(() => activeRepairs.value.length);

const totalWaitingRepairs = computed(
  () => activeRepairs.value.filter((r) => r.status === "Bekliyor").length
);

const totalInServiceRepairs = computed(
  () =>
    activeRepairs.value.filter(
      (r) => r.status === "Serviste" || r.status === "Yedek Parça Bekleniyor"
    ).length
);

const totalArchivedRepairs = computed(() => archivedRepairs.value.length);

// 🔍 Güncel tamirler (liste) + durum filtresi + arama
const filteredRepairs = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();

  let base = activeRepairs.value;

  if (currentStatusFilter.value === "bekleyen") {
    base = base.filter((r) => r.status === "Bekliyor");
  } else if (currentStatusFilter.value === "tamir") {
    base = base.filter(
      (r) => r.status === "Serviste" || r.status === "Yedek Parça Bekleniyor"
    );
  } else if (currentStatusFilter.value === "tamamlandi") {
    base = base.filter((r) => r.status === "Tamamlandı");
  }

  if (!term) return base;

  return base.filter((r) => {
    const customer = r.customerName?.toLowerCase() || "";
    const phone = r.customerPhone?.toLowerCase() || "";
    const device = r.deviceInfo?.toLowerCase() || "";
    const problem = r.problem?.toLowerCase() || "";

    return (
      customer.includes(term) ||
      phone.includes(term) ||
      device.includes(term) ||
      problem.includes(term)
    );
  });
});

// 🔍 Geçmiş tamirler (modal içi arama)
const filteredArchivedRepairs = computed(() => {
  const term = historySearchTerm.value.trim().toLowerCase();
  const base = archivedRepairs.value;

  if (!term) return base;

  return base.filter((r) => {
    const customer = r.customerName?.toLowerCase() || "";
    const phone = r.customerPhone?.toLowerCase() || "";
    const device = r.deviceInfo?.toLowerCase() || "";
    const problem = r.problem?.toLowerCase() || "";

    return (
      customer.includes(term) ||
      phone.includes(term) ||
      device.includes(term) ||
      problem.includes(term)
    );
  });
});

// Duruma göre rozet rengi
function statusBadgeClass(status) {
  if (status === "Teslim Edildi") {
    return "bg-green-100 text-green-700 border border-green-300";
  }
  if (status === "Tamamlandı") {
    return "bg-blue-100 text-blue-700 border border-blue-300";
  }
  if (status === "Serviste" || status === "Yedek Parça Bekleniyor") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-300";
  }
  if (status === "Bekliyor") {
    return "bg-orange-100 text-orange-700 border border-orange-300";
  }
  return "bg-slate-100 text-slate-700 border border-slate-300";
}
</script>
