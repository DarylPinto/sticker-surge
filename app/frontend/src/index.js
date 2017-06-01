import './sass/style.sass';
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCookie from 'vue-cookie';

import homePage from './pages/home-page.vue';
import userPage from './pages/user-page.vue';
import guildPage from './pages/guild-page.vue';

require.context('./images', true, /.*\.(gif|png|jpe?g|svg)$/i);

/******************************************************************/

Vue.use(VueRouter);
Vue.use(VueCookie);

const HomePage = Vue.component('home-page', homePage);
const UserPage = Vue.component('user-page', userPage);
const GuildPage = Vue.component('guild-page', guildPage);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', component: HomePage },
		{ path: '/user/:id', component: UserPage, props: {pageType: 'users'} },
		{ path: '/server/:id', component: GuildPage, props: {pageType: 'guilds'} }
	]
});

new Vue({
	el: "#root",
	router: router
});