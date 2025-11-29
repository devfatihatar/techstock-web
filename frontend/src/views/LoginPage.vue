<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-2xl font-semibold text-slate-800 mb-2">
        TechStock Giriş
      </h1>
      <p class="text-sm text-slate-500 mb-6">
        Stok ve cihazlarınızı kolayca takip edin.
      </p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">
            E-posta
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-200"
            placeholder="simge@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">
            Şifre
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-200"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-lg py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? "Giriş yapılıyor..." : "Giriş Yap" }}
        </button>
      </form>

      <div class="mt-6 text-xs text-slate-500">
        <p class="font-medium text-slate-600 mb-1">Hesabınız yok mu?</p>
        <p>
          Kayıt için bana ulaşın:
          <span class="font-semibold text-sky-600">
            fatihatar07@outlook.com
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/client";

const emit = defineEmits(["login-success"]);

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const TOKEN_KEY = "ts_token";
const COMPANY_KEY = "ts_company";

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const res = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    const { token, company } = res.data;

    // Token + firma bilgisi kaydet
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(COMPANY_KEY, JSON.stringify(company));

    // App.vue'ye haber ver
    emit("login-success", company);
  } catch (err) {
    console.error(err);
    error.value =
      err?.response?.data?.message || "Giriş yapılırken bir hata oluştu";
  } finally {
    loading.value = false;
  }
}
</script>
