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
			listMode: 'whitelist',
			whitelistRole: '',
			whitelistIds: [],
			blacklistIds: [],
			guildManagerIds: [],
			stickerManagerIds: [],
			stickerManagerRole: '',
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			userGuilds: JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || []
		}
	},

	computed: {
		userCanEdit: function(){
			if(!this.userId) return false; //User must be logged in
			else if(!this.userGuilds.includes(this.guildId)) return false; //User must be part of guild
			else if(this.guildManagerIds.includes(this.userId)) return true; //User can edit if guildManager
			else if(this.listMode === 'blacklist' && this.blacklistIds.includes(this.userId)) return false; //User cannot edit if blacklisted
			else if(this.listMode === 'whitelist'){
				if(this.whitelistRole === '@everyone' || this.whitelistIds.includes(this.userId) || this.stickerManagerIds.includes(this.userId)) return true;
				else if(this.whitelistRole != '@everyone' && !this.whitelistIds.includes(this.userId)) return false;
			}
			return false;
		},
		userIsGuildManager: function(){
			return this.guildManagerIds.includes(this.userId);
		},
		nameFontSize: function(){
			let size = 1 - (this.guildName.length / 100);
			if(size < 0.3) size = 0.3;
			return size.toString() + 'em';
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
				if(!res.data.isActive) return window.location.replace('/');
				this.guildId = res.data.id;
				this.guildName = res.data.guildName;
				this.iconURL = res.data.icon ? `https://cdn.discordapp.com/icons/${res.data.id}/${res.data.icon}.png` : null;
				this.customStickers = res.data.customStickers;
				this.listMode = res.data.listMode;
				this.whitelistRole = res.data.whitelist.roleId;
				this.whitelistIds = res.data.whitelist.userIds;
				this.blacklistIds = res.data.blacklist.userIds;
				this.guildManagerIds = res.data.guildManagerIds;
				this.stickerManagerIds = res.data.stickerManagers.userIds;
				this.stickerManagerRole = res.data.stickerManagers.roleId;
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
	
	<div v-if="!pageLoaded" class="loading-page">
		<img src="/images/loading-spin.svg">
	</div>

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
			:userId="userId"
			:userIsGuildManager="userIsGuildManager"
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
			font-size: 90px
			> img
				border-radius: 100%
				height: 100px
				color: transparent
				font-size: 10px
				border: 5px solid rgba(255, 255, 255, 0.1)
		h1
			display: inline-block
			margin-left: 15px

	@media screen and (max-width: 650px)
		.guild-page > header
			font-size: 45px
			justify-content: center
			margin-top: 25px
			margin-bottom: 25px

	@media screen and (max-width: 560px)
		.guild-page > header > img
				height: 75px
				width: 75px

	@media screen and (max-width: 450px)
		.guild-page > header
			font-size: 35px
			> img
				height: 60px
				width: 60px
				border-width: 3px

</style>