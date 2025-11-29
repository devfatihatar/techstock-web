<template>
  <div>
    <!-- Üst başlık -->
    <header
      class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-slate-800">
          Stok Yönetimi
        </h1>
        <p class="text-xs md:text-sm text-slate-500">
          {{ settings.companyName }} - Ürün giriş/çıkış takibi
        </p>
      </div>

      <div class="text-[11px] md:text-xs text-slate-500 md:text-right">
        Kullanıcı:
        <span class="font-medium text-slate-700">
          {{ settings.userName }}
        </span>
      </div>
    </header>

    <!-- Üstte özet kartlar -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-[11px] md:text-xs text-slate-500 mb-1">
          Toplam Ürün Çeşidi
        </p>
        <p class="text-xl md:text-2xl font-semibold text-slate-800">
          {{ totalProducts }}
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-[11px] md:text-xs text-slate-500 mb-1">
          Toplam Stok Adedi
        </p>
        <p class="text-xl md:text-2xl font-semibold text-slate-800">
          {{ totalQuantity }}
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-[11px] md:text-xs text-slate-500 mb-1">
          Toplam Stok Maliyeti
        </p>
        <p class="text-xl md:text-2xl font-semibold text-slate-800">
          {{ totalStockValue.toLocaleString("tr-TR") }} ₺
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-[11px] md:text-xs text-slate-500 mb-1">
          Düşük Stoktaki Ürünler
        </p>
        <p class="text-xl md:text-2xl font-semibold text-slate-800">
          {{ lowStockCount }}
        </p>

        <button
          v-if="lowStockCount > 0"
          @click="showLowStockPanel = true"
          class="mt-3 w-full text-[11px] md:text-xs px-3 py-2 rounded-md bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200"
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
    <section class="flex flex-col lg:flex-row gap-6">
      <!-- Sol: Ürün ekleme formu -->
      <div class="w-full lg:max-w-xs">
        <ProductForm @add-product="handleAddProduct" />
      </div>

      <!-- Sağ: ürün listesi -->
      <div class="flex-1">
        <div class="bg-white rounded-xl shadow p-3 sm:p-4 text-sm">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
          >
            <h2 class="text-sm sm:text-base font-semibold text-slate-800">
              Ürün Listesi
            </h2>

            <input
              v-model="searchTerm"
              type="text"
              class="border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ürün adı veya tedarikçi ara..."
            />
          </div>

          <!-- Hiç ürün yoksa -->
          <div
            v-if="products.length === 0"
            class="text-slate-500 text-xs sm:text-sm"
          >
            Henüz ürün eklenmedi.
          </div>

          <!-- Ürün var ama aramada sonuç yoksa -->
          <div
            v-else-if="filteredProducts.length === 0"
            class="text-slate-500 text-xs sm:text-sm"
          >
            Aramanıza uygun ürün bulunamadı.
          </div>

          <!-- Hem ürün var, hem aramada sonuç varsa -->
          <div v-else class="max-h-[460px] overflow-y-auto">
            <!-- Mobilde yatay kaydırılabilir tablo -->
            <div class="overflow-x-auto">
              <table
                class="w-full min-w-[720px] text-left text-[11px] sm:text-xs border-collapse"
              >
                <thead>
                  <tr class="border-b text-slate-500">
                    <th class="py-2 pr-2">Ürün Adı</th>
                    <th class="py-2 pr-2">Adet</th>
                    <th class="py-2 pr-2">Alış Fiyatı (₺)</th>
                    <th class="py-2 pr-2">Tedarikçi</th>
                    <th class="py-2 pl-2 text-right">İşlemler</th>
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
                          v-if="
                            item.quantity !== null &&
                            item.quantity <= LOW_STOCK_THRESHOLD
                          "
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
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-2">
                            <span>
                              {{
                                item.buyPrice?.toLocaleString("tr-TR")
                              }}
                              ₺
                            </span>
                            <button
                              @click="startPriceEdit(item)"
                              class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                            >
                              Fiyatı Düzenle
                            </button>
                          </div>

                          <button
                            class="text-[10px] text-blue-600 hover:underline self-start"
                            @click="togglePriceHistory(item.id)"
                          >
                            Fiyat geçmişini gör
                          </button>
                        </div>

                        <!-- Fiyat geçmişi listesi -->
                        <div
                          v-if="
                            openPriceHistoryId === item.id &&
                            item.priceHistory?.length
                          "
                          class="mt-2 text-[10px] text-slate-600 border-t pt-1"
                        >
                          <p class="mb-1 font-semibold">Geçmiş fiyatlar:</p>
                          <ul class="space-y-0.5 max-h-24 overflow-y-auto">
                            <li
                              v-for="(h, idx) in item.priceHistory"
                              :key="idx"
                            >
                              <span class="font-medium">
                                {{
                                  h.price?.toLocaleString("tr-TR")
                                }}
                                ₺
                              </span>
                              <span class="ml-1">
                                ({{
                                  new Date(h.date).toLocaleDateString("tr-TR")
                                }})
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
                          class="w-full border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <td class="py-2 pr-2">
                      {{ item.supplier || "-" }}
                    </td>

                    <td class="py-2 pl-2 text-right whitespace-nowrap">
                      <button
                        @click="increaseStock(item.id)"
                        class="mr-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-[10px] sm:text-xs"
                      >
                        +1
                      </button>

                      <button
                        @click="decreaseStock(item.id)"
                        class="mr-1 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-[10px] sm:text-xs"
                      >
                        -1
                      </button>

                      <button
                        @click="deleteProduct(item.id)"
                        class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-[10px] sm:text-xs"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Düşük stok ürünleri paneli -->
    <div
      v-if="showLowStockPanel"
      class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 px-3"
    >
      <div
        class="bg-white rounded-xl shadow-lg w-full max-w-md mt-24 mx-auto p-4 text-sm"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
        >
          <h3 class="text-sm sm:text-base font-semibold text-slate-800">
            Düşük stoktaki ürünler
          </h3>
          <button
            @click="showLowStockPanel = false"
            class="self-start sm:self-auto text-[11px] sm:text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>

        <p class="text-[11px] text-slate-500 mb-2">
          Adedi {{ LOW_STOCK_THRESHOLD }} ve altında olan ürünler listelenir.
        </p>

        <div
          v-if="lowStockProducts.length === 0"
          class="text-slate-500 text-xs sm:text-sm"
        >
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
                Tedarikçi: {{ item.supplier || "-" }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-800">
                {{ item.quantity }} adet
              </p>
              <p class="text-[11px] text-slate-500">
                {{
                  item.buyPrice?.toLocaleString("tr-TR")
                }}
                ₺
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import ProductForm from "../components/ProductForm.vue";
import api from "../api/client"; // 👈 repairs sayfasındaki axios client

const LOW_STOCK_THRESHOLD = 3;
const SETTINGS_STORAGE_KEY = "simge-settings";

// 🔹 Ayarlar (şimdilik localStorage'dan)
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

// 🔹 Ürün listesi (artık backend'den geliyor)
const products = ref([]);

// UI state
const loading = ref(false);
const error = ref("");

// fiyat düzenleme
const priceEditId = ref(null);
const priceEditValue = ref(null);
const openPriceHistoryId = ref(null);

// düşük stok paneli
const showLowStockPanel = ref(false);

// arama
const searchTerm = ref("");

// 📥 ÜRÜNLERİ BACKEND'DEN YÜKLE
async function loadProducts() {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/products"); // -> http://localhost:4000/api/products
    const raw = Array.isArray(res.data) ? res.data : [];

    products.value = raw.map((p) => ({
      ...p,
      quantity: p.quantity != null ? p.quantity : 0,
      buyPrice: p.buyPrice != null ? Number(p.buyPrice) : null,
      // priceHistory backend'den include edilecek (aşağıda backend'de göstereceğim)
      priceHistory: Array.isArray(p.priceHistory) ? p.priceHistory : [],
    }));
  } catch (e) {
    console.error("Ürünler alınırken hata:", e);
    error.value = "Ürünler alınırken bir hata oluştu.";
    products.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadProducts();
});

