<template>
  <div class="pb-10">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">Cihazlar</h1>
        <p class="text-sm text-slate-500">
          Müşteri cihazlarını, durumlarını ve bilgilerini yönetin.
        </p>
      </div>

      <!-- Sağ üst: filtreler + Geçmiş cihazlar butonu -->
      <div class="flex items-center gap-3">
        <!-- Durum filtreleri -->
        <div
          class="inline-flex items-center bg-slate-100 rounded-full p-1 text-xs"
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
            Bekleyen cihazlar
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
            Tamir bekleyen
          </button>
        </div>

        <!-- Daha belirgin Geçmiş cihazlar butonu -->
        <button
          type="button"
          @click="showHistoryModal = true"
          class="text-xs px-3.5 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex items-center gap-1"
        >
          <span>Geçmiş Cihazlar</span>
        </button>
      </div>
    </header>
    <!-- 🔹 YAN YANA KÜÇÜK DASHBOARD -->
    <div class="w-full flex flex-wrap gap-4 mb-6">
      <!-- Aktif cihaz -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]"
      >
        <div
          class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg"
        >
          💼
        </div>
        <div>
          <div class="text-xs text-slate-500">Aktif</div>
          <div class="text-xl font-semibold">{{ totalActive }}</div>
        </div>
      </div>

      <!-- Bekleyen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]"
      >
        <div
          class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg"
        >
          ⏳
        </div>
        <div>
          <div class="text-xs text-slate-500">Bekleyen</div>
          <div class="text-xl font-semibold">{{ totalBekleyen }}</div>
        </div>
      </div>

      <!-- Tamir Bekleyen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]"
      >
        <div
          class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg"
        >
          🛠️
        </div>
        <div>
          <div class="text-xs text-slate-500">Tamir</div>
          <div class="text-xl font-semibold">{{ totalTamir }}</div>
        </div>
      </div>

      <!-- Teslim Edilen -->
      <div
        class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg shadow p-3 flex-1 min-w-[200px]"
      >
        <div
          class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg"
        >
          📦
        </div>
        <div>
          <div class="text-xs text-slate-500">Teslim</div>
          <div class="text-xl font-semibold">{{ totalArchived }}</div>
        </div>
      </div>
    </div>

    <!-- Ana layout: Sol form + Sağ liste -->
    <section class="flex gap-6">
      <!-- Sol: Cihaz ekleme / düzenleme formu -->
      <div class="bg-white rounded-xl shadow p-6 w-full max-w-xl text-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold">
            {{ editingDeviceId ? "Cihaz Kaydı Düzenle" : "Yeni Cihaz Kaydı" }}
          </h2>

          <span
            v-if="editingDeviceId"
            class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300"
          >
            Düzenleme modu
          </span>
        </div>

        <div class="space-y-4">
          <!-- Müşteri adı -->
          <div>
            <label class="block text-sm font-medium mb-1"> Müşteri Adı </label>
            <input
              v-model="deviceForm.customerName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Ali Yılmaz"
            />
          </div>

          <!-- Telefon -->
          <div>
            <label class="block text-sm font-medium mb-1"> Telefon </label>
            <input
              v-model="deviceForm.phone"
              type="tel"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: 05xx xxx xx xx"
            />
          </div>

          <!-- Tür / Marka / Model -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1"> Tür </label>
              <input
                v-model="deviceForm.type"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Telefon, Laptop"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1"> Marka </label>
              <input
                v-model="deviceForm.brand"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Apple, Samsung"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1"> Model </label>
              <input
                v-model="deviceForm.model"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: iPhone 11"
              />
            </div>
          </div>

          <!-- Seri numarası -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Seri Numarası
            </label>
            <input
              v-model="deviceForm.serialNumber"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: SN123456789"
            />
          </div>

          <!-- Açıklama / Not -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Açıklama / Not (isteğe bağlı)
            </label>
            <textarea
              v-model="deviceForm.description"
              rows="2"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Cihazda çizikler var, garanti dışı, müşteri yedek cihaz istemiyor..."
            ></textarea>
          </div>

          <!-- Durum -->
          <div>
            <label class="block text-sm font-medium mb-1"> Cihaz Durumu </label>
            <select
              v-model="deviceForm.status"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option>Serviste</option>
              <option>Bekliyor</option>
              <option>Yedek Parça Bekleniyor</option>
              <option>Teslim Edildi</option>
            </select>
          </div>

          <!-- Butonlar -->
          <div class="flex gap-2 mt-2">
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
      <div class="flex-1 bg-white rounded-xl shadow p-4 text-sm">
        <div class="flex items-center justify-between mb-3 gap-3">
          <h2 class="text-base font-semibold text-slate-800">
            Güncel Cihazlar
          </h2>

          <input
            v-model="searchTerm"
            type="text"
            class="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Müşteri, telefon, cihaz veya seri no ara..."
          />
        </div>

        <div v-if="filteredDevices.length === 0" class="text-slate-500">
          Henüz güncel cihaz kaydı yok veya aramaya uygun kayıt bulunamadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-500">
                <th class="py-2">Müşteri</th>
                <th class="py-2">Telefon</th>
                <th class="py-2">Cihaz</th>
                <th class="py-2">Seri No</th>
                <th class="py-2">Durum</th>
                <th class="py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in filteredDevices"
                :key="d.id"
                class="border-b last:border-0 text-slate-700 align-top"
              >
                <td class="py-2 pr-2">
                  <div class="font-semibold">
                    {{ d.customerName || "-" }}
                  </div>
                </td>

                <td class="py-2 pr-2">
                  <div class="text-[11px] text-slate-600">
                    {{ d.phone || "-" }}
                  </div>
                </td>

                <td class="py-2 pr-2">
                  <div class="font-semibold">
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

        <!-- Debug için istersen aç:
        <pre class="text-[10px] mt-4">{{ devices }}</pre>
        -->
      </div>
    </section>

    <!-- GEÇMİŞ CİHAZLAR MODAL -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col text-sm"
      >
        <!-- Modal header -->
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 class="text-base font-semibold">
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
            v-if="filteredArchivedDevices.length === 0"
            class="text-slate-500 text-sm"
          >
            Henüz geçmiş cihaz kaydı yok.
          </div>

          <div v-else>
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b text-slate-500">
                  <th class="py-2">Müşteri</th>
                  <th class="py-2">Telefon</th>
                  <th class="py-2">Cihaz</th>
                  <th class="py-2">Seri No</th>
                  <th class="py-2">Durum</th>
                  <th class="py-2">Teslim Tarihi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="d in filteredArchivedDevices"
                  :key="d.id"
                  class="border-b last:border-0 text-slate-700 align-top"
                >
                  <td class="py-2 pr-2">
                    <div class="font-semibold">
                      {{ d.customerName || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="text-[11px] text-slate-600">
                      {{ d.phone || "-" }}
                    </div>
                  </td>

                  <td class="py-2 pr-2">
                    <div class="font-semibold">
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
import { ref, computed, onMounted, watch } from "vue";

const DEVICES_STORAGE_KEY = "simge-devices";
const DEVICES_ARCHIVE_KEY = "simge-devices-archive";

const REPAIRS_STORAGE_KEY = "simge-repairs";
const REPAIRS_ARCHIVE_KEY = "simge-repairs-archive";

const devices = ref([]);           // Güncel cihazlar
const archivedDevices = ref([]);   // Geçmiş cihazlar (Teslim Edildi olanlar)

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

// 'all' | 'bekleyen' | 'tamir'
const currentStatusFilter = ref("all");

// 📥 LocalStorage'dan oku
onMounted(() => {
  try {
    const storedDevices = localStorage.getItem(DEVICES_STORAGE_KEY);
    devices.value = storedDevices ? (JSON.parse(storedDevices) || []) : [];
    if (!Array.isArray(devices.value)) devices.value = [];
  } catch (e) {
    console.error("Devices parse error:", e);
    devices.value = [];
  }

  try {
    const storedArchived = localStorage.getItem(DEVICES_ARCHIVE_KEY);
    archivedDevices.value = storedArchived
      ? (JSON.parse(storedArchived) || [])
      : [];
    if (!Array.isArray(archivedDevices.value)) archivedDevices.value = [];
  } catch (e) {
    console.error("Archived devices parse error:", e);
    archivedDevices.value = [];
  }

  // 🔄 Teslim Edildi durumundaki cihazları aktif listeden geçmişe taşı (migration)
  try {
    const stillActive = [];
    const movedToArchive = [...archivedDevices.value];

    for (const d of devices.value) {
      if (!d || typeof d !== "object") continue;

      if (d.status === "Teslim Edildi") {
        // Eğer zaten arşivde yoksa ekle
        const existsInArchive = movedToArchive.some((a) => a.id === d.id);
        if (!existsInArchive) {
          movedToArchive.push({
            ...d,
            // deliveredAt yoksa oluştur
            deliveredAt: d.deliveredAt || new Date().toISOString(),
          });
        }
      } else {
        stillActive.push(d);
      }
    }

    devices.value = stillActive;
    archivedDevices.value = movedToArchive;

    // Persist et
    localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices.value));
    localStorage.setItem(
      DEVICES_ARCHIVE_KEY,
      JSON.stringify(archivedDevices.value)
    );

    // Bu cihazlara bağlı tamirleri de kontrol et
    const deliveredIds = new Set(
      movedToArchive
        .filter((d) => d && d.id != null)
        .map((d) => d.id)
    );

    deliveredIds.forEach((id) => {
      syncRepairsForDeliveredDevice(id);
    });
  } catch (e) {
    console.error("Device migration / repair sync error:", e);
  }
});

