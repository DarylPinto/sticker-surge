<script>
import Vue from 'vue';
import axios from 'axios';
import userCanManageStickersInGuild from '../utilities/user-can-manage-stickers-in-guild.js';
import header from '../components/header.vue';
import footer from '../components/footer.vue';
import stickerCollection from '../components/sticker-collection.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);
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
			guild: {
				id: '',
				guildName: '',
				icon: '',
				customStickers: [],
				listMode: 'whitelist',
				whitelist: {
					userIds: [],
					roleId: '@everyone'
				},
				blacklist: {
					userIds: [],
					roleId: null
				},
				guildManagerIds: [],
				stickerManagers: {
					userIds: [],
					roleId: '@everyone',
				},
				stickerPacks: [],
			},
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			userGuilds: JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || [],	
			stickerPackData: []
		}
	},

	computed: {
		userCanEdit: function(){
			return userCanManageStickersInGuild(this.guild, this.userId, this.userGuilds);	
		},
		userIsGuildManager: function(){
			return this.guild.guildManagerIds.includes(this.userId);
		},
		nameFontSize: function(){
			let size = 0.9 - (this.guild.guildName.length / 25);
			if(size < 0.52) size = 0.52;
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
				this.guild = res.data;
				this.guild.icon = res.data.icon ?
					`https://cdn.discordapp.com/icons/${res.data.id}/${res.data.icon}.png` :
					'/images/default-discord-icon.png';
				document.title = `${res.data.guildName} - Stickers for Discord`;	
				this.pageLoaded = true;
			})
			.catch(err => {
				if(err.response.status === 404) window.location.replace('/');
			})
			.then(() => {
				//Map guild's sticker pack keys into requests for the pack data
				return Promise.all(this.guild.stickerPacks.map(key => {
					return axios.get(`/api/sticker-packs/${key}`)
					.catch(err => {
						//If a guild's sticker pack doesn't exist for some reason,
						//attempt to remove it so that the page can display properly on next refresh
						//This should never happen, but it's a safety net in case it does
						if(err.response.status === 404){
							axios.delete(`/api/guilds/${this.$route.params.id}/sticker-packs`, {data: {packKey: key}});
						}
					});
				}));
			})
			.then(responseData => {
				responseData.reverse();
				this.stickerPackData = responseData.map(res => res.data);	
				this.scrollToUrlHash();
			})
			.catch(err => {
				console.error(err.message);
			});
		},
		scrollToUrlHash(){
			if(window.location.hash.length < 1) return;
			const hash = window.location.hash;
			const el = document.querySelector(hash);
			if(el) el.scrollIntoView({behavior: "smooth"});
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
<main class="guild-page">

	<header-bar :userId="userId"></header-bar>

	<div v-if="!pageLoaded" class="loading-page">
		<img src="/images/loading-spin.svg">
	</div>

	<div :class="{transparent: !pageLoaded}">
	
		<header class="guild-header">
			<groupIcon :defaultImage="guild.icon" :canEdit="false" />
			<h1 :style="`font-size: ${nameFontSize}`">{{guild.guildName}}</h1>
		</header>

		<div class="container">

			<stickerCollection
				v-on:reload="loadPageData"
				name="Custom Stickers"
				:stickerPrefix="null"
				:emojiNamesAllowed="false"
				:stickers="guild.customStickers"
				:maxStickers="400"
				:pageType="pageType"
				:userId="userId"
				:userIsGuildManager="userIsGuildManager"
				:isEditable="userCanEdit"
			>
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

	.guild-page
		> div
			transition: .2s
		header.guild-header
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
			text-align: center
			max-width: 70%

		.sticker-collection
			margin-bottom: 70px
			&:last-of-type
				margin-bottom: 0

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