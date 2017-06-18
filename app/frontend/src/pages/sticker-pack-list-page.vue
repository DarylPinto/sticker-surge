<script>
import Vue from 'vue';
import header from '../components/header.vue';

Vue.component('header-bar', header);

module.exports = {

	data: function(){
		return {
			pageLoaded: false,
			userId: this.$cookie.get('id') || null
		}
	},

	mounted: function(){
		document.title = 'Sticker Packs - Stickers for Discord';
		this.pageLoaded = true;
	}

}

</script>

<template>
<main>

	<header-bar :userId="userId"></header-bar>
	<div class="container sticker-pack-list" :class="{transparent: !pageLoaded}">
		<h1>Coming Soon</h1>	
	</div>

</main>
</template>

<style lang="sass">

	.sticker-pack-list	
		text-align: center
		transition: .2s
		h1
			font-size: 65px
			margin-top: 80px
			margin-bottom: 80px

</style>