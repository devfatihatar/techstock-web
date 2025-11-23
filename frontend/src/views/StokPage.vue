<template>
  <div>
    <!-- Üst başlık -->
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">
          Stok Yönetimi
        </h1>
        <p class="text-sm text-slate-500">
          Simge Bilgisayar - Ürün giriş/çıkış takibi
        </p>
      </div>

      <div class="text-xs text-slate-500">
        Kullanıcı:
        <span class="font-medium text-slate-700">Fatih</span>
      </div>
    </header>

    <!-- Üstte özet kartlar -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 mb-1">Toplam Ürün Çeşidi</p>
        <p class="text-2xl font-semibold text-slate-800">
          {{ totalProducts }}
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 mb-1">Toplam Stok Adedi</p>
        <p class="text-2xl font-semibold text-slate-800">
          {{ totalQuantity }}
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 mb-1">Toplam Stok Maliyeti</p>
        <p class="text-2xl font-semibold text-slate-800">
          {{ totalStockValue.toLocaleString('tr-TR') }} ₺
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 mb-1">Düşük Stoktaki Ürünler</p>
        <p class="text-2xl font-semibold text-slate-800">
          {{ lowStockCount }}
        </p>

        <button
          v-if="lowStockCount > 0"
          @click="showLowStockPanel = true"
          class="mt-3 w-full text-xs px-3 py-2 rounded-md bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200"
        >
          Ürünleri gör
        </button>

        <p
          v-else
          class="mt-3 text-[11px] text-slate-500"
        >
          Şu anda düşük stokta ürün yok.
        </p>
      </div>
    </section>

    <!-- İçerik alanı -->
    <section class="flex gap-6">
      <!-- Sol: Ürün ekleme formu -->
      <ProductForm @add-product="handleAddProduct" />

      <!-- Sağ: ürün listesi -->
      <div class="flex-1">
        <div class="bg-white rounded-xl shadow p-4 text-sm">
          <div class="flex items-center justify-between mb-3 gap-3">
            <h2 class="text-base font-semibold text-slate-800">
              Ürün Listesi
            </h2>

            <input
              v-model="searchTerm"
              type="text"
              class="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ürün adı veya tedarikçi ara..."
            />
          </div>

          <!-- Hiç ürün yoksa -->
          <div v-if="products.length === 0" class="text-slate-500">
            Henüz ürün eklenmedi.
          </div>

          <!-- Ürün var ama aramada sonuç yoksa -->
          <div
            v-else-if="filteredProducts.length === 0"
            class="text-slate-500"
          >
            Aramanıza uygun ürün bulunamadı.
          </div>

          <!-- Hem ürün var, hem aramada sonuç varsa -->
          <table
            v-else
            class="w-full text-left text-xs border-collapse"
          >
            <thead>
              <tr class="border-b text-slate-500">
                <th class="py-2">Ürün Adı</th>
                <th class="py-2">Adet</th>
                <th class="py-2">Alış Fiyatı (₺)</th>
                <th class="py-2">Tedarikçi</th>
                <th class="py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredProducts"
                :key="item.id"
                class="border-b last:border-0 text-slate-700"
                :class="{ 'bg-red-50': item.quantity === 0 }"
              >
                <td class="py-2 pr-2">
                  <div class="flex items-center gap-2">
                    <span>{{ item.name }}</span>
                    <span
                      v-if="item.quantity !== null && item.quantity <= LOW_STOCK_THRESHOLD"
                      class="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300"
                    >
                      Düşük stok
                    </span>
                  </div>
                </td>

                <td class="py-2 pr-2 font-semibold">
                  {{ item.quantity }}
                </td>

                <td class="py-2 pr-2 align-top">
                  <!-- Düzenleme modunda değilse -->
                  <div v-if="priceEditId !== item.id">
                    <div class="flex items-center gap-2">
                      <span>
                        {{ item.buyPrice?.toLocaleString('tr-TR') }} ₺
                      </span>
                      <button
                        @click="startPriceEdit(item)"
                        class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                      >
                        Fiyatı Düzenle
                      </button>
                    </div>

                    <button
                      class="mt-1 text-[10px] text-blue-600 hover:underline"
                      @click="togglePriceHistory(item.id)"
                    >
                      Fiyat geçmişini gör
                    </button>

                    <!-- Fiyat geçmişi listesi -->
                    <div
                      v-if="openPriceHistoryId === item.id && item.priceHistory?.length"
                      class="mt-2 text-[10px] text-slate-600 border-t pt-1"
                    >
                      <p class="mb-1 font-semibold">Geçmiş fiyatlar:</p>
                      <ul class="space-y-0.5 max-h-24 overflow-y-auto">
                        <li
                          v-for="(h, idx) in item.priceHistory"
                          :key="idx"
                        >
                          <span class="font-medium">
                            {{ h.price?.toLocaleString('tr-TR') }} ₺
                          </span>
                          <span class="ml-1">
                            ({{ new Date(h.date).toLocaleDateString('tr-TR') }})
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Düzenleme modunda ise -->
                  <div v-else class="space-y-1">
                    <input
                      v-model="priceEditValue"
                      type="number"
                      min="0"
                      class="w-full border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Yeni fiyat"
                    />
                    <div class="flex gap-2 justify-end">
                      <button
                        @click="cancelPriceEdit"
                        class="px-2 py-1 text-[10px] rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                      >
                        İptal
                      </button>
                      <button
                        @click="savePriceEdit(item.id)"
                        class="px-2 py-1 text-[10px] rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                </td>

                <td class="py-2 pr-2">{{ item.supplier || '-' }}</td>

                <td class="py-2 text-right">
                  <button
                    @click="increaseStock(item.id)"
                    class="mr-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    +1
                  </button>

                  <button
                    @click="decreaseStock(item.id)"
                    class="mr-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    -1
                  </button>

                  <button
                    @click="deleteProduct(item.id)"
                    class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Düşük stok ürünleri paneli -->
    <div
      v-if="showLowStockPanel"
      class="fixed inset-0 bg-black/40 flex items-start justify-center z-50"
    >
      <div
        class="bg-white rounded-xl shadow-lg w-full max-w-md mt-24 mx-4 p-4 text-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-slate-800">
            Düşük stoktaki ürünler
          </h3>
          <button
            @click="showLowStockPanel = false"
            class="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>

        <p class="text-[11px] text-slate-500 mb-2">
          Adedi {{ LOW_STOCK_THRESHOLD }} ve altında olan ürünler listelenir.
        </p>

        <div v-if="lowStockProducts.length === 0" class="text-slate-500 text-sm">
          Şu anda düşük stokta ürün yok.
        </div>

        <ul
          v-else
          class="divide-y max-h-64 overflow-y-auto"
        >
          <li
            v-for="item in lowStockProducts"
            :key="item.id"
            class="py-2 flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium text-slate-800">
                {{ item.name }}
              </p>
              <p class="text-[11px] text-slate-500">
                Tedarikçi: {{ item.supplier || '-' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-800">
                {{ item.quantity }} adet
              </p>
              <p class="text-[11px] text-slate-500">
                {{ item.buyPrice?.toLocaleString('tr-TR') }} ₺
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import ProductForm from "../components/ProductForm.vue";

const STORAGE_KEY = "simge-products";
const LOW_STOCK_THRESHOLD = 3; // 3 ve altı "düşük stok"

// ürün listesi
const products = ref([]);

// fiyat düzenleme
const priceEditId = ref(null);
const priceEditValue = ref(null);
const openPriceHistoryId = ref(null);

// düşük stok paneli
const showLowStockPanel = ref(false);

// sayfa yüklenince localStorage'dan oku
onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      products.value = JSON.parse(stored);
    } catch (e) {
      console.error("LocalStorage veri okuma hatası:", e);
    }
  }
});

