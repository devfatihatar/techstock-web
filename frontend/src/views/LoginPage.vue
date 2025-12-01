<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div
      class="w-full max-w-5xl bg-slate-900/60 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1.1fr,1fr]"
    >
      <!-- SOL TARAF: Tanıtım / slogan -->
      <div class="relative bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-slate-900 p-8 lg:p-10 flex flex-col justify-between">
        <!-- Üst badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-sky-500/40 text-[11px] text-sky-100 mb-6 w-fit">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          TechStock • Akıllı Stok Yönetimi
        </div>

        <div class="space-y-4">
          <h1 class="text-3xl lg:text-4xl font-semibold text-slate-50 leading-tight">
            Stok, cihaz ve satışlarını
            <span class="text-sky-400">tek panelden</span> yönet.
          </h1>
          <p class="text-sm text-slate-300/80 max-w-md">
            TechStock ile tamirdeki cihazları, satış hareketlerini ve stok durumunu
            saniyeler içinde gör. Fazla karmaşık ekranlar olmadan,
            <span class="text-sky-300">sadece ihtiyacın olan veriyi</span> önüne getirir.
          </p>

          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200/90">
            <div class="flex items-start gap-2">
              <div class="mt-0.5 h-5 w-5 rounded-full bg-sky-500/10 flex items-center justify-center text-[11px] text-sky-300 border border-sky-500/40">
                ✓
              </div>
              <div>
                <p class="font-medium text-slate-50">Cihaz & Tamir takibi</p>
                <p class="text-slate-300/80">
                  Hangi cihaz hangi aşamada, teslim tarihi ne, hepsini tek bakışta gör.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <div class="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[11px] text-emerald-300 border border-emerald-500/40">
                ₺
              </div>
              <div>
                <p class="font-medium text-slate-50">Stok & satış kontrolü</p>
                <p class="text-slate-300/80">
                  Hangi üründen ne kadar kaldı, hangi gün ne kadar satış oldu takip et.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <div class="mt-0.5 h-5 w-5 rounded-full bg-sky-500/10 flex items-center justify-center text-[11px] text-sky-300 border border-sky-500/40">
                ⏱
              </div>
              <div>
                <p class="font-medium text-slate-50">Dakikalar içinde başlangıç</p>
                <p class="text-slate-300/80">
                  Karmaşık kurulum yok, giriş yap ve cihazlarını eklemeye başla.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <div class="mt-0.5 h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center text-[11px] text-amber-300 border border-amber-500/40">
                🔒
              </div>
              <div>
                <p class="font-medium text-slate-50">Rol tabanlı güvenlik</p>
                <p class="text-slate-300/80">
                  Firma kullanıcıları sadece kendi verilerini görür, ayarlara sen hükmedersin.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Alt: küçük bilgi -->
        <div class="mt-8 pt-6 border-t border-slate-800/60 text-[11px] flex flex-wrap gap-4 justify-between text-slate-400">
          <span>Versiyon 1.0 • TechStock Web Panel</span>
          <span>Geliştirici: <span class="text-sky-300">Fatih Atar</span></span>
        </div>
      </div>

      <!-- SAĞ TARAF: Login kartı -->
      <div class="bg-slate-950/80 h-full flex items-center justify-center p-6 lg:p-8">
        <div class="w-full max-w-sm bg-slate-900/80 border border-slate-800 shadow-xl rounded-2xl p-6 space-y-5">
          <!-- Mod badge -->
          <div class="flex items-center justify-between mb-1">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] border"
                 :class="isAdminLogin
                   ? 'bg-slate-900/80 border-sky-500/50 text-sky-200'
                   : 'bg-slate-900/80 border-emerald-500/40 text-emerald-200'">
              <span class="w-1.5 h-1.5 rounded-full"
                    :class="isAdminLogin ? 'bg-sky-400' : 'bg-emerald-400'"></span>
              <span class="font-medium tracking-wide">
                {{ isAdminLogin ? "Yönetici Oturumu" : "Firma Paneli Girişi" }}
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-slate-50">
              {{ isAdminLogin ? "Admin Giriş" : "TechStock Giriş" }}
            </h2>
            <p class="text-xs text-slate-400">
              {{
                isAdminLogin
                  ? "TechStock genel ayarlarını ve tüm firmaları buradan yönet."
                  : "Firmanızın cihaz, stok ve satış ekranlarına erişim için giriş yapın."
              }}
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-300">
                E-posta
              </label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full border border-slate-700 bg-slate-900/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400"
                :placeholder="isAdminLogin ? 'admin@techstock.com' : 'ornek@firmaniz.com'"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-300">
                Şifre
              </label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full border border-slate-700 bg-slate-900/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400"
                placeholder="••••••••"
              />
            </div>

            <p v-if="error" class="text-xs text-red-400">
              {{ error }}
            </p>

            <button
              type="submit"
              class="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              :class="isAdminLogin
                ? 'bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'"
              :disabled="loading"
            >
              <span>
                {{
                  loading
                    ? "Giriş yapılıyor..."
                    : (isAdminLogin ? "Admin Olarak Giriş Yap" : "Giriş Yap")
                }}
              </span>
            </button>
          </form>

          <div class="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div>
              <p class="font-medium text-slate-200 mb-0.5">Hesabınız yok mu?</p>
              <p>
                Kayıt için bana ulaşın:
                <span class="font-semibold text-sky-300">
                  fatihatar07@outlook.com
                </span>
              </p>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span>
                {{
                  isAdminLogin
                    ? "Firma hesabı ile giriş yapmak ister misiniz?"
                    : "Yönetici olarak giriş yapmak mı istiyorsunuz?"
                }}
              </span>
              <RouterLink
                :to="isAdminLogin ? { name: 'company-login' } : { name: 'admin-login' }"
                class="text-sky-300 hover:text-sky-200 font-semibold hover:underline"
              >
                {{ isAdminLogin ? "Firma Girişi" : "Admin Girişi" }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../api/client";

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const TOKEN_KEY = "ts_token";
const USER_KEY = "ts_user";
const COMPANY_KEY = "ts_company";

// /admin-login -> meta.loginType = "admin"
// /login       -> meta.loginType = "company"
const loginType = computed(() => route.meta.loginType || "company");
const isAdminLogin = computed(() => loginType.value === "admin");

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    console.log("[Login] mode:", isAdminLogin.value ? "ADMIN" : "COMPANY");

    // Backend: /api/auth/...  (api client baseURL muhtemelen /api)
    const endpoint = isAdminLogin.value
      ? "/auth/admin/login"
      : "/auth/login";

    console.log("[Login] endpoint:", endpoint);

    const res = await api.post(endpoint, {
      email: email.value,
      password: password.value,
    });

    console.log("[Login] response data:", res.data);

    let token;
    let user = null;
    let company = null;

    if (isAdminLogin.value) {
      // Admin login response'ü:
      // { message, token, user: { id, email, role } }
      token = res.data.token;
      user = res.data.user || {
        id: 0,
        email: email.value,
        role: "ADMIN",
        companyId: null,
      };
    } else {
      // Firma login response'ü:
      // { token, company: { id, name, email } }
      token = res.data.token;
      company = res.data.company;

      if (!company) {
        throw new Error("Sunucudan firma bilgisi alınamadı.");
      }

      user = {
        id: company.id,
        email: company.email,
        role: "COMPANY",
        companyId: company.id,
      };
    }

    if (!token) {
      throw new Error("Token bulunamadı.");
    }

    // 🔐 Auth store + localStorage
    auth.setAuth({ user, token, company });

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (company) {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
    }

    // 🔀 Yönlendirme
    if (isAdminLogin.value) {
      console.log("[Login] Admin -> settings yönlendirme");
      await router.push({ name: "settings" });
    } else {
      console.log("[Login] Company -> devices yönlendirme");
      await router.push({ name: "devices" });
    }
  } catch (err) {
    console.error("[Login] error:", err);
    error.value =
      err?.response?.data?.message ||
      err.message ||
      "Giriş yapılırken bir hata oluştu";
  } finally {
    loading.value = false;
  }
}
</script>



