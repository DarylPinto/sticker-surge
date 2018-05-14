<script>
import Vue from 'vue';
import axios from 'axios';
import debounce from 'debounce';
import header from '../components/header.vue';
import stickerPackListItem from '../components/sticker-pack-list-item.vue';

Vue.component('header-bar', header);
Vue.component('stickerPackListItem', stickerPackListItem);

module.exports = {

	data: function(){
		return {
			packs: [],
			pageNum: 1,
			sortMethod: 'popular',
			search: '',
			pageLoaded: false,
			packsLoaded: false,
			userId: this.$cookie.get('id') || null
		}
	},

	methods: {
		loadPacks: function(){

			let endpoint = `/api/sticker-packs/?sort=${this.sortMethod}&page=${this.pageNum}`;
			(this.search.trim().length > 0) ? endpoint += `&search=${encodeURIComponent(this.search)}` : null;
			endpoint += `&nocache=${(new Date()).getTime()}`;

			this.packsLoaded = false;

			axios.get(endpoint)
			.then(res => {
				this.packs = res.data;
				this.packsLoaded = true;
			});
		},

		debouncedLoad: debounce(function(){
			this.loadPacks();
		}, 400)
	},

	mounted: function(){
		document.title = 'Sticker Packs - Stickers for Discord';
		this.pageLoaded = true;
		this.loadPacks();
	}

}

</script>

<template>
<main>

	<header-bar :userId="userId"></header-bar>
	<div class="container sticker-pack-list" :class="{transparent: !pageLoaded}">

		<header>
			<h1>Sticker Packs</h1>
			<div class="section-options">
				<span class="search-box">
					<i class="material-icons">search</i>
					<input type="text" placeholder="Search" v-model="search" @input="debouncedLoad()">	
				</span>	
				<select class="sort-stickers" v-model="sortMethod" @change="loadPacks()">
					<option value="popular">Sort by: Popular</option>
					<option value="newest">Sort by: Newest</option>
					<option value="oldest">Sort by: Oldest</option>
				</select>
				<router-link to="/sticker-packs/new" class="btn" v-if="userId">Create a Sticker Pack</router-link>	
			</div>	
		</header>	

		<div v-if="!packsLoaded" class="loading-packs">
			<img src="/images/loading-spin.svg">
		</div>

		<stickerPackListItem
			v-if="packsLoaded"
			v-for="pack in packs"
			:key="pack.key"
			:link="`/pack/${pack.key}`"
			:name="pack.name"
			:icon="pack.icon"
			:description="pack.description"
			:subscribers="pack.subscribers"
		/>

	</div>

</main>
</template>

<style lang="sass">

	.sticker-pack-list	
		margin-top: 40px	
		transition: .2s
		h1
			font-size: 85px
		header
			display: flex
			padding-bottom: 15px	
			margin-bottom: 30px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
			justify-content: space-between
			align-items: baseline
			.btn
				display: flex
				align-items: center

		.sticker-pack
			display: inline-block
			width: calc(25% - 11.5px)
			margin-right: 15px
			vertical-align: top
			border-radius: 5px
			height: 280px
			margin-bottom: 15px
			background-color: rgba(255,255,255,0.05)
			a
				text-decoration: none
				display: inline-block	
				text-align: center
				border-radius: 5px
				height: inherit
				padding: 20px
				width: 100%
				box-sizing: border-box
				transition: .2s
				&:hover
					background-color: rgba(255,255,255,0.05)
			&:nth-of-type(4n)
				margin-right: 0
			h2
				font-size: 20px
				margin-top: 10px
				margin-bottom: 10px
				font-weight: 100
				line-height: 1.3em
			.pack-icon
				display: inline-block
				border-radius: 200px
				border: 5px solid #484848
				margin-top: 25px
				height: 128px
				width: 128px
				background-color: #1f1f1f
				background-size: cover
				background-position: center center
				background-repeat: no-repeat

		.loading-packs img
			display: block
			width: 150px
			margin: 0 auto
			margin-top: 90px

</style>