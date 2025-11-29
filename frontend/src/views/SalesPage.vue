<template>
  <div class="pb-24 min-h-[130vh]">
    <!-- Üst başlık -->
    <header
      class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-slate-800">
          Satış Yap
        </h1>
        <p class="text-xs md:text-sm text-slate-500">
          {{ settings.companyName }} - Satış ve ciro takibi
        </p>
      </div>

      <div class="text-[11px] md:text-xs text-slate-500 md:text-right">
        <div>
          Kullanıcı:
          <span class="font-medium text-slate-700">
            {{ settings.userName }}
          </span>
        </div>
        <div>
          Tarih:
          <span class="font-medium text-slate-700">
            {{ todayReadable }}
          </span>
        </div>
      </div>
    </header>

    <!-- Özet kartlar -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-[11px] md:text-xs text-slate-500 mb-1">
          Bugünkü Satış Adedi
        </p>
        <p class="text-xl md:text-2xl font-semibold text-slate-800">
          {{ todaySalesCount }}
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-[11px] md:text-xs text-slate-500 mb-1">
          Bugünkü Ciro
        </p>
        <p class="text-xl md:text-2xl font-semibold text-slate-800">
          {{ todaySalesTotal.toLocaleString("tr-TR") }} ₺
        </p>
      </div>

      <!-- Geçmiş satışlar kartı -->
      <div
        class="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
      >
        <div>
          <p class="text-[11px] md:text-xs text-slate-500 mb-1">
            Geçmiş Satışlar
          </p>
          <p class="text-[11px] text-slate-500">
            Ürün, müşteri ve tarihe göre geçmiş satış kayıtlarını inceleyin.
          </p>
        </div>

        <button
          @click="showHistoryModal = true"
          class="mt-3 w-full text-xs px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
        >
          Geçmiş satışları gör
        </button>
      </div>
    </section>

    <!-- Ana layout: Satış formu + Bugünkü satışlar -->
    <section class="flex flex-col lg:flex-row gap-6">
      <!-- Satış formu -->
      <div class="bg-white rounded-xl shadow p-4 sm:p-6 w-full lg:max-w-xl">
        <h2 class="text-base sm:text-lg font-semibold mb-4">Satış Ekle</h2>

        <div class="space-y-4 text-sm">
          <!-- Ürün adı -->
          <div>
            <label class="block text-sm font-medium mb-1"> Ürün Seç </label>
            <select
              v-model.number="saleForm.productId"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option :value="null" disabled>Ürün seçin...</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }} (Stok: {{ p.quantity }})
              </option>
            </select>
            <p
              class="mt-1 text-[11px] text-slate-500"
              v-if="products.length === 0"
            >
              Henüz ürün eklenmemiş. Önce "Ürünler" sayfasından ürün ekleyin.
            </p>
          </div>

          <!-- Adet & fiyat -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Adet</label>
              <input
                v-model.number="saleForm.quantity"
                type="number"
                min="1"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">
                Satış Fiyatı (₺)
              </label>
              <input
                v-model.number="saleForm.price"
                type="number"
                min="1"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Müşteri -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Müşteri Adı Soyadı
            </label>
            <input
              v-model="saleForm.customer"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="İsteğe bağlı"
            />
          </div>

          <!-- Kaydet butonu -->
          <button
            @click="addSale"
            class="w-full mt-2 bg-green-600 text-white font-medium py-2.5 rounded-md text-sm hover:bg-green-700 active:scale-[0.99] transition"
          >
            Satışı Kaydet
          </button>
        </div>
      </div>

      <!-- Bugünkü satışlar -->
      <div class="flex-1 bg-white rounded-xl shadow p-3 sm:p-4 text-sm">
        <h2 class="text-sm sm:text-base font-semibold text-slate-800 mb-3">
          Bugünkü Satışlar
        </h2>

        <div
          v-if="todaySales.length === 0"
          class="text-slate-500 text-xs sm:text-sm"
        >
          Bugün henüz satış yapılmadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <!-- Mobilde yatay kaydırılabilir tablo -->
          <div class="overflow-x-auto">
            <table
              class="w-full min-w-[720px] text-left text-[11px] sm:text-xs border-collapse"
            >
              <thead>
                <tr class="border-b text-slate-500">
                  <th class="py-2 pr-2">Tarih</th>
                  <th class="py-2 pr-2">Saat</th>
                  <th class="py-2 pr-2">Ürün</th>
                  <th class="py-2 pr-2">Adet</th>
                  <th class="py-2 pr-2">Satış Fiyatı</th>
                  <th class="py-2 pr-2">Müşteri</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="sale in todaySales"
                  :key="sale.id"
                  class="border-b last:border-0 text-slate-700"
                >
                  <td class="py-2 pr-2">
                    {{ new Date(sale.date).toLocaleDateString("tr-TR") }}
                  </td>
                  <td class="py-2 pr-2">
                    {{
                      new Date(sale.date).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                  </td>
                  <td class="py-2 pr-2">{{ sale.productName }}</td>
                  <td class="py-2 pr-2">{{ sale.quantity }}</td>
                  <td class="py-2 pr-2">
                    {{ sale.price.toLocaleString("tr-TR") }} ₺
                  </td>
                  <td class="py-2 pr-2">{{ sale.customer || "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- Son 7 Günlük Satış Raporu + Grafik -->
    <section
      class="mt-8 bg-white rounded-xl shadow p-3 sm:p-4 text-sm min-h-[550px]"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
      >
        <h2 class="text-sm sm:text-base font-semibold text-slate-800">
          Son 7 Günlük Satış Raporu
        </h2>

        <p class="text-[11px] sm:text-xs text-slate-500">
          Bu ay toplam ciro:
          <span class="font-semibold text-slate-800">
            {{ currentMonthTotal.toLocaleString("tr-TR") }} ₺
          </span>
        </p>
      </div>

      <div
        v-if="last7DaysReports.length === 0"
        class="text-slate-500 text-xs sm:text-sm"
      >
        Henüz raporlanacak satış bulunmuyor.
      </div>

      <template v-else>
        <div class="overflow-x-auto">
          <table
            class="w-full min-w-[720px] text-left text-[11px] sm:text-xs border-collapse"
          >
            <!-- Buraya kendi tablo thead/tbody yapın, orijinalinle aynı kalsın -->
            <!-- ... -->
          </table>
        </div>

        <div class="mt-6 border-t pt-4">
          <h3 class="text-xs font-semibold text-slate-700 mb-2">
            Ciro grafiği (son 7 gün)
          </h3>
          <div class="h-32 md:h-40">
            <BarChart :chartData="barChartData" :options="barChartOptions" />
          </div>
        </div>
      </template>
    </section>
  </div>

  <!-- 🧾 Geçmiş satışlar modalı -->
  <div
    v-if="showHistoryModal"
    class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 px-2"
  >
    <div
      class="bg-white rounded-xl shadow-lg w-full max-w-4xl mt-16 mx-auto p-4 text-sm"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
      >
        <h3 class="text-sm sm:text-base font-semibold text-slate-800">
          Geçmiş Satışlar
        </h3>
        <button
          @click="showHistoryModal = false"
          class="self-start sm:self-auto text-[11px] sm:text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          Kapat
        </button>
      </div>

      <!-- Filtreler -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label class="block text-[11px] text-slate-500 mb-1">
            Ürün adı
          </label>
          <input
            v-model="historyFilters.product"
            type="text"
            class="w-full border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Örn: Laptop"
          />
        </div>

        <div>
          <label class="block text-[11px] text-slate-500 mb-1">
            Müşteri adı
          </label>
          <input
            v-model="historyFilters.customer"
            type="text"
            class="w-full border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Örn: Ahmet"
          />
        </div>

        <div>
          <label class="block text-[11px] text-slate-500 mb-1">
            Başlangıç tarihi
          </label>
          <input
            v-model="historyFilters.startDate"
            type="date"
            class="w-full border rounded-md px-2 py-1 text-[11px] sm:text-xs border-slate-300"
          />
        </div>

        <div>
          <label class="block text-[11px] text-slate-500 mb-1">
            Bitiş tarihi
          </label>
          <input
            v-model="historyFilters.endDate"
            type="date"
            class="w-full border rounded-md px-2 py-1 text-[11px] sm:text-xs border-slate-300"
          />
        </div>
      </div>

      <!-- Liste -->
      <div
        v-if="filteredHistorySales.length === 0"
        class="text-slate-500 text-xs sm:text-sm"
      >
        Filtrelere uygun satış bulunamadı.
      </div>

      <div v-else class="max-h-80 overflow-y-auto">
        <div class="overflow-x-auto">
          <table
            class="w-full min-w-[720px] text-left text-[11px] sm:text-xs border-collapse"
          >
            <thead>
              <tr class="border-b text-slate-500">
                <th class="py-2 pr-2">Tarih</th>
                <th class="py-2 pr-2">Saat</th>
                <th class="py-2 pr-2">Ürün</th>
                <th class="py-2 pr-2">Adet</th>
                <th class="py-2 pr-2">Satış Fiyatı</th>
                <th class="py-2 pr-2">Toplam</th>
                <th class="py-2 pr-2">Müşteri</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sale in filteredHistorySales"
                :key="sale.id"
                class="border-b last:border-0 text-slate-700"
              >
                <td class="py-2 pr-2">
                  {{ new Date(sale.date).toLocaleDateString("tr-TR") }}
                </td>
                <td class="py-2 pr-2">
                  {{
                    new Date(sale.date).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </td>
                <td class="py-2 pr-2">{{ sale.productName }}</td>
                <td class="py-2 pr-2">{{ sale.quantity }}</td>
                <td class="py-2 pr-2">
                  {{ (sale.price || 0).toLocaleString("tr-TR") }} ₺
                </td>
                <td class="py-2 pr-2">
                  {{
                    ((sale.price || 0) * (sale.quantity || 0)).toLocaleString(
                      "tr-TR"
                    )
                  }}
                  ₺
                </td>
                <td class="py-2 pr-2">{{ sale.customer || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api/client";
import { BarChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// 🔹 Ayarlar (localStorage)
const SETTINGS_STORAGE_KEY = "simge-settings";

const settings = ref({
  companyName: "Simge Bilgisayar",
  userName: "Fatih",
});

const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
if (storedSettings) {
  try {
    const parsed = JSON.parse(storedSettings);
    settings.value = {
      ...settings.value,
      ...parsed,
    };
  } catch (e) {
    console.error("Settings parse error:", e);
  }
}

// 🔹 Ürünler ve satışlar
const products = ref([]);
const sales = ref([]);

// UI state
const loading = ref(false);
const saving = ref(false);
const error = ref("");

const showHistoryModal = ref(false);

const historyFilters = ref({
  product: "",
  customer: "",
  startDate: "",
  endDate: "",
});

// 📥 ÜRÜNLERİ YÜKLE
async function loadProducts() {
  try {
    const res = await api.get("/products");
    products.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("Ürünler alınırken hata:", e);
    products.value = [];
  }
}

// 📥 SATIŞLARI YÜKLE
async function loadSales() {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/sales");
    const raw = Array.isArray(res.data) ? res.data : [];

    sales.value = raw.map((s) => {
      const productName =
        s.productName ||
        s.product?.name ||
        s.productTitle ||
        s.itemName ||
        "";

      return {
        ...s,
        productName,
        quantity: s.quantity != null ? s.quantity : 1,
        price:
          s.price != null
            ? Number(s.price)
            : s.totalPrice != null
            ? Number(s.totalPrice)
            : 0,
        date: s.date || s.createdAt,
        customer: s.customer || s.customerName || "",
      };
    });
  } catch (e) {
    console.error("Satışlar alınırken hata:", e);
    error.value = "Satışlar alınırken bir hata oluştu.";
    sales.value = [];
  } finally {
    loading.value = false;
  }
}

// İlk yükleme
onMounted(async () => {
  await Promise.all([loadProducts(), loadSales()]);
});

// 🟩 SATIŞ FORMU
const saleForm = ref({
  productId: null,
  quantity: 1,
  price: null,
  customer: "",
});

// 🧾 Geçmiş satışlar (modal) – filtreli liste
const filteredHistorySales = computed(() => {
  let list = [...sales.value];

  const product = historyFilters.value.product.trim().toLowerCase();
  const customer = historyFilters.value.customer.trim().toLowerCase();
  const start = historyFilters.value.startDate;
  const end = historyFilters.value.endDate;

  if (product) {
    list = list.filter((s) =>
      (s.productName || "").toLowerCase().includes(product)
    );
  }

  if (customer) {
    list = list.filter((s) =>
      (s.customer || "").toLowerCase().includes(customer)
    );
  }

  if (start) {
    list = list.filter((s) => s.date && s.date.slice(0, 10) >= start);
  }

  if (end) {
    list = list.filter((s) => s.date && s.date.slice(0, 10) <= end);
  }

  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
});

// 🔹 SATIŞ KAYDET (backend'e gönder)
async function addSale() {
  if (!saleForm.value.productId) {
    alert("Lütfen bir ürün seçin.");
    return;
  }
  if (!saleForm.value.price) {
    alert("Lütfen satış fiyatını girin.");
    return;
  }

  const qty = saleForm.value.quantity || 1;

  saving.value = true;
  error.value = "";

  try {
    const payload = {
      productId: saleForm.value.productId,
      quantity: qty,
      price: Number(saleForm.value.price),
      customer: saleForm.value.customer || null,
    };

    console.log("Gönderilen satış payload:", payload);

    await api.post("/sales", payload);

    // Satış başarılı -> hem satışları hem ürünleri (stok) tazele
    await Promise.all([loadSales(), loadProducts()]);

    // Formu sıfırla
    saleForm.value = {
      productId: null,
      quantity: 1,
      price: null,
      customer: "",
    };
  } catch (e) {
    console.error("Satış kaydedilirken hata:", e);
    error.value =
      e?.response?.data?.message ||
      "Satış kaydı kaydedilirken bir hata oluştu.";
    alert(error.value);
  } finally {
    saving.value = false;
  }
}

// 🟧 Bugünkü satışlar / özetler
const todayStr = new Date().toISOString().slice(0, 10);

const todaySales = computed(() =>
  sales.value.filter((s) => s.date && s.date.slice(0, 10) === todayStr)
);

const todaySalesCount = computed(() => todaySales.value.length);

const todaySalesTotal = computed(() =>
  todaySales.value.reduce(
    (sum, s) => sum + (s.price || 0) * (s.quantity || 0),
    0
  )
);

// okunabilir tarih
const todayReadable = computed(() => new Date().toLocaleDateString("tr-TR"));

// 🔹 Günlük raporlar (tarihe göre gruplanmış)
const dailyReports = computed(() => {
  const map = new Map();

  for (const s of sales.value) {
    if (!s.date) continue;
    const d = s.date.slice(0, 10); // YYYY-MM-DD

    if (!map.has(d)) {
      map.set(d, { date: d, count: 0, total: 0 });
    }

    const r = map.get(d);
    r.count += 1;
    r.total += (s.price || 0) * (s.quantity || 0);
  }

  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
});

// 🔹 Son 7 gün
const last7DaysReports = computed(() => dailyReports.value.slice(0, 7));

// 📊 Grafik label & data
const chartLabels = computed(() =>
  last7DaysReports.value
    .map((r) => new Date(r.date).toLocaleDateString("tr-TR"))
    .reverse()
);

const chartData = computed(() =>
  last7DaysReports.value.map((r) => r.total).reverse()
);

const barChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: "Günlük Ciro (₺)",
      data: chartData.value,
      backgroundColor: "rgba(59, 130, 246, 0.6)",
      borderRadius: 6,
      maxBarThickness: 30,
    },
  ],
}));

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 10,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 10,
        },
      },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      labels: {
        font: {
          size: 10,
        },
      },
    },
  },
};

// 🔹 Bu ay toplam ciro
const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"

const currentMonthTotal = computed(() =>
  sales.value.reduce((sum, s) => {
    if (!s.date) return sum;
    return s.date.slice(0, 7) === currentMonthKey
      ? sum + (s.price || 0) * (s.quantity || 0)
      : sum;
  }, 0)
);
</script>


