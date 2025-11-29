<template>
  <div class="pb-10">
    <!-- ÜST BAŞLIK -->
    <header
      class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-xl md:text-2xl font-semibold text-slate-800">
          Ayarlar
        </h1>
        <p class="text-xs md:text-sm text-slate-500">
          Firmaları yönetin, hangi modüllerin aktif olacağını seçin.
        </p>
      </div>

      <div class="md:text-right text-[11px] md:text-xs text-slate-500">
        <div class="font-semibold">
          Aktif Firma:
          <span class="text-slate-900">
            {{ activeCompany?.name || "Henüz seçilmedi" }}
          </span>
        </div>
        <div v-if="activeCompany" class="text-[11px]">
          {{ activeCompany.username }}
        </div>
      </div>
    </header>

    <!-- 🔐 Admin şifre alanı -->
    <section class="mb-6 max-w-xl">
      <!-- İlk defa şifre oluşturma -->
      <div
        v-if="!hasAdminPassword"
        class="bg-white rounded-xl shadow p-4 border border-slate-200 text-sm"
      >
        <h2 class="text-sm sm:text-base font-semibold text-slate-800 mb-2">
          Admin Şifresi Oluştur
        </h2>
        <p class="text-[11px] text-slate-500 mb-3">
          Bu şifre yalnızca ayarlar sayfasına giriş için kullanılacaktır. Şu an
          için şifreler tarayıcıda
          <span class="font-semibold">localStorage</span>
          üzerinde tutulur, dışarıya gönderilmez.
        </p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">
              Admin Şifresi
            </label>
            <input
              v-model="adminCreatePassword"
              type="password"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="En az 4 karakter"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Şifre (Tekrar)
            </label>
            <input
              v-model="adminCreatePasswordConfirm"
              type="password"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tekrar girin"
            />
          </div>

          <button
            type="button"
            @click="createAdminPassword"
            class="mt-1 px-4 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.99]"
          >
            Admin şifresini kaydet
          </button>
        </div>
      </div>

      <!-- Mevcut şifreden giriş -->
      <div
        v-else-if="hasAdminPassword && !isAdminUnlocked"
        class="bg-white rounded-xl shadow p-4 border border-slate-200 text-sm"
      >
        <h2 class="text-sm sm:text-base font-semibold text-slate-800 mb-2">
          Admin Girişi
        </h2>
        <p class="text-[11px] text-slate-500 mb-3">
          Ayarlar sayfasına erişmek için admin şifresini girin.
        </p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">
              Admin Şifresi
            </label>
            <input
              v-model="adminLoginPassword"
              type="password"
              class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Admin şifrenizi girin"
              @keyup.enter="loginAsAdmin"
            />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <button
              type="button"
              @click="loginAsAdmin"
              class="px-4 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.99]"
            >
              Giriş yap
            </button>

            <p class="text-[10px] sm:text-[11px] text-slate-500">
              Şifreyi unuttuysanız localStorage'dan silerek yeniden oluşturmanız
              gerekir.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 🔧 Asıl firma + modül ayarları sadece admin açıkken -->
    <section
      v-if="isAdminUnlocked || !hasAdminPassword"
      class="flex flex-col lg:flex-row gap-6"
    >
      <!-- Sol: Firma listesi -->
      <div
        class="w-full lg:max-w-xs bg-white rounded-xl shadow p-4 text-sm"
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
            class="text-[11px] sm:text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Yeni
          </button>
        </div>

        <div class="text-[11px] sm:text-xs">
          <div v-if="companies.length === 0" class="text-slate-500">
            Henüz firma eklenmemiş. Yeni bir firma oluşturun.
          </div>

          <ul
            v-else
            class="space-y-1 max-h-[360px] overflow-y-auto mt-1"
          >
            <li
              v-for="c in companies"
              :key="c.id"
              class="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer"
              :class="
                c.id === selectedCompanyId
                  ? 'bg-slate-900 text-white'
                  : 'hover:bg-slate-100 text-slate-800'
              "
              @click="selectCompany(c.id)"
            >
              <div>
                <div class="font-semibold">
                  {{ c.name }}
                </div>
                <div
                  class="text-[10px]"
                  :class="
                    c.id === selectedCompanyId
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  "
                >
                  {{ c.username || 'Kullanıcı yok' }}
                </div>
              </div>

              <div class="flex flex-col items-end gap-1">
                <span
                  v-if="activeCompanyId === c.id"
                  class="text-[10px] px-2 py-0.5 rounded-full"
                  :class="
                    c.id === selectedCompanyId
                      ? 'bg-white/15 text-emerald-100 border border-emerald-200/40'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  "
                >
                  Aktif
                </span>
                <span
                  v-if="!c.isActive"
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
      <div class="flex-1 bg-white rounded-xl shadow p-4 sm:p-6 text-sm">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2"
        >
          <h2 class="text-sm sm:text-base font-semibold text-slate-800">
            {{ selectedCompanyId ? "Firma Ayarları" : "Yeni Firma Oluştur" }}
          </h2>

          <div class="flex items-center gap-2">
            <button
              v-if="selectedCompanyId"
              type="button"
              @click="setAsActiveCompany"
              class="text-[11px] sm:text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
            >
              Bu firmayı aktif yap
            </button>

            <button
              v-if="selectedCompanyId"
              type="button"
              @click="deleteCompany"
              class="text-[11px] sm:text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
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
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <h3 class="text-[11px] sm:text-xs font-semibold text-slate-500 mb-2">
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
                    class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Yeni şifre belirleyin"
                  />
                  <p class="text-[11px] text-slate-500 mt-1">
                    Şimdilik localStorage'da tutuluyor; gerçek sistemde sunucu
                    tarafında hash'lenmesi gerekir.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-[11px] sm:text-xs font-semibold text-slate-500 mb-2">
                Aktif Modüller
              </h3>

              <div class="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
                <label
                  class="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    v-model="companyForm.modules.devices"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <span>Cihaz Yönetimi</span>
                </label>

                <label
                  class="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    v-model="companyForm.modules.repairs"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <span>Tamir Yönetimi</span>
                </label>

                <label
                  class="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    v-model="companyForm.modules.sales"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <span>Satış / Fatura</span>
                </label>

                <label
                  class="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    v-model="companyForm.modules.stock"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <span>Stok Yönetimi</span>
                </label>

                <label
                  class="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    v-model="companyForm.modules.suppliers"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <span>Tedarikçiler</span>
                </label>

                <label
                  class="inline-flex items-center gap-2 cursor-pointer"
                >
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
            class="px-4 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.99]"
          >
            Kaydet
          </button>

          <button
            type="button"
            @click="resetForm"
            class="px-4 py-2.5 rounded-md border text-sm text-slate-600 hover:bg-slate-50"
          >
            Temizle
          </button>
        </div>
      </div>
    </section>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, watch } from "vue";

