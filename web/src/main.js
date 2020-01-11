import Vue from "vue";
import App from "./App.vue";
import "./sass/style.sass";
import "./registerServiceWorker";
import router from "./router";
import VueCookie from "vue-cookie";

Vue.use(VueCookie);
Vue.config.productionTip = false;
Vue.prototype.$apiURL = 'http://localhost:3000'

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
