<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-amber-50/40 px-3 py-4 md:px-6 md:py-8"
  >
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- ÜST BAŞLIK -->
      <header
        class="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/70 border border-emerald-200 text-[11px] text-emerald-700 mb-2"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Firma Paneli • Genel Bakış
          </p>
          <h1 class="text-xl md:text-2xl font-semibold text-slate-900">
            Genel Bakış
          </h1>
          <p class="text-xs md:text-sm text-slate-600">
            Günlük, haftalık ve aylık hareketlerin özetini buradan takip edin.
          </p>
        </div>
      </header>

      <!-- 1) GELİR BÖLÜMÜ -->
      <section
        class="bg-white/90 border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 space-y-4"
      >
        <!-- Başlık + range selector + ay seçimi -->
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 class="text-sm sm:text-base font-semibold text-slate-900">
              Satış Geliri
            </h2>
            <p class="text-[11px] text-slate-500">
              Günlük, haftalık ve aylık bazda toplam satış gelirini gösterir.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 items-center justify-end">
            <div
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[11px]"
            >
              <button
                v-for="range in ranges"
                :key="range.value"
                type="button"
                class="px-2.5 py-1 rounded-full transition"
                :class="
                  revenueRange === range.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                "
                @click="revenueRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>

            <div v-if="revenueRange === 'monthly'" class="ml-1">
              <select
                v-model="revenueMonth"
                class="border border-slate-300 rounded-md px-2 py-1 text-[11px] bg-white"
              >
                <option
                  v-for="m in months"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Özet + Grafik -->
        <div class="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-4 items-stretch">
          <!-- Sol: Özet rakam -->
          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
          >
            <div>
              <p class="text-[11px] text-slate-500 mb-1">
                Seçili dönemde toplam gelir
              </p>
              <p class="text-2xl font-semibold text-slate-900">
                ₺{{ formattedRevenueTotal }}
              </p>
              <p class="text-[11px] text-slate-500 mt-1">
                {{
                  revenueRange === 'daily'
                    ? 'Son 7 gün temel alınarak'
                    : revenueRange === 'weekly'
                    ? 'Son 4 hafta temel alınarak'
                    : 'Seçili ay içerisindeki günler baz alınarak'
                }}
              </p>
            </div>
            <p class="mt-3 text-[11px] text-emerald-600">
              Bu alanı ileride “geçen dönemle kıyasla %X artış” gibi verilerle
              zenginleştirebiliriz.
            </p>
          </div>

          <!-- Sağ: Grafik -->
          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-[11px] font-medium text-slate-600">
                {{
                  revenueRange === 'daily'
                    ? 'Günlük dağılım (son 7 gün)'
                    : revenueRange === 'weekly'
                    ? 'Haftalık dağılım (son 4 hafta)'
                    : 'Aylık dağılım (seçili ay)'
                }}
              </p>
              <p class="text-[10px] text-slate-400">
                Chart.js ile sütun grafik
              </p>
            </div>

            <div class="flex-1 flex flex-col justify-end">
              <BarChart
                v-if="revenueChartPoints.length"
                :chartData="revenueChartData"
                :options="chartOptions"
                :height="CHART_HEIGHT"
              />
              <div
                v-else
                class="h-[120px] flex items-center justify-center text-[11px] text-slate-400"
              >
                Bu aralıkta gelir verisi bulunamadı.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2) STOKTAN ÇIKAN BÖLÜMÜ -->
      <section
        class="bg-white/90 border border-slate-200 rounded-xl shadow-sm p-3 sm:p-4 space-y-4"
      >
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 class="text-sm sm:text-base font-semibold text-slate-900">
              Stoktan Çıkan Ürünler
            </h2>
            <p class="text-[11px] text-slate-500">
              Satış veya tamir nedeniyle stoktan düşen ürün adetleri.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 items-center justify-end">
            <div
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[11px]"
            >
              <button
                v-for="range in ranges"
                :key="range.value"
                type="button"
                class="px-2.5 py-1 rounded-full transition"
                :class="
                  stockOutRange === range.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                "
                @click="stockOutRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>

            <div v-if="stockOutRange === 'monthly'" class="ml-1">
              <select
                v-model="stockOutMonth"
                class="border border-slate-300 rounded-md px-2 py-1 text-[11px] bg-white"
              >
                <option
                  v-for="m in months"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-4 items-stretch">
          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
          >
            <div>
              <p class="text-[11px] text-slate-500 mb-1">
                Seçili dönemde stoktan çıkan toplam
              </p>
              <p class="text-2xl font-semibold text-slate-900">
                {{ stockOutTotal }} adet
              </p>
            </div>
            <p class="mt-3 text-[11px] text-slate-500">
              İleride “en çok çıkan ilk 3 ürün” gibi bir liste eklenebilir.
            </p>
          </div>

          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-[11px] font-medium text-slate-600">
                Stoktan çıkış dağılımı
              </p>
            </div>

            <div class="flex-1 flex flex-col justify-end">
              <BarChart
                v-if="stockOutChartPoints.length"
                :chartData="stockOutChartData"
                :options="chartOptions"
                :height="CHART_HEIGHT"
              />
              <div
                v-else
                class="h-[120px] flex items-center justify-center text-[11px] text-slate-400"
              >
                Bu aralıkta stoktan çıkış verisi bulunamadı.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3) STOĞA GİREN BÖLÜMÜ -->
      <section
        class="bg-white/90 border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 space-y-4"
      >
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 class="text-sm sm:text-base font-semibold text-slate-900">
              Stoğa Giren Ürünler
            </h2>
            <p class="text-[11px] text-slate-500">
              Tedarik veya satın alma ile stoğa eklenen ürün adetleri.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 items-center justify-end">
            <div
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[11px]"
            >
              <button
                v-for="range in ranges"
                :key="range.value"
                type="button"
                class="px-2.5 py-1 rounded-full transition"
                :class="
                  stockInRange === range.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                "
                @click="stockInRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>

            <div v-if="stockInRange === 'monthly'" class="ml-1">
              <select
                v-model="stockInMonth"
                class="border border-slate-300 rounded-md px-2 py-1 text-[11px] bg-white"
              >
                <option
                  v-for="m in months"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-4 items-stretch">
          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
          >
            <div>
              <p class="text-[11px] text-slate-500 mb-1">
                Seçili dönemde stoğa giren toplam
              </p>
              <p class="text-2xl font-semibold text-slate-900">
                {{ stockInTotal }} adet
              </p>
            </div>
            <p class="mt-3 text-[11px] text-slate-500">
              İleride satın alma maliyetleriyle birleştirip “toplam alış
              maliyeti” de hesaplanabilir.
            </p>
          </div>

          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-[11px] font-medium text-slate-600">
                Stoğa giriş dağılımı
              </p>
            </div>

            <div class="flex-1 flex flex-col justify-end">
              <BarChart
                v-if="stockInChartPoints.length"
                :chartData="stockInChartData"
                :options="chartOptions"
                :height="CHART_HEIGHT"
              />
              <div
                v-else
                class="h-[120px] flex items-center justify-center text-[11px] text-slate-400"
              >
                Bu aralıkta stoğa giriş verisi bulunamadı.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4) TAMİRLER BÖLÜMÜ -->
      <section
        class="bg-white/90 border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 space-y-4"
      >
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 class="text-sm sm:text-base font-semibold text-slate-900">
              Tamir Kayıtları
            </h2>
            <p class="text-[11px] text-slate-500">
              Açılan tamir kayıtlarının dönemsel dağılımı.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 items-center justify-end">
            <div
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[11px]"
            >
              <button
                v-for="range in ranges"
                :key="range.value"
                type="button"
                class="px-2.5 py-1 rounded-full transition"
                :class="
                  repairRange === range.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                "
                @click="repairRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>

            <div v-if="repairRange === 'monthly'" class="ml-1">
              <select
                v-model="repairMonth"
                class="border border-slate-300 rounded-md px-2 py-1 text-[11px] bg-white"
              >
                <option
                  v-for="m in months"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-4 items-stretch">
          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
          >
            <div>
              <p class="text-[11px] text-slate-500 mb-1">
                Seçili dönemde toplam tamir kaydı
              </p>
              <p class="text-2xl font-semibold text-slate-900">
                {{ repairTotal }} adet
              </p>
            </div>
            <p class="mt-3 text-[11px] text-slate-500">
              İleride “bekleyen / tamamlanan” gibi durum bazlı dağılım da
              eklenebilir.
            </p>
          </div>

          <div
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-[11px] font-medium text-slate-600">
                Tamir kayıtlarının dağılımı
              </p>
            </div>

            <div class="flex-1 flex flex-col justify-end">
              <BarChart
                v-if="repairChartPoints.length"
                :chartData="repairChartData"
                :options="chartOptions"
                :height="CHART_HEIGHT"
              />
              <div
                v-else
                class="h-[120px] flex items-center justify-center text-[11px] text-slate-400"
              >
                Bu aralıkta tamir verisi bulunamadı.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "../api/client";
import { BarChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

// Chart.js sadece 1 kere register olsun
if (!Chart._fatihRegistered) {
  Chart.register(...registerables);
  Chart._fatihRegistered = true;
}

// TÜM GRAFİKLERİN YÜKSEKLİĞİ (px)
const CHART_HEIGHT = 210;

// Ortak range seçenekleri
const ranges = [
  { value: "daily", label: "Günlük" },
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
];

// Ay seçimi
const months = [
  { value: "2025-01", label: "Ocak 2025" },
  { value: "2024-12", label: "Aralık 2024" },
  { value: "2024-11", label: "Kasım 2024" },
  { value: "2024-10", label: "Ekim 2024" },
];

const WEEK_LABELS = ["1. Hf", "2. Hf", "3. Hf", "4. Hf"];
const WEEKDAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

//
// 1) GELİR
//
const revenueRange = ref("daily");
const revenueMonth = ref(months[0]?.value || "2025-01");
const revenueLoading = ref(false);
const revenueData = ref({
  daily: [],
  weekly: [],
  monthly: {},
});

async function loadRevenue() {
  try {
    revenueLoading.value = true;

    const params = { range: revenueRange.value };
    if (revenueRange.value === "monthly") {
      params.month = revenueMonth.value;
    }

    const res = await api.get("/company/dashboard/revenue", { params });
    const points = res.data.points || [];

    if (revenueRange.value === "daily") {
      revenueData.value.daily = points;
    } else if (revenueRange.value === "weekly") {
      revenueData.value.weekly = points;
    } else if (revenueRange.value === "monthly") {
      if (!revenueData.value.monthly) {
        revenueData.value.monthly = {};
      }
      revenueData.value.monthly[revenueMonth.value] = points;
    }
  } catch (err) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        "Gelir verileri alınırken bir hata oluştu."
    );
  } finally {
    revenueLoading.value = false;
  }
}