// 🔹 ÜRÜN EKLE – ProductForm'dan gelen event'i backend'e POST et
async function handleAddProduct(product) {
  try {
    const payload = {
      name: product.name,
      quantity:
        product.quantity !== undefined && product.quantity !== null
          ? Number(product.quantity)
          : 0,
      buyPrice:
        product.buyPrice !== undefined && product.buyPrice !== null
          ? Number(product.buyPrice)
          : null,
      supplier: product.supplier || null,
    };

    await api.post("/products", payload); // POST /api/products

    await loadProducts();
  } catch (e) {
    console.error("Ürün eklenirken hata:", e);
    const msg =
      e?.response?.data?.message || "Ürün eklenirken bir hata oluştu.";
    alert(msg);
  }
}

// 🔹 STOK ARTTIR
async function increaseStock(id) {
  try {
    await api.patch(`/products/${id}/stock`, { delta: 1 }); // PATCH /api/products/:id/stock
    await loadProducts();
  } catch (e) {
    console.error("Stok arttırılırken hata:", e);
    const msg =
      e?.response?.data?.message || "Stok arttırılırken bir hata oluştu.";
    alert(msg);
  }
}

// 🔹 STOK AZALT
async function decreaseStock(id) {
  try {
    await api.patch(`/products/${id}/stock`, { delta: -1 });
    await loadProducts();
  } catch (e) {
    console.error("Stok azaltılırken hata:", e);
    const msg =
      e?.response?.data?.message || "Stok azaltılırken bir hata oluştu.";
    alert(msg);
  }
}

