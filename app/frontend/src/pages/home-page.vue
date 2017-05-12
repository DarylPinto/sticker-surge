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
	<h1>Stickers for Discord</h1>	

</main>
</template>
