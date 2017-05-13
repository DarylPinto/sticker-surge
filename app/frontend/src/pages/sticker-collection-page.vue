<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import sticker from '../components/sticker.vue';

Vue.component('header-bar', header);
Vue.component('sticker', sticker);

module.exports = {
	props: ['page_type'],

	data: function(){
		return {
			username: '',
			customStickers: []
		}
	},

	methods: {
		loadStickers(){	
			axios.get(`/api/${this.page_type}/${this.$route.params.id}`)
			.then(res => {
				this.customStickers = res.data.customStickers;
				this.username = res.data.username;	
				this.$el.querySelector('.faded-out').classList.remove('faded-out');	
			}).catch(err => console.log(err));
		}
	},

	watch: {
		'$route': function(){
			this.loadStickers();
		}
	},

	mounted: function(){
		this.loadStickers();	
	}

}

</script>

<template>
<main>

	<header-bar></header-bar>
	<div class="container faded-out">

		<h1>{{username}}</h1>

		<section>
			<h2>Custom Stickers</h2>
			<div class="sticker-area">
				<sticker v-for="sticker in customStickers" :link="sticker.url" :name="'-'+sticker.name"></sticker>
			</div>	
		</section>

	</div>
</main>
</template>

<style lang="sass">

	.container
		transition: .5s
		&.faded-out
			opacity: 0

	.sticker-area
		font-size: 0

	h1
		font-weight: 100
		font-size: 90px
		margin-top: 40px
		margin-bottom: 20px
		margin-left: -8px

	h2
		font-size: 30px
		font-weight: 300
		border-bottom: 2px solid rgba(255, 255, 255, 0.45)
		margin-bottom: 20px
		padding-bottom: 10px

</style>