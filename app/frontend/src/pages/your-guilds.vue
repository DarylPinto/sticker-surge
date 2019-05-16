<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import footer from '../components/footer.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);

if(!Array.prototype.includes){
	Array.prototype.includes = function(item){
		return this.indexOf(item) > -1;
	}
}

//Custom compare function for Array.sort in order to help
//some browsers (Safari) sort Objects by property alphabetically
function alphabeticalCompare(a, b){
	if(a.toLowerCase() > b.toLowerCase()) return 1;
	else if(a.toLowerCase() < b.toLowerCase()) return -1;
	else return 0;	
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

	methods: {
		loadPageData(){	

			let remaining_ajax_calls = this.userGuilds.length;
			this.pageLoaded = true;

			//Load data for each guild in `guilds` cookie
			this.userGuilds.forEach(id => {
				axios.get(`/api/guilds/${id}/info?nocache=${(new Date()).getTime()}`)
				.then(res => {

					this.userGuildData.push({id: id, name: res.data.guildName, icon: res.data.icon});
					//When all ajax calls have been made, sort the data and toggle `guildsLoaded`	flag
					remaining_ajax_calls -= 1;
					if(remaining_ajax_calls === 0){
						this.userGuildData.sort((a, b) => alphabeticalCompare(a.name, b.name));
						this.guildsLoaded = true;
					}

				});
			});
			
		},

		initialPageLoad(){
			if(!this.userId) window.location.replace('/'); //redirect if user not logged in
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
<main class="your-guilds-page">

	<header-bar :userId="userId"></header-bar>
	
	<div v-if="!guildsLoaded" class="loading-page">
		<img src="/images/loading-spin.svg">
	</div>

	<div :class="{transparent: !pageLoaded}">

		<header class="your-guilds-header">
			<h1>Your Servers</h1>	
		</header>

		<div class="container">

			<div v-if="userGuilds.length === 0 && guildsLoaded" class="no-guilds-alert">
				<p>Stickers for Discord is not in any of your servers<br>
				Let's fix that, shall we?</p>
				<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=536879104" class="btn" target="_blank">Add to Discord</a>
			</div>

			<div v-if="userGuilds.length > 0 && guildsLoaded" v-for="guild in userGuildData" :key="guild.id" class="guild">
				<router-link :to="`/server/${guild.id}`">
					<img v-if="guild.icon" :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`" :alt="guild.name">
					<img v-if="!guild.icon" src="/images/default-discord-icon.png" :alt="guild.name">
					<h2>{{guild.name}}</h2>
				</router-link>
			</div>

		</div>

	</div>

	<footer-bar></footer-bar>

</main>
</template>

<style lang="sass">

	.your-guilds-page	
		> div
			transition: .2s
		.loading-page img
			margin-top: 280px
		header.your-guilds-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 65px
			padding-bottom: 65px
			margin-bottom: 35px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 50px
		.guild
			display: inline-block
			width: calc(25% - 11.5px)
			margin-right: 15px
			vertical-align: top
			border-radius: 5px
			height: 190px
			margin-bottom: 15px
			background-color: rgba(255,255,255,0.05)
			a
				text-decoration: none
				display: inline-flex
				flex-direction: column
				align-items: center
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
				font-size: 18px
				margin-top: 10px
				margin-bottom: 10px
				font-weight: 100
				line-height: 1.3em
				color: rgba(255,255,255,0.7)
			img
				border-radius: 200px
				border: 5px solid rgba(255, 255, 255, 0.1)
				height: 80px
				width: 80px
				margin-top: 10px

		.no-guilds-alert
			text-align: center
			p
				font-size: 30px
				opacity: 0.4
				text-align: center
				margin-top: 100px
				font-weight: 100
				line-height: 1.6em
			a
				font-size: 24px
				font-weight: 100
				border-radius: 40px
				padding: 13px 25px
				margin-top: 30px

	@media screen and (max-width: 940px)
		.your-guilds-page
			.guild
				box-sizing: border-box
				width: calc(50% - 7.5px)
				&:nth-of-type(4n)
					margin-right: 0
				&:nth-of-type(2n)
					margin-right: 0

	@media screen and (max-width: 650px)
		.your-guilds-page
			h1
				text-align: center
				padding-bottom: 25px

	@media screen and (max-width: 600px)
		.your-guilds-page
			.guild
				height: auto
				a
					flex-direction: column
					justify-content: center
				img	
					height: 90px
					width: 90px

	@media screen and (max-width: 500px)
		.your-guilds-page
			h1
				font-size: 50px
			.guild
				width: 100%
				margin-right: 0
			.guild h2
				font-size: 16px

</style>