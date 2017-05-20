<script>

	module.exports = {
		props: ['userId'],
		data: function(){
			return {
				loggedIn: this.userId != null
			}
		}
	}

</script>

<template>
<header id="main-header">

	<div class="container">
		
		<router-link to="/">
			<img src="/images/logo.png" class="logo" alt="Stickers for Discord">
		</router-link>

		<nav class="main-nav">

			<!-- <a href="/your-stickers" v-if="!loggedIn">Your Stickers</a> -->
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

</style>