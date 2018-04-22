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
			packIcon: null,
			packTitle: '',
			packKey: '',
			packKeyValid: true,
			packKeyFocused: false,
			termsAccepted: false,
			dblSupportRequired: true,
			dblSupported: false,
			userId: this.$cookie.get('id') || null,
		}
	},	
	methods: {
		sanitizePackKey: function(){
			if(this.packKey.length === 0){
				this.packKeyValid = true;
				return;
			}
			this.packKey = this.packKey.toLowerCase().replace(/[^a-z0-9]/g, '');
			this.debouncedCheckValidPackKey();
		},
		debouncedCheckValidPackKey: debounce(function(){	
			axios.get(`/api/sticker-packs/${this.packKey}/info`)
			.then(res => this.packKeyValid = false)
			.catch(err => this.packKeyValid = true);
		}, 150),
		showPackIconPreview: function(e){
			let file = e.target.files[0];
			if(!file){
				this.packIcon = null;
				return false;
			}
			
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.packIcon = reader.result;
				reader = null; //de-reference
			});
		},
		createPack: function(){
			if(!this.packKeyValid) return alert('Pack prefix invalid');
			if(!this.termsAccepted) return alert('You must accept the Terms and Conditions');
			if(this.dblSupportRequired && !this.dblSupported) return alert('You must vote for the bot on Discord Bot List');

			let formData = new FormData(document.querySelector('.create-pack-page form'));

			axios.post('/api/sticker-packs', formData, {'Content-Type': 'multipart/form-data'})
			.then(res => {
				if(res.status === 201) return window.location.replace(`/pack/${this.packKey}`);
			})
			.catch(err => {
				console.error(err.message);
			});
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
			<div class="pack-icon" :class="{'icon-submitted': packIcon}" :style="'background-image: url('+packIcon+')'"	>
				<input type="file" name="icon" @change="showPackIconPreview" accept="image/png, image/jpeg, image/webp" required>
				<span v-if="!packIcon">Choose an<br>Icon</span>
			</div>	
			<input type="text" name="name" class="pack-title" placeholder="Title" maxlength="60" v-model="packTitle" required>
			<div class="pack-key">
				<div class="tooltip left" :class="{transparent: !(packKeyFocused && packKey.length === 0)}">
					<p>Keep it short, sweet and to the point! All sticker names in your pack will begin with this prefix.</p>
					<p>This CANNOT be changed in the future.</p>
				</div>
				<input
					type="text"
					name="key"
					@input="sanitizePackKey"
					placeholder="Unique Prefix"
					maxlength="8"
					v-model="packKey"
					@focus="packKeyFocused = true"
					@blur="packKeyFocused = false"
					required
				>
				<i
					class="material-icons"
					:class="{error: !packKeyValid}"
					v-show="packKey.length > 0"
				>
					{{packKeyValid ? 'check_circle' : 'error'}}
				</i>
				<div class="tooltip right" :class="{transparent: packKeyValid}">
					<p>This prefix is unavailable</p>
				</div>	
			</div>
			<div class="confirmations">
				<p @click="termsAccepted = !termsAccepted">
					<!-- Standard checkboxes used for keyboard controls -->
					<input type="checkbox" v-model="termsAccepted">
					<i class="material-icons">{{termsAccepted ? 'check_box' : 'check_box_outline_blank'}}</i>
					I have read and agree to the <a href="#" target="_blank">Terms and Conditions</a>
				</p>
				<p v-if="dblSupportRequired" @click="dblSupported = !dblSupported">
					<!-- Standard checkboxes used for keyboard controls -->
					<input type="checkbox" v-model="dblSupported">
					<i class="material-icons">{{dblSupported ? 'check_box' : 'check_box_outline_blank'}}</i>
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
				display: inline-flex
				justify-content: center
				align-items: center
				height: 100px
				width: 100px
				border-radius: 100%
				background-color: rgba(0,0,0,0.35)
				border: 5px solid gray
				cursor: pointer
				margin-bottom: 18px
				overflow: hidden
				background-size: cover
				background-position: center center
				background-repeat: no-repeat
				&.icon-submitted
					border-color: rgba(255,255,255,0.2)
				input[type="file"]
					position: absolute
					height: 100px
					width: 100px
					padding: 0
					margin: 0
					border-radius: 100%
					opacity: 0
					cursor: pointer
				span
					font-size: 12px
					text-transform: uppercase
					color: gray 
					text-align: center
					line-height: 1.2em
					margin-top: 5px	
					transition: .2s
				&:hover span
					color: white
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
					color: gray
					&.error
						color: red
			.tooltip
				&.left
					width: 180px
					left: -220px
					top: -15px
				&.right
					width: 150px
					right: -197px
					top: 2px

					&:after
						top: 10px

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
				margin-top: 40px
				margin-bottom: 20px
				margin-left: -22px
				input[type="checkbox"]
					position: absolute	
					left: 0
					opacity: 0
					pointer-events: none
					user-select: none
					-moz-user-select: none
					-webkit-user-select: none
				p	
					color: gray
					vertical-align: middle
					margin-bottom: 20px
					text-indent: -16px
					margin-left: 75px
					font-size: 14px
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


</style>
