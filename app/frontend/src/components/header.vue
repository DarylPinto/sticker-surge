<script>
	import Vue from 'vue';
	import swipeEvents from '../scripts/swipe-events.js';
	swipeEvents.init();

	module.exports = {
		props: ['userId'],
		data: function(){
			return {
				loggedIn: this.userId != null,
				mobileNavOpen: false
			}
		},
		methods: {
			toggleMobileNav(){
				this.mobileNavOpen = !this.mobileNavOpen;
			},
			openMobileNav(){
				this.mobileNavOpen = true;
			},
			closeMobileNav(){
				this.mobileNavOpen = false;
			}
		},
		mounted: function(){
			document.addEventListener('swipeleft', this.closeMobileNav);
			document.addEventListener('swiperight', this.openMobileNav);
		}

	}

</script>

<template>
<header id="main-header">

	<div class="container">

		<div class="mobile-nav-btn" @click="openMobileNav"></div>
		
		<router-link to="/" class="logo-link">
			<img src="/images/logo.svg" class="logo" alt="Stickers for Discord">
		</router-link>

		<nav class="main-nav">

			<router-link to="/servers" v-if="loggedIn">Your Servers</router-link>
			<router-link :to="`/user/${userId}`" v-if="loggedIn">Personal Stickers</router-link>
			<router-link to="/sticker-packs">Sticker Packs</router-link>

			<a href="/login" v-if="!loggedIn">Log In</a>
			<a href="/logout" v-if="loggedIn">Log Out</a>
			
		</nav>	

	</div>


	<!-- Mobile Nav -->
	<div class="mobile-nav-backdrop" :class="{open: mobileNavOpen}" @click="closeMobileNav"></div>

	<nav class="mobile-nav" :class="{open: mobileNavOpen}">
		<router-link to="/" class="logo-link">
			<img src="/images/logo.svg" class="logo" alt="Stickers for Discord">
		</router-link>

		<router-link to="/servers" v-if="loggedIn">Your Servers</router-link>
		<router-link :to="`/user/${userId}`" v-if="loggedIn">Personal Stickers</router-link>
		<router-link to="/sticker-packs">Sticker Packs</router-link>

		<a href="/login" v-if="!loggedIn">Log In</a>
		<a href="/logout" v-if="loggedIn">Log Out</a>
	</nav>

</header>
</template>

<style lang="sass">

	$brand-red: #fc6262
	$header-color: #131313
	$discord-gray: #2a2d2f
	$header-height: 60px

	#main-header
		background-color: $header-color
		height: $header-height 
		width: 100%
		display: flex
		justify-content: center
		z-index: 1
		.container
			display: flex
			justify-content: space-between
			margin: 0
			a
				color: white
				height: $header-height 
				display: inline-flex
				align-items: center
			.logo
				max-height: 45px
				max-width: 249px	
				width: auto
			.main-nav
				font-size: 0
			.main-nav a
				padding-left: 7px
				padding-right: 7px
				font-size: 16px
				font-weight: 300
				text-decoration: none
				&:hover, &.router-link-active
					background-color: $discord-gray
		.mobile-nav-btn
			display: none
			width: 35px
			height: 6px
			background: white
			position: absolute
			left: 25px
			top: 37px
			&:before, &:after
				content: ''
				display: block
				position: relative
				width: 35px
				height: 6px
				background: white
			&:before
				top: 10px
			&:after
				top: -16px

		.mobile-nav-backdrop
			position: fixed
			width: 100vw
			height: 100vh
			background-color: rgba(0,0,0,0.7)	
			z-index: 100
			opacity: 0
			pointer-events: none
			transition: 0.3s

		.mobile-nav
			position: fixed
			height: 100vh
			width: 75vw
			left: -100vw
			background-color: #2a2d2f
			overflow: hidden
			transition: 0.3s
			z-index: 110
			.logo-link, .logo-link.router-link-active
				background-color: $brand-red
			.logo
				max-width: 60vw
			a
				display: block
				width: 100%
				padding: 25px 20px
				font-size: 18px
				text-decoration: none
				&:hover, &.router-link-active
					background-color: rgba(255,255,255,0.1)

		.mobile-nav-backdrop.open
			opacity: 1
			pointer-events: auto

		.mobile-nav.open
			left: 0
			opacity: 1
			box-shadow: 0 0 40px black
			pointer-events: auto


	@media screen and (min-width: 790px)
		.mobile-nav.open, .mobile-nav-backdrop.open
			display: none


	@media screen and (max-width: 790px)
		#main-header
			height: 80px
			.container
				justify-content: space-around
				a
					height: 80px
				.logo
					max-height: 50px
				.mobile-nav-btn
					display: block

		.main-nav
			display: none
	
	@media screen and (max-width: 360px)
		#main-header .mobile-nav-btn
			left: 15px
			transform: scale(0.8)

</style>