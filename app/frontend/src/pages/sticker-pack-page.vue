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
			name: '',
			key: '',
			iconURL: '',
			creatorId: '',
			stickers: [],
			stickerName: '',
			stickerURL: '',
			stickerCreationError: '',
			pageLoaded: false,
			userId: this.$cookie.get('id') || null
		}
	},

	computed: {
		isUsersPack: function(){return this.userId === this.creatorId},
		nameFontSize: function(){
			let size = 1 - (this.name.length / 100);
			if(size < 0.3) size = 0.3;
			return size.toString() + 'em';
		}
	},

	methods: {
		loadPageData(){	
			this.pageLoaded = false;
				
			axios.get(`/api/${this.pageType}/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {	
				this.name = res.data.name;
				this.key = res.data.key;
				this.stickers = res.data.stickers;
				this.iconURL = res.data.icon ? this.iconURL : null;
				this.creatorId = res.data.creatorId;
				document.title = `${res.data.name} - Stickers for Discord`;	
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
	
	<div class="container sticker-pack-page" :class="{transparent: !pageLoaded}">
		
		<header>
			<img v-if="iconURL" :src="iconURL" :alt="name">
			<img v-if="!iconURL" src="/images/default-discord-icon.png" :alt="name">
			<h1 :style="`font-size: ${nameFontSize}`">{{name}}</h1>	
		</header>

		<stickerCollection
			v-on:reload="loadPageData"
			:name="name"
			:stickerPrefix="key"
			:emojiNamesAllowed="true"
			:stickers="stickers"
			:maxStickers="400"
			:pageType="pageType"
			:userId="userId"
			:isEditable="isUsersPack">
		</stickerCollection>

	</div>

</main>
</template>

<style lang="sass">

	.sticker-pack-page
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
		.sticker-pack-page > header
			font-size: 45px
			justify-content: center
			margin-top: 25px
			margin-bottom: 25px

	@media screen and (max-width: 560px)
		.sticker-pack-page > header > img
			height: 75px
			width: 75px

	@media screen and (max-width: 450px)
		.sticker-pack-page > header
			font-size: 35px
			> img
				height: 60px
				width: 60px
				border-width: 3px

</style>