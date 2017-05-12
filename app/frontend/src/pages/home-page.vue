<script>
import Vue from 'vue';
import header from '../components/header.vue';

Vue.component('header-bar', header);

module.exports = {

	data: function(){
		return {
		}
	}

}

</script>

<template>
<main>

	<header-bar></header-bar>
	<div class="container">
		<h1>Home</h1>	
	</div>
	
</main>
</template>

<style lang="sass">

</style>