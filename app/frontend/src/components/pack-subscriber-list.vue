<script>
import Vue from 'vue';
import axios from 'axios';
import packSubscriberListItem from './pack-subscriber-list-item.vue';

Vue.component('packSubscriberListItem', packSubscriberListItem);

module.exports = {
	props: ['userId', 'packKey'],
	data: function(){
		return {
			isOpen: false,
			userGuilds: [],
			packItemData: [{
				id: "",
				name: "",
				type: "",
				stickerPacks: []
			}],	
			patchReqObject: {subscriptions: []}
		}
	},
	methods: {
		togglePackDropdown: function(){
			this.isOpen = !this.isOpen;
		},

		selectionChange: function(data){
			this.patchReqObject.subscriptions.forEach((sub, i) => {
				if(sub.id === data.id && sub.type === data.type){
					this.patchReqObject.subscriptions.splice(i, 1);
				}
			});
			this.patchReqObject.subscriptions.push(data);
		},

		updateStickerPackGroups(){
			console.log('Loading...');
			axios.patch(`/api/sticker-packs/${this.packKey}/subscribers`, this.patchReqObject)
			.then(() => this.isOpen = false);
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

			this.userGuilds = JSON.parse(decodeURIComponent(this.$cookie.get('guilds')));

			this.userGuilds.forEach(id => {
				axios.get(`/api/guilds/${id}?nocache=${(new Date()).getTime()}`)
				.then(res => {
					if(this.userCanManageStickersInGuild(res.data)){
						this.packItemData.push({
							id: id,
							name: res.data.guildName,
							type: "guild",
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
				type: "user",
				stickerPacks: res.data.stickerPacks
			}
		});
		
		//Listen for parent event to open/close pack options
		this.$parent.$on('togglePackDropdown', this.togglePackDropdown);

	}
}
</script>

<template>
<div class="pack-dropdown-wrapper" :class="{hidden: !isOpen}">

	<div class="pack-dropdown">
		<h2>Use this pack in:</h2>
		<ul>	
			<packSubscriberListItem
				v-for="item in packItemData"
				v-on:selectionChange="selectionChange($event)"
				:type="item.type"
				:name="item.name"
				:groupId="item.id"
				:initiallySelected="item.stickerPacks.includes(packKey)"
				:key="item.type+item.id"
			/>
		</ul>
		<button class="btn" @click="updateStickerPackGroups">Done</button>
	</div>

	<div class="pack-dropdown-backdrop" @click="togglePackDropdown()"></div>

</div>
</template>

<style lang="sass">

	.pack-dropdown-wrapper
		position: absolute
		right: -5px
		transition: .2s
		opacity: 1
		z-index: 3
		&.hidden
			opacity: 0
			pointer-events: none

	.pack-dropdown
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
				user-select: none
				&:nth-child(2n)
					background-color: rgba(0,0,0,0.1)

	.pack-dropdown-backdrop
		position: fixed
		height: 100vh
		width: 100vw
		top: 0
		left: 0
		background: rgba(0,0,0,0.7)
		z-index: 1


</style>