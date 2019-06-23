<script>
import Vue from 'vue';
import axios from 'axios';
import userCanManageStickersInGuild from '../utilities/user-can-manage-stickers-in-guild.js';
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
	mounted: function(){
		
		axios.get(`/api/set-guilds?nocache=${(new Date()).getTime()}`)
		.then(() => {

			this.userGuilds = JSON.parse(decodeURIComponent(this.$cookie.get('guilds')));

			this.userGuilds.forEach(id => {
				axios.get(`/api/guilds/${id}/info?nocache=${(new Date()).getTime()}`)
				.then(res => {	
					if(userCanManageStickersInGuild(res.data, this.userId, this.userGuilds)){
						this.packItemData.push({
							id: id,
							name: res.data.guildName,
							type: "guilds",
							icon: res.data.icon,
							stickerPacks: res.data.stickerPacks
						});
					}	
				})
			});

		})
		.catch(err => {
			if(err.response.status === 401) window.location.replace('/login');
		});

		axios.get(`/api/users/${this.userId}/info?nocache=${(new Date()).getTime()}`)
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
	<h1>Choose where to use this pack</h1>
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
			border: 1px solid rgba(0,0,0,0.4)
			background-color: rgba(0,0,0,0.2)
			border-radius: 4px
			margin-top: 20px
			margin-bottom: 20px
			max-height: 330px
			overflow: hidden
			overflow-y: auto
		.btn
			font-size: 18px

</style>