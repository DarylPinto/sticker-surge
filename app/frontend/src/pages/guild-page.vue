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
			managerIds: [],
			managerRole: '',
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
			return this.userId && this.userGuilds.includes(this.guildId) && (this.managerIds.includes(this.userId) || this.managerRole === '@everyone');
		}	
	},

	methods: {
		loadPageData(){	
			this.pageLoaded = false;
				
			axios.get(`/api/${this.pageType}/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				this.guildId = res.data.id;
				this.guildName = res.data.guildName;
				this.iconURL = res.data.icon ? `https://cdn.discordapp.com/icons/${res.data.id}/${res.data.icon}.png` : null;
				this.customStickers = res.data.customStickers;	
				this.managerIds = res.data.managerIds;
				this.managerRole = res.data.managerRole;
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
			<h1>{{guildName}}</h1>	
		</header>

		<stickerCollection
			v-on:reload="loadPageData"
			name="Custom Stickers"
			stickerPrefix=""
			:emojiNamesAllowed="false"
			:stickers="customStickers"
			:pageType="pageType"
			:isEditable="userCanEdit">
		</stickerCollection>

	</div>

</main>
</template>

<style lang="sass">

	.guild-page
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