const revenueChartPoints = computed(() => {
  if (revenueRange.value === "monthly") {
    return revenueData.value.monthly?.[revenueMonth.value] || [];
  }
  return revenueData.value[revenueRange.value] || [];
});

const revenueTotal = computed(() =>
  revenueChartPoints.value.reduce((sum, p) => sum + (p.value || 0), 0)
);

const formattedRevenueTotal = computed(() =>
  revenueTotal.value.toLocaleString("tr-TR")
);

//
// 2) STOKTAN ÇIKAN
//
const stockOutRange = ref("daily");
const stockOutMonth = ref(months[0]?.value || "2025-01");
const stockOutLoading = ref(false);

const stockOutData = ref({
  daily: [],
  weekly: [],
  monthly: {},
});

async function loadStockOut() {
  try {
    stockOutLoading.value = true;

    const params = { range: stockOutRange.value };
    if (stockOutRange.value === "monthly") {
      params.month = stockOutMonth.value;
    }

    const res = await api.get("/company/dashboard/stock-out", { params });
    const points = res.data.points || [];

    if (stockOutRange.value === "daily") {
      stockOutData.value.daily = points;
    } else if (stockOutRange.value === "weekly") {
      stockOutData.value.weekly = points;
    } else if (stockOutRange.value === "monthly") {
      if (!stockOutData.value.monthly) {
        stockOutData.value.monthly = {};
      }
      stockOutData.value.monthly[stockOutMonth.value] = points;
    }
  } catch (err) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        "Stoktan çıkan verileri alınırken bir hata oluştu."
    );
  } finally {
    stockOutLoading.value = false;
  }
}

const stockOutChartPoints = computed(() => {
  if (stockOutRange.value === "monthly") {
    return stockOutData.value.monthly?.[stockOutMonth.value] || [];
  }
  return stockOutData.value[stockOutRange.value] || [];
});

const stockOutTotal = computed(() =>
  stockOutChartPoints.value.reduce((sum, p) => sum + (p.value || 0), 0)
);

//
// 3) STOĞA GİREN
//
const stockInRange = ref("daily");
const stockInMonth = ref(months[0]?.value || "2025-01");
const stockInLoading = ref(false);

const stockInData = ref({
  daily: [],
  weekly: [],
  monthly: {},
});

async function loadStockIn() {
  try {
    stockInLoading.value = true;

    const params = { range: stockInRange.value };
    if (stockInRange.value === "monthly") {
      params.month = stockInMonth.value;
    }

    const res = await api.get("/company/dashboard/stock-in", { params });
    const points = res.data.points || [];

    if (stockInRange.value === "daily") {
      stockInData.value.daily = points;
    } else if (stockInRange.value === "weekly") {
      stockInData.value.weekly = points;
    } else if (stockInRange.value === "monthly") {
      if (!stockInData.value.monthly) {
        stockInData.value.monthly = {};
      }
      stockInData.value.monthly[stockInMonth.value] = points;
    }
  } catch (err) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        "Stoğa giren verileri alınırken bir hata oluştu."
    );
  } finally {
    stockInLoading.value = false;
  }
}

