import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./main.css"; // sen ne kullanıyorsan

const app = createApp(App);

app.use(router);

app.mount("#app");
