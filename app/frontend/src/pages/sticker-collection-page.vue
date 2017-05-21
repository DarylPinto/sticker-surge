<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import sticker from '../components/sticker.vue';
import liteModal from '../scripts/lite-modal.js';

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
			stickerCreationError: '',
			liteModal: liteModal,
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
				liteModal.init();
			}).catch(err => {
				if(err.response.status === 404) window.location.replace('/');
			});
		},


		addSticker(){
			axios.post(`/api/${this.pageType}/${this.$route.params.id}/stickers`, {
				name: this.stickerName,
				url: this.stickerURL
			})
			.then(res => {
				this.stickerName = '';
				this.stickerURL = '';
				this.stickerCreationError = '';
				this.liteModal.close();
				this.loadPageData();
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
				this.stickerCreationError = err.response.data;
			});
		},


		deleteSticker(stickerName){
			axios.delete(`/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`)
			.then(res => {
				this.loadPageData();
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
			});
		},

		showConfirmDialog(text, callback){
			if(!confirm(text)) return false;
			callback();
		}

	},

	watch: {
		'$route': function(){
			this.$el.querySelector('.sticker-collection').classList.add('faded-out');
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

		<section>
			<header>
				<h2>Custom Stickers</h2>
				<button v-if="isUsersPage" class="btn" @click="liteModal.open('#sticker-creation-modal')">Add a Sticker</button>	
			</header>	
			<div class="sticker-area">
				<sticker
					v-for="sticker in customStickers"
					v-on:deleteSticker="showConfirmDialog('Are you sure you want to delete -'+sticker.name+'?', function(){deleteSticker(sticker.name)})"
					:link="sticker.url"
					:name="'-'+sticker.name"
					:prefix="null"
					:isUsersPage="isUsersPage">
				</sticker>
			</div>	
		</section>

		<form id="sticker-creation-modal" class="lite-modal" @submit.prevent="addSticker">
			<h1>Add a sticker</h1>
			<input v-model="stickerName" placeholder="name" pattern="^:?-?[a-z0-9]+:?$" title="Lowercase letters and numbers only" required>
			<input v-model="stickerURL" placeholder="url" required>
			<button class="btn">Add</button>
			<p>{{stickerCreationError}}</p>
		</form>

	</div>
</main>
</template>

<style lang="sass">

	.sticker-collection	
		transition: .3s
		&.faded-out
			opacity: 0
		> header
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
		section header
			margin-bottom: 20px
			padding-bottom: 10px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
			display: flex
			justify-content: space-between

	.lite-modal
		background-color: #36393E
		padding: 30px
		box-shadow: 0 0 10px black
		border: 1px solid rgba(255, 255, 255, 0.15)
		border-radius: 4px
		text-align: center
		h1
			font-weight: 100
			font-size: 40px
			margin-bottom: 20px
		input, button
			color: black
			margin: 10px auto
			width: 80%
		.btn
			color: white

	.sticker-area
		font-size: 0

</style>