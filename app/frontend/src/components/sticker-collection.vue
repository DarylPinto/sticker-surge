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
			stickerSearchString: '',
			stickerUploadPreview: ''
		}
	},
	methods: {

		addSticker(){
			let stickerCreationForm = new FormData(document.querySelector('#sticker-creation-modal'));
			axios.post(`/api/${this.pageType}/${this.$route.params.id}/stickers`, stickerCreationForm, {'Content-Type': 'multipart/form-data'})
			.then(res => {
				this.closeModal();
				this.$emit('reload');
			}).catch(err => {
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
		closeModal: function(){
			liteModal.close();
			window.setTimeout(() => {	
				this.stickerUploadPreview = '';	
			}, 350);	
		},
		showStickerPreview(e){
			let file = e.target.files[0];
			if(!file) return false;
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.stickerUploadPreview = reader.result;
			});
		},

		showConfirmDialog(text, callback){
			if(!confirm(text)) return false;
			callback();
		}

	},
	mounted: function(){
		this.initModal();
	}
}
</script>

<template>
<section class="sticker-collection">

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
			v-show="sticker.name.includes(stickerSearchString)"
			:link="sticker.url"
			:name="'-'+sticker.name"
			:prefix="null"
			:isEditable="isEditable">
		</sticker>
	</div>

	<form method="POST" action="/api/users/82161988473454592/stickers" enctype="multipart/form-data">
		<input type="text" name="name">
		<input type="file" name="sticker">
		<button>send</button>
	</form>

	<form v-if="isEditable" id="sticker-creation-modal" class="lite-modal" @submit.prevent="addSticker">
		<i class="material-icons close-x" @click="closeModal">clear</i>
		<h1>Add a sticker</h1>

		<img v-show="stickerUploadPreview" :src="stickerUploadPreview">

		<input v-show="!stickerUploadPreview" name="sticker" type="file" placeholder="Image" accept="image/png, image/jpeg" @change="showStickerPreview($event)" required>
		<input name="name" placeholder="name" pattern="^:?-?[a-z0-9]+:?$" title="Lowercase letters and numbers only" required>
		<button class="btn">Add</button>
	</form>

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

	.lite-modal
		position: relative
		background-color: #36393E
		padding: 30px
		box-shadow: 0 0 10px black
		border: 1px solid rgba(255, 255, 255, 0.15)
		border-radius: 4px
		text-align: center
		img
			max-width: 300px
			max-height: 300px
		.close-x
			position: absolute
			top: 10px
			right: 13px
			color: rgba(255, 255, 255, 0.45)
			cursor: default
		h1
			font-weight: 100
			font-size: 40px
			margin-bottom: 20px
		input, button
			color: black
			margin: 10px auto
			width: 80%
		.btn
			color: white

	.sticker-area
		font-size: 0

</style>