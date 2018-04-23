<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import stickerCollection from '../components/sticker-collection.vue';
import modal from '../components/modal.vue';
import packSubscriberList from '../components/pack-subscriber-list.vue';

Vue.component('header-bar', header);
Vue.component('stickerCollection', stickerCollection);
Vue.component('modal', modal);
Vue.component('packSubscriberList', packSubscriberList);

module.exports = {
	props: ['pageType'],

	data: function(){
		return {
			name: '',
			key: '',
			iconURL: '',
			creatorId: '',
			stickers: [],
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			showPackSubscriberList: false
		}
	},

	computed: {
		isUsersPack: function(){return this.userId === this.creatorId},
		nameFontSize: function(){
			let size = 1 - (this.name.length / 25);
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
				this.iconURL = res.data.icon ? res.data.icon : null;
				this.creatorId = res.data.creatorId;
				document.title = `${res.data.name} - Stickers for Discord`;	
				this.pageLoaded = true;
			}).catch(err => {
				if(err.response.status === 404) window.location.replace('/sticker-packs');
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
<main class="sticker-pack-page">

	<header-bar :userId="userId"></header-bar>

	<div :class="{transparent: !pageLoaded}">

		<header class="pack-header">
			<div class="pack-icon" :style="'background-image: url('+iconURL+')'"></div>
			<h1 :style="`font-size: ${nameFontSize}`">{{name}}</h1>
			<a class="btn hollow" @click="showPackSubscriberList = true">Add This Pack</a>	
		</header>
		
		<div class="container" :class="{transparent: !pageLoaded}">

			<stickerCollection
				v-on:reload="loadPageData"
				name="Stickers in this pack"
				:stickerPrefix="key"
				:emojiNamesAllowed="true"
				:stickers="stickers"
				:maxStickers="400"
				:pageType="pageType"
				:userId="userId"
				:isEditable="isUsersPack">
			</stickerCollection>

		</div>

		<modal
			v-show="showPackSubscriberList"
			@close="showPackSubscriberList = false"
		>
			<component
				is="packSubscriberList"
				:userId="userId"
				:packKey="key"
			/>
		</modal>

	</div>

</main>
</template>

<style lang="sass">

	.sticker-pack-page
		margin-bottom: 90px
		> div
			transition: .2s
		header.pack-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 25px
			padding-bottom: 40px
			margin-bottom: 25px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 90px
			.pack-icon
				display: block
				border-radius: 100%
				height: 90px
				width: 90px
				color: transparent
				font-size: 10px
				margin-bottom: 15px
				border: 5px solid #484848
				background-color: #1f1f1f
				background-size: cover
				background-position: center center
				background-repeat: no-repeat
			.btn
				margin-top: 20px
				font-size: 18px
				padding: 10px 20px

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