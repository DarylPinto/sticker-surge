<script>
import Vue from 'vue';
import axios from 'axios';

export default {
	props: ['type', 'name', 'icon', 'itemId', 'packKey', 'initiallySubscribed'],
	data: function(){
		return {
			subscribed: false,
			hovered: false,
			loading: false
		}
	},
	computed: {
		iconURL(){
			if(!this.icon) return '/img/default-discord-icon.png';
			const icon_type = (this.type === 'users') ? 'avatars' : 'icons';
			return `https://cdn.discordapp.com/${icon_type}/${this.itemId}/${this.icon}.png`;
		},
		subButtonText(){
			if(this.loading) return '···';
			if(this.subscribed && this.hovered) return 'Remove';
			return (this.subscribed) ? 'Added' : 'Add';
		}
	},
	methods: {
		toggleSubscribe: function(){
			const method = (this.subscribed) ? 'delete' : 'post';
			this.loading = true;

			axios({
				method,
				url: `${this.$apiURL}/api/${this.type}/${this.itemId}/sticker-packs`,
				data: {packKey: this.packKey}
			})
			.then(res => {	
				this.subscribed = !this.subscribed;
				this.loading = false;
			})
			.catch(err => {
				console.error(err);
				if(err.message.indexOf("already has that Sticker Pack") > -1){
					this.subscribed = !this.subscribed;
				}
				this.loading = false;
			});
		}
	},
	created: function(){
		this.subscribed = this.initiallySubscribed;
	}
}
</script>

<template>
<li class="pack-subscriber-list-item" :class="{subscribed: subscribed}">
	<img :src="iconURL"> {{name}}
	<a
		class="btn hollow"
		:class="{subscribed: subscribed, unclickable: loading}"
		@click="toggleSubscribe"
		@mouseenter="hovered = true"
		@mouseleave="hovered = false"
	>{{subButtonText}}</a>
</li>
</template>

<style lang="sass">

	li.pack-subscriber-list-item
		padding: 15px 10px	
		user-select: none
		font-size: 18px
		&:nth-child(2n)
			background-color: rgba(0,0,0,0.1)
		img
			height: 45px
			width: 45px
			border-radius: 200px
			vertical-align: middle
			margin-right: 10px
		.btn
			float: right
			font-size: 14px
			margin-top: 5px
			margin-right: 20px
			width: 95px
			text-align: center
			padding: 8px
			&.unclickable
				pointer-events: none
			&.subscribed
				color: gray
				border-color: gray
				&:hover
					color: gray
					border-color: gray
					background-color: transparent

</style>