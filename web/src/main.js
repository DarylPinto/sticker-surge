import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCookie from "vue-cookie";
import VueGtag from "vue-gtag";
import "./sass/style.sass";
import "./registerServiceWorker";

Vue.use(VueCookie);
Vue.config.productionTip = false;
Vue.prototype.$apiURL = process.env.VUE_APP_URL;
Vue.prototype.$botId = process.env.VUE_APP_DISCORD_APP_ID;
Vue.prototype.$botInviteURL = `https://discordapp.com/oauth2/authorize?client_id=${process.env.VUE_APP_DISCORD_APP_ID}&scope=bot&permissions=${process.env.VUE_APP_DISCORD_APP_BOT_PERMS}`;

if (!!process.env.VUE_APP_GA_ENABLED) {
  Vue.use(VueGtag, {
    config: { id: process.env.VUE_APP_GA_ID }
  });
}

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
