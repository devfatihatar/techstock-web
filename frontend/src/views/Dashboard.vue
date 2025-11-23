<template>
  <div class="min-h-screen flex bg-slate-100">
    <!-- Sol Menü -->
    <Sidebar />

    <!-- Sağ taraf: içerik -->
    <main class="flex-1 p-8">
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

      <!-- İçerik alanı -->
      <section class="flex gap-6">
        <!-- Sol: Ürün ekleme formu -->
        <ProductForm @add-product="handleAddProduct" />

        <!-- Sağ: ürün listesi -->
        <div class="flex-1 space-y-4">
          <div class="bg-white rounded-xl shadow p-4 text-sm">
            <h2 class="text-base font-semibold text-slate-800 mb-3">
              Ürün Listesi
            </h2>

            <div v-if="products.length === 0" class="text-slate-500">
              Henüz ürün eklenmedi.
            </div>

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
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in products"
                  :key="item.id"
                  class="border-b last:border-0 text-slate-700"
                >
                  <td class="py-2 pr-2">{{ item.name }}</td>
                  <td class="py-2 pr-2">{{ item.quantity }}</td>
                  <td class="py-2 pr-2">{{ item.buyPrice?.toLocaleString('tr-TR') }}</td>
                  <td class="py-2 pr-2">{{ item.supplier || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "../components/Sidebar.vue";
import ProductForm from "../components/ProductForm.vue";

// Ürünleri tuttuğumuz liste (state)
const products = ref([]);

// Formdan ürün gelince çağrılacak fonksiyon
function handleAddProduct(product) {
  products.value.push({
    id: Date.now(), // basit benzersiz id
    ...product,
  });
}
</script>
