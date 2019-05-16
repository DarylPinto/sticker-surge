import './sass/style.sass';
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCookie from 'vue-cookie';

import homePage from './pages/home-page.vue';
import userPage from './pages/user-page.vue';
import guildPage from './pages/guild-page.vue';
import yourGuilds from './pages/your-guilds.vue';
import documentation from './pages/documentation.vue';
import stickerPackPage from './pages/sticker-pack-page.vue';
import stickerPacksListPage from './pages/sticker-pack-list-page.vue';
import createPackPage from './pages/create-pack-page.vue';

require.context('./images', true, /.*\.(gif|png|jpe?g|svg)$/i);

/******************************************************************/

Vue.use(VueRouter);
Vue.use(VueCookie);

const HomePage = Vue.component('home-page', homePage);
const UserPage = Vue.component('user-page', userPage);
const GuildPage = Vue.component('guild-page', guildPage);
const YourGuilds = Vue.component('your-guilds', yourGuilds);
const Documentation = Vue.component('documentation', documentation);
const StickerPackPage = Vue.component('sticker-pack-page', stickerPackPage);
const StickerPacksListPage = Vue.component('sticker-packs-list-page', stickerPacksListPage);
const CreatePackPage = Vue.component('create-pack-page', createPackPage);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', component: HomePage },
		{ path: '/user/:id', component: UserPage, props: {pageType: 'users'} },
		{ path: '/server/:id', component: GuildPage, props: {pageType: 'guilds'} },
		{ path: '/servers', component: YourGuilds },
		{ path: '/docs', component: Documentation},
		{ path: '/pack/:id', component: StickerPackPage, props: {pageType: 'sticker-packs'}},
		{ path: '/sticker-packs', component: StickerPacksListPage },
		{ path: '/sticker-packs/new', component: CreatePackPage }
	],
	scrollBehavior (to, from, savedPosition){
		return (savedPosition) ? savedPosition : {x: 0, y: 0};
	}
});

new Vue({
	el: "#root",
	router: router
});