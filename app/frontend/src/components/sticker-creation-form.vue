<script>
import Vue from 'vue';
import axios from 'axios';
import emojis from '../data/emojis.json';

module.exports = {
	props: ['stickers', 'emojiNamesAllowed'],
	data: function(){
		return {
			stickerUploadPreview: '',
			stickerUploadError: '',
			newStickerName: '',
			newStickerDefaultName: ''
		}
	},
	methods: {

		emitAddSticker(){
			//Error checking
			let file = document.querySelector('.sticker-creation-form input[type="file"]').files[0];

			//If `newStickerName` is empty string, set it to `newStickerDefaultName`
			if(this.newStickerName.length === 0) this.newStickerName = this.newStickerDefaultName;	

			//If it's still an empty string, prompt user to enter a name
			if(this.newStickerName.length === 0){
				this.stickerUploadError = "Enter a name for this sticker.";
				return false;
			}

			if(this.stickers.map(s => s.name).indexOf(this.newStickerName) > -1){
				this.stickerUploadError = "Name already in use by another sticker.";
				return false;
			}
			if(file && file.size > 5 * 1024 * 1024){
				this.stickerUploadError = "File size is too large (5MB Max).";
				return false;
			}
			if(!this.emojiNamesAllowed && emojis.indexOf(this.newStickerName) > -1){
				this.stickerUploadError = "Name already in use by an emoji.";
				return false;
			}

			//de-reference
			file = null;

			//Emit add sticker event
			this.stickerUploadError = '';	
			window.setTimeout(() => {	
				let stickerCreationFormData = new FormData(document.querySelector('.sticker-creation-form'));
				this.$emit('addSticker', stickerCreationFormData);
				this.$parent.close();
			}, 100);
			
		},	

		//Sanitize `name` and set it to vm.newDefaultStickerName
		//(used as sticker name if none provided)
		setDefaultStickerName(name){	
			const max_length = 20;
			if(name.indexOf('.') > -1) name = name.substr(0, name.lastIndexOf('.'));
			name = name.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
			name = (name.length > max_length) ? name.substr(0, max_length) : name;
			this.newStickerDefaultName = name;
		},

		showStickerPreview(e){
			let file = e.target.files[0];
			if(!file) return false;
			this.setDefaultStickerName(file.name);
			
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.stickerUploadPreview = reader.result;
				document.querySelector('.sticker-creation-form input[name="name"]').focus();
				reader = null; //de-reference
			});
		},

		//Show custom error message on invalid stickername (for Safari)
		//stackoverflow.com/q/16867407/#42422152
		checkStickerNameValidity(e){
			e.target.setCustomValidity('');
			e.target.checkValidity();
			e.target.setCustomValidity(e.target.validity.valid ? '' : 'Lowercase letters and numbers only');
		}
	}
}
</script>

<template>
<form class="sticker-creation-form" @submit.prevent="emitAddSticker">
	<h1>Create a Sticker</h1>

	<img v-show="stickerUploadPreview" :src="stickerUploadPreview">

	<div v-show="!stickerUploadPreview" class="upload-area">
		<p>Drag image or click to upload</p>
		<input
			name="sticker"
			type="file"
			placeholder="Image"
			accept="image/png, image/jpeg, image/webp"
			@change="showStickerPreview($event)"
			required
		>	
	</div>	
	<input
		v-model="newStickerName"
		@input="checkStickerNameValidity"
		name="name"
		placeholder="Sticker Name"
		pattern="^:?-?[a-zа-яё0-9]+:?$"	
		maxlength="20"
		autocomplete="off"
		spellcheck="false"
	>
	<p v-if="stickerUploadError.length > 0" class="sticker-upload-error">{{stickerUploadError}}</p>
	<button class="btn">Create</button>
</form>
</template>

<style lang="sass">

	.sticker-creation-form	
		display: flex
		flex-direction: column
		align-items: center
		text-align: center	
		img
			display: block
			margin: 0 auto
			margin-bottom: 15px
			max-height: 200px
			max-width: 200px
		h1
			font-weight: 400
			font-size: 40px
			margin: 20px	
		input, button
			margin: 10px auto
			max-width: 60%
			display: block
		button
			margin-top: 20px
		.upload-area
			display: inline-flex
			position: relative
			border: 2px dashed white
			margin: 15px
			margin-bottom: 5px
			max-width: 65%
			justify-content: center
			text-align: center
			overflow: hidden
			p
				position: absolute
				top: 0
				left: 0
				color: rgba(255,255,255,0.5)
				width: 100%
				height: 100%
				display: inline-flex
				justify-content: center
				align-items: center
			input
				border-radius: 0
				opacity: 0
				margin: 0
				height: 140px
				max-width: none
				padding: 0
				font-size: 100px
		.sticker-upload-error
			padding: 10px
		.btn
			color: white
			padding: 10px 0
			width: 115px

	@media screen and (max-width: 600px)
		.sticker-creation-form
			h1
				font-size: 30px
			.upload-area, input
				max-width: 80%	

	@media screen and (max-width: 450px)
		.sticker-creation-form
			h1
				font-size: 25px
			.upload-area, input
				max-width: 90%
				p
					font-size: 14px

</style>