import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import store from "./store/index.js";

import "vuetify/styles"; // Import Vuetify global styles
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import vueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);
app.use(vueToast);

app.mount("#app");