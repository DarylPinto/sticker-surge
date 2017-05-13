<script>
import Vue from 'vue';
import axios from 'axios';
import header from '../components/header.vue';
import sticker from '../components/sticker.vue';

Vue.component('header-bar', header);
Vue.component('sticker', sticker);

module.exports = {
	props: ['page_type'],

	data: function(){
		return {
			username: '',
			stickers: []
		}
	},

	mounted: function(){

		//this.$el.querySelector('.container').classList.add('faded-out');

		axios.get(`/api/${this.page_type}s/${this.$route.params.id}`)
		.then(res => {

			let stickers = res.data.customStickers;
			stickers.reverse();
			this.stickers = stickers;
			this.username = res.data.username;	
			this.$el.querySelector('.faded-out').classList.remove('faded-out');

		}).catch(err => console.log(err));

	}
}

</script>

<template>
<main>

	<header-bar></header-bar>
	<div class="container faded-out">

		<h1>{{username}}</h1>

		<section>
			<h2>Custom Stickers</h2>
			<div class="sticker-area">
				<sticker v-for="sticker in stickers" :link="sticker.url" :name="sticker.name"></sticker>
			</div>	
		</section>

	</div>
</main>
</template>

<style lang="sass">

	.container
		transition: .5s
		&.faded-out
			opacity: 0

	.sticker-area
		font-size: 0

	h1
		font-weight: 100
		font-size: 90px
		margin-top: 40px
		margin-bottom: 20px
		margin-left: -8px

	h2
		font-size: 30px
		font-weight: 300
		border-bottom: 2px solid rgba(255, 255, 255, 0.43)
		margin-bottom: 20px
		padding-bottom: 10px

</style>