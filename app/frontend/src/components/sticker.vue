<script>
module.exports = {
	props: ['link', 'type', 'creator', 'prefix', 'name', 'userId', 'userIsGuildManager', 'isEditable'],
	computed: {
		displayName(){
			if(this.type === 'users') return `-${this.name}`;
			else if(this.type === 'guilds')	return `:${this.name}:`;
			else return `:${this.prefix}-${this.name}:`;
		},
		isCreatedByUser(){
			return this.userId === this.creator;
		}
	},
	methods: {
		notifyCopied(){
			[].slice.call(document.querySelectorAll('.sticker')).forEach(sticker => sticker.classList.remove('notify-copied'));
			this.$el.classList.add('notify-copied');
			window.setTimeout(() => this.$el.classList.remove('notify-copied'), 1500);
		},

		emitDeleteSticker(e){
			e.stopPropagation();
			this.$emit('deleteSticker');
		}

	}
}
</script>

<template>
<div class="sticker" :data-clipboard-text="displayName" @click="notifyCopied">
	<i class="material-icons delete-sticker" v-if="isCreatedByUser || userIsGuildManager" @click="emitDeleteSticker($event)">clear</i>	
	<img :src="link" :alt="name">	
	<p>{{displayName}}</p>
</div>
</template>

<style lang="sass">

	$discord-gray: #36393E
	$brand-blue: #60b0b9
	$brand-red: #fc6262
	$sticker-margin: 15px

	.sticker
		font-size: 18px
		background-color: $discord-gray
		border-radius: 5px
		overflow: hidden
		width: calc(25% - #{$sticker-margin})
		height: 280px
		margin-right: $sticker-margin
		margin-bottom: $sticker-margin
		display: inline-flex
		flex-direction: column
		justify-content: center
		align-items: center
		position: relative
		cursor: pointer
		vertical-align: top
		&:hover .delete-sticker
			color: rgba(255,255,255,0.3)
		&.notify-copied p:after
			opacity: 1

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
			-webkit-user-drag: none
			-khtml-user-drag: none
			-moz-user-drag: none
			-o-user-drag: none
			user-drag: none
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
			&:after
				content: 'Copied to clipboard!'
				display: flex
				transition: .2s
				opacity: 0
				pointer-events: none
				text-transform: none
				justify-content: center
				align-items: center
				background-color: $brand-red
				position: absolute
				width: 100%
				height: 100%
				top: 0
				left: 0

	@media screen and (max-width: 915px)
		.sticker
			width: calc(50% - #{$sticker-margin})

	@media screen and (max-width: 500px)
		.sticker
			height: 200px
			img
				max-height: 140px
				max-width: 130px
			p
				font-size: 14px

</style>