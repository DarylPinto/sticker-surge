<script>
import Vue from 'vue';
import header from '../components/header.vue';
import footer from '../components/footer.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);

module.exports = {
	data: function(){
		return {
			userId: this.$cookie.get('id') || null,
			pageLoaded: false
		}
	},
	mounted: function(){	
		this.pageLoaded = true;
	}
}

</script>

<template>
<main class="documentation-page">

	<header-bar :userId="userId"></header-bar>	

	<div :class="{transparent: !pageLoaded}">

		<header class="your-guilds-header">
			<h1>Documentation</h1>	
		</header>

		<div class="container">
			<h2>Adding the bot to your server</h2>
			<p>The first thing you need to do to get stickers on your Discord server is to add the bot</p>
		</div>

	</div>

	<footer-bar></footer-bar>

</main>
</template>

<style lang="sass">

	.documentation-page
		> div
			transition: .2s
		header.your-guilds-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 65px
			padding-bottom: 65px
			margin-bottom: 35px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 50px
		h2
			font-size: 30px
			font-weight: 100
			border-bottom: 1px solid rgba(255, 255, 255, 0.15)
			padding-bottom: 15px
			margin-bottom: 27px
		p
			font-size: 16px

</style>