const COMPANIES_STORAGE_KEY = "simge-companies";
const ACTIVE_COMPANY_KEY = "simge-active-company-id";
const ADMIN_PASSWORD_KEY = "simge-admin-password";

const companies = ref([]);
const selectedCompanyId = ref(null);
const activeCompanyId = ref(null);

const companyForm = ref(createEmptyCompanyForm());

// 🔐 Admin şifre state
const hasAdminPassword = ref(false);
const isAdminUnlocked = ref(false);
const adminCreatePassword = ref("");
const adminCreatePasswordConfirm = ref("");
const adminLoginPassword = ref("");

// 📥 LocalStorage'dan firmaları + aktif firmayı + admin şifre bilgisini yükle
onMounted(() => {
  // Firmalar
  try {
    const stored = localStorage.getItem(COMPANIES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      companies.value = Array.isArray(parsed) ? parsed : [];
    } else {
      companies.value = [];
    }
  } catch (e) {
    console.error("Companies parse error:", e);
    companies.value = [];
  }

  // Aktif firma
  try {
    const activeId = localStorage.getItem(ACTIVE_COMPANY_KEY);
    activeCompanyId.value = activeId ? Number(activeId) : null;
  } catch (e) {
    console.error("Active company parse error:", e);
    activeCompanyId.value = null;
  }

  // Admin şifresi var mı?
  try {
    const storedAdmin = localStorage.getItem(ADMIN_PASSWORD_KEY);
    hasAdminPassword.value = !!storedAdmin;
    // Eğer henüz şifre oluşturulmamışsa, ayarlar açık olsun ki ilk kurulum yapılabilsin
    isAdminUnlocked.value = !storedAdmin;
  } catch (e) {
    console.error("Admin password parse error:", e);
    hasAdminPassword.value = false;
    isAdminUnlocked.value = true;
  }

  // İlk firma yoksa otomatik bir örnek oluştur
  if (companies.value.length === 0) {
    const defaultId = Date.now();
    const defaultCompany = {
      id: defaultId,
      name: "Simge Bilgisayar",
      contactPerson: "",
      phone: "",
      email: "",
      username: "simgeadmin",
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
      createdAt: new Date().toISOString(),
    };
    companies.value.push(defaultCompany);
    activeCompanyId.value = defaultId;
    selectedCompanyId.value = defaultId;
    companyForm.value = { ...defaultCompany };
  } else {
    // Varsayılan seçili firma
    if (activeCompanyId.value) {
      selectedCompanyId.value = activeCompanyId.value;
    } else if (companies.value[0]) {
      selectedCompanyId.value = companies.value[0].id;
      activeCompanyId.value = companies.value[0].id;
    }
    const current = companies.value.find(
      (c) => c.id === selectedCompanyId.value
    );
    if (current) {
      companyForm.value = cloneCompanyToForm(current);
    }
  }
});

