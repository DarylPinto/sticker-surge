<script>
import axios from 'axios';
import emojis from '../data/emojis.json';
import liteModal from '../scripts/lite-modal.js';

module.exports = {
	props: ['stickers', 'emojiNamesAllowed'],
	data: function(){
		return {
			stickerUploadPreview: '',
			stickerUploadError: '',
			newStickerName: ''
		}
	},
	methods: {

		emitAddSticker(){
			//Error checking
			if(this.stickers.map(s => s.name).indexOf(this.newStickerName) > -1){
				this.stickerUploadError = "Name already in use by another sticker.";
				return false;
			}
			if(!this.emojiNamesAllowed && emojis.indexOf(this.newStickerName) > -1){
				this.stickerUploadError = "Name already in use by an emoji.";
				return false;
			}

			//Emit add sticker event
			let stickerCreationFormData = new FormData(document.querySelector('.sticker-creation-modal'));
			this.stickerUploadError = '';
			this.closeModal();
			this.$emit('addSticker', stickerCreationFormData);
		},

		initModal: liteModal.init.bind(liteModal),
		openModal: liteModal.open.bind(liteModal),
		closeModal: liteModal.close.bind(liteModal),

		showStickerPreview(e){
			let file = e.target.files[0];
			if(!file) return false;
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.stickerUploadPreview = reader.result;
				document.querySelector('.sticker-creation-modal input[name="name"]').focus();
			});
		},

	},
	mounted: function(){
		this.$parent.$on('openStickerCreationModal', () => {
			this.openModal('.sticker-creation-modal');
		});

		//While initializing lite-modal, we'll pass in a
		//callback to be executed when modal is closed
		this.initModal(() => {
			document.querySelector('.sticker-creation-modal input[type="file"]').value = '';
			this.stickerUploadPreview = '';
			this.newStickerName = '';
			this.stickerUploadError = '';
		});
		//Then we change the closeModal method on the vue instance to include callback
		this.closeModal = liteModal.closeWithCB.bind(liteModal);
	}
}
</script>

<template>
<form class="sticker-creation-modal lite-modal" @submit.prevent="emitAddSticker">

	<i class="material-icons close-x" @click="closeModal">clear</i>
	<h1>Add a sticker</h1>

	<img v-show="stickerUploadPreview" :src="stickerUploadPreview">

	<div v-show="!stickerUploadPreview" class="upload-area">
		<p>Drag image or click to upload</p>
		<input name="sticker" type="file" placeholder="Image" accept="image/png, image/jpeg" @change="showStickerPreview($event)" required>	
	</div>	
	<input v-model="newStickerName" name="name" placeholder="Sticker Name" pattern="^:?-?[a-z0-9]+:?$" maxlength="20" autocomplete="off" spellcheck="false" title="Lowercase letters and numbers only" required>
	<p v-if="stickerUploadError.length > 0" class="sticker-upload-error">{{stickerUploadError}}</p>
	<button class="btn">Add</button>

</form>
</template>

<style lang="sass">

	.sticker-creation-modal	
		position: relative
		background-color: #36393E
		padding: 30px
		box-shadow: 0 0 10px black
		border: 1px solid rgba(255, 255, 255, 0.15)
		border-radius: 4px
		text-align: center
		width: 80vw
		max-width: 640px
		box-sizing: border-box
		img
			max-height: 200px
			max-width: 200px
		.close-x
			position: absolute
			padding: 15px
			top: 0px
			right: 3px
			color: rgba(255, 255, 255, 0.3)
			cursor: default
			font-size: 30px
			&:hover
				color: rgba(255,255,255,0.5)
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
			border: 2px dashed white
			cursor: pointer
			display: inline-flex
			margin: 15px
			margin-bottom: 5px
			max-width: 65%
			justify-content: center
			align-items: center
			text-align: center
			p
				position: absolute
				color: rgba(255,255,255,0.5)
				width: 59%
			input
				opacity: 0
				margin: 0
				height: 140px
				max-width: none
				cursor: pointer
		.sticker-upload-error
			padding: 10px
		.btn
			color: white
			padding: 10px 0
			width: 115px

</style>