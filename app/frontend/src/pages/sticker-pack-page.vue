<script>
import Vue from 'vue';
import axios from 'axios';
import debounce from 'debounce';
import header from '../components/header.vue';
import footer from '../components/footer.vue';
import stickerCollection from '../components/sticker-collection.vue';
import modal from '../components/modal.vue';
import packSubscriberList from '../components/pack-subscriber-list.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);
Vue.component('stickerCollection', stickerCollection);
Vue.component('modal', modal);
Vue.component('packSubscriberList', packSubscriberList);

module.exports = {
	props: ['pageType'],

	data: function(){
		return {
			name: '',
			key: '',
			description: '',
			iconURL: '',
			creatorId: '',
			stickers: [],
			published: false,
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			showPackSubscriberList: false
		}
	},

	computed: {
		isUsersPack: function(){return this.userId === this.creatorId},
		nameFontSize: function(){
			let size = 1 - (this.name.length / 25);
			if(size < 0.4) size = 0.4;
			return size.toString() + 'em';
		}
	},

	methods: {
		loadPackData: function(){	
			this.pageLoaded = false;
				
			axios.get(`/api/sticker-packs/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				if(!res.data.published && res.data.creatorId !== this.userId){
					return window.location.replace('/sticker-packs');
				}

				this.name = res.data.name;
				this.key = res.data.key;
				this.description = res.data.description;
				this.stickers = res.data.stickers;
				this.published = res.data.published;
				this.iconURL = res.data.icon ? res.data.icon : null;
				this.creatorId = res.data.creatorId;
				document.title = `${res.data.name} - Stickers for Discord`;	
				this.pageLoaded = true;
				setTimeout(this.adjustDescHeight, 100);
			}).catch(err => {
				if(err.response.status === 404) window.location.replace('/sticker-packs');
			});
		},

		updatePackData: debounce(function(){
			axios.patch(`/api/sticker-packs/${this.$route.params.id}`, {
				name: this.name,
				description: this.description
			})
			.then(res => {
				document.title = `${res.data.name} - Stickers for Discord`;
				console.log(res);
			})
			.catch(err => {
				console.error(err.message);
			});
		}, 400),

		//stackoverflow.com/a/995374
		adjustDescHeight: function(){	
			let textarea = this.$el.querySelector('.pack-desc');
			textarea.style.height = "1px";
			textarea.style.height = textarea.scrollHeight+"px";
		},

		publishPack: function(){
			axios.post(`/api/sticker-packs/${this.$route.params.id}/publish`)
			.then(res => {
				this.published = res.data.published;
				console.log(res);
			});
		}

	},

	watch: {
		'$route': function(){	
			this.loadPackData();
		}
	},

	mounted: function(){
		this.loadPackData();
	}

}

</script>

<template>
<main class="sticker-pack-page">

	<header-bar :userId="userId"></header-bar>

	<div :class="{transparent: !pageLoaded}">

		<header class="pack-header">
			<div class="pack-icon" :style="'background-image: url('+iconURL+')'"></div>
			<input v-model="name" class="pack-title" maxlength="30" :style="`font-size: ${nameFontSize}`" :disabled="!isUsersPack" @input="updatePackData" />
			<textarea class="pack-desc" v-model="description" maxlength="110" :disabled="!isUsersPack" @input="updatePackData" @keydown="adjustDescHeight">
			</textarea>
			<a v-if="published" class="btn hollow" @click="showPackSubscriberList = true">Use This Pack</a>	
			<a v-if="!published" class="btn hollow publish" :class="{disabled: stickers.length < 4}" @click="publishPack">
				{{stickers.length < 4 ?
					"Add "+(4-stickers.length)+" More "+(4-stickers.length===1?"Sticker":"Stickers")+" Before Publishing This Pack" :
					"Publish This Pack!"
				}}
			</a>	
		</header>
		
		<div class="container" :class="{transparent: !pageLoaded}">

			<stickerCollection
				v-on:reload="loadPackData"
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
			<!-- If Logged In -->
			<component
				v-if="userId"
				is="packSubscriberList"
				:userId="userId"
				:packKey="key"
			/>
			<!-- If Not Logged In	 -->
			<div v-if="!userId" class="use-pack-instructions">
				<h1>How to use this pack</h1>
				<ol>
					<li>
						Add the bot to your server:
						<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=8192" class="btn" target="_blank">Add to Discord</a>
					</li>	
					<li>In your server, type: <pre><span class="mention">@Stickers for Discord</span> addPack {{key}}</pre></li>	
				</ol>	
			</div>
		</modal>

	</div>

	<footer-bar></footer-bar>

</main>
</template>

<style lang="sass">

	.sticker-pack-page	
		> div
			transition: .2s
		header.pack-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 25px
			padding-bottom: 40px
			margin-bottom: 45px
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
			.pack-title
				display: block
				width: 100%
				max-width: 660px
				padding: 0
				border: none	
			.pack-desc
				display: block
				width: 100%
				max-width: 660px
				margin-top: 25px
				margin-bottom: 5px
				padding: 0
				font-size: 20px	
				color: gray
				font-weight: 100	
				text-align: center
				line-height: 1.4em
				background-color: transparent
				border: none	
				outline: 0
				min-height: 30px
				resize: none
			.btn
				margin-top: 20px
				font-size: 18px
				padding: 10px 20px
				&.publish:not(.disabled)
					animation: glow 1.5s ease-in 0s infinite alternate
				&.disabled
					font-size: 15px
					pointer-events: none
					color: gray
					border-color: gray

	.use-pack-instructions
		h1
			font-size: 32px
			text-align: center
			opacity: 0.8
			margin-bottom: 40px
		ol
			padding-top: 20px
			border-top: 1px solid rgba(255,255,255,0.2)
		li
			margin-left: 30px
			font-size: 20px
			margin-bottom: 15px
			.btn
				display: inline-block
				margin-left: 10px
		pre	
			font-family: "Helvetica", "Arial", sans-serif
			font-size: 16px
			border: 1px solid rgba(0,0,0,0.4)
			border-radius: 4px
			background-color: rgba(0,0,0,0.2) 
			padding: 10px
			margin-top: 12px
			display: inline-block
			margin-left: 5px
			.mention
				font-family: inherit 


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