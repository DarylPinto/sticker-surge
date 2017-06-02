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
			stickerName: '',
			stickerURL: '',
			stickerCreationError: '',
			pageLoaded: false,
			userId: this.$cookie.get('id') || null
		}
	},

	computed: {
		isUsersPage: function(){return this.userId === this.$route.params.id}
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
	
	<div class="container user-page" :class="{transparent: !pageLoaded}">
		
		<header>
			<img v-if="avatarURL" :src="avatarURL" :alt="username">
			<h1>{{username}}</h1>	
		</header>

		<stickerCollection
			v-on:reload="loadPageData"
			name="Custom Stickers"
			stickerPrefix="-"
			:emojiNamesAllowed="true"
			:stickers="customStickers"
			:pageType="pageType"
			:isEditable="isUsersPage">
		</stickerCollection>

	</div>

</main>
</template>

<style lang="sass">

	.user-page
		margin-bottom: 120px
		transition: .3s
		&.transparent
			opacity: 0
		header
			margin-top: 40px
			margin-bottom: 40px
			display: flex
			align-items: center
			> img
				border-radius: 100%
				height: 100px
		h1
			font-weight: 100
			font-size: 90px
			display: inline-block
			margin-left: 15px

</style>