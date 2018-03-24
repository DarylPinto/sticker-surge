<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import stickerCollection from '../components/sticker-collection.vue';

Vue.component('header-bar', header);
Vue.component('stickerCollection', stickerCollection);

module.exports = {
	props: ['pageType'],

	data: function(){
		return {
			username: '',
			avatarURL: '',
			customStickers: [],
			pageLoaded: false,
			userId: this.$cookie.get('id') || null
		}
	},

	computed: {
		isUsersPage: function(){return this.userId === this.$route.params.id},
		nameFontSize: function(){
			let size = 1 - (this.username.length / 100);
			if(size < 0.3) size = 0.3;
			return size.toString() + 'em';
		}
	},

	methods: {
		loadPageData(){	
			this.pageLoaded = false;
				
			axios.get(`/api/${this.pageType}/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				this.customStickers = res.data.customStickers;
				this.username = res.data.username;
				this.avatarURL = res.data.avatar ? `https://cdn.discordapp.com/avatars/${res.data.id}/${res.data.avatar}.png` : null;
				document.title = `${res.data.username} - Stickers for Discord`;	
				this.pageLoaded = true;
			}).catch(err => {
				if(err.response.status === 404) window.location.replace('/');
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
	
	<div v-if="!pageLoaded" class="loading-page">
		<img src="/images/loading-spin.svg">
	</div>

	<div class="container user-page" :class="{transparent: !pageLoaded}">
		
		<header>
			<img v-if="avatarURL" :src="avatarURL" :alt="username">
			<img v-if="!avatarURL" src="/images/default-discord-icon.png" :alt="username">
			<h1 :style="`font-size: ${nameFontSize}`">{{username}}</h1>	
		</header>

		<stickerCollection
			v-on:reload="loadPageData"
			name="Custom Stickers"
			:stickerPrefix="null"
			:emojiNamesAllowed="true"
			:stickers="customStickers"
			:maxStickers="200"
			:pageType="pageType"
			:userId="userId"
			:isEditable="isUsersPage">
		</stickerCollection>

	</div>

</main>
</template>

<style lang="sass">

	.user-page
		margin-bottom: 90px
		transition: .2s
		> header
			margin-top: 40px
			margin-bottom: 40px
			display: flex
			align-items: center
			font-size: 90px
			> img
				border-radius: 100%
				height: 100px
				width: 100px
				color: transparent
				font-size: 10px
				border: 5px solid rgba(255, 255, 255, 0.1)
		h1
			display: inline-block
			margin-left: 15px

	@media screen and (max-width: 650px)
		.user-page > header
			font-size: 45px
			justify-content: center
			margin-top: 25px
			margin-bottom: 25px

	@media screen and (max-width: 560px)
		.user-page > header > img
			height: 75px
			width: 75px

	@media screen and (max-width: 450px)
		.user-page > header
			font-size: 35px
			> img
				height: 60px
				width: 60px
				border-width: 3px

</style>