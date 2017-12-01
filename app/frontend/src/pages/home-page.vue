<script>
import Vue from 'vue';
import header from '../components/header.vue';

Vue.component('header-bar', header);

module.exports = {

	data: function(){
		return {
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			taglines: [
				'Make your server expressive',
				'Spice up your server',
				'Meme it up in your server',
				'Keep your server interesting',
				'Add some fun to your server',
				'Turn your server up a notch'
			]
		}
	},

	methods: {
		randArrayItem(arr){
			return arr[Math.floor(Math.random() * arr.length)];	
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
		<div class="headline">
			<span>{{randArrayItem(taglines)}} with</span>
			<h1>Stickers for Discord</h1>	
		</div>	
		<a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=8192" class="btn" target="_blank">Add to Discord</a>

		<video src="demo-video.mp4" autoplay loop muted></video>	
	</div>
</main>
</template>

<style lang="sass">

	.home-page
		text-align: center
		height: calc(100vh - 100px)
		position: relative
		transition: opacity .2s
		video
			display: block
			position: absolute
			margin: 0 auto
			box-shadow: 0 0 25px rgba(0,0,0, 0.8)
			margin-top: 80px
			background-color: #36393e
			bottom: 0
			left: 0
			right: 0
			max-width: 100%
			max-height: calc(100vh - 450px)
			border-top-left-radius: 5px
			border-top-right-radius: 5px
		.headline
			padding-top: 60px
			margin-bottom: 60px
			h1
				transform: scale(1, 1.1)
				font-weight: bold
				font-size: 65px
			span
				display: block
				margin-bottom: 15px
				font-weight: 400
				opacity: 0.8
				font-size: 35px
		a
			font-size: 24px
			font-weight: 100
			border-radius: 40px
			padding: 13px 25px
			text-shadow: 1px 1px rgba(0, 0, 0, 0.50)
			letter-spacing: -0.5px

	//Media query widths
	@media screen and (max-width: 750px)
		.home-page .headline
			h1
				font-size: 38px
			span
				font-size: 20px		

	@media screen and (max-width: 435px)
		.home-page .headline
			padding-top: 100px

	@media screen and (max-width: 400px)
		.home-page
			.headline
				h1
					font-size: 28px
				span
					font-size: 15px
			a
				font-size: 20px

	//Media query heights
	@media screen and (max-height: 650px)
		.home-page
			display: flex
			flex-direction: column
			align-items: center
			justify-content: center
			.headline
				padding-top: 0
			video
				display: none

</style>