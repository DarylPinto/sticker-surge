<script>
import Vue from 'vue';
import axios from 'axios';
import Clipboard from 'clipboard';
import sticker from '../components/sticker.vue';
import stickerCreationModal from '../components/sticker-creation-modal.vue';
import packSubscriberList from '../components/pack-subscriber-list.vue';

Vue.component('sticker', sticker);
Vue.component('stickerCreationModal', stickerCreationModal);
Vue.component('packSubscriberList', packSubscriberList);

const normalizeObj = obj => JSON.parse(JSON.stringify(obj));

module.exports = {
	props: ['name', 'stickerPrefix', 'emojiNamesAllowed', 'userId', 'userIsGuildManager', 'isEditable', 'stickers', 'maxStickers', 'pageType'],
	data: function(){	
		return {	
			stickerSearchString: '',
			sortMethod: 'newest',
			loadingNewSticker: false	
		}
	},
	computed: {
		noStickersText(){
			return (!this.isEditable) ? 'No stickers here just yet!' : 'No stickers here just yet. Add some!';
		},
		maxStickersReached(){
			return this.stickers.length >= this.maxStickers;
		},
		sortedStickers(){
			//Clone stickers array
			let sorted = [].concat(this.stickers);

			//Sort by newest
			if(this.sortMethod === 'newest'){
				//Sorting is not necessary, since `stickers` are already newest -> oldest by default
				//sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			}
			//Sort by oldest
			else if(this.sortMethod === 'oldest'){
				sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			}
			//Sort by most used
			else if(this.sortMethod === 'mostUsed'){
				sorted.sort((a, b) => b.uses - a.uses);
			}

			return sorted;
		}
	},
	methods: {
		
		searchMatchesSticker(prefix, name){
			let searchString = this.stickerSearchString.toLowerCase().replace(/(:|-)/g, '');
			name = (prefix) ? prefix + name : name;	
			return name.includes(searchString);
		},

		addSticker(formData){
			this.loadingNewSticker = true;
			//Sort by newest so that when new sticker is added, it's visible right away
			this.sortMethod = 'newest';

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
			if(!confirm(`Are you sure you want to delete ${stickerName}?`)) return false;

			axios.delete(`/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`)
			.then(res => {
				this.$emit('reload');
			}).catch(err => {
				if(err.response.status === 401) window.location.href = '/login';
			});
		}

	},

	mounted: function(){
		new Clipboard('.sticker');
	},

	//When this component unmounts, emit event to notify
	//children who have been moved around the dom
	destroyed: function(){
		this.$emit('destroyed');
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
			<select class="sort-stickers" v-model="sortMethod">
				<option value="newest">Sort by: Newest</option>
				<option value="oldest">Sort by: Oldest</option>
				<option value="mostUsed">Sort by: Most Used</option>
			</select>
			<button v-if="isEditable" class="btn" :class="{disabled: maxStickersReached}" @click="$emit('openStickerCreationModal')">Create a Sticker</button>
			<button v-if="userId && pageType === 'sticker-packs'" class="add-pack-dropdown-btn" @click="$emit('togglePackDropdown')"><i class="material-icons">star</i></button>
		</div>

		<!-- Sticker Pack Options -->
		<packSubscriberList
			v-if="pageType === 'sticker-packs'"
			:userId="userId"
			:packKey="stickerPrefix" 
		/>	

	</header>
	<div class="sticker-area">

		<p v-if="stickers.length === 0 && !loadingNewSticker" class="no-stickers-text">{{noStickersText}}</p>

		<div v-if="loadingNewSticker" class="loading-sticker">
			<img src="/images/loading-spin.svg" alt="">
		</div>
		<sticker
			v-for="sticker in sortedStickers"
			v-on:deleteSticker="deleteSticker(sticker.name)"
			v-show="searchMatchesSticker(stickerPrefix, sticker.name)"
			:type="pageType"
			:key="sticker.name"
			:link="sticker.url"
			:creator="sticker.creatorId"
			:prefix="stickerPrefix"
			:name="sticker.name"
			:userId="userId"
			:userIsGuildManager="userIsGuildManager"
			:isEditable="isEditable">
		</sticker>
	</div>

	<!-- Sticker Creation Modal -->
	<stickerCreationModal
		v-show="isEditable"
		v-on:addSticker="addSticker($event)"
		:emojiNamesAllowed="emojiNamesAllowed"
		:stickers="stickers">
	</stickerCreationModal>

</section>
</template>

<style lang="sass">

	$discord-gray: #36393E
	$sticker-margin: 15px

	.sticker-collection
		//overflow: hidden
		> .sticker-creation-modal
			display: none
		.sticker-area
			font-size: 0
			width: calc(100% + #{$sticker-margin})
		.loading-sticker
			vertical-align: bottom
			background-color: $discord-gray
			border-radius: 5px
			overflow: hidden
			width: calc(25% - #{$sticker-margin})
			height: 280px
			margin-right: $sticker-margin
			margin-bottom: $sticker-margin
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
			margin-bottom: 30px
			padding-bottom: 10px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
			display: flex
			align-items: center
			justify-content: space-between
			position: relative
	
	p.no-stickers-text
		font-size: 40px
		opacity: 0.4
		text-align: center
		margin-top: 100px
		width: calc(100% - 15px)
		font-weight: 100

	@media screen and (max-width: 915px)
		.sticker-collection .loading-sticker
			width: calc(50% - #{$sticker-margin})

	@media screen and (max-width: 830px)
		.sticker-collection	> header	
			h2
				font-size: 20px	
			.section-options
				> *
					margin-right: 10px
				.search-box input
					max-width: 85px

	@media screen and (max-width: 700px)
		.sticker-collection
			p.no-stickers-text
				font-size: 20px
			> header
				display: block
				h2
					margin-bottom: 20px

	@media screen and (max-width: 515px)
		.sticker-collection header .section-options
			justify-content: space-between
			> *
				width: 30%
				margin-bottom: 5px
				height: 30px
			.search-box input, .sort-stickers, .btn
				padding: 7px
				font-size: 12.5px
			.search-box
				input
					width: 100%
					max-width: 100%

	@media screen and (max-width: 500px)
		.sticker-collection .loading-sticker
			height: 200px

	@media screen and (max-width: 420px)
		.sticker-collection header .section-options
			.search-box input, .sort-stickers, .btn
				font-size: 12px

	@media screen and (max-width: 370px)
		.sticker-collection header .section-options
			.search-box input, .sort-stickers, .btn
				font-size: 10px

</style>