// 💾 Değiştikçe kaydet
watch(
  devices,
  (val) => {
    localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

watch(
  archivedDevices,
  (val) => {
    localStorage.setItem(DEVICES_ARCHIVE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

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

// 💾 Cihaz kaydet / güncelle + bağlı tamirleri güncelle
function saveDevice() {
  if (!deviceForm.value.customerName || !deviceForm.value.type) {
    alert("En azından müşteri adı ve cihaz türü girilmelidir.");
    return;
  }

  const willBeDelivered = deviceForm.value.status === "Teslim Edildi";
  let deviceIdToUse = editingDeviceId.value || null;
  const now = new Date().toISOString();

  if (editingDeviceId.value) {
    // 🔁 Güncelle
    const idx = devices.value.findIndex(
      (d) => d.id === editingDeviceId.value
    );

    if (idx !== -1) {
      const updated = {
        ...devices.value[idx],
        ...deviceForm.value,
      };

      if (willBeDelivered) {
        // Aktif listeden çıkar, geçmişe taşı
        devices.value.splice(idx, 1);
        archivedDevices.value.push({
          ...updated,
          deliveredAt: updated.deliveredAt || now,
        });
      } else {
        devices.value[idx] = updated;
      }
    } else {
      // Çok uç bir durumda: aktif listede yoksa, arşivde olabilir, onu güncelleme senaryosunu şimdilik es geçiyoruz.
      console.warn("Editing device not found in active list:", editingDeviceId.value);
    }
  } else {
    // ➕ Yeni cihaz
    const newId = Date.now();
    deviceIdToUse = newId;
    const base = {
      id: newId,
      createdAt: now,
      ...deviceForm.value,
    };

    if (willBeDelivered) {
      archivedDevices.value.push({
        ...base,
        deliveredAt: base.deliveredAt || now,
      });
    } else {
      devices.value.push(base);
    }
  }

  // Eğer cihaz Teslim Edildi ise, ona bağlı tüm aktif tamirleri arşive taşı
  if (willBeDelivered && deviceIdToUse != null) {
    syncRepairsForDeliveredDevice(deviceIdToUse);
  }

  editingDeviceId.value = null;
  resetDeviceForm();
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
const totalActive = computed(() => devices.value.length);

const totalBekleyen = computed(() =>
  devices.value.filter((d) => d.status === "Bekliyor").length
);

const totalTamir = computed(() =>
  devices.value.filter(
    (d) =>
      d.status === "Serviste" ||
      d.status === "Yedek Parça Bekleniyor"
  ).length
);

const totalArchived = computed(() => archivedDevices.value.length);

const totalAllDevices = computed(() => {
  const sum = totalActive.value + totalArchived.value;
  return sum === 0 ? 1 : sum; // 0'a bölme olmasın diye
});

// 🔍 Güncel cihazlar + durum filtresi + arama
const filteredDevices = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();

  let base = devices.value;

  if (currentStatusFilter.value === "bekleyen") {
    base = base.filter((d) => d.status === "Bekliyor");
  } else if (currentStatusFilter.value === "tamir") {
    base = base.filter(
      (d) =>
        d.status === "Serviste" ||
        d.status === "Yedek Parça Bekleniyor"
    );
  }

  if (!term) return base;

  return base.filter((d) => {
    const customer = d.customerName?.toLowerCase() || "";
    const phone = d.phone?.toLowerCase() || "";
    const deviceText =
      `${d.type || ""} ${d.brand || ""} ${d.model || ""} ${
        d.serialNumber || ""
      }`.toLowerCase();
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
    const deviceText =
      `${d.type || ""} ${d.brand || ""} ${d.model || ""} ${
        d.serialNumber || ""
      }`.toLowerCase();
    const desc = d.description?.toLowerCase() || "";

    return (
      customer.includes(term) ||
      phone.includes(term) ||
      deviceText.includes(term) ||
      desc.includes(term)
    );
  });
});

// 🧩 Cihaz Teslim Edildi → Tamirleri arşive taşı
function syncRepairsForDeliveredDevice(deviceId) {
  try {
    const storedActive = localStorage.getItem(REPAIRS_STORAGE_KEY);
    const storedArchived = localStorage.getItem(REPAIRS_ARCHIVE_KEY);

    let active = [];
    let archived = [];

    if (storedActive) {
      const parsed = JSON.parse(storedActive);
      active = Array.isArray(parsed) ? parsed : [];
    }

    if (storedArchived) {
      const parsed = JSON.parse(storedArchived);
      archived = Array.isArray(parsed) ? parsed : [];
    }

    const now = new Date().toISOString();
    const remaining = [];
    const moved = [];

    for (const r of active) {
      if (!r || typeof r !== "object") continue;

      if (r.deviceId === deviceId && r.status !== "Teslim Edildi") {
        moved.push({
          ...r,
          status: "Teslim Edildi",
          updatedAt: now,
          deliveredAt: now,
        });
      } else {
        remaining.push(r);
      }
    }

    if (moved.length > 0) {
      const newArchived = [...archived, ...moved];
      localStorage.setItem(REPAIRS_STORAGE_KEY, JSON.stringify(remaining));
      localStorage.setItem(
        REPAIRS_ARCHIVE_KEY,
        JSON.stringify(newArchived)
      );
    }
  } catch (e) {
    console.error("syncRepairsForDeliveredDevice error:", e);
  }
}

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
