<template>
  <div class="pb-10">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">
          Tamirler
        </h1>
        <p class="text-sm text-slate-500">
          Cihaz tamir süreçlerini, durumlarını ve ücretlerini takip edin.
        </p>
      </div>

      <!-- Sağ üst: durum filtreleri + Geçmiş Tamirler butonu -->
      <div class="flex items-center gap-3">
        <!-- Durum filtreleri -->
        <div class="inline-flex items-center bg-slate-100 rounded-full p-1 text-xs">
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
            Bekleyen
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'tamir'"
            class="px-3 py-1 rounded-full transition"
            :class="currentStatusFilter === 'tamir'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'"
          >
            Tamirde
          </button>
          <button
            type="button"
            @click="currentStatusFilter = 'tamamlandi'"
            class="px-3 py-1 rounded-full transition"
            :class="currentStatusFilter === 'tamamlandi'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'"
          >
            Tamamlandı
          </button>
        </div>

        <!-- Geçmiş tamirler butonu -->
        <button
          type="button"
          @click="showHistoryModal = true"
          class="text-xs px-3.5 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex items-center gap-1"
        >
          <span>Geçmiş Tamirler</span>
        </button>
      </div>
    </header>

    <!-- 🔹 Mini dashboard (yan yana kutular) -->
    <div class="w-full flex flex-wrap gap-4 mb-6">
      <!-- Aktif tamirler -->
      <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]">
        <div class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg">🛠️</div>
        <div>
          <div class="text-xs text-slate-500">Aktif tamirler</div>
          <div class="text-xl font-semibold">{{ totalActiveRepairs }}</div>
        </div>
      </div>

      <!-- Bekleyen tamirler -->
      <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]">
        <div class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg">⏳</div>
        <div>
          <div class="text-xs text-slate-500">Bekleyen</div>
          <div class="text-xl font-semibold">{{ totalWaitingRepairs }}</div>
        </div>
      </div>

      <!-- Serviste / Parça bekleyen -->
      <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]">
        <div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg">🔧</div>
        <div>
          <div class="text-xs text-slate-500">Tamirde</div>
          <div class="text-xl font-semibold">{{ totalInServiceRepairs }}</div>
        </div>
      </div>

      <!-- Geçmiş tamirler -->
      <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]">
        <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg">📦</div>
        <div>
          <div class="text-xs text-slate-500">Geçmiş tamirler</div>
          <div class="text-xl font-semibold">{{ totalArchivedRepairs }}</div>
        </div>
      </div>
    </div>

    <!-- Ana layout: Sol form + Sağ liste -->
    <section class="flex gap-6">
      <!-- Sol: Tamir ekleme / düzenleme formu -->
      <div class="bg-white rounded-xl shadow p-6 w-full max-w-xl text-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold">
            {{ editingRepairId ? "Tamir Kaydı Düzenle" : "Yeni Tamir Kaydı" }}
          </h2>

          <span
            v-if="editingRepairId"
            class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300"
          >
            Düzenleme modu
          </span>
        </div>

        <div class="space-y-4">
          <!-- Cihaz seçimi -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Cihaz (kayıtlı cihazlardan seç)
            </label>

            <select
              v-model.number="repairForm.deviceId"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option :value="null" disabled>
                Cihaz seçin...
              </option>

              <option
                v-for="d in devices"
                :key="d.id"
                :value="d.id"
              >
                {{ d.customerName || "Müşteri" }} -
                {{ d.type }} {{ d.brand }} {{ d.model }}
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
            <label class="block text-sm font-medium mb-1">
              Sorun Açıklaması
            </label>
            <textarea
              v-model="repairForm.problem"
              rows="2"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Açılmıyor, ekran kırık, şarj olmuyor..."
            ></textarea>
          </div>

          <!-- Ücret + Durum -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">
                Tahmini Ücret (₺)
              </label>
              <input
                v-model="repairForm.estimatedCost"
                type="number"
                min="0"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="İsteğe bağlı"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">
                Durum
              </label>
              <select
                v-model="repairForm.status"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>Bekliyor</option>
                <option>Serviste</option>
                <option>Yedek Parça Bekleniyor</option>
                <option>Tamamlandı</option>
                <option>Teslim Edildi</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 mt-2">
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
      <div class="flex-1 bg-white rounded-xl shadow p-4 text-sm">
        <div class="flex items-center justify-between mb-3 gap-3">
          <h2 class="text-base font-semibold text-slate-800">
            Tamir Kayıtları
          </h2>

          <input
            v-model="searchTerm"
            type="text"
            class="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Müşteri, cihaz veya durum ara..."
          />
        </div>

        <div v-if="filteredRepairs.length === 0" class="text-slate-500">
          Henüz tamir kaydı yok veya aramaya uygun kayıt bulunamadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-500">
                <th class="py-2">Tarih</th>
                <th class="py-2">Müşteri</th>
                <th class="py-2">Cihaz</th>
                <th class="py-2">Durum</th>
                <th class="py-2">Tahmini Ücret</th>
                <th class="py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, idx) in filteredRepairs"
                :key="r?.id || idx"
                class="border-b last:border-0 text-slate-700 align-top"
              >
                <td class="py-2 pr-2">
                  {{ new Date(r.createdAt).toLocaleDateString("tr-TR") }}
                </td>
                <td class="py-2 pr-2">
                  <div class="font-semibold">
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
                  <div class="font-semibold">
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
                    :class="statusClass(r.status)"
                  >
                    {{ r.status }}
                  </span>
                </td>
                <td class="py-2 pr-2">
                  <span
                    v-if="r.estimatedCost !== null && r.estimatedCost !== undefined"
                  >
                    {{
                      Number(r.estimatedCost).toLocaleString("tr-TR")
                    }} ₺
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

        <!-- Debug için istersen aç:
        <pre class="text-[10px] mt-4">{{ repairs }}</pre>
        -->
      </div>
    </section>

    <!-- GEÇMİŞ TAMİRLER MODAL -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col text-sm">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 class="text-base font-semibold">
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
              class="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ara..."
            />
            <button
              type="button"
              @click="showHistoryModal = false"
              class="text-xs px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Kapat
            </button>
          </div>
        </div>

        <!-- Modal content -->
        <div class="p-4 overflow-y-auto">
          <div
            v-if="filteredArchivedRepairs.length === 0"
            class="text-slate-500 text-sm"
          >
            Henüz geçmiş tamir kaydı yok.
          </div>

          <div v-else>
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b text-slate-500">
                  <th class="py-2">Tarih</th>
                  <th class="py-2">Müşteri</th>
                  <th class="py-2">Cihaz</th>
                  <th class="py-2">Durum</th>
                  <th class="py-2">Tahmini Ücret</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in filteredArchivedRepairs"
                  :key="r.id"
                  class="border-b last:border-0 text-slate-700 align-top"
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
                    <div class="font-semibold">
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
                    <div class="font-semibold">
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
                      :class="statusClass(r.status)"
                    >
                      {{ r.status || "Teslim Edildi" }}
                    </span>
                  </td>
                  <td class="py-2 pr-2">
                    <span
                      v-if="r.estimatedCost !== null && r.estimatedCost !== undefined"
                    >
                      {{
                        Number(r.estimatedCost).toLocaleString("tr-TR")
                      }} ₺
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
import { ref, computed, onMounted, watch } from "vue";

