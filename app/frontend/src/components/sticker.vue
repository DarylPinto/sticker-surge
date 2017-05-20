<script>
module.exports = {
	props: ['link', 'name']
}
</script>

<template>
<div class="sticker">
	<div class="image" :style="'background-image: url('+link+')'"></div>
	<p>:{{name}}:</p>
</div>
</template>

<style lang="sass">

	$discord-gray: #36393E	

	.sticker
		font-size: 18px
		background-color: $discord-gray
		border-radius: 5px
		overflow: hidden
		width: calc(25% - 11.5px)
		margin-right: 15px
		margin-bottom: 15px
		display: inline-flex
		flex-direction: column
		justify-content: space-between
		align-items: center
		&:nth-child(4n)
			margin-right: 0
		.image
			height: 230px
			width: 100%
			background-repeat: no-repeat
			background-position: center center
			border: 10px solid transparent
			box-sizing: border-box
			background-size: contain
		p
			background-color: #505154
			color: #eaeaea 
			text-align: center
			width: 100%
			padding: 15px 0
			text-transform: lowercase

</style>