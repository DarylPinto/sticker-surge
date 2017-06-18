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
		document.title = 'Stickers for Discord';
		this.pageLoaded = true;
	}

}

</script>

<template>
<main>

	<header-bar :userId="userId"></header-bar>
	<div class="container home-page" :class="{transparent: !pageLoaded}">
		<h1>Express yourself with<br>Stickers for Discord</h1>
		<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=8192" class="btn" target="_blank">Add to Discord</a>	
	</div>

</main>
</template>

<style lang="sass">

	.home-page	
		text-align: center
		transition: .2s
		h1
			transform: scale(1, 1.1)
			font-weight: bold
			font-size: 65px
			margin-top: 60px
			margin-bottom: 60px
		a
			font-size: 24px
			font-weight: 100
			border-radius: 40px
			padding: 13px 25px
			letter-spacing: -0.5px

</style>