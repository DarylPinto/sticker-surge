<template>
<footer id="main-footer">
	<div class="container">	
		<div>
			<a href="https://github.com/darylpinto/stickers-for-discord" target="_blank" rel="noopener noreferrer">Github</a>	
			<a href="/terms.html" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
		</div>
	</div>
</footer>
</template>

<style lang="sass">

	#main-footer
		background-color: #1b1b1b
		width: 100%
		height: 100px
		margin-top: 60px
		.container
			height: inherit
			display: flex
			flex-direction: row
			justify-content: space-around
			align-items: center
		&.sticky
			position: fixed
			bottom: 0
		p, a, i
			color: rgba(255,255,255,0.35)
		p
			position: relative
			top: -5px
		i
			position: relative
			top: 6px
		a
			margin-left: 8px
			font-size: 14px
			transition: .2s
			&:hover
				color: rgba(255,255,255, 0.7)

</style>