import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { store, key } from "@/stores/store";

const i18n = createI18n({
  legacy: false,
  locale: "ru",
  fallbackLocale: "ru",
});

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(i18n);
app.use(store, key);
app.use(router);

app.mount("#app");
