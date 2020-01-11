import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCookie from "vue-cookie";
import VueGtag from "vue-gtag";
import { app_url, google_analytics } from "../../covert.js";
import "./sass/style.sass";
import "./registerServiceWorker";

Vue.use(VueCookie);
Vue.config.productionTip = false;
Vue.prototype.$apiURL = app_url;

if (google_analytics.enabled) {
  Vue.use(VueGtag, {
    config: { id: google_analytics.id }
  });
}

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
