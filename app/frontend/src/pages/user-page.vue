<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import footer from '../components/footer.vue';
import stickerCollection from '../components/sticker-collection.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);
Vue.component('stickerCollection', stickerCollection);

module.exports = {
	props: ['pageType'],

	data: function(){
		return {
			username: '',
			avatarURL: '',
			customStickers: [],
			stickerPacks: [],
			pageLoaded: false,
			stickerPackData: [],
			userId: this.$cookie.get('id') || null
		}
	},

	computed: {
		isUsersPage: function(){return this.userId === this.$route.params.id},
		nameFontSize: function(){
			let size = 0.9 - (this.username.length / 25);
			if(size < 0.52) size = 0.52;
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
				this.stickerPacks = res.data.stickerPacks;
				document.title = `${res.data.username} - Stickers for Discord`;	
				this.pageLoaded = true;
			})
			.then(() => {

				//If user is logged in and on their own page, update their username + avatar
				if(!this.isUsersPage) return;
				
				axios.get('/api/update-user-info')
				.then(res => {
					if(!res.data.updated) return;
					this.username = res.data.username;
					this.avatarURL = `https://cdn.discordapp.com/avatars/${this.userId}/${res.data.avatar}.png`;
					document.title = `${res.data.username} - Stickers for Discord`;
				});

			})
			.then(() => {
				return Promise.all(this.stickerPacks.map(key => {
					return axios.get(`/api/sticker-packs/${key}`);
				}));
			})
			.then(responseData => {
				responseData.reverse();
				this.stickerPackData = responseData.map(res => res.data);
				//Scroll to pack in url hash once all loaded
				setTimeout(this.scrollToUrlHash, 500);
			})
			.catch(err => {
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
<main class="user-page">

	<header-bar :userId="userId"></header-bar>
	
	<div v-if="!pageLoaded" class="loading-page">
		<img src="/images/loading-spin.svg">
	</div>

	<div :class="{transparent: !pageLoaded}">

		<header class="user-header">
			<groupIcon
				:defaultImage="(!avatarURL) ? '/images/default-discord-icon.png' : avatarURL" 
				:canEdit="false"
			/>
			<h1 :style="`font-size: ${nameFontSize}`">{{username}}</h1>
		</header>
			
		<div class="container">

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

			<stickerCollection
				v-for="pack in stickerPackData"
				:key="pack.key"
				:id="pack.key"
				:name="pack.name"
				:stickerPrefix="pack.key"
				:emojiNamesAllowed="false"
				:stickers="pack.stickers"
				:maxStickers="400"
				pageType="sticker-packs"
				:userId="userId"	
				:isEditable="false"
			>
			</stickerCollection>

		</div>

	</div>

	<footer-bar></footer-bar>

</main>
</template>

<style lang="sass">

	.user-page
		> div
			transition: .2s
		header.user-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 25px
			padding-bottom: 40px
			margin-bottom: 45px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 90px
		h1
			display: inline-block
			font-weight: 400

		.sticker-collection
			margin-bottom: 70px
			&:last-of-type
				margin-bottom: 0

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