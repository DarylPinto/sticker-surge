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
			showPackSubscriberList: false,
			showPackHelperDialog: false,
			showPublishTooltip: false
		}
	},

	computed: {
		isUsersPack: function(){return this.userId === this.creatorId},
		nameFontSize: function(){
			let size = 0.9 - (this.name.length / 25);
			if(size < 0.52) size = 0.52;
			return size.toString() + 'em';
		},
		//Check if pack is able to be published
		publishCheck: function(){
			let remaining = (4 - this.stickers.length < 0) ? 0 : 4 - this.stickers.length;	
			let item = (remaining === 1) ? "Sticker" : "Stickers";
			return {
				valid: remaining === 0,
				invalidMessage: `Add ${remaining} More ${item} Before Publishing`
			}	
		}
	},	

	methods: {
		loadPackData: function(isInitialLoad){	
			this.pageLoaded = false;
				
			axios.get(`/api/sticker-packs/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				if(!res.data.listed || (!res.data.published && res.data.creatorId !== this.userId)){
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

				//Show helper dialog
				if(isInitialLoad && this.isUsersPack && !this.published){
					this.showPackHelperDialog = true;
				}
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
			})
			.catch(err => {
				console.error(err.message);
			});
		}, 400),

		updatePackIcon: function(formData){
			formData.set('name', this.name);
			formData.set('description', this.description);

			axios.patch(`/api/sticker-packs/${this.$route.params.id}`, formData, {'Content-Type': 'multipart/form-data'})
			.catch(err => {
				console.error(err.message);
			});
		},

		//stackoverflow.com/a/995374
		adjustDescHeight: function(){	
			let textarea = this.$el.querySelector('.pack-desc');
			textarea.style.height = "1px";
			textarea.style.height = textarea.scrollHeight+"px";
		},

		publishPack: function(){
			if(!this.publishCheck.valid) return;
			axios.post(`/api/sticker-packs/${this.$route.params.id}/publish`)
			.then(res => {
				this.$cookie.delete('currentNewPack');
				this.published = res.data.published;
				this.showPackHelperDialog = true;	
			})
			.catch(err => {
				console.error(err.message);
			})
		},

		deletePack: function(){
			if(this.published) return;
			if(!confirm(`Are you sure you want to delete this pack?`)) return false;
			axios.delete(`/api/sticker-packs/${this.$route.params.id}`)
			.then(res => {
				this.$cookie.delete('currentNewPack');
				window.location.replace('/sticker-packs');
			})
			.catch(err => {
				console.error(err.message);
			})
		}

	},

	watch: {
		'$route': function(){	
			this.loadPackData(true);
		}
	},

	mounted: function(){
		this.loadPackData(true);
	}

}

</script>

<template>
<main class="sticker-pack-page">

	<header-bar :userId="userId"></header-bar>

	<div v-if="!pageLoaded" class="loading-page">
		<img src="/images/loading-spin.svg">
	</div>

	<div :class="{transparent: !pageLoaded}">

		<header class="pack-header">
			<groupIcon :defaultImage="iconURL" :canEdit="isUsersPack" @iconUpdated="updatePackIcon($event, formData)" />
			<input v-model="name" class="pack-title" spellcheck="false" maxlength="30" :style="`font-size: ${nameFontSize}`" :disabled="!isUsersPack" @input="updatePackData" />
			<textarea
				v-model="description"
				class="pack-desc"
				spellcheck="false"
				maxlength="110"
				:disabled="!isUsersPack"
				@input="updatePackData"
				@keydown="adjustDescHeight"
				@blur="adjustDescHeight"
			>
			</textarea>
			<div class="buttons">
				<a v-if="published" class="btn hollow" @click="showPackSubscriberList = true">Use This Pack</a>

				<!-- Pre-Publish Buttons -->
				<div v-if="!published && !publishCheck.valid" class="tooltip top" :class="{transparent: !showPublishTooltip}">
					{{!publishCheck.valid ?	publishCheck.invalidMessage : "Publish This Pack!"}}
				</div>
				<a
					v-if="!published"
					class="btn hollow publish"
					:class="{disabled: stickers.length < 4}"
					@click="publishPack"
					@mouseover="showPublishTooltip = true"
					@mouseleave="showPublishTooltip = false"
				>
					Publish This Pack
				</a>
				<a v-if="!published" @click="deletePack" class="btn hollow secondary">Delete Pack</a>	
			</div>
		</header>
		
		<div class="container">

			<stickerCollection
				v-on:reload="loadPackData(false)"
				name="Stickers in this pack"
				:stickerPrefix="key"
				:emojiNamesAllowed="true"
				:stickers="stickers"
				:maxStickers="400"
				:pageType="pageType"
				:userId="userId"
				:groupId="key"
				groupType="sticker-packs"
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
						<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=536879104" class="btn" target="_blank">Add to Discord</a>
					</li>	
					<li>In your server, type: <pre><span class="mention">@Stickers for Discord</span> addPack {{key}}</pre></li>	
				</ol>	
			</div>
		</modal>
	
		<modal
			v-if="isUsersPack"
			v-show="showPackHelperDialog"
			@close="showPackHelperDialog = false"
		>
			<div class="pack-helper-dialog">
				<div v-if="!published">
					<h1>Almost Done!</h1>	
					<p>Once you add at least 4 stickers, you'll be able to publish this Sticker Pack for everyone to use!</p>
				</div>
				<div v-if="published">
					<h1>Congratulations!</h1>	
					<p>Congratulations! The <b>{{name}}</b> Sticker Pack has been published!</p>
				</div>
				<div class="buttons">
					<a class="btn" @click="showPackHelperDialog = false">Got it</a>	
				</div>
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
				overflow: hidden
			.buttons
				display: flex
				.tooltip
					margin-left: -13px
					margin-top: -35px
					&:after
						left: 115px	
			.btn
				min-width: 200px
				margin-top: 20px
				margin-left: 10px
				margin-right: 10px
				text-align: center
				font-size: 18px
				padding: 10px 20px
				display: inline-block
				&.publish:not(.disabled)
					animation: glow 0.525s ease-in 0s infinite alternate
				&.disabled, &.secondary
					//font-size: 15px
					color: gray
					border-color: gray
					background-color: transparent
				&.secondary:hover
					border-color: white
					color: white

	.use-pack-instructions, .pack-helper-dialog
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
				padding: 9px 16px
		p
			font-weight: 100
			font-size: 20px
			line-height: 1.6em	
			margin-top: -10px
			margin-bottom: 30px
			text-align: center
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
		.buttons
			margin-top: -15px
			text-align: center
			.btn
				font-size: 20px
				padding: 10px
				width: 130px
				
	@media screen and (max-width: 650px)
		.sticker-pack-page > header
			font-size: 45px
			justify-content: center	

	@media screen and (max-width: 560px)
		.sticker-pack-page
			> header > img
				height: 75px
				width: 75px
			header.pack-header
				.pack-title, .pack-desc 
					max-width: 90%


	@media screen and (max-width: 450px)
		.sticker-pack-page > header
			font-size: 35px
			> img
				height: 60px
				width: 60px
				border-width: 3px

</style>