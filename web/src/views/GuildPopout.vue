<script>
import Vue from 'vue';
import axios from 'axios';

/*
if(!Array.prototype.includes){
	Array.prototype.includes = function(item){
		return this.indexOf(item) > -1;
	}
}
*/

export default {
	props: ['pageType'],

	data: function(){
		return {
			guild: {
				id: '',
				guildName: '',
				icon: '',
				customStickers: [],
				stickerPacks: [],
			},
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			userGuilds: JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || [],	
			stickerPackData: []
		}
	},

	computed: {
		nameFontSize: function(){
			let size = 0.9 - (this.guild.guildName.length / 25);
			if(size < 0.52) size = 0.52;
			return size.toString() + 'em';
		}
	},

	methods: {
		loadPageData(){	
			this.pageLoaded = false;

			axios.get(`${this.$apiURL}/api/set-guilds?nocache=${(new Date()).getTime()}`)
			.then(() => {
				this.userGuilds = JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || []
			});

			axios.get(`${this.$apiURL}/api/${this.pageType}/${this.$route.params.id}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				if(!res.data.isActive) return window.location.replace('/');
				this.guild = res.data;
				this.guild.icon = res.data.icon ?
					`https://cdn.discordapp.com/icons/${res.data.id}/${res.data.icon}.png` :
					'/img/default-discord-icon.png';
				document.title = `${res.data.guildName} - Stickers for Discord`;	
				this.pageLoaded = true;
			})
			.catch(err => {
				if(err.response.status === 404) window.location.replace('/');
			})
			.then(() => {
				//Map guild's sticker pack keys into requests for the pack data
				return Promise.all(this.guild.stickerPacks.map(key => {
					return axios.get(`${this.$apiURL}/api/sticker-packs/${key}`)
					.catch(err => {
						//If a guild's sticker pack doesn't exist for some reason,
						//attempt to remove it so that the page can display properly on next refresh
						//This should never happen, but it's a safety net in case it does
						if(err.response.status === 404){
							axios.delete(`${this.$apiURL}/api/guilds/${this.$route.params.id}/sticker-packs`, {data: {packKey: key}});
						}
					});
				}));
			})
			.then(responseData => {
				responseData.reverse();
				this.stickerPackData = responseData.map(res => res.data);
			})
			.catch(err => {
				console.error(err.message);
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
<main class="guild-popout-page">

	<div>
		<img v-for="sticker in guild.customStickers" :src="sticker.url" class="sticker" />
	</div>
	
</main>
</template>

<style lang="sass">

	.guild-popout-page
		.sticker
			max-width: 100px
			max-height: 100px
			vertical-align: middle
			padding: 20px

</style>