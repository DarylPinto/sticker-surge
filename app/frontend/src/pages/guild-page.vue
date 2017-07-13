<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import stickerCollection from '../components/sticker-collection.vue';

Vue.component('header-bar', header);
Vue.component('stickerCollection', stickerCollection);

if(!Array.prototype.includes){
	Array.prototype.includes = function(item){
		return this.indexOf(item) > -1;
	}
}

module.exports = {
	props: ['pageType'],

	data: function(){
		return {
			guildId: '',
			guildName: '',
			iconURL: '',
			customStickers: [],
			guildManagerIds: [],
			stickerManagerIds: [],
			stickerManagerRole: '',
			stickerName: '',
			stickerURL: '',
			stickerCreationError: '',
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			userGuilds: JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || []
		}
	},

	computed: {
		userCanEdit: function(){
			if(!this.userId) return false; //User must be logged in
			if(!this.userGuilds.includes(this.guildId)) return false; //User must be part of guild
			if(this.stickerManagerIds.includes(this.userId) || this.guildManagerIds.includes(this.userId)) return true; //User must have content role or manager role
			if(this.stickerManagerRole === '@everyone') return true //User can edit if content role is set to @everyone
			return false;
		},
		nameFontSize: function(){
			let size = 90 - this.guildName.length;
			if(size < 50)	size = 50;
			return size.toString() + 'px';
		}
	},

	methods: {
		loadPageData(){	
			this.pageLoaded = false;

			axios.get(`/api/set-guilds?nocache=${(new Date()).getTime()}`)
			.then(() => {
				this.userGuilds = JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || []
			});

			axios.get(`/api/${this.pageType}/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				this.guildId = res.data.id;
				this.guildName = res.data.guildName;
				this.iconURL = res.data.icon ? `https://cdn.discordapp.com/icons/${res.data.id}/${res.data.icon}.png` : null;
				this.customStickers = res.data.customStickers;	
				this.guildManagerIds = res.data.guildManagerIds;
				this.stickerManagerIds = res.data.stickerManagerIds;
				this.stickerManagerRole = res.data.stickerManagerRole;
				document.title = `${res.data.guildName} - Stickers for Discord`;	
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
	
	<div class="container guild-page" :class="{transparent: !pageLoaded}">
		
		<header>
			<img v-if="iconURL" :src="iconURL" :alt="guildName">
			<img v-if="!iconURL" src="/images/default-discord-icon.png" :alt="guildName">
			<h1 :style="`font-size: ${nameFontSize}`">{{guildName}}</h1>	
		</header>

		<stickerCollection
			v-on:reload="loadPageData"
			name="Custom Stickers"
			:stickerPrefix="null"
			:emojiNamesAllowed="false"
			:stickers="customStickers"
			:maxStickers="400"
			:pageType="pageType"
			:isEditable="userCanEdit">
		</stickerCollection>

	</div>

</main>
</template>

<style lang="sass">

	.guild-page
		margin-bottom: 120px
		transition: .2s
		> header
			margin-top: 40px
			margin-bottom: 40px
			display: flex
			align-items: center
			> img
				border-radius: 100%
				height: 100px
				border: 5px solid rgba(255, 255, 255, 0.1)
		h1
			font-size: 90px
			display: inline-block
			margin-left: 15px

</style>