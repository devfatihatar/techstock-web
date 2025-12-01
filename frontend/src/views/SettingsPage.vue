<template>
  <div
    class="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-emerald-50/20 px-3 py-4 md:px-6 md:py-8"
  >
    <div class="max-w-6xl mx-auto">
      <!-- ÜST BAŞLIK -->
      <header
        class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/70 border border-amber-200 text-[11px] text-amber-700 mb-2"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Yönetim • Firma & Modül Ayarları
          </p>
          <h1 class="text-xl md:text-2xl font-semibold text-slate-900">
            Ayarlar
          </h1>
          <p class="text-xs md:text-sm text-slate-600">
            Firmaları yönetin, hangi modüllerin aktif olacağını seçin.
          </p>
        </div>

        <div
          class="md:text-right text-[11px] md:text-xs text-slate-500 bg-white/80 border border-slate-200 rounded-xl px-3 py-2 shadow-sm"
        >
          <div class="font-semibold">
            Seçili Firma:
            <span class="text-slate-900">
              {{ selectedCompany?.name || "Henüz seçilmedi" }}
            </span>
          </div>
          <div v-if="selectedCompany" class="text-[11px]">
            {{ selectedCompany.username || "Kullanıcı yok" }}
          </div>
        </div>
      </header>

      <!-- FİRMA + MODÜL AYARLARI -->
      <section class="flex flex-col lg:flex-row gap-6">
        <!-- Sol: Firma listesi -->
        <div
          class="w-full lg:max-w-xs bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-4 text-sm"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2"
          >
            <h2 class="text-sm sm:text-base font-semibold text-slate-800">
              Firmalar
            </h2>
            <button
              type="button"
              @click="startNewCompany"
              class="text-[11px] sm:text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition"
            >
              Yeni Firma
            </button>
          </div>

          <div class="text-[11px] sm:text-xs">
            <div v-if="companies.length === 0" class="text-slate-500">
              Henüz firma eklenmemiş. Yeni bir firma oluşturun.
            </div>

            <ul
              v-else
              class="space-y-1 max-h-[360px] overflow-y-auto mt-1 pr-1"
            >
              <li
                v-for="c in companies"
                :key="c.id"
                class="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition"
                :class="c.id === selectedCompanyId
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-800'"
                @click="selectCompany(c.id)"
              >
                <div>
                  <div class="font-semibold">
                    {{ c.name }}
                  </div>
                  <div
                    class="text-[10px]"
                    :class="c.id === selectedCompanyId
                      ? 'text-slate-200'
                      : 'text-slate-500'"
                  >
                    {{ c.username || 'Kullanıcı yok' }}
                  </div>
                </div>

                <div class="flex flex-col items-end gap-1">
                  <span
                    v-if="c.isActive"
                    class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    Aktif
                  </span>
                  <span
                    v-else
                    class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700"
                  >
                    Pasif
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sağ: Firma detay / modül ayarları -->
        <div
          class="flex-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 text-sm"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2"
          >
            <div>
              <h2 class="text-sm sm:text-base font-semibold text-slate-800">
                {{ selectedCompanyId ? "Firma Ayarları" : "Yeni Firma Oluştur" }}
              </h2>
              <p class="text-[11px] text-slate-500">
                Firma bilgilerini ve hangi modüllerin açık olacağını belirleyin.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="companyForm.isActive"
                class="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Firma aktif
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                Firma pasif
              </span>

              <button
                v-if="selectedCompanyId"
                type="button"
                @click="deleteCompany"
                class="text-[11px] sm:text-xs px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              >
                Sil
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Firma bilgileri -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">
                  Firma Adı
                </label>
                <input
                  v-model="companyForm.name"
                  type="text"
                  class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Örn: Simge Bilgisayar"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  Yetkili / İlgili Kişi
                </label>
                <input
                  v-model="companyForm.contactPerson"
                  type="text"
                  class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Örn: Fatih Atar"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  Telefon
                </label>
                <input
                  v-model="companyForm.phone"
                  type="tel"
                  class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Örn: 05xx xxx xx xx"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  E-posta
                </label>
                <input
                  v-model="companyForm.email"
                  type="email"
                  class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Örn: info@firma.com"
                />
              </div>

              <div class="pt-2">
                <label
                  class="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                >
                  <input
                    v-model="companyForm.isActive"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <span>Firma aktif</span>
                </label>
                <p class="text-[11px] text-slate-500 mt-1">
                  Pasif firmalar giriş yapamaz ve menüde görünmez.
                </p>
              </div>
            </div>

            <!-- Kullanıcı + modül ayarları -->
            <div class="space-y-4">
              <div class="border-b pb-3">
                <h3
                  class="text-[11px] sm:text-xs font-semibold text-slate-500 mb-2"
                >
                  Giriş Bilgileri
                </h3>

                <div class="space-y-2">
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Kullanıcı Adı
                    </label>
                    <input
                      v-model="companyForm.username"
                      type="text"
                      class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      placeholder="Örn: simgeadmin"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Şifre
                    </label>
                    <input
                      v-model="companyForm.password"
                      type="password"
                      class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      placeholder="Yeni şifre belirleyin (şimdilik sadece not amaçlı)"
                    />
                    <p class="text-[11px] text-slate-500 mt-1">
                      Şimdilik localStorage'da tutuluyor; gerçek sistemde
                      sunucu tarafında hash'lenmesi gerekir.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  class="text-[11px] sm:text-xs font-semibold text-slate-500 mb-2"
                >
                  Aktif Modüller
                </h3>

                <div class="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="companyForm.modules.devices"
                      type="checkbox"
                      class="rounded border-slate-300"
                    />
                    <span>Cihaz Yönetimi</span>
                  </label>

                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="companyForm.modules.repairs"
                      type="checkbox"
                      class="rounded border-slate-300"
                    />
                    <span>Tamir Yönetimi</span>
                  </label>

                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="companyForm.modules.sales"
                      type="checkbox"
                      class="rounded border-slate-300"
                    />
                    <span>Satış / Fatura</span>
                  </label>

                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="companyForm.modules.stock"
                      type="checkbox"
                      class="rounded border-slate-300"
                    />
                    <span>Stok Yönetimi</span>
                  </label>

                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="companyForm.modules.suppliers"
                      type="checkbox"
                      class="rounded border-slate-300"
                    />
                    <span>Tedarikçiler</span>
                  </label>

                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="companyForm.modules.reports"
                      type="checkbox"
                      class="rounded border-slate-300"
                    />
                    <span>Raporlar / Dashboard</span>
                  </label>
                </div>

                <p class="text-[11px] text-slate-500 mt-2">
                  Menüde sadece seçili modüller gösterilecek. Örneğin stok takibi
                  kullanmayan firmalar için "Stok" gizlenir.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              @click="saveCompany"
              class="px-4 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.99] shadow-sm"
            >
              Kaydet
            </button>

            <button
              type="button"
              @click="resetForm"
              class="px-4 py-2.5 rounded-md border text-sm text-slate-600 bg-slate-50 hover:bg-slate-100"
            >
              Temizle
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api/client";