const stockInChartPoints = computed(() => {
  if (stockInRange.value === "monthly") {
    return stockInData.value.monthly?.[stockInMonth.value] || [];
  }
  return stockInData.value[stockInRange.value] || [];
});

const stockInTotal = computed(() =>
  stockInChartPoints.value.reduce((sum, p) => sum + (p.value || 0), 0)
);

//
// 4) TAMİRLER
//
const repairRange = ref("daily");
const repairMonth = ref(months[0]?.value || "2025-01");
const repairLoading = ref(false);

const repairData = ref({
  daily: [],
  weekly: [],
  monthly: {},
});

async function loadRepairs() {
  try {
    repairLoading.value = true;

    const params = { range: repairRange.value };
    if (repairRange.value === "monthly") {
      params.month = repairMonth.value;
    }

    const res = await api.get("/company/dashboard/repairs", { params });
    const points = res.data.points || [];

    if (repairRange.value === "daily") {
      repairData.value.daily = points;
    } else if (repairRange.value === "weekly") {
      repairData.value.weekly = points;
    } else if (repairRange.value === "monthly") {
      if (!repairData.value.monthly) {
        repairData.value.monthly = {};
      }
      repairData.value.monthly[repairMonth.value] = points;
    }
  } catch (err) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        "Tamir verileri alınırken bir hata oluştu."
    );
  } finally {
    repairLoading.value = false;
  }
}

const repairChartPoints = computed(() => {
  if (repairRange.value === "monthly") {
    return repairData.value.monthly?.[repairMonth.value] || [];
  }
  return repairData.value[repairRange.value] || [];
});

const repairTotal = computed(() =>
  repairChartPoints.value.reduce((sum, p) => sum + (p.value || 0), 0)
);

//
// Chart.js options
//
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 8, right: 4, bottom: 4, left: 4 },
  },
  scales: {
    x: {
      ticks: {
        font: { size: 10 },
      },
    },
    y: {
      ticks: {
        font: { size: 10 },
      },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      labels: {
        font: { size: 10 },
      },
    },
  },
};

// GELİR chartData
const revenueChartData = computed(() => ({
  labels: revenueChartPoints.value.map((p) => p.label),
  datasets: [
    {
      label: "Satış Geliri (₺)",
      data: revenueChartPoints.value.map((p) => p.value || 0),
      backgroundColor: "rgba(16, 185, 129, 0.7)",
      borderRadius: 6,
      maxBarThickness: 32,
    },
  ],
}));

// STOKTAN ÇIKAN chartData
const stockOutChartData = computed(() => ({
  labels: stockOutChartPoints.value.map((p) => p.label),
  datasets: [
    {
      label: "Stoktan Çıkan (adet)",
      data: stockOutChartPoints.value.map((p) => p.value || 0),
      backgroundColor: "rgba(251, 191, 36, 0.8)",
      borderRadius: 6,
      maxBarThickness: 32,
    },
  ],
}));

// STOĞA GİREN chartData
const stockInChartData = computed(() => ({
  labels: stockInChartPoints.value.map((p) => p.label),
  datasets: [
    {
      label: "Stoğa Giren (adet)",
      data: stockInChartPoints.value.map((p) => p.value || 0),
      backgroundColor: "rgba(56, 189, 248, 0.8)",
      borderRadius: 6,
      maxBarThickness: 32,
    },
  ],
}));

// TAMİRLER chartData
const repairChartData = computed(() => ({
  labels: repairChartPoints.value.map((p) => p.label),
  datasets: [
    {
      label: "Tamir Adedi",
      data: repairChartPoints.value.map((p) => p.value || 0),
      backgroundColor: "rgba(244, 63, 94, 0.8)",
      borderRadius: 6,
      maxBarThickness: 32,
    },
  ],
}));

//
// WATCH'LAR & İLK YÜKLEME
//
watch(
  [revenueRange, revenueMonth],
  async () => {
    await loadRevenue();
  },
  { immediate: false }
);

watch(
  [stockOutRange, stockOutMonth],
  async () => {
    await loadStockOut();
  },
  { immediate: false }
);

watch(
  [stockInRange, stockInMonth],
  async () => {
    await loadStockIn();
  },
  { immediate: false }
);

watch(
  [repairRange, repairMonth],
  async () => {
    await loadRepairs();
  },
  { immediate: false }
);

onMounted(() => {
  loadRevenue();
  loadStockOut();
  loadStockIn();
  loadRepairs();
});
</script>
