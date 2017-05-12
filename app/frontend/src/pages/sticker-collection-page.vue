<script>
import Vue from 'vue';
import header from '../components/header.vue';
import sticker from '../components/sticker.vue';

Vue.component('header-bar', header);
Vue.component('sticker', sticker);

module.exports = {

	props: ['type'],

	data: function(){
		return {
		}
	}

}

</script>

<template>
<main>

	<header-bar></header-bar>
	<div class="container">

		<h1>{{type}} {{$route.params.id}}</h1>

		<section>
			<h2>Custom Stickers</h2>
			<div class="sticker-area">
				<sticker link="http://i.imgur.com/sZf6MAL.png" name="fry"></sticker>	
				<sticker link="http://i.imgur.com/Fv3BM56.png" name="kappa"></sticker>	
				<sticker link="http://i.imgur.com/dIxAL3I.png" name="mrbean"></sticker>	
				<sticker link="http://i.imgur.com/hdpVMQy.png" name="sandbag"></sticker>
			</div>	
		</section>

	</div>
</main>
</template>

<style lang="sass">

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