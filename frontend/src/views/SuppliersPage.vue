<template>
  <div class="min-h-screen bg-[#f5f5f0] px-4 sm:px-6 lg:px-8 py-6 pb-24">
    <!-- Başlık -->
    <header
      class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-slate-800">
          Tedarikçiler
        </h1>
        <p class="text-xs md:text-sm text-slate-500">
          Çalıştığınız tedarikçileri ve iletişim bilgilerini yönetin.
        </p>
      </div>
    </header>

    <section class="flex flex-col lg:flex-row gap-6">
      <!-- Sol: Tedarikçi ekleme formu -->
      <div
        class="bg-white rounded-xl shadow p-4 sm:p-6 w-full lg:max-w-xl text-sm"
      >
        <h2 class="text-sm sm:text-base font-semibold mb-4">
          Yeni Tedarikçi Ekle
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1"> Firma Adı </label>
            <input
              v-model="supplierForm.companyName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Örn: Simge Bilgisayar"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1"> Yetkili Adı </label>
            <input
              v-model="supplierForm.contactName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Örn: Ali Yılmaz"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1"> Telefon </label>
              <input
                v-model="supplierForm.phone"
                type="text"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Örn: 05xx xxx xx xx"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"> E-posta </label>
              <input
                v-model="supplierForm.email"
                type="email"
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Örn: SSD, RAM tedarik ediyor"
            ></textarea>
          </div>

          <button
            @click="addSupplier"
            :disabled="saving"
            class="w-full mt-2 bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md text-sm hover:bg-slate-800 active:scale-[0.99] transition"
          >
            Tedarikçiyi Kaydet
          </button>
        </div>
      </div>

      <!-- Sağ: Tedarikçi listesi -->
      <div class="flex-1 bg-white rounded-xl shadow p-3 sm:p-4 text-sm">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
        >
          <h2 class="text-sm sm:text-base font-semibold text-slate-800">
            Tedarikçi Listesi
          </h2>

          <input
            v-model="searchTerm"
            type="text"
            class="border rounded-md px-2 py-1 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Firma veya yetkili ara..."
          />
        </div>

        <div
          v-if="filteredSuppliers.length === 0"
          class="text-slate-500 text-xs sm:text-sm"
        >
          Henüz tedarikçi eklenmedi veya aramaya uygun kayıt bulunamadı.
        </div>

        <div v-else class="max-h-[420px] overflow-y-auto">
          <!-- Mobilde yatay kaydırılabilir tablo -->
          <div class="overflow-x-auto">
            <table
              class="w-full min-w-[640px] text-left text-[11px] sm:text-xs border-collapse"
            >
              <thead>
                <tr class="border-b text-slate-500">
                  <th class="py-2 pr-2">Firma</th>
                  <th class="py-2 pr-2">Yetkili</th>
                  <th class="py-2 pr-2">Telefon</th>
                  <th class="py-2 pr-2">E-posta</th>
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
                    <div v-if="s.notes" class="text-[11px] text-slate-500 mt-1">
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
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api/client"; // repairs, stock, sales'te kullandığın axios client

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

const loading = ref(false);
const saving = ref(false);
const error = ref("");

// 🔹 Tedarikçileri backend'den çek
async function loadSuppliers() {
  loading.value = true;
  error.value = "";

  try {
    const res = await api.get("/suppliers"); // GET /api/suppliers
    const raw = Array.isArray(res.data) ? res.data : [];

    // Backend: name -> Frontend: companyName
    suppliers.value = raw.map((s) => ({
      ...s,
      companyName: s.name || s.companyName || "",
    }));
  } catch (e) {
    console.error("Tedarikçiler alınırken hata:", e);
    error.value =
      e?.response?.data?.message || "Tedarikçiler alınırken bir hata oluştu.";
    suppliers.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadSuppliers);

// 🔹 Yeni tedarikçi ekle
async function addSupplier() {
  if (!supplierForm.value.companyName) {
    alert("Lütfen firma adını girin.");
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const payload = {
      // Prisma'daki Supplier modelinde name alanı var
      name: supplierForm.value.companyName,
      contactName: supplierForm.value.contactName || null,
      phone: supplierForm.value.phone || null,
      email: supplierForm.value.email || null,
      address: supplierForm.value.address || null,
      notes: supplierForm.value.notes || null,
    };

    await api.post("/suppliers", payload); // POST /api/suppliers

    // Listeyi tazele
    await loadSuppliers();

    // Formu sıfırla
    supplierForm.value = {
      companyName: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    };
  } catch (e) {
    console.error("Tedarikçi kaydedilirken hata:", e);
    error.value =
      e?.response?.data?.message || "Tedarikçi kaydedilirken bir hata oluştu.";
    alert(error.value);
  } finally {
    saving.value = false;
  }
}

// 🔹 Arama filtresi
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
