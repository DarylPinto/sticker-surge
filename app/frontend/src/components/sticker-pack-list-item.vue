<script>
import Vue from 'vue';

module.exports = {
	props: ['link', 'name', 'icon', 'description', 'subscribers']
}

</script>

<template>
<router-link :to="link" class="sticker-pack-list-item">
	<div class="icon" :style="'background-image: url('+icon+')'"></div>
	<div class="title"><h2>{{name}}</h2></div>
	<p class="desc">{{description}}</p>
	<footer>
		<span>{{subscribers.toLocaleString()}} {{subscribers === 1 ? 'subscriber' : 'subscribers'}}</span>
	</footer>
</router-link>
</template>

<style lang="sass">	

	.sticker-pack-list-item
		display: inline-flex
		width: calc(33.45% - 11.5px)
		height: 260px
		border: 1px solid rgba(0, 0, 0, 0.4)
		box-sizing: border-box
		position: relative
		flex-direction: column
		text-decoration: none	
		margin-right: 15px
		vertical-align: top
		border-radius: 5px
		overflow: hidden
		margin-bottom: 15px
		background-color: rgba(255,255,255,0.05)
		transition: .2s
		&:nth-of-type(3n)
			margin-right: 0
		&:hover
			transform: scale(1.04)
		.icon
			position: absolute
			display: inline-block
			border-radius: 200px
			border: 5px solid #484848
			top: 60px
			left: 20px	
			height: 110px
			width: 110px
			background-color: #1f1f1f
			background-size: cover
			background-position: center center
			background-repeat: no-repeat
		.title
			display: flex
			flex-direction: column-reverse
			height: 110px	
			background: repeating-linear-gradient(-45deg, rgba(23,23,23,0.65), rgba(23,23,23,0.65) 20px, rgba(16,16,16,0.65) 0, rgba(16,16,16,0.65) 40px)
			h2
				margin-left: 160px
				margin-right: 13px
				font-weight: 400
				font-size: 25px
				margin-bottom: 5px
				line-height: 1.2em
		.desc
			margin-left: 160px
			margin-top: 12px
			line-height: 1.4em
			margin-right: 19px
			font-size: 14px
			opacity: 0.6
		footer
			display: block
			width: 100%
			position: absolute
			bottom: 0
			left: 0
			font-size: 12px
			border-top: 1px solid rgba(255,255,255,0.05)
			background-color: rgba(255,255,255,0.05)
			text-align: right
			padding-top: 6px
			padding-bottom: 7px
			span
				margin-right: 8px
				color: rgba(255,255,255,0.4)

	@media screen and (max-width: 1160px)	
		.sticker-pack-list-item
			width: calc(50% - 7.5px)
			&:nth-of-type(3n)
				margin-right: 15px
			&:nth-of-type(2n)
				margin-right: 0

	@media screen and (max-width: 660px)	
		.sticker-pack-list-item
			width: 100%
			min-height: 260px
			height: auto
			margin-right: 0	


</style>
