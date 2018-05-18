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
			isLastPage: false,
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
				this.packs = res.data.packs;
				this.isLastPage = res.data.isLastPage;
				this.packsLoaded = true;
			});
		},

		debouncedLoad: debounce(function(){
			this.loadPacks();
		}, 400),

		nextPage(){
			this.pageNum++;
			this.loadPacks();
		},

		prevPage(){
			this.pageNum--;
			this.loadPacks();
		}
	},

	mounted: function(){
		document.title = 'Sticker Packs - Stickers for Discord';
		this.pageLoaded = true;
		this.loadPacks();
	}

}

</script>

<template>
<main class="sticker-pack-list-page">

	<header-bar :userId="userId"></header-bar>

	<header class="sticker-pack-list-header">
		<h1>Sticker Packs</h1>
	</header>

	<div class="container" :class="{transparent: !pageLoaded}">

		<div class="sort-wrap">
			<h2>{{sortMethod}} packs</h2>
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
		</div>	

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

		<div v-show="packsLoaded" class="pagination">
			<span v-if="pageNum > 1" @click="prevPage()">Prev</span>
			<span v-if="!isLastPage" @click="nextPage()">Next</span>
		</div>

	</div>

</main>
</template>

<style lang="sass">

	$brand-red: #fc6262

	.sticker-pack-list-page	
		transition: .2s
		div.sort-wrap
			display: flex
			margin-top: 55px
			padding-bottom: 15px	
			margin-bottom: 30px
			border-bottom: 2px solid rgba(255, 255, 255, 0.45)
			justify-content: space-between
			align-items: baseline
			h2
				text-transform: capitalize
				font-size: 30px
				font-weight: 300
			.btn
				display: flex
				align-items: center
	
		header.sticker-pack-list-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 65px
			padding-bottom: 65px
			margin-bottom: 25px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 50px	

		.loading-packs img
			display: block
			width: 150px
			margin: 0 auto
			margin-top: 90px

	.pagination	
		display: block
		margin-top: 30px
		margin-bottom: 45px	
		text-align: right
		span
			display: inline-block
			text-align: center
			min-width: 90px
			margin-left: 10px
			margin-right: 10px	
			padding: 10px
			border: 1px solid gray
			color: gray
			border-radius: 4px
			cursor: pointer
			transition: .2s
			&:hover
				background-color: $brand-red
				border-color: $brand-red
				color: white
			&:first-child
				margin-left: 0
			&:last-child
				margin-right: 0

</style>