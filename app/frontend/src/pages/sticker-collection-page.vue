<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import sticker from '../components/sticker.vue';

Vue.component('header-bar', header);
Vue.component('sticker', sticker);

module.exports = {
	props: ['pageType'],

	data: function(){
		return {
			username: '',
			avatarURL: '',
			customStickers: [],
			stickerName: '',
			stickerURL: '',
			userId: this.$cookie.get('id') || null
		}
	},

	computed: {
		isUsersPage: function(){return this.userId === this.$route.params.id}
	},

	methods: {
		loadPageData(){	
			axios.get(`/api/${this.pageType}/${this.$route.params.id}`)
			.then(res => {
				this.customStickers = res.data.customStickers;
				this.username = res.data.username;
				this.avatarURL = res.data.avatar ? `https://cdn.discordapp.com/avatars/${res.data.id}/${res.data.avatar}.png` : null;
				document.title = `${res.data.username} - Stickers for Discord`;
				this.$el.querySelector('.sticker-collection').classList.remove('faded-out');
			}).catch(err => console.error(err.response.data));
		},
		addSticker(){
			axios.post(`/api/${this.pageType}/${this.$route.params.id}/stickers`, {
				name: this.stickerName,
				url: this.stickerURL	
			})
			.then(res => {
				this.loadPageData();
				console.log(res);
			}).catch(err => {
				console.error(err.response.data);
				if(err.response.status === 401) window.location.href = '/login';
			});
		},
		deleteSticker(){
			axios.delete(`/api/${this.pageType}/${this.$route.params.id}/stickers/${this.stickerName}`)
			.then(res => {
				this.loadPageData();
				console.log(res);
			}).catch(err => {
				console.error(err.response.data);
				if(err.response.status === 401) window.location.href = '/login';
			});

		}
	},

	watch: {
		'$route': function(){
			this.loadPageData();
		}
	},

	mounted: function(){
		this.loadPageData();
	}

}

</script>

<template>
<main>

	<header-bar :userId="userId"></header-bar>
	<div class="container sticker-collection faded-out">
		
		<header class="user">
			<img v-if="avatarURL" :src="avatarURL" :alt="username">
			<h1>{{username}}</h1>	
		</header>
		
		<div v-if="isUsersPage">
			<input v-model="stickerName" placeholder="name">
			<input v-model="stickerURL" placeholder="url">
			<button @click="addSticker">Add sticker</button>
			<button @click="deleteSticker">Delete sticker</button>		
		</div>	

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
		header
			margin-top: 40px
			margin-bottom: 40px
			display: flex
			align-items: center
			img
				border-radius: 100%
				height: 100px
		h1
			font-weight: 100
			font-size: 90px
			display: inline-block
			margin-left: 15px

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