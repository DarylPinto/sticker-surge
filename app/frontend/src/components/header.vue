<script>

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
			}
		}
	}

</script>

<template>
<header id="main-header">

	<div class="container">

		<div class="mobile-nav-btn" @click="toggleMobileNav"></div>
		
		<router-link to="/" class="logo-link">
			<img src="/images/logo.png" class="logo" alt="Stickers for Discord">
		</router-link>

		<nav class="main-nav">

			<router-link :to="`/user/${userId}`" v-if="loggedIn">Your Stickers</router-link>

			<router-link to="/servers" v-if="loggedIn">Your Servers</router-link>
			<router-link to="/sticker-packs">Sticker Packs</router-link>

			<a href="/login" v-if="!loggedIn">Log In</a>
			<a href="/logout" v-if="loggedIn">Log Out</a>
			
		</nav>	

	</div>

	<div class="mobile-nav" :class="{open: mobileNavOpen}" @click="toggleMobileNav">
		<nav @click.stop>

			<router-link to="/" class="logo-link">
				<img src="/images/logo.png" class="logo" alt="Stickers for Discord">
			</router-link>

			<router-link :to="`/user/${userId}`" v-if="loggedIn">Your Stickers</router-link>

			<router-link to="/servers" v-if="loggedIn">Your Servers</router-link>
			<router-link to="/sticker-packs">Sticker Packs</router-link>

			<a href="/login" v-if="!loggedIn">Log In</a>
			<a href="/logout" v-if="loggedIn">Log Out</a>
		</nav>
	</div>

</header>
</template>

<style lang="sass">

	$brand-red: #fc6262
	$header-height: 100px

	#main-header
		background-color: $brand-red
		height: $header-height 
		width: 100%
		display: flex
		justify-content: center
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
				max-height: 65px
				width: auto
			.main-nav
				font-size: 0
			.main-nav a
				padding-left: 10px
				padding-right: 10px
				font-size: 18px
				font-weight: 300
				text-decoration: none
				&:hover, &.router-link-active
					background-color: rgba(255,255,255,0.1)
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

		.mobile-nav
			position: fixed
			width: 100vw
			height: 100vh
			background-color: rgba(0,0,0,0.7)	
			z-index: 100
			opacity: 0
			pointer-events: none
			transition: .2s
			nav
				content: ''
				height: 100vh
				width: 75vw
				left: -75vw
				background-color: #2a2d2f
				overflow: hidden
				position: relative
				transition: 0.5s
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

		.mobile-nav.open
			opacity: 1
			pointer-events: auto
			nav
				left: 0


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