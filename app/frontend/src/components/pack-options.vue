<script>
import Vue from 'vue';
import axios from 'axios';

module.exports = {
	props: ['userId'],
	data: function(){
		return {
			isOpen: false,
			userGuilds: JSON.parse(decodeURIComponent(this.$cookie.get('guilds'))) || [],
			userGuildData: []
		}
	},
	methods: {
		togglePackOptions: function(){
			this.isOpen = !this.isOpen;
		},

		//Determine if user can manage stickers in guild - duh
		userCanManageStickersInGuild(guild){
			if(guild.stickerManagerRole === '@everyone') return true;
			if(guild.managerIds.indexOf(this.userId) > -1) return true;
			if(guild.stickerManagerIds.indexOf(this.userId) > -1) return true;
			return false;
		}
	},
	mounted: function(){
		
		axios.get(`/api/set-guilds?nocache=${(new Date()).getTime()}`)
		.then(() => {

			this.userGuilds.forEach(id => {
				axios.get(`/api/guilds/${id}?nocache=${(new Date()).getTime()}`)
				.then(res => {
					if(this.userCanManageStickersInGuild(res.data)){
						this.userGuildData.push({id: id, name: res.data.guildName});	
					}	
				});
			});

		});
		
		//Listen for parent event to open/close pack options
		this.$parent.$on('togglePackOptions', this.togglePackOptions);

	}
}
</script>

<template>
<div class="pack-options-wrapper" :class="{hidden: !isOpen}">

	<div class="pack-options">
		<h2>Use this pack in:</h2>
		<ul>
			<li>Personal Stickers</li>	
			<li v-for="guild in userGuildData">{{guild.name}}</li>
		</ul>
		<button class="btn">Done</button>
	</div>

	<div class="pack-options-backdrop" @click="togglePackOptions()"></div>

</div>
</template>

<style lang="sass">

	.pack-options-wrapper
		position: absolute
		right: -5px
		transition: .2s
		opacity: 1
		z-index: 3
		&.hidden
			opacity: 0
			pointer-events: none

	.pack-options
		background-color: #36393e
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.64) 
		border: 1px solid rgba(255, 255, 255, 0.05)
		border-radius: 5px
		padding: 25px
		box-sizing: border-box
		min-width: 350px
		position: absolute
		right: 0
		top: 25px
		z-index: 2
		&::after
			content: ''
			border: 15px solid transparent
			border-bottom-color: #36393e
			position: absolute
			top: -30px
			right: 8px
			pointer-events: none

		h2
			font-size: 26px

		ul
			width: 100%
			box-shadow: inset 0 0 7px rgba(0,0,0,0.3)
			background-color: rgba(0,0,0,0.2)
			margin-top: 20px
			margin-bottom: 20px
			li
				padding: 15px 10px
				cursor: pointer
				&:nth-child(2n)
					background-color: rgba(0,0,0,0.1)

	.pack-options-backdrop
		position: fixed
		height: 100vh
		width: 100vw
		top: 0
		left: 0
		background: rgba(0,0,0,0.7)
		z-index: 1


</style>