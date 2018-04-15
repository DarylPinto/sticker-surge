<script>
import Vue from 'vue';

module.exports = {
	props: ['type', 'name', 'groupId', 'initiallySelected'],
	data: function(){
		return {
			selected: false
		}
	},
	methods: {
		handleClick: function(){
			this.selected = !this.selected;		
			this.$emit('selectionChange', {
				type: this.type,
				id: this.groupId,
				subscribed: this.selected
			});
		}
	},
	created: function(){
		this.selected = this.initiallySelected;
	}
}
</script>

<template>
<li :class="{selected: selected}" @click="handleClick">
	{{name}}
	<i v-show="selected" class="material-icons">done</i>
</li>
</template>

<style lang="sass">

	.pack-dropdown ul li.selected
		background-color: #415a88
		&:nth-child(2n)
			background-color: rgba(65, 90, 136, 0.8)
		i
			float: right
			position: relative
			top: -5px

</style>