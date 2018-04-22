<script>
import Vue from 'vue';
import axios from 'axios';
import debounce from 'debounce';
import header from '../components/header.vue';

Vue.component('header-bar', header);

module.exports = {	
	data: function(){
		return {
			pageLoaded: false,
			packTitle: '',
			packKey: '',
			packKeyValid: true,
			userId: this.$cookie.get('id') || null,
		}
	},
	methods: {
		sanitizePackKey: function(){
			this.packKey = this.packKey.toLowerCase().replace(/[^a-z0-9]/g, '');
		},
		createPack: function(){
			alert('Not implemented yet xd');
		}
	},
	mounted: function(){
		if(!this.userId) return window.location.replace('/sticker-packs'); //redirect if user not logged in
		this.pageLoaded = true;
		document.title = 'Create a Sticker Pack - Stickers for Discord';
	}
}	
</script>

<template>
<main class="create-pack-page">

	<header-bar :userId="userId"></header-bar>

	<div :class="{transparent: !pageLoaded}">

		<header class="create-pack-header">
			<h1>Create a Sticker Pack</h1>		
		</header>
		
		<form @submit.prevent="createPack">	
			<div class="pack-icon"></div>	
			<input type="text" class="pack-title" placeholder="Title" maxlength="60" v-model="packTitle">
			<div class="pack-key">
				<input
					type="text"
					@input="sanitizePackKey"
					placeholder="Unique Prefix"
					maxlength="8"
					v-model="packKey"
				>
				<i class="material-icons" v-show="packKey.length > 0">{{packKeyValid ? 'check_circle' : 'error'}}</i>	
			</div>
			<div class="confirmations">
				<p>
					<i class="material-icons">check_box_outline_blank</i>
					I have read and agree to the <a href="#" target="_blank">Terms and Conditions</a>
				</p>
				<p>
					<i class="material-icons">check_box_outline_blank</i>
					I have voted for the bot on <a href="https://discordbots.org/bot/224415693393625088" target="_blank">Discord Bot List</a> within the last 24 hours
				</p>	
			</div>
			<button class="btn">Continue</button>
		</form>

	</div>

</main>
</template>

<style lang="sass">
	
	.create-pack-page
		> div
			transition: .2s
		header.create-pack-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 65px
			padding-bottom: 65px
			margin-bottom: 25px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 50px

		form
			display: flex
			flex-direction: column
			align-items: center
			width: 50%
			margin: 45px auto
			.pack-icon
				display: inline-block
				height: 100px
				width: 100px
				border-radius: 100%
				color: transparent
				background-color: rgba(0,0,0,0.2)
				font-size: 10px
				border: 5px solid rgba(255, 255, 255, 0.1)
				cursor: pointer
				margin-bottom: 18px
			input, p, .pack-key
				width: 480px
			.pack-key	
				position: relative
				left: -5px
				input
					width: 100%
				i.material-icons
					position: absolute
					top: 10px
					right: -10px
					opacity: 0.3
			input
				border-radius: 0
				border: none
				border-bottom: 1px solid gray
				text-align: left
				padding-left: 0
				margin-bottom: 30px
				font-size: 18px	
				&.pack-title
					display: inline-block
					font-size: 30px
					vertical-align: middle	
					margin-bottom: 50px
			.confirmations
				margin-top: 20px
				margin-left: -12px
				p	
					color: gray
					vertical-align: middle
					margin-bottom: 20px
					text-indent: -16px
					margin-left: 60px
					a
						color: gray
						transition: .1s
						&:hover
							color: white
					i
						vertical-align: middle
						margin-right: 5px
						color: gray
						cursor: pointer
			
			.btn
				display: flex
				justify-content: center
				font-size: 20px
				height: 45px
				align-items: center
				margin: 0 auto
				width: 40%
				margin-top: 15px


</style>
