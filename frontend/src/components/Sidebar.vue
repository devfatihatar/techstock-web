<template>
  <aside class="w-64 bg-slate-900 text-slate-100 px-4 py-6 flex flex-col">
    <h1 class="text-2xl font-bold mb-8">TechStock</h1>

    <nav>
      <ul class="space-y-3 text-sm">
        <li
          class="cursor-pointer rounded-md px-3 py-2"
          :class="
            props.activePage === 'stok' ? 'bg-slate-800' : 'hover:bg-slate-800'
          "
          @click="changePage('stok')"
        >
          Ürünler
        </li>

        <li
          class="cursor-pointer rounded-md px-3 py-2"
          :class="
            props.activePage === 'satis' ? 'bg-slate-800' : 'hover:bg-slate-800'
          "
          @click="changePage('satis')"
        >
          Satış Yap
        </li>

        
        <li
          class="cursor-pointer rounded-md px-3 py-2"
          :class="
            props.activePage === 'suppliers'
              ? 'bg-slate-800'
              : 'hover:bg-slate-800'
          "
          @click="changePage('suppliers')"
        >
          Tedarikçiler
        </li>
        <li
          class="cursor-pointer rounded-md px-3 py-2"
          :class="
            props.activePage === 'settings'
              ? 'bg-slate-800'
              : 'hover:bg-slate-800'
          "
          @click="changePage('settings')"
        >
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
