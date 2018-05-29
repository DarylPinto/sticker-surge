<script>
import Vue from 'vue';
import axios from 'axios';
import debounce from 'debounce';
import header from '../components/header.vue';
import footer from '../components/footer.vue';
import stickerPackListItem from '../components/sticker-pack-list-item.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);
Vue.component('stickerPackListItem', stickerPackListItem);

module.exports = {

	data: function(){
		return {
			packs: [],
			pageNum: 1,
			allContentLoaded: false,
			sortMethod: 'popular',
			search: '',
			pageLoaded: false,
			currentlyLoadingPacks: false,
			userId: this.$cookie.get('id') || null,
			userBanned: false
		}
	},

	methods: {
		loadPacks: function(isInitialLoad){

			if(isInitialLoad){	
				this.packs = [];
				this.pageNum = 1;
				this.allContentLoaded = false;
			}else{
				this.pageNum++;
			}

			let endpoint = `/api/sticker-packs/?sort=${this.sortMethod}&page=${this.pageNum}`;
			(this.search.trim().length > 0) ? endpoint += `&search=${encodeURIComponent(this.search)}` : null;
			endpoint += `&nocache=${(new Date()).getTime()}`;

			this.currentlyLoadingPacks = true;

			axios.get(endpoint)
			.then(res => {
				let new_packs;
				if(res.data.packs.length === 0) this.allContentLoaded = true;
				this.currentlyLoadingPacks = false;
				//Remove potential duplicates before appending
				new_packs = res.data.packs.filter(pack => !this.packs.map(p => p.key).includes(pack.key));
				this.packs = this.packs.concat(new_packs);
			});
		},

		debouncedLoad: debounce(function(){
			this.currentlyLoadingPacks = true;
			this.loadPacks(true);
		}, 400)

	},

	mounted: function(){
		document.title = 'Sticker Packs - Stickers for Discord';
		this.pageLoaded = true;
		this.loadPacks(true);

		//Hide "create new pack" button if user banned from creating sticker packs
		if(this.userId){
			axios.get(`/api/users/${this.userId}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				if(res.data.bans.indexOf('CREATE_STICKER_PACK') > -1) this.userBanned = true;
			});
		}

		//Scroll to bottom to load more
		window.addEventListener('scroll', () => {
			let distance_from_bottom = 80;
			if((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - distance_from_bottom){
				if(!this.currentlyLoadingPacks && !this.allContentLoaded) this.loadPacks(false);
			}
		});

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
					<input type="text" placeholder="Search" v-model="search" @input="debouncedLoad(true)">
				</span>
				<select class="sort-stickers" v-model="sortMethod" @change="loadPacks(true)">
					<option value="popular">Sort by: Popular</option>
					<option value="newest">Sort by: Newest</option>
					<option value="oldest">Sort by: Oldest</option>
				</select>
				<router-link to="/sticker-packs/new" class="btn" v-if="userId && !userBanned">Create a Sticker Pack</router-link>	
			</div>	
		</div>

		<stickerPackListItem
			v-for="pack in packs"
			:key="pack.key"
			:link="`/pack/${pack.key}`"
			:name="pack.name"
			:icon="pack.icon"
			:description="pack.description"
			:subscribers="pack.subscribers"
		/>

		<div v-if="currentlyLoadingPacks" class="loading-packs">
			<img src="/images/loading-spin.svg">
		</div>

	</div>

	<footer-bar></footer-bar>

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
			width: 90px
			margin: 0 auto
			margin-top: 20px

</style>