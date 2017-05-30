<script>
module.exports = {
	props: ['link', 'name', 'isEditable'],
}
</script>

<template>
<div class="sticker">
	<i class="material-icons delete-sticker" v-if="isEditable" @click="$emit('deleteSticker')">clear</i>	
	<img :src="link" :alt="name">	
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
		height: 280px
		margin-right: 15px
		margin-bottom: 15px
		display: inline-flex
		flex-direction: column
		justify-content: center
		align-items: center
		position: relative
		vertical-align: top
		&:nth-child(4n)
			margin-right: 0
		&:hover .delete-sticker
			color: rgba(255,255,255,0.3)
		.delete-sticker
			position: absolute
			top: 8px
			right: 10px	
			font-weight: 100
			font-size: 30px
			cursor: default
			color: transparent
			transition: .2s
			&:hover
				color: rgba(255,255,255,0.5)
		img
			max-height: 210px
			max-width: 220px
			margin-bottom: 42px
			object-fit: contain
		p
			background-color: #505154
			color: #eaeaea 
			text-align: center
			width: 100%
			padding: 15px 0
			text-transform: lowercase
			position: absolute
			bottom: 0
			left: 0

</style>