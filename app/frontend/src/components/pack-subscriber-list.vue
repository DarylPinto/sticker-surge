<script>
import Vue from 'vue';
import axios from 'axios';
import packSubscriberListItem from './pack-subscriber-list-item.vue';

Vue.component('packSubscriberListItem', packSubscriberListItem);

module.exports = {
	props: ['userId', 'packKey'],
	data: function(){
		return {
			userGuilds: [],
			packItemData: [{
				id: "",
				name: "",
				icon: "",
				type: "",
				stickerPacks: []
			}]
		}
	},
	methods: {	
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

			this.userGuilds = JSON.parse(decodeURIComponent(this.$cookie.get('guilds')));

			this.userGuilds.forEach(id => {
				axios.get(`/api/guilds/${id}?nocache=${(new Date()).getTime()}`)
				.then(res => {
					if(this.userCanManageStickersInGuild(res.data)){
						this.packItemData.push({
							id: id,
							name: res.data.guildName,
							type: "guilds",
							icon: res.data.icon,
							stickerPacks: res.data.stickerPacks
						});
					}	
				});
			});

		});

		axios.get(`/api/users/${this.userId}?nocache=${(new Date()).getTime()}`)
		.then(res => {
			this.packItemData[0] = {
				id: res.data.id,
				name: "Personal Stickers",
				type: "users",
				icon: res.data.avatar,
				stickerPacks: res.data.stickerPacks
			}
		});	

	}
}
</script>

<template>
<div class="pack-subscriber-list">
	<h1>Where do you want to use this pack?</h1>
	<ul>	
		<packSubscriberListItem
			v-for="item in packItemData"	
			:itemId="item.id"
			:name="item.name"
			:icon="item.icon"
			:type="item.type"
			:packKey="packKey"
			:initiallySubscribed="item.stickerPacks.includes(packKey)"
			:key="item.type+item.id"
		/>
	</ul>	
</div>
</template>

<style lang="sass">

	.pack-subscriber-list
		h1
			display: inline-block
			font-size: 25px
			opacity: 0.8
		ul
			width: 100%
			box-shadow: inset 0 0 7px rgba(0,0,0,0.3)
			background-color: rgba(0,0,0,0.2)
			margin-top: 20px
			margin-bottom: 20px
		.btn
			font-size: 18px

</style>