const companies = ref([]);
const selectedCompanyId = ref(null);
const loading = ref(false);

const companyForm = ref(createEmptyCompanyForm());

// Seçili firma (sadece görüntü için)
const selectedCompany = computed(() =>
  companies.value.find((c) => c.id === selectedCompanyId.value) || null
);

// Sayfa açılınca firmaları çek
onMounted(() => {
  fetchCompanies();
});

function createEmptyCompanyForm() {
  return {
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    isActive: true,
    modules: {
      devices: true,
      repairs: true,
      sales: false,
      stock: false,
      suppliers: false,
      reports: true,
    },
  };
}

function cloneCompanyToForm(company) {
  return {
    name: company.name || "",
    contactPerson: company.contactPerson || "",
    phone: company.phone || "",
    email: company.email || "",
    username: company.username || "",
    // Şifreyi backend’den almıyoruz, sadece yeni girilecek
    password: "",
    isActive: company.isActive !== false,
    modules: {
      devices: company.modules?.devices ?? true,
      repairs: company.modules?.repairs ?? true,
      sales: company.modules?.sales ?? false,
      stock: company.modules?.stock ?? false,
      suppliers: company.modules?.suppliers ?? false,
      reports: company.modules?.reports ?? true,
    },
  };
}

// 🔄 Firmaları backend'den çek
async function fetchCompanies() {
  loading.value = true;
  try {
    const res = await api.get("/admin/companies");
    companies.value = Array.isArray(res.data) ? res.data : [];

    if (companies.value.length > 0) {
      selectedCompanyId.value = companies.value[0].id;
      companyForm.value = cloneCompanyToForm(companies.value[0]);
    } else {
      selectedCompanyId.value = null;
      companyForm.value = createEmptyCompanyForm();
    }
  } catch (err) {
    console.error(err);
    alert("Firmalar yüklenirken bir hata oluştu.");
  } finally {
    loading.value = false;
  }
}