const REPAIRS_STORAGE_KEY = "simge-repairs";
const REPAIRS_ARCHIVE_KEY = "simge-repairs-archive";
const DEVICES_STORAGE_KEY = "simge-devices";

const repairs = ref([]);          // aktif tamirler (Teslim Edildi hariç)
const archivedRepairs = ref([]);  // geçmiş tamirler (Teslim Edildi)
const devices = ref([]);          // cihazlar sadece okunuyor gibi başlıyoruz ama artık statü güncelliyoruz

const repairForm = ref({
  deviceId: null,
  problem: "",
  estimatedCost: null,
  status: "Bekliyor",
});

const editingRepairId = ref(null);
const searchTerm = ref("");
const historySearchTerm = ref("");
const showHistoryModal = ref(false);

// 'all' | 'bekleyen' | 'tamir' | 'tamamlandi'
const currentStatusFilter = ref("all");

// 📥 LocalStorage'dan oku
onMounted(() => {
  try {
    const storedDevices = localStorage.getItem(DEVICES_STORAGE_KEY);
    if (storedDevices) {
      const parsed = JSON.parse(storedDevices);
      devices.value = Array.isArray(parsed) ? parsed : [];
    } else {
      devices.value = [];
    }
  } catch (e) {
    console.error("Devices parse error in RepairsPage:", e);
    devices.value = [];
  }

  try {
    const storedArchive = localStorage.getItem(REPAIRS_ARCHIVE_KEY);
    const storedRepairs = localStorage.getItem(REPAIRS_STORAGE_KEY);

    if (storedArchive) {
      // Yeni sistem: aktif + arşiv ayrı
      const parsedActive = storedRepairs ? JSON.parse(storedRepairs) : [];
      repairs.value = Array.isArray(parsedActive) ? parsedActive : [];

      const parsedArchived = JSON.parse(storedArchive);
      archivedRepairs.value = Array.isArray(parsedArchived)
        ? parsedArchived
        : [];
    } else if (storedRepairs) {
      // Eski sistem: hepsi tek listede
      const parsed = JSON.parse(storedRepairs);
      const all = Array.isArray(parsed) ? parsed : [];
      repairs.value = all.filter((r) => r.status !== "Teslim Edildi");
      archivedRepairs.value = all.filter((r) => r.status === "Teslim Edildi");
    } else {
      repairs.value = [];
      archivedRepairs.value = [];
    }
  } catch (e) {
    console.error("Repairs parse error:", e);
    repairs.value = [];
    archivedRepairs.value = [];
  }
});

