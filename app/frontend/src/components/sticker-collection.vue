<script>
import Vue from 'vue';
import axios from 'axios';
import sticker from '../components/sticker.vue';
import stickerCreationModal from '../components/sticker-creation-modal.vue';

Vue.component('sticker', sticker);
Vue.component('stickerCreationModal', stickerCreationModal);

module.exports = {
	props: ['name', 'isEditable', 'stickers', 'pageType'],
	data: function(){
		return {	
			stickerSearchString: ''
		}
	},
	methods: {

		deleteSticker(stickerName){
			axios.delete(`/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`)
			.then(res => {
				this.$emit('reload');
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
			});
		},

		showConfirmDialog(text, callback){
			if(!confirm(text)) return false;
			callback();
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

	<stickerCreationModal
		v-if="isEditable"
		v-on:reload="$emit('reload')"
		:apiURL="`/api/${this.pageType}/${this.$route.params.id}/stickers`"
		:stickers="stickers">
	</stickerCreationModal>

</section>
</template>

<style lang="sass">

	.sticker-collection
		.sticker-area
			font-size: 0
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

</style>