// 🔹 ÜRÜN SİL
async function deleteProduct(id) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

  try {
    await api.delete(`/products/${id}`);
    await loadProducts();
  } catch (e) {
    console.error("Ürün silinirken hata:", e);
    const msg =
      e?.response?.data?.message || "Ürün silinirken bir hata oluştu.";
    alert(msg);
  }
}

// 🔹 FİYAT DÜZENLEME BAŞLAT
function startPriceEdit(item) {
  priceEditId.value = item.id;
  priceEditValue.value =
    item.buyPrice !== null && item.buyPrice !== undefined
      ? item.buyPrice
      : null;
}

function cancelPriceEdit() {
  priceEditId.value = null;
  priceEditValue.value = null;
}

// 🔹 FİYAT KAYDET (buyPrice + priceHistory backend'de tutulacak)
async function savePriceEdit(id) {
  const newPrice = Number(priceEditValue.value);
  if (!Number.isFinite(newPrice) || newPrice < 0) {
    alert("Lütfen geçerli bir fiyat girin.");
    return;
  }

  try {
    await api.put(`/products/${id}/price`, { buyPrice: newPrice });
    await loadProducts();
    priceEditId.value = null;
    priceEditValue.value = null;
  } catch (e) {
    console.error("Fiyat güncellenirken hata:", e);
    const msg =
      e?.response?.data?.message || "Fiyat güncellenirken bir hata oluştu.";
    alert(msg);
  }
}

function togglePriceHistory(id) {
  openPriceHistoryId.value = openPriceHistoryId.value === id ? null : id;
}

// 🔹 FİLTRELER
const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return products.value;

  return products.value.filter((item) => {
    const name = item.name?.toLowerCase() || "";
    const supplier = item.supplier?.toLowerCase() || "";
    return name.includes(term) || supplier.includes(term);
  });
});

// 🔹 ÖZET KARTLAR
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

