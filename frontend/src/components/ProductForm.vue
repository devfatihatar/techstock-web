<template>
  <section class="bg-white rounded-xl shadow p-6 w-full max-w-xl">
    <h2 class="text-xl font-semibold mb-4">
      Yeni Ürün Ekle
    </h2>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-sm font-medium mb-1">
          Ürün Adı
        </label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Örn: MSI Gaming Laptop"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">
            Stok Adedi
          </label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="0"
            class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Örn: 5"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Alış Fiyatı (₺)
          </label>
          <input
            v-model.number="form.buyPrice"
            type="number"
            min="0"
            class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Örn: 25000"
            required
          />
        </div>
      </div>

     <div>
  <label class="block text-sm font-medium mb-1">
    Tedarikçi
  </label>

  <select
    v-model="form.supplier"
    class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  >
    <option value="" disabled>
      Tedarikçi seçin...
    </option>

    <option
      v-for="s in suppliers"
      :key="s.id"
      :value="s.companyName"
    >
      {{ s.companyName }} 
      <span v-if="s.contactName">
        - {{ s.contactName }}
      </span>
    </option>
  </select>

  <p
    v-if="suppliers.length === 0"
    class="mt-1 text-[11px] text-slate-500"
  >
    Henüz tedarikçi eklenmemiş. "Tedarikçiler" sekmesinden ekleyebilirsiniz.
  </p>
</div>


      <button
        type="submit"
        class="w-full mt-2 bg-blue-600 text-white font-medium py-2.5 rounded-md text-sm hover:bg-blue-700 active:scale-[0.99] transition"
      >
        Kaydet
      </button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
const SUPPLIERS_STORAGE_KEY = "simge-suppliers";
const suppliers = ref([]);

onMounted(() => {
  const stored = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
  if (stored) {
    try {
      suppliers.value = JSON.parse(stored);
    } catch (e) {
      console.error("Suppliers parse error in ProductForm:", e);
    }
  }
});

// Bu component "dışarıya haber" yollayabiliyor
const emit = defineEmits(["add-product"]);

// Formdaki alanlar
const form = reactive({
  name: "",
  quantity: null,
  buyPrice: null,
  supplier: "",
});

// Kaydet butonuna basınca
function handleSubmit() {
  // Form verisini üst componente gönderiyoruz
  emit("add-product", {
    name: form.name,
    quantity: form.quantity,
    buyPrice: form.buyPrice,
    supplier: form.supplier,
  });

  // Formu temizle
  form.name = "";
  form.quantity = null;
  form.buyPrice = null;
  form.supplier = "";
}
</script>
