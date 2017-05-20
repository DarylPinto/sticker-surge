<script>
import Vue from 'vue';
import header from '../components/header.vue';

Vue.component('header-bar', header);

module.exports = {

	data: function(){
		return {
			userId: this.$cookie.get('id') || null
		}
	},

	mounted: function(){
		document.title = 'Stickers for Discord';
	}

}

</script>

<template>
<main>

	<header-bar :userId="userId"></header-bar>
	<div class="container home-page">
		<h1>Express yourself with<br>Stickers for Discord</h1>
		<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=268463104" target="_blank">Add to Discord</a>	
	</div>
	
</main>
</template>

<style lang="sass">

	.home-page	
		text-align: center
		h1	
			font-family: 'Righteous', sans-serif
			font-size: 75px
			margin-top: 80px
			margin-bottom: 80px
		a
			background-color: #60b0b9
			display: inline-block
			font-size: 18px
			text-decoration: none
			border-radius: 40px
			padding: 13px 25px

</style>