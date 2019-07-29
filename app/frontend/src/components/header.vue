<script>
import Vue from 'vue';
import axios from 'axios';
import swipeEvents from '../scripts/swipe-events.js';
swipeEvents.init();

module.exports = {
	props: ['userId'],
	data: function(){
		return {
			loggedIn: this.userId != null,
			mobileNavOpen: false,	
			username: null,
			avatarURL: null
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
		},
		updateUserInfo(){
			axios.get(`/api/users/${this.userId}?nocache=${(new Date()).getTime()}`)
			.then(res => {
				this.username = res.data.username;
				this.avatarURL = res.data.avatar ?
					`https://cdn.discordapp.com/avatars/${res.data.id}/${res.data.avatar}.png` :
					'/images/default-discord-icon.png';
			});
		}
	},
	mounted: function(){
		document.addEventListener('swipeleft', this.closeMobileNav);
		document.addEventListener('swiperight', this.openMobileNav);

		if(this.userId) this.updateUserInfo();
	},
	watch: {
		'$route': function(){	
			if(this.userId) this.updateUserInfo();
		}
	},

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
		
			<router-link to="/sticker-packs">Sticker Packs</router-link>
			<router-link to="/docs">Documentation</router-link>
			<a href="https://discord.gg/HNFmKsE" target="_blank" rel="noopener noreferrer">Community</a>		
		</nav>

		<a href="/login" v-if="!loggedIn" class="login-btn">Login</a>

		<div v-if="loggedIn" class="nav-profile">
			<img :src="avatarURL">
			<span>{{username}} ▾</span>
			<nav class="profile-submenu">
				<router-link to="/servers" v-if="loggedIn">Your Servers</router-link>
				<router-link :to="`/user/${userId}`" v-if="loggedIn">Personal Stickers</router-link>
				<hr />
				<a href="/logout" class="logout">Log Out</a>
			</nav>
		</div>

	</div>


	<!-- Mobile Nav -->
	<div class="mobile-nav-backdrop" :class="{open: mobileNavOpen}" @click="closeMobileNav"></div>

	<nav class="mobile-nav" :class="{open: mobileNavOpen}">
		<router-link to="/" class="logo-link">
			<img src="/images/logo.svg" class="logo" alt="Stickers for Discord">
		</router-link>

		<router-link to="/" :exact="true">Home</router-link>
		<router-link to="/sticker-packs">Sticker Packs</router-link>
		<router-link to="/docs">Documentation</router-link>
		<a href="https://discord.gg/HNFmKsE" target="_blank" rel="noopener noreferrer">Community</a>
		<hr v-if="loggedIn" />
		<router-link to="/servers" v-if="loggedIn">Your Servers</router-link>
		<router-link :to="`/user/${userId}`" v-if="loggedIn">Personal Stickers</router-link>
		<hr />
		<a href="/login" v-if="!loggedIn">Login</a>
		<a href="/logout" v-if="loggedIn">Log Out</a>
	</nav>

</header>
</template>

<style lang="sass">

	$brand-red: #fc6262
	$header-color: #131313
	$discord-gray: #2a2d2f
	$header-height: 60px
	$login-gray: #b0b0b2

	#main-header
		background-color: $header-color
		height: $header-height 
		width: 100%
		display: flex
		justify-content: center
		position: fixed
		top: 0
		left: 0
		z-index: 1
		.container
			display: flex
			align-items: center
			margin: 0
			a
				color: white
				height: $header-height 
				display: inline-flex
				align-items: center
			.logo
				max-height: 37px
				max-width: 249px	
				width: auto
			.main-nav
				font-size: 0
				margin-left: 15px
				a
					padding-left: 7px
					padding-right: 7px
					font-size: 16px
					font-weight: 300
					text-decoration: none
					&:hover, &.router-link-active
						background-color: $discord-gray
			.login-btn	
				margin-left: auto
				border: 2px solid $login-gray
				color: $login-gray 
				border-radius: 20px
				height: auto
				padding: 8px 15px
				font-size: 14px
				font-weight: 100
				transition: .2s
				text-decoration: none
				&:hover
					background-color: transparent
					color: white
					border-color: white
			.nav-profile
				display: flex
				justify-content: flex-end
				align-items: center
				height: $header-height
				margin-left: auto
				cursor: pointer
				position: relative
				img
					height: 30px
					margin-right: 7px
					border-radius: 100px
					border: 1px solid rgba(255, 255, 255, 0.2)
				.profile-submenu
					opacity: 0
					pointer-events: none
					background-color: #131313
					position: absolute
					top: calc(#{$header-height} - 4px)
					right: 0
					transition: .2s
					border-radius: 5px
					overflow: hidden
					width: 150px
					border: 1px solid rgba(128, 128, 128, 0.25)
					box-shadow: 0 0 5px rgba(0, 0, 0, 0.75)
					&:hover
						opacity: 1
						pointer-events: auto
					a
						height: auto
						width: 150px
						box-sizing: border-box
						padding: 15px
						font-size: 14px
						text-align: right
						text-decoration: none
						&:hover, &.router-link-active
							background-color: $discord-gray
					hr
						border-color: rgba(128, 128, 128, 0.25)
						margin: 0
				
				&:hover
					min-width: 150px
					.profile-submenu
						opacity: 1
						pointer-events: auto

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
				padding: 20px 20px
				font-size: 18px
				text-decoration: none
				&:hover, &.router-link-active
					background-color: rgba(255,255,255,0.1)
			hr
				border-color: rgba(128, 128, 128, 0.5)
				margin: 0

		.mobile-nav-backdrop.open
			opacity: 1
			pointer-events: auto

		.mobile-nav.open
			left: 0
			opacity: 1
			box-shadow: 0 0 40px black
			pointer-events: auto

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

		.main-nav, .login-btn, .nav-profile
			display: none !important
	
	@media screen and (max-width: 360px)
		#main-header .mobile-nav-btn
			left: 15px
			transform: scale(0.8)

</style>