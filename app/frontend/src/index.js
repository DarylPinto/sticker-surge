import './sass/style.sass';
import Vue from 'vue';
import VueRouter from 'vue-router';

import homePage from './pages/home-page.vue';
//import cityPage from './pages/city-page.vue';

//require.context('./images', true, /.*\.(gif|png|jpe?g|svg)$/i);

/******************************************************************/

Vue.use(VueRouter);

const Home = Vue.component('home-page', homePage);
//const City = Vue.component('city-page', cityPage);

//let cityRoutes = cityData.english
//  .map(route => ({path: `/${route.slug}`, component: City}));

const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', component: Home },
		//{ path: '/user', component: User },
		//{ path: '/server', component: Guild },
	]
});

new Vue({
	el: "#root",
	router: router
});