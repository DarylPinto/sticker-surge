<script>
</script>

<template>
<header>

	<div class="container">
		
		<router-link to="/">
			<img src="images/logo.png" class="logo" alt="Stickers for Discord">
		</router-link>

		<nav class="main-nav">
			<router-link to="/user/123">Your Stickers</router-link>
			<router-link to="/server/456">Your Servers</router-link>
			<router-link to="/sticker-packs">Sticker Packs</router-link>
			<a href="/login">Log In</a>
		</nav>	

	</div>	

</header>
</template>

<style lang="sass">

	$brand-red: #fc6262
	$header-height: 100px

	header
		background-color: $brand-red
		height: $header-height 
		width: 100%
		display: flex
		justify-content: center
		.container
			display: flex
			justify-content: space-between
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