// 🌱 Yeni firma moduna geç
function startNewCompany() {
  selectedCompanyId.value = null;
  companyForm.value = createEmptyCompanyForm();
}

// 🔁 Var olan firmayı seç
function selectCompany(id) {
  selectedCompanyId.value = id;
  const c = companies.value.find((x) => x.id === id);
  if (c) {
    companyForm.value = cloneCompanyToForm(c);
  }
}

// 💾 Kaydet (yeni veya güncelle)
async function saveCompany() {
  if (!companyForm.value.name) {
    alert("Lütfen firma adını girin.");
    return;
  }
  if (!companyForm.value.email) {
    alert("Lütfen firma e-posta adresini girin.");
    return;
  }

  const payload = {
    name: companyForm.value.name,
    contactPerson: companyForm.value.contactPerson,
    phone: companyForm.value.phone,
    email: companyForm.value.email,
    username: companyForm.value.username,
    isActive: companyForm.value.isActive,
    modules: { ...companyForm.value.modules },
    password:
      companyForm.value.password && companyForm.value.password.trim().length > 0
        ? companyForm.value.password.trim()
        : undefined,
  };

  try {
    let res;

    if (selectedCompanyId.value) {
      // Güncelle
      res = await api.put(`/admin/companies/${selectedCompanyId.value}`, payload);
    } else {
      // Yeni firma
      res = await api.post("/admin/companies", payload);
    }

    const saved = res.data;

    if (selectedCompanyId.value) {
      // Var olanı listede güncelle
      const idx = companies.value.findIndex(
        (c) => c.id === selectedCompanyId.value
      );
      if (idx !== -1) {
        companies.value[idx] = saved;
      }
    } else {
      // Yeni firma listeye ekle
      companies.value.push(saved);
      selectedCompanyId.value = saved.id;
    }

    // Formu güncel veriyle yenile, şifreyi sıfırla
    companyForm.value = cloneCompanyToForm(saved);
    companyForm.value.password = "";

    alert("Firma ayarları kaydedildi.");
  } catch (err) {
    console.error(err);
    const msg =
      err?.response?.data?.message ||
      "Firma kaydedilirken bir hata oluştu.";
    alert(msg);
  }
}

// ♻ Formu temizle (seçili firmayı geri yükle veya yeni form)
function resetForm() {
  if (selectedCompanyId.value) {
    const c = companies.value.find((x) => x.id === selectedCompanyId.value);
    if (c) {
      companyForm.value = cloneCompanyToForm(c);
      return;
    }
  }
  companyForm.value = createEmptyCompanyForm();
}

// 🗑 Firma sil
async function deleteCompany() {
  if (!selectedCompanyId.value) return;
  const c = companies.value.find((x) => x.id === selectedCompanyId.value);
  if (!c) return;

  if (!confirm(`"${c.name}" firmasını silmek istediğinize emin misiniz?`)) {
    return;
  }

  try {
    await api.delete(`/admin/companies/${selectedCompanyId.value}`);

    companies.value = companies.value.filter(
      (x) => x.id !== selectedCompanyId.value
    );

    if (companies.value.length > 0) {
      selectedCompanyId.value = companies.value[0].id;
      companyForm.value = cloneCompanyToForm(companies.value[0]);
    } else {
      selectedCompanyId.value = null;
      companyForm.value = createEmptyCompanyForm();
    }

    alert("Firma silindi.");
  } catch (err) {
    console.error(err);
    alert("Firma silinirken bir hata oluştu.");
  }
}
</script>

