<script>
import Vue from 'vue';
import header from '@/components/Header.vue';

Vue.component('header-bar', header);

export default {

	data: function(){
		return {
			pageLoaded: false,
			userId: this.$cookie.get('id') || null,
			taglines: [
				'Make your Discord server more expressive',
				'Spice up your Discord server',
				'Meme it up in your Discord server',
				'Liven up the mood in your Discord server',
				'Keep your Discord server interesting',
				'Add some fun to your Discord server',
				'Express yourself in your Discord server',
				'Try something new in your Discord server',
				'Bring a bit of humor to your Discord server',
				'Trash talk your buddies in new ways',
				'Turn your Discord server up a notch'
			]
		}
	},

	methods: {
		randArrayItem(arr){
			return arr[Math.floor(Math.random() * arr.length)];	
		}
	},

	mounted: function(){
		document.title = 'Discord Sticker Packs & Custom Stickers - Sticker Surge';
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
			<h1>Sticker Surge</h1>	
		</div>	
		<a :href="$botInviteURL" class="btn" target="_blank">Add to Discord</a>
		<router-link to="/docs" class="btn secondary">Learn More</router-link>

		<video src="../assets/videos/demo-video.mp4" autoplay loop muted></video>	
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
				font-weight: 500
				font-size: 65px
			span
				display: block
				margin-bottom: 15px
				font-weight: 400
				opacity: 0.8
				font-size: 35px
				line-height: 1.25em
		a.btn
			font-size: 24px
			font-weight: 100
			border-radius: 40px
			padding: 13px 25px
			min-width: 200px
			text-shadow: 1px 1px rgba(0, 0, 0, 0.50)
			letter-spacing: -0.5px
			&.secondary
				margin-left: 15px
				&:hover
					border-color: #5f6263
					background-color: #5f6263 
					text-shadow: none

	//Media query widths
	@media screen and (max-width: 750px)
		.home-page .headline
			h1
				font-size: 38px
			span
				font-size: 20px
				padding: 0 10px	
	
	@media screen and (max-width: 460px)
		.home-page a.btn
			margin-left: auto
			margin-right: auto
			display: block
			width: 70%
			&.secondary
				margin-left: auto !important
				margin-top: 15px

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
			a.btn.secondary
				margin-left: 0
				margin-top: 15px

</style>