<script>
module.exports = {
	props: ['link', 'name', 'isEditable'],
}
</script>

<template>
<div class="sticker">
	<span v-if="isEditable" class="delete-sticker" @click="$emit('deleteSticker')">X</span>
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
		position: relative
		&:nth-child(4n)
			margin-right: 0
		&:hover .delete-sticker
			color: rgba(255,255,255,0.3)
		.delete-sticker
			position: absolute
			top: 10px
			right: 17px
			transform: scale(1.2, 1)
			font-weight: 100
			font-size: 27px
			cursor: default
			color: transparent
			transition: .2s
			&:hover
				color: rgba(255,255,255,0.5)
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