<script>
import Vue from 'vue';
import axios from 'axios';
import Clipboard from 'clipboard';
import naturalCompare from 'natural-compare-lite';
import sticker from './Sticker.vue';
import modal from './Modal.vue';
import stickerCreationForm from './StickerCreationForm.vue';

Vue.component('sticker', sticker);
Vue.component('modal', modal);
Vue.component('stickerCreationForm', stickerCreationForm);

//String.startsWith polyfill
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

const normalizeObj = obj => JSON.parse(JSON.stringify(obj));

export default {
	props: ['name', 'stickerPrefix', 'emojiNamesAllowed', 'userId', 'groupId', 'groupType', 'userIsGuildManager', 'userCanManageStickersInGroup', 'isEditable', 'stickers', 'maxStickers', 'pageType'],
	data: function(){
		return {
			stickerSearchString: '',
			sortMethod: 'newest',
			loadingNewSticker: false,
			showStickerCreationModal: false
		}
	},
	computed: {
		noStickersText(){
			let text;
			if(this.isEditable && this.pageType !== 'sticker-packs') text = 'No custom stickers here just yet. Add some!';
			else if(this.pageType !== 'sticker-packs') text = 'No custom stickers here just yet!';	
			else if(this.isEditable && this.pageType === 'sticker-packs') text = 'No stickers in this pack just yet. Add some!';
			else text = 'No stickers here just yet!';
			return text;
		},
		maxStickersReached(){
			return this.stickers.length >= this.maxStickers;
		},
		shownStickers(){
			//Clone stickers array
			let shown = [].concat(this.stickers);
			let sanitized_search_string = this.stickerSearchString.toLowerCase().replace(/(:|-)/g, '');

			//Sort by newest
			if(this.sortMethod === 'newest'){
				//Sorting is not necessary, since `stickers` are already newest -> oldest by default
				//shown.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			}
			//Sort by oldest
			else if(this.sortMethod === 'oldest'){
				shown.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			}
			//Sort by most used
			else if(this.sortMethod === 'mostUsed'){
				shown.sort((a, b) => b.uses - a.uses);
			}
			//Sort alphabetically
			else if(this.sortMethod === 'alpha'){
				shown.sort((a, b) => naturalCompare(a.name, b.name));
			}
			//Sort alphabetically (Reversed)
			else if(this.sortMethod === 'alphaReverse'){
				shown.sort((a, b) => naturalCompare(a.name, b.name));
				shown.reverse();
			}
			//Sort alphabetically
			else if(this.sortMethod === 'alpha'){
				sorted.sort((a, b) => naturalCompare(a.name, b.name));
			}
			//Sort alphabetically (Reversed)
			else if(this.sortMethod === 'alphaReverse'){
				sorted.sort((a, b) => naturalCompare(a.name, b.name));
				sorted.reverse();
			}

			return shown.filter(sticker => {
				let sticker_display_name = (this.pageType === 'sticker-packs') ? this.stickerPrefix+sticker.name : sticker.name;
				return sticker_display_name.indexOf(sanitized_search_string) > -1;
			});
		}
	},
	methods: {	

		addSticker(formData){
			this.loadingNewSticker = true;
			//Sort by newest so that when new sticker is added, it's visible right away
			this.sortMethod = 'newest';

			axios.post(`${this.$apiURL}/api/${this.pageType}/${this.$route.params.id}/stickers`, formData, {'Content-Type': 'multipart/form-data'})
			.then(res => {
				this.loadingNewSticker = false;
				this.$emit('reload');
			}).catch(err => {
				this.loadingNewSticker = false;
				console.error(err.response.status);
				console.error(err.response.data);
				if(err.response.status === 401) window.location.href = '/login';
			});
		},

		deleteSticker(stickerName){
			let sticker_display_name = (this.pageType === 'sticker-packs') ? this.stickerPrefix+'-'+stickerName : stickerName; 
			let message = `Are you sure you want to delete ${sticker_display_name}?`;
			if(!confirm(message)) return false;

			axios.delete(`${this.$apiURL}/api/${this.pageType}/${this.$route.params.id}/stickers/${stickerName}`)
			.then(res => {
				this.$emit('reload');
			}).catch(err => {
				console.error(err.response.status);
				console.error(err.response.data);
				if(err.response.status === 401) window.location.href = '/login';
			});
		},

		unsubscribeFromPack(){
			let message = `Are you sure you want to stop using the "${this.name}" sticker pack?`;
			if(!confirm(message)) return false;

			// Unsubscribe from pack
			axios({
				method: 'delete',
				url: `${this.$apiURL}/api/${this.groupType}/${this.groupId}/sticker-packs`,
				data: {packKey: this.stickerPrefix}
			});

			// Remove from currently loaded view
			let pack_index = this.$parent.stickerPackData.map(pack => pack.key).indexOf(this.stickerPrefix);
			this.$parent.stickerPackData.splice(pack_index, 1);
		}

	},

	mounted: function(){	
		let _this = this;
		new Clipboard('.sticker');
	}

}
</script>

<template>
<section class="sticker-collection" @dragenter="(isEditable) ? showStickerCreationModal = true : null">

	<!-- Main Page -->
	<header>
		<h2>
			<a
				:href="pageType === 'sticker-packs' && groupType != 'sticker-packs' ? `/pack/${stickerPrefix}` : false"
				target="_blank"
			>
				{{name}}
			</a>
		</h2>
		<div class="section-options">
			<span class="search-box">
				<i class="material-icons">search</i>
				<input type="text" placeholder="Search" v-model="stickerSearchString">	
			</span>	
			<select class="sort-stickers" v-model="sortMethod">
				<option value="newest">Sort by: Newest</option>
				<option value="oldest">Sort by: Oldest</option>
				<option value="mostUsed">Sort by: Most Used</option>
				<option value="alpha">Sort by: A-Z</option>
				<option value="alphaReverse">Sort by: Z-A</option>
			</select>
			<button
				v-if="pageType === 'sticker-packs' && userCanManageStickersInGroup"
				@click="unsubscribeFromPack"
				class="pack-unsub"
			>
				<i class="material-icons">clear</i>
				Stop Using this Pack
			</button>
			<button
				v-if="isEditable"
				class="btn"
				:class="{disabled: maxStickersReached}"
				@click="showStickerCreationModal = true"
			>
				Create a Sticker
			</button>
		</div>
	</header>	
	<div class="sticker-area">

		<p v-if="stickers.length === 0 && !loadingNewSticker" class="no-stickers-text">{{noStickersText}}</p>

		<div v-if="loadingNewSticker" class="loading-sticker">
			<img src="/img/loading-spin.svg" alt="">
		</div>
		<sticker
			v-for="sticker in shownStickers"
			v-on:deleteSticker="deleteSticker(sticker.name)"
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

	<modal
		v-if="showStickerCreationModal"
		@close="showStickerCreationModal = false"
	>
		<component
			is="stickerCreationForm"
			@addSticker="addSticker($event)"
			:emojiNamesAllowed="emojiNamesAllowed"
			:stickers="stickers"
		/>
	</modal>

</section>
</template>

<style lang="sass">

	$discord-gray: #36393E
	$sticker-margin: 15px

	.sticker-collection
		overflow: hidden
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
			a
				text-decoration: none
				cursor: default
			a[href]
				cursor: pointer	
		> header
			margin-bottom: 30px
			padding-bottom: 10px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
			display: flex
			align-items: center
			justify-content: space-between
			.section-options
				display: flex
				.btn.disabled
					pointer-events: none
					background-color: #929292
					color: lightgray
				.pack-unsub
					display: flex
					justify-content: center
					align-items: center
					min-width: 37px
					border: 1px solid #7d7d7d	
					background-color: transparent
					border-radius: 100px
					color: #7d7d7d
					font-size: 0	
					outline: 0
					cursor: pointer
					transition: .2s
					i
						font-size: 18px
						color: #7d7d7d
					&:hover
						font-size: 16px
						padding-right: 16px	
						i
							padding-right: 5px
					
				.sort-stickers
					background-color: #2a2d2f
					border-radius: 40px
					color: #7d7d7d
					font-size: 16px
					padding: 0 15px
					outline: 0
					border: 1px solid #7d7d7d
					-webkit-appearance: none
					-moz-appearance: none
					text-indent: 1px
					text-overflow: ''
					option
						background-color: inherit
					&::-ms-expand
						display: none
				input
					text-align: left
				> *
					box-sizing: border-box
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
		margin-bottom: 50px
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