// ürün ekleme
function handleAddProduct(product) {
  products.value.push({
    id: Date.now(),
    ...product,
    priceHistory: [
      {
        price: product.buyPrice,
        date: new Date().toISOString(),
      },
    ],
  });
}

// stok işlemleri
function increaseStock(id) {
  const product = products.value.find((p) => p.id === id);
  if (!product) return;
  product.quantity++;
}

function decreaseStock(id) {
  const product = products.value.find((p) => p.id === id);
  if (!product) return;
  if (product.quantity > 0) {
    product.quantity--;
  }
}

function deleteProduct(id) {
  products.value = products.value.filter((p) => p.id !== id);
}

// fiyat düzenleme işlemleri
function startPriceEdit(item) {
  priceEditId.value = item.id;
  priceEditValue.value = item.buyPrice;
}

function cancelPriceEdit() {
  priceEditId.value = null;
  priceEditValue.value = null;
}

function savePriceEdit(id) {
  const product = products.value.find((p) => p.id === id);
  if (!product) return;

  const newPrice = Number(priceEditValue.value);
  if (isNaN(newPrice) || newPrice < 0) return;

  if (!Array.isArray(product.priceHistory)) {
    product.priceHistory = [];
  }

  product.priceHistory.push({
    price: newPrice,
    date: new Date().toISOString(),
  });

  product.buyPrice = newPrice;

  priceEditId.value = null;
  priceEditValue.value = null;
}

function togglePriceHistory(id) {
  openPriceHistoryId.value =
    openPriceHistoryId.value === id ? null : id;
}

// her değişiklikte localStorage'a yaz
watch(
  products,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

// arama
const searchTerm = ref("");

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return products.value;

  return products.value.filter((item) => {
    const name = item.name?.toLowerCase() || "";
    const supplier = item.supplier?.toLowerCase() || "";
    return name.includes(term) || supplier.includes(term);
  });
});

// özet kartlar
const totalProducts = computed(() => products.value.length);

const totalQuantity = computed(() =>
  products.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
);

const totalStockValue = computed(() =>
  products.value.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.buyPrice || 0),
    0
  )
);

const lowStockCount = computed(() =>
  products.value.filter(
    (item) =>
      item.quantity !== null &&
      item.quantity !== undefined &&
      item.quantity <= LOW_STOCK_THRESHOLD
  ).length
);

const lowStockProducts = computed(() =>
  products.value.filter(
    (item) =>
      item.quantity !== null &&
      item.quantity !== undefined &&
      item.quantity <= LOW_STOCK_THRESHOLD
  )
);
</script>