// 💾 Firmalar değişince kaydet
watch(
  companies,
  (val) => {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

// 💾 Aktif firma değişince kaydet
watch(
  activeCompanyId,
  (val) => {
    if (val == null) {
      localStorage.removeItem(ACTIVE_COMPANY_KEY);
    } else {
      localStorage.setItem(ACTIVE_COMPANY_KEY, String(val));
    }
  }
);

// 🧮 Seçilmiş ve aktif firma
const activeCompany = computed(() =>
  companies.value.find((c) => c.id === activeCompanyId.value) || null
);

const selectedCompany = computed(() =>
  companies.value.find((c) => c.id === selectedCompanyId.value) || null
);

// 🔐 Admin şifre oluştur
function createAdminPassword() {
  const pass = adminCreatePassword.value.trim();
  const confirm = adminCreatePasswordConfirm.value.trim();

  if (!pass || pass.length < 4) {
    alert("Admin şifresi en az 4 karakter olmalıdır.");
    return;
  }

  if (pass !== confirm) {
    alert("Şifreler eşleşmiyor.");
    return;
  }

  localStorage.setItem(ADMIN_PASSWORD_KEY, pass);
  hasAdminPassword.value = true;
  isAdminUnlocked.value = true;
  adminCreatePassword.value = "";
  adminCreatePasswordConfirm.value = "";
  alert("Admin şifresi kaydedildi. Ayarlara erişebilirsiniz.");
}

// 🔐 Admin giriş
function loginAsAdmin() {
  const input = adminLoginPassword.value.trim();
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);

  if (!stored) {
    alert("Henüz admin şifresi oluşturulmamış. Yeni şifre oluşturarak başlayın.");
    hasAdminPassword.value = false;
    isAdminUnlocked.value = true;
    return;
  }

  if (input === stored) {
    isAdminUnlocked.value = true;
    adminLoginPassword.value = "";
  } else {
    alert("Admin şifresi hatalı.");
  }
}

// 🧱 Boş form oluştur
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
    password: company.password || "",
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

// ➕ Yeni firma
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
function saveCompany() {
  if (!companyForm.value.name) {
    alert("Lütfen firma adını girin.");
    return;
  }

  const now = new Date().toISOString();

  if (selectedCompanyId.value) {
    // Güncelle
    const idx = companies.value.findIndex(
      (c) => c.id === selectedCompanyId.value
    );
    if (idx !== -1) {
      companies.value[idx] = {
        ...companies.value[idx],
        ...companyForm.value,
        modules: { ...companyForm.value.modules },
        updatedAt: now,
      };
    }
  } else {
    // Yeni firma
    const newId = Date.now();
    const newCompany = {
      id: newId,
      ...companyForm.value,
      modules: { ...companyForm.value.modules },
      createdAt: now,
    };
    companies.value.push(newCompany);
    selectedCompanyId.value = newId;

    // İlk firmaysa direkt aktif yap
    if (!activeCompanyId.value) {
      activeCompanyId.value = newId;
    }
  }

  alert("Firma ayarları kaydedildi.");
}

// ♻ Formu temizle (yeni firma moduna geç)
function resetForm() {
  if (selectedCompanyId.value) {
    companyForm.value = cloneCompanyToForm(
      companies.value.find((c) => c.id === selectedCompanyId.value) || {}
    );
  } else {
    companyForm.value = createEmptyCompanyForm();
  }
}

// 🟢 Aktif firma olarak seç
function setAsActiveCompany() {
  if (!selectedCompanyId.value) return;
  activeCompanyId.value = selectedCompanyId.value;
  alert("Aktif firma güncellendi.");
}

// 🗑 Firma sil
function deleteCompany() {
  if (!selectedCompanyId.value) return;
  const c = companies.value.find((x) => x.id === selectedCompanyId.value);
  if (!c) return;

  if (!confirm(`"${c.name}" firmasını silmek istediğinize emin misiniz?`)) {
    return;
  }

  companies.value = companies.value.filter((x) => x.id !== c.id);

  if (activeCompanyId.value === c.id) {
    activeCompanyId.value =
      companies.value.length > 0 ? companies.value[0].id : null;
  }

  selectedCompanyId.value =
    companies.value.length > 0 ? companies.value[0].id : null;

  if (selectedCompanyId.value) {
    const next = companies.value.find(
      (x) => x.id === selectedCompanyId.value
    );
    companyForm.value = next
      ? cloneCompanyToForm(next)
      : createEmptyCompanyForm();
  } else {
    companyForm.value = createEmptyCompanyForm();
  }
}
</script>
