<script>
import Vue from 'vue';
import axios from 'axios';
import sticker from '../components/sticker.vue';
import stickerCreationModal from '../components/sticker-creation-modal.vue';

Vue.component('sticker', sticker);
Vue.component('stickerCreationModal', stickerCreationModal);

const normalizeObj = obj => JSON.parse(JSON.stringify(obj));

module.exports = {
	props: ['name', 'stickerPrefix', 'emojiNamesAllowed', 'isEditable', 'stickers', 'pageType'],
	data: function(){	
		return {	
			stickerSearchString: '',	
			loadingNewSticker: false
		}
	},
	methods: {
		
		addSticker(formData){
			this.loadingNewSticker = true;	

			axios.post(`/api/${this.pageType}/${this.$route.params.id}/stickers`, formData, {'Content-Type': 'multipart/form-data'})
			.then(res => {
				this.loadingNewSticker = false;
				this.$emit('reload');
			}).catch(err => {
				this.loadingNewSticker = false;
				if(err.response.status === 401) window.location.href = '/login';
				console.error(err.response.data);
			});
		},

		deleteSticker(stickerName){
			if(!confirm('Are you sure you want to delete -'+stickerName+'?')) return false;

			axios.delete(`/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`)
			.then(res => {
				this.$emit('reload');
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
			});
		}

	},
	computed: {
		noStickersText(){
			return (!this.isEditable) ? 'No stickers here just yet!' : 'No stickers here just yet. Add some!';
		}
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
			<button v-if="isEditable" class="btn" @click="$emit('openStickerCreationModal')">Add a Sticker</button>	
		</div>
	</header>	
	<div class="sticker-area">

		<p v-if="stickers.length === 0 && !loadingNewSticker" class="no-stickers-text">{{noStickersText}}</p>

		<div v-if="loadingNewSticker" class="loading-sticker">
			<img src="/images/loading-spin.svg" alt="">
		</div>
		<sticker
			v-for="sticker in stickers"
			v-on:deleteSticker="deleteSticker(sticker.name)"
			v-show="sticker.name.indexOf(stickerSearchString.replace(/(:|-)/g, '')) > -1"
			:link="sticker.url"
			:name="stickerPrefix+sticker.name"
			:prefix="null"
			:isEditable="isEditable">
		</sticker>
	</div>

	<!-- Sticker Creation Modal -->
	<stickerCreationModal
		v-if="isEditable"
		v-on:addSticker="addSticker($event)"
		:emojiNamesAllowed="emojiNamesAllowed"
		:stickers="stickers">
	</stickerCreationModal>

</section>
</template>

<style lang="sass">

	$discord-gray: #36393E

	.sticker-collection
		> .sticker-creation-modal
			display: none
		.sticker-area
			font-size: 0
		.loading-sticker
			vertical-align: bottom
			background-color: $discord-gray
			border-radius: 5px
			overflow: hidden
			width: calc(25% - 11.5px)
			height: 280px
			margin-right: 15px
			margin-bottom: 15px
			display: inline-flex
			flex-direction: column
			justify-content: center
			align-items: center
			position: relative
			img
				margin: 0
				width: 100px
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
	
	p.no-stickers-text
		font-size: 40px
		opacity: 0.4
		text-align: center
		margin-top: 100px
		font-weight: 100

</style>