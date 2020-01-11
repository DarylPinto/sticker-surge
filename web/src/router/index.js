import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";
import User from "@/views/User.vue";
import Guild from "@/views/Guild.vue";
import GuildPopout from "@/views/GuildPopout.vue";
import YourGuilds from "@/views/YourGuilds.vue";
import Documentation from "@/views/Documentation.vue";
import StickerPack from "@/views/StickerPack.vue";
import StickerPacksList from "@/views/StickerPacksList.vue";
import CreatePack from "@/views/CreatePack.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", component: Home },
  { path: "/user/:id", component: User, props: { pageType: "users" } },
  { path: "/server/:id", component: Guild, props: { pageType: "guilds" } },
  {
    path: "/server/:id/popout",
    component: GuildPopout,
    props: { pageType: "guilds" }
  },
  { path: "/servers", component: YourGuilds },
  { path: "/docs", component: Documentation },
  {
    path: "/pack/:id",
    component: StickerPack,
    props: { pageType: "sticker-packs" }
  },
  { path: "/sticker-packs", component: StickerPacksList },
  { path: "/sticker-packs/new", component: CreatePack }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
