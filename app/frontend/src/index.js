import './sass/style.sass';
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCookie from 'vue-cookie';

import homePage from './pages/home-page.vue';
import stickerCollectionPage from './pages/sticker-collection-page.vue';

require.context('./images', true, /.*\.(gif|png|jpe?g|svg)$/i);

/******************************************************************/

Vue.use(VueRouter);
Vue.use(VueCookie);

const Home = Vue.component('home-page', homePage);
const StickerCollection = Vue.component('sticker-collection-page', stickerCollectionPage);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', component: Home },
		{ path: '/user/:id', component: StickerCollection, props: {pageType: 'users'} },
		{ path: '/server/:id', component: StickerCollection, props: {pageType: 'guilds'} }
	]
});

new Vue({
	el: "#root",
	router: router
});