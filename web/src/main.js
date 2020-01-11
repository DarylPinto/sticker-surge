import Vue from "vue";
import App from "./App.vue";
import "./sass/style.sass";
import "./registerServiceWorker";
import router from "./router";
import VueCookie from "vue-cookie";
import { app_url } from "../../covert.js";

Vue.use(VueCookie);
Vue.config.productionTip = false;
Vue.prototype.$apiURL = app_url;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
