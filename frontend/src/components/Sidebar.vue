<template>
  <aside class="w-64 bg-slate-900 text-slate-100 min-h-screen p-6">
    <h1 class="text-2xl font-bold mb-8">Simge Bilgisayar</h1>

    <nav>
      <ul class="space-y-3 text-sm">
  <li
    class="cursor-pointer rounded-md px-3 py-2"
    :class="props.activePage === 'stok' ? 'bg-slate-800' : 'hover:bg-slate-800'"
    @click="changePage('stok')"
  >
    Ürünler
  </li>

  <li
    class="cursor-pointer rounded-md px-3 py-2"
    :class="props.activePage === 'satis' ? 'bg-slate-800' : 'hover:bg-slate-800'"
    @click="changePage('satis')"
  >
    Satış Yap
  </li>

  <li class="cursor-pointer hover:bg-slate-800 rounded-md px-3 py-2">
    Tedarikçiler
  </li>
  <li class="cursor-pointer hover:bg-slate-800 rounded-md px-3 py-2">
    Ayarlar
  </li>
</ul>

    </nav>
  </aside>
</template>

<script setup>
const props = defineProps({
  activePage: {
    type: String,
    default: "stok",
  },
});

const emit = defineEmits(["change-page"]);

function changePage(page) {
  emit("change-page", page);
}
</script>

