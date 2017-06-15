<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';

Vue.component('header-bar', header);

if(!Array.prototype.includes){
	Array.prototype.includes = function(item){
		return this.indexOf(item) > -1;
	}
}

module.exports = {
	data: function(){
		return {
			pageLoaded: false,
			guildsLoaded: false,
			userId: this.$cookie.get('id') || null,
			userGuilds: JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || [],
			userGuildData: []
		}
	},

	computed: {

		sortedUserGuildData(){
			return this.userGuildData.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase());
		}

	},

	methods: {
		loadPageData(){	

			this.pageLoaded = true;

			let fakeGuilds = [ //for test purposes
				{
					id: '197751992687263744',
					name: 'Smash Netplay Ontario',
					icon: '8a21a509fad8c2ead6c6ae5165f98a2e'	
				},
				{
					id: '106403490124816384',
					name: 'zucario Mains [ProjectM] (The coolest character)',
					icon: 'f196c689f6e5332b8896d8122ec0de6c'
				},
				{
					id: '80702129504780288',
					name: '/r/smashbros',
					icon: '963e72b381de6b738af432571fd0a493'
				}
			];

			//Load data for each guild in `guilds` cookie
			this.userGuilds.forEach(id => {
				axios.get(`/api/guilds/${id}?nocache=${(new Date()).getTime()}`)
				.then(res => {
					this.userGuildData.push({id: id, name: res.data.guildName, icon: res.data.icon});
					if(!this.guildsLoaded) this.guildsLoaded = true;
				});
			});
			//fakeGuilds.forEach(g => this.userGuildData.push(g)); //for test purposes
			
		},

		initialPageLoad(){
			if(!this.userId) window.location.replace('/login'); //redirect if user not logged in
			document.title = 'Your servers - Stickers for Discord'; //set title

			this.loadPageData(); //load page data
			let initialUserGuilds = JSON.stringify(this.userGuilds); //set a reference to compare user guilds 

			axios.get(`/api/set-guilds?nocache=${(new Date()).getTime()}`)
			.then(() => {
				this.userGuilds = JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || [];	//set user guilds once cookies are updated
				this.guildsLoaded = true;

				//if new user guilds are different from when the page first loaded, reload the data
				if(JSON.stringify(this.userGuilds) === initialUserGuilds) return false;
				this.guildsLoaded = false;
				this.userGuildData = [];
				this.loadPageData();
			});
		}

	},

	watch: {
		'$route': function(){
			this.initialPageLoad();
		}
	},

	mounted: function(){
		this.initialPageLoad();
	}

}

</script>

<template>
<main>

	<header-bar :userId="userId"></header-bar>
	
	<div class="container your-guilds-page" :class="{transparent: !pageLoaded}">
		
		<h1>Your Servers</h1>

		<div v-if="userGuildData.length === 0 && guildsLoaded" class="no-guilds-alert">
			<p>You're not in any servers with Stickers for Discord<br>
			Let's fix that, shall we?</p>
			<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=8192" class="btn" target="_blank">Add to Discord</a>
		</div>

		<div v-for="guild in sortedUserGuildData" class="guild">
			<a :href="`/server/${guild.id}`">
				<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`" :alt="guild.name">
				<h2>{{guild.name}}</h2>
			</a>
		</div>

	</div>

</main>
</template>

<style lang="sass">

	.your-guilds-page
		margin-top: 40px
		transition: .2s
		h1
			font-weight: 100
			font-size: 85px
			padding-bottom: 45px	
			margin-bottom: 20px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
		.guild
			display: inline-block
			width: calc(25% - 11.5px)
			margin-right: 15px
			vertical-align: top
			border-radius: 5px
			height: 280px
			margin-bottom: 15px
			background-color: rgba(255,255,255,0.05)
			a
				text-decoration: none
				display: inline-block	
				text-align: center
				border-radius: 5px
				height: inherit
				padding: 20px
				width: 100%
				box-sizing: border-box
				transition: .2s
				&:hover
					background-color: rgba(255,255,255,0.05)
			&:nth-of-type(4n)
				margin-right: 0
			h2
				font-size: 20px
				margin-top: 10px
				margin-bottom: 10px
				font-weight: 100
				line-height: 1.3em
			img
				border-radius: 200px
				border: 5px solid rgba(255, 255, 255, 0.1)
				margin-top: 25px

		.no-guilds-alert
			text-align: center
			p
				font-size: 40px
				opacity: 0.4
				text-align: center
				margin-top: 100px
				font-weight: 100
				line-height: 1.6em
			a
				font-size: 18px
				border-radius: 40px
				padding: 13px 25px
				margin-top: 30px

</style>