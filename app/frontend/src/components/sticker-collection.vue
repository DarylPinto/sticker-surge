<script>
import Vue from 'vue';
import axios from 'axios';
import sticker from '../components/sticker.vue';
import liteModal from '../scripts/lite-modal.js';

Vue.component('sticker', sticker);

module.exports = {
	props: ['name', 'isEditable', 'stickers', 'pageType'],
	data: function(){
		return {
			loadingScreenActive: false,
			stickerSearchString: '',
			stickerUploadPreview: '',
			newStickerName: ''
		}
	},
	methods: {

		addSticker(){
			let stickerCreationForm = new FormData(document.querySelector('#sticker-creation-modal'));
			this.loadingScreenActive = true;
			axios.post(`/api/${this.pageType}/${this.$route.params.id}/stickers`, stickerCreationForm, {'Content-Type': 'multipart/form-data'})
			.then(res => {
				this.closeModal();
				this.loadingScreenActive = false;
				this.$emit('reload');
			}).catch(err => {
				this.loadingScreenActive = false;
				if(err.response.status === 401) window.location.href = '/login';
				console.error(err.response.data);
			});
		},

		deleteSticker(stickerName){
			axios.delete(`/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`)
			.then(res => {
				this.$emit('reload');
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
			});
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
				document.querySelector('input[name="name"]').focus();
			});
		},

		showConfirmDialog(text, callback){
			if(!confirm(text)) return false;
			callback();
		}

	},
	mounted: function(){
		//While initializing lite-modal, we'll pass in a
		//callback to be executed when modal is closed
		this.initModal(() => {
			document.querySelector('#sticker-creation-modal input[type="file"]').value = '';
			this.stickerUploadPreview = '';
			this.newStickerName = '';
		});
		//Then we change the closeModal method on the vue instance to include callback
		this.closeModal = liteModal.closeWithCB.bind(liteModal);
	}
}
</script>

<template>
<section class="sticker-collection">

	<!-- Main Page -->
	<header>
		<h2>{{name}}</h2>
		<div class="section-options">
			<span class="search-box">
				<i class="material-icons">search</i>
				<input type="text" placeholder="Search" v-model="stickerSearchString">	
			</span>	
			<button v-if="isEditable" class="btn" @click="openModal('#sticker-creation-modal')">Add a Sticker</button>	
		</div>
	</header>	
	<div class="sticker-area">
		<sticker
			v-for="sticker in stickers"
			v-on:deleteSticker="showConfirmDialog('Are you sure you want to delete -'+sticker.name+'?', function(){deleteSticker(sticker.name)})"
			v-show="sticker.name.indexOf(stickerSearchString) > -1"
			:link="sticker.url"
			:name="'-'+sticker.name"
			:prefix="null"
			:isEditable="isEditable">
		</sticker>
	</div>

	<!-- Sticker Creation Modal -->
	<form v-if="isEditable" id="sticker-creation-modal" class="lite-modal" @submit.prevent="addSticker">
		<i class="material-icons close-x" @click="closeModal">clear</i>
		<h1>Add a sticker</h1>

		<img v-show="stickerUploadPreview" :src="stickerUploadPreview">

		<div v-show="!stickerUploadPreview" class="upload-area">
			<p>Drag image or click to upload</p>
			<input name="sticker" type="file" placeholder="Image" accept="image/png, image/jpeg" @change="showStickerPreview($event)" required>	
		</div>	
		<input v-model="newStickerName" name="name" placeholder="Sticker Name" pattern="^:?-?[a-z0-9]+:?$" autocomplete="off" spellcheck="false" title="Lowercase letters and numbers only" required>
		<button class="btn">Add</button>
	</form>

	<!-- Loading Overlay -->
	<div v-if="loadingScreenActive" class="loading-overlay">
		<img src="/images/loading-spin.svg" alt="">
	</div>

</section>
</template>

<style lang="sass">

	.sticker-collection
		h2
			font-size: 30px
			font-weight: 300
		> header
			margin-bottom: 20px
			padding-bottom: 10px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
			display: flex
			justify-content: space-between
			.section-options
				display: flex
				input
					text-align: left
				> *
					margin-right: 15px
					&:last-child
						margin-right: 0
				.search-box
					border: 1px solid #7d7d7d
					border-radius: 40px
					display: flex
					align-items: center
					padding-left: 10px
					i
						font-size: 20px
						color: #7d7d7d
					input
						padding: 8px 15px
						padding-left: 4px
						font-size: 16px
						width: 140px
						background-color: transparent
						border: none
						outline: 0

	#sticker-creation-modal	
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
			max-height: 160px
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
			input
				opacity: 0
				margin: 0
				height: 140px
				max-width: none
				cursor: pointer
		.btn
			color: white
			padding: 10px 0
			width: 115px
	
	.loading-overlay
		position: fixed
		top: 0
		left: 0
		width: 100vw
		height: 100vh
		background-color: rgba(255,255,255,0.7)
		display: flex
		justify-content: center
		align-items: center
		z-index: 200

	.sticker-area
		font-size: 0

</style>