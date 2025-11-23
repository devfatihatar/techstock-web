<template>
  <div>
    <!-- Başlık -->
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">
          Tedarikçiler
        </h1>
        <p class="text-sm text-slate-500">
          Çalıştığınız tedarikçileri ve iletişim bilgilerini yönetin.
        </p>
      </div>
    </header>

    <section class="flex gap-6">
      <!-- Sol: Tedarikçi ekleme formu -->
      <div class="bg-white rounded-xl shadow p-6 w-full max-w-xl text-sm">
        <h2 class="text-base font-semibold mb-4">
          Yeni Tedarikçi Ekle
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              Firma Adı
            </label>
            <input
              v-model="supplierForm.companyName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Simge Bilgisayar"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Yetkili Adı
            </label>
            <input
              v-model="supplierForm.contactName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Ali Yılmaz"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">
                Telefon
              </label>
              <input
                v-model="supplierForm.phone"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: 05xx xxx xx xx"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">
                E-posta
              </label>
              <input
                v-model="supplierForm.email"
                type="email"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: info@firma.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Adres (isteğe bağlı)
            </label>
            <textarea
              v-model="supplierForm.address"
              rows="2"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adres bilgisi"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Notlar (isteğe bağlı)
            </label>
            <textarea
              v-model="supplierForm.notes"
              rows="2"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: SSD, RAM tedarik ediyor"
            ></textarea>
          </div>

          <button
            @click="addSupplier"
            class="w-full mt-2 bg-slate-900 text-white font-medium py-2.5 rounded-md text-sm hover:bg-slate-800 active:scale-[0.99] transition"
          >
            Tedarikçiyi Kaydet
          </button>
        </div>
      </div>

      <!-- Sağ: Tedarikçi listesi -->
      <div class="flex-1 bg-white rounded-xl shadow p-4 text-sm">
        <div class="flex items-center justify-between mb-3 gap-3">
          <h2 class="text-base font-semibold text-slate-800">
            Tedarikçi Listesi
          </h2>

          <input
            v-model="searchTerm"
            type="text"
            class="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Firma veya yetkili ara..."
          />
        </div>

        <div v-if="filteredSuppliers.length === 0" class="text-slate-500">
          Henüz tedarikçi eklenmedi veya aramaya uygun kayıt bulunamadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-500">
                <th class="py-2">Firma</th>
                <th class="py-2">Yetkili</th>
                <th class="py-2">Telefon</th>
                <th class="py-2">E-posta</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in filteredSuppliers"
                :key="s.id"
                class="border-b last:border-0 text-slate-700 align-top"
              >
                <td class="py-2 pr-2">
                  <div class="font-semibold">
                    {{ s.companyName }}
                  </div>
                  <div
                    v-if="s.address"
                    class="text-[11px] text-slate-500 mt-1"
                  >
                    {{ s.address }}
                  </div>
                  <div
                    v-if="s.notes"
                    class="text-[11px] text-slate-500 mt-1"
                  >
                    Not: {{ s.notes }}
                  </div>
                </td>
                <td class="py-2 pr-2">
                  {{ s.contactName || "-" }}
                </td>
                <td class="py-2 pr-2">
                  {{ s.phone || "-" }}
                </td>
                <td class="py-2 pr-2">
                  {{ s.email || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const STORAGE_KEY = "simge-suppliers";

const suppliers = ref([]);

const supplierForm = ref({
  companyName: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
});

const searchTerm = ref("");

// localStorage'dan yükle
onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      suppliers.value = JSON.parse(stored);
    } catch (e) {
      console.error("Suppliers parse error:", e);
    }
  }
});

// kaydedildikçe localStorage'a yaz
watch(
  suppliers,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

function addSupplier() {
  if (!supplierForm.value.companyName) return;

  suppliers.value.push({
    id: Date.now(),
    ...supplierForm.value,
  });

  supplierForm.value = {
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  };
}

const filteredSuppliers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return suppliers.value;

  return suppliers.value.filter((s) => {
    const company = s.companyName?.toLowerCase() || "";
    const contact = s.contactName?.toLowerCase() || "";
    return company.includes(term) || contact.includes(term);
  });
});
</script>
