<script>
</script>

<template>
<header>

	<div class="container">
		
		<router-link to="/" class="logo">
			<img src="images/logo.png" alt="Stickers for Discord">
		</router-link>

		<nav class="main-nav">
			<router-link to="/user/me">Your Stickers</router-link>
			<router-link to="/guilds">Your Servers</router-link>
			<router-link to="/sticker-packs">Sticker Packs</router-link>
			<a href="/login">Login</a>
		</nav>	

	</div>	

</header>
</template>

<style scoped lang="sass">

	$brand-orange: #fcb862
	$header-height: 100px

	*
		font-family: 'Rubik', sans-serif

	header
		background-color: $brand-orange
		height: $header-height 
		width: 100%
		display: flex
		justify-content: center
		.container
			width: 100%
			max-width: 1000px
			height: $header-height 
			display: flex
			justify-content: space-between
			a
				color: white
				height: $header-height 
				display: inline-flex
				align-items: center
			nav a
				padding-left: 10px
				padding-right: 10px
				font-weight: 300
				text-decoration: none
				&:hover
					background-color: rgba(255,255,255,0.1)

</style>