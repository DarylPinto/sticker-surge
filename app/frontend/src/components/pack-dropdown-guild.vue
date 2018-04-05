<script>
import Vue from 'vue';

module.exports = {
	props: ['type', 'name', 'groupId'],
	data: function(){
		return {
			active: false
		}
	},
	methods: {
	},
	mounted: function(){

	}
}
</script>

<template>
<li :class="{active: active}" @click="active = !active">
	{{name}}
	<i v-show="active" class="material-icons">done</i>
</li>
</template>

<style lang="sass">

	.pack-dropdown ul li.active
		background-color: #415a88
		&:nth-child(2n)
			background-color: rgba(65, 90, 136, 0.8)
		i
			float: right
			position: relative
			top: -5px

</style>