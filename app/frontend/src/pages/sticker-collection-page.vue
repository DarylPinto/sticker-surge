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
			customStickers: [],
			stickerName: '',
			stickerURL: ''
		}
	},

	methods: {
		loadStickers(){	
			axios.get(`/api/${this.page_type}/${this.$route.params.id}`)
			.then(res => {
				this.customStickers = res.data.customStickers;
				this.username = res.data.username;	
				this.$el.querySelector('.sticker-collection').classList.remove('faded-out');
			}).catch(err => console.error(err.response.data));
		},
		addSticker(){
			axios.post(`/api/${this.page_type}/${this.$route.params.id}/stickers`, {
				name: this.stickerName,
				url: this.stickerURL	
			})
			.then(res => {
				this.loadStickers();
				console.log(res);
			}).catch(err => console.error(err.response.data));
		},
		deleteSticker(){
			axios.delete(`/api/${this.page_type}/${this.$route.params.id}/stickers/${this.stickerName}`)
			.then(res => {
				this.loadStickers();
				console.log(res);
			}).catch(err => console.error(err.response.data));
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
	<div class="container sticker-collection faded-out">

		<h1>{{username}}</h1>
		
		<input v-model="stickerName" placeholder="name">
		<input v-model="stickerURL" placeholder="url">
		<button @click="addSticker">Add sticker</button>
		<button @click="deleteSticker">Delete sticker</button>	

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

	.sticker-collection	
		transition: .3s
		&.faded-out
			opacity: 0
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
		input, button
			color: black

	.sticker-area
		font-size: 0

</style>