<script>
module.exports = {
	props: ['defaultImage', 'canEdit'],
	data: function(){
		return {
			uploadedImage: "" 
		}
	},
	computed: {
		icon: function(){
			return (this.uploadedImage.length === 0) ? this.defaultImage : this.uploadedImage;
		}
	},
	methods: {
		handleChange: function(e){
			let file = e.target.files[0];
			if(!file){
				this.uploadedImage = "";
				return false;
			}else if(file.size > 5 * 1024 * 1024){
				return alert("File size is too large (5MB Max).");
			}
			
			let reader = new FileReader();
			let formData = new FormData();

			//Display image
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.uploadedImage = reader.result;
				reader = null; //de-reference
			});

			//Emit event with form data containing image file
			formData.set('icon', file, 'icon.png');
			this.$emit('iconUpdated', formData);
		}
	}
}
</script>

<template>
<div class="group-icon" :class="{'icon-shown': icon}" :style="'background-image: url('+icon+')'">
	<input type="file" v-if="canEdit" name="icon" @change="handleChange" accept="image/png, image/jpeg, image/webp" required>
	<span v-if="!icon && canEdit">Choose&nbsp;an<br>Icon</span>
	<span v-if="icon && canEdit">Change<br>Icon</span>	
</div>
</template>

<style lang="sass">

	.group-icon
		display: inline-flex
		justify-content: center
		align-items: center
		height: 100px
		width: 100px
		border-radius: 100%
		background-color: #1f1f1f
		border: 5px solid gray 
		//cursor: pointer
		margin-bottom: 18px
		overflow: hidden
		background-size: cover
		background-position: center center
		background-repeat: no-repeat
		&.icon-shown
			border-color: #484848
			span
				opacity: 0
			&:hover span
				opacity: 1
		input[type="file"]
			position: absolute
			height: 100px
			width: 100px
			padding: 0
			margin: 0
			border-radius: 100%
			opacity: 0
			cursor: pointer
		span
			display: flex
			justify-content: center
			align-items: center
			padding-top: 5px
			font-size: 12px
			text-transform: uppercase
			color: gray 
			text-align: center
			line-height: 1.2em
			background-color: rgba(0, 0, 0, 0.5);
			height: 100px
			width: 100px
			border-radius: 100%
		&:hover span
			color: white

</style>
