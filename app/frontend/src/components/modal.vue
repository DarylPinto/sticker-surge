<script>
import Vue from 'vue';

module.exports = {
	methods: {	
		close: function(){
			this.$emit('close');
		},
		handleEscKey: function(e){
			if(e.keyCode === 27) this.close();
		}
	},
	beforeMount: function(){
		document.addEventListener('keydown', this.handleEscKey);
	},
	beforeDestroy: function(){
		document.removeEventListener('keydown', this.handleEscKey);	
	}
}
</script>

<template>
<transition name="fade">
	<div class="modal-bg"	@click="close">
		<div class="modal" @click.stop>
			<i class="material-icons close-x" @click="close">clear</i>
			<slot />
		</div>	
	</div>
</transition>
</template>

<style lang="sass">
			
	.modal-bg
		display: flex 
		background-color: rgba(0,0,0,.7)
		position: fixed
		top: 0
		left: 0
		transition: .2s opacity
		height: 100vh
		width: 100vw
		z-index: 100	
		justify-content: center
		align-items: center
		&.closed
			display: none 
		&.fade-leave-active, &.fade-enter
			opacity: 0

	.modal
		position: relative
		background-color: #36393E
		padding: 30px
		box-shadow: 0 0 10px black
		border: 1px solid rgba(255, 255, 255, 0.15)
		border-radius: 4px	
		width: 80vw
		max-width: 640px
		box-sizing: border-box
		.close-x
			position: absolute
			padding: 15px
			top: 0px
			right: 3px
			color: rgba(255, 255, 255, 0.3)
			cursor: default
			font-size: 30px
			&:hover
				color: rgba(255,255,255,0.5)

	@media screen and (max-width: 600px)
		.modal
			width: 90vw	

</style>