// 💾 Aktif ve geçmiş tamirleri ayrı ayrı kaydet
watch(
  repairs,
  (val) => {
    localStorage.setItem(REPAIRS_STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

watch(
  archivedRepairs,
  (val) => {
    localStorage.setItem(REPAIRS_ARCHIVE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

// ❗ YENİ: Cihazlardaki statü değişikliklerini de kaydet
watch(
  devices,
  (val) => {
    localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

// Seçili cihaz
const selectedDevice = computed(
  () =>
    devices.value.find((d) => d.id == repairForm.value.deviceId) || null
);

// 🔧 Yeni tamir ekle / mevcut tamiri güncelle
function saveRepair() {
  if (!repairForm.value.deviceId) {
    alert("Lütfen bir cihaz seçin.");
    return;
  }

  const device = devices.value.find(
    (d) => d.id == repairForm.value.deviceId
  );

  if (!device) {
    alert("Seçilen cihaz bulunamadı.");
    return;
  }

  const deviceInfoText = `${device.type || ""} ${device.brand || ""} ${
    device.model || ""
  }`.trim();

  const customerName = device.customerName || "";
  const customerPhone = device.phone || "";

  let estimated = repairForm.value.estimatedCost;
  if (
    estimated === "" ||
    estimated === null ||
    estimated === undefined
  ) {
    estimated = null;
  } else {
    estimated = Number(estimated);
    if (Number.isNaN(estimated)) {
      estimated = null;
    }
  }

  // ✅ Cihaz durumunu tamir durumuna çek
  device.status = repairForm.value.status || "Serviste";
  // (watch(devices) sayesinde bu değişiklik localStorage'a da yazılacak)

  const isDelivered = repairForm.value.status === "Teslim Edildi";

  if (editingRepairId.value) {
    // 🔁 Mevcut kaydı güncelle
    const index = repairs.value.findIndex(
      (r) => r.id === editingRepairId.value
    );
    if (index !== -1) {
      const updated = {
        ...repairs.value[index],
        customerName,
        customerPhone,
        deviceId: device.id,
        deviceInfo: deviceInfoText,
        problem: repairForm.value.problem,
        estimatedCost: estimated,
        status: repairForm.value.status,
        updatedAt: new Date().toISOString(),
      };

      if (isDelivered) {
        repairs.value.splice(index, 1);
        archivedRepairs.value.push({
          ...updated,
          deliveredAt: new Date().toISOString(),
        });
      } else {
        repairs.value[index] = updated;
      }
    }
  } else {
    // ➕ Yeni kayıt ekle
    const base = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      deviceId: device.id,
      deviceInfo: deviceInfoText,
      problem: repairForm.value.problem,
      estimatedCost: estimated,
      status: repairForm.value.status,
    };

    if (isDelivered) {
      archivedRepairs.value.push({
        ...base,
        deliveredAt: new Date().toISOString(),
      });
    } else {
      repairs.value.push(base);
    }
  }

  // Formu sıfırla
  editingRepairId.value = null;
  repairForm.value = {
    deviceId: null,
    problem: "",
    estimatedCost: null,
    status: "Bekliyor",
  };
}

// ✏️ Düzenleme başlat
function startEditRepair(repair) {
  editingRepairId.value = repair.id;
  repairForm.value = {
    deviceId: repair.deviceId ?? null,
    problem: repair.problem ?? "",
    estimatedCost:
      repair.estimatedCost === null || repair.estimatedCost === undefined
        ? null
        : repair.estimatedCost,
    status: repair.status || "Bekliyor",
  };
}

// ❌ Düzenlemeyi iptal et
function cancelEditRepair() {
  editingRepairId.value = null;
  repairForm.value = {
    deviceId: null,
    problem: "",
    estimatedCost: null,
    status: "Bekliyor",
  };
}

// 🔢 Dashboard metrikleri
const totalActiveRepairs = computed(() => repairs.value.length);

const totalWaitingRepairs = computed(
  () => repairs.value.filter((r) => r.status === "Bekliyor").length
);

const totalInServiceRepairs = computed(
  () =>
    repairs.value.filter(
      (r) =>
        r.status === "Serviste" ||
        r.status === "Yedek Parça Bekleniyor"
    ).length
);

const totalArchivedRepairs = computed(
  () => archivedRepairs.value.length
);

// 🔍 Filtrelenmiş aktif tamirler
const filteredRepairs = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();

  let base = repairs.value;

  // Duruma göre filtre
  if (currentStatusFilter.value === "bekleyen") {
    base = base.filter((r) => r.status === "Bekliyor");
  } else if (currentStatusFilter.value === "tamir") {
    base = base.filter(
      (r) =>
        r.status === "Serviste" ||
        r.status === "Yedek Parça Bekleniyor"
    );
  } else if (currentStatusFilter.value === "tamamlandi") {
    base = base.filter((r) => r.status === "Tamamlandı");
  }

  if (!term) return base;

  return base.filter((r) => {
    const customer = r.customerName?.toLowerCase() || "";
    const device = r.deviceInfo?.toLowerCase() || "";
    const status = r.status?.toLowerCase() || "";
    const problem = r.problem?.toLowerCase() || "";
    return (
      customer.includes(term) ||
      device.includes(term) ||
      status.includes(term) ||
      problem.includes(term)
    );
  });
});

// 🔍 Filtrelenmiş geçmiş tamirler
const filteredArchivedRepairs = computed(() => {
  const term = historySearchTerm.value.trim().toLowerCase();
  const base = archivedRepairs.value;

  if (!term) return base;

  return base.filter((r) => {
    const customer = r.customerName?.toLowerCase() || "";
    const device = r.deviceInfo?.toLowerCase() || "";
    const status = r.status?.toLowerCase() || "";
    const problem = r.problem?.toLowerCase() || "";
    return (
      customer.includes(term) ||
      device.includes(term) ||
      status.includes(term) ||
      problem.includes(term)
    );
  });
});

// Duruma göre badge rengi
function statusClass(status) {
  if (status === "Tamamlandı" || status === "Teslim Edildi") {
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
