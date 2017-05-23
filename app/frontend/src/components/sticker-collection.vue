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
			newSticker: {
				name: '',
				url: ''
			}
		}
	},
	methods: {
		addSticker(){
			axios.post(`/api/${this.pageType}/${this.$route.params.id}/stickers`, {
				name: this.newSticker.name,
				url: this.newSticker.url
			})
			.then(res => {
				this.newSticker.name = '';
				this.newSticker.url = '';
				//this.stickerCreationError = '';
				this.closeModal();
				this.$emit('reload');
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
				this.stickerCreationError = err.response.data;
			});
		},
		deleteSticker(stickerName){
			console.log(`/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`);
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
			<input type="text" placeholder="Search" v-model="stickerSearchString">
			<button v-if="isEditable" class="btn" @click="openModal('#sticker-creation-modal')">Add a Sticker</button>	
		</div>
	</header>	
	<div class="sticker-area">
		<sticker
			v-for="sticker in stickers"
			v-on:deleteSticker="showConfirmDialog('Are you sure you want to delete -'+sticker.name+'?', function(){deleteSticker(sticker.name)})"
			v-if="sticker.name.includes(stickerSearchString)"
			:link="sticker.url"
			:name="'-'+sticker.name"
			:prefix="null"
			:isEditable="isEditable">
		</sticker>
	</div>

	<form v-if="isEditable" id="sticker-creation-modal" class="lite-modal" @submit.prevent="addSticker">
		<h1>Add a sticker</h1>
		<input v-model="newSticker.name" placeholder="name" pattern="^:?-?[a-z0-9]+:?$" title="Lowercase letters and numbers only" required>
		<input v-model="newSticker.url" placeholder="url" required>
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
				input
					padding: 8px 15px
					border: 1px solid #7d7d7d
					background-color: transparent
					border-radius: 40px	
					outline: 0


	.lite-modal
		background-color: #36393E
		padding: 30px
		box-shadow: 0 0 10px black
		border: 1px solid rgba(255, 255, 255, 0.15)
		border-radius: 4px
		text-align: center
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