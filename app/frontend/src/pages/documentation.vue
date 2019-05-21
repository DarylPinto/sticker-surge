<script>
import Vue from 'vue';
import header from '../components/header.vue';
import footer from '../components/footer.vue';

Vue.component('header-bar', header);
Vue.component('footer-bar', footer);

module.exports = {
	data: function(){
		return {
			userId: this.$cookie.get('id') || null,
			pageLoaded: false
		}
	},
	mounted: function(){
		document.title = 'Documentation - Stickers for Discord';
		this.pageLoaded = true;
	}
}

</script>

<template>
<main class="documentation-page">

	<header-bar :userId="userId"></header-bar>	

	<div :class="{transparent: !pageLoaded}">

		<header class="documentation-header">
			<h1>Documentation</h1>	
		</header>

		<div class="container">
			<section id="tutorial">
				<h2>Getting Started</h2>
				<p>Inspired by other chat applications such as Telegram and LINE, Stickers for Discord aims to fill the sticker shaped void that us Discord users have in our hearts.</p>
				<p>Getting your server set up is a piece of cake and only takes a minute:</p>
				<ol>
					<li>Add the bot to your server: <a href="https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=536879104" class="btn" target="_blank">Add to Discord</a></li>
					<li>Check out the <router-link to="/sticker-packs">available sticker packs</router-link> and start using the ones you like. (Click on a pack, then click "Use This Pack")</li>
					<li>In your server, start sending stickers by typing in their names! (Example: <pre>:pika-rofl:</pre>)</li>
				</ol>
			</section>
			<section id="commands">
				<h2>Bot Commands</h2>
				<table>
					<tbody>
						<tr>
							<td>$stickers</td>
							<td>View the stickers your server can use.</td>
						</tr>
						<tr>
							<td>$addPack [PACK&nbsp;PREFIX]</td>
							<td>Add a sticker pack for anyone on your server to use.</td>
						</tr>
						<tr>
							<td>$removePack [PACK&nbsp;PREFIX]</td>
							<td>Remove a sticker pack from your server.</td>
						</tr>
						<tr>
							<td>$createSticker [STICKER&nbsp;NAME] [IMAGE&nbsp;URL]</td>
							<td>Create a custom sticker for your server to use.</td>
						</tr>
						<tr>
							<td>$deleteSticker [STICKER&nbsp;NAME]</td>
							<td>Delete a custom sticker from your server.</td>
						</tr>
						<tr>
							<td>$whitelist [ROLE&nbsp;NAME]</td>
							<td>Set the role required to use stickers on your server.</td>
						</tr>
						<tr>
							<td>$blacklist [ROLE&nbsp;NAME]</td>
							<td>Set a role to be blocked from using stickers on your server.</td>
						</tr>
						<tr>
							<td>$setPrefix [NEW&nbsp;PREFIX]</td>
							<td>Set the prefix used to invoke bot commands on your server.</td>
						</tr>
						<tr>
							<td>$setManagerRole [ROLE&nbsp;NAME]</td>
							<td>Set the role required to create stickers and manage sticker packs on your server.</td>
						</tr>
						<tr>
							<td>$commands</td>
							<td>List commands.</td>
						</tr>
						<tr>
							<td>$help</td>
							<td>Get help and general info.</td>
						</tr>
					</tbody>
				</table>	
			</section>
			<section id="faq">
				<h2>Frequently Asked Questions</h2>
				<div>
					<strong>I just got the bot, what do I do now?</strong>
					<p>Start off by either <router-link to="/sticker-packs">adding a sticker pack to your server,</router-link> or by creating your own stickers (read below).
					Bot commands are listed above.</p>
				</div>
				<div>
					<strong>How do I use stickers?</strong>
					<p>Simply type the sticker names as they appear (Example: <pre>:pika-rofl:</pre>)
					Note: You can't include other text with your message when using a sticker. Just type the sticker name and hit enter.</p>
				</div>
				<div>
					<strong>How do I view the stickers we have on our server?</strong>
					<p>Use the command <pre>$stickers</pre></p>
				</div>
				<div>
					<strong>How do I make stickers?</strong>
					<p>There are 3 types of stickers that you can make:</p>
				
					<ol>
						<li>Server stickers<br />
						These stickers will be usable by anyone in your Discord server. You can create them by using the <pre>$createSticker</pre> command.
						You can also create server stickers by logging in to the website, clicking on "Your Servers", selecting your server, and then clicking "Create a Sticker"</li>

						<li>Personal Stickers<br />
						These stickers will only be usable by you, but you can use them on any server where the bot is present. You can create them by Direct Messaging the bot with the command <pre>$createSticker</pre><br />
						You can also create personal stickers by logging in to the website, clicking on "Personal Stickers", and clicking "Create a Sticker"</li>

						<li>Sticker Packs<br />
						These stickers will be publicly available for anyone to use. Don't create sticker packs if the stickers are in-jokes between you and your friends that no one else will understand (use server stickers for that). Sticker packs are for general-purpose stickers. Make them if you think many people will enjoy using them.
						You can create sticker packs by logging in to the website, clicking on "Sticker Packs", and then clicking "Create a Sticker Pack".</li>
					</ol>
				</div>
				<div>
					<strong>How many stickers can I have?</strong>
					<p>Each server can have up to 400 custom stickers, and each user can have up to 200. You can add as many sticker packs to your server as you'd like.</p>
				</div>
				<div>	
					<strong>I changed the command prefix for the bot and can't remember what it is! What do I do?</strong>
					<p>Type: <pre><span class="mention">@Stickers for Discord</span> help</pre></p>
				</div>
				<div>
					<strong>What are the maximum dimensions for stickers?</strong>
					<p>250x250</p>
				</div>
				<div>
					<strong>Can I make animated stickers?</strong>
					<p>No.</p>
				</div>
				<div>
					<strong>I have Discord Nitro. Some of my custom emojis have names that match the stickers in my server. How do I use stickers with conflicting names?</strong>
					<p>You can use semicolons instead of colons to send stickers.</p>
				</div>
			</section>	
		</div>

	</div>

	<footer-bar></footer-bar>

</main>
</template>

<style lang="sass">

	.documentation-page
		> div
			transition: .2s
			> .container
				max-width: 950px
		header.documentation-header
			background-color: rgba(0,0,0,0.3)
			padding-top: 65px
			padding-bottom: 65px
			margin-bottom: 35px
			display: flex
			flex-direction: column
			justify-content: center
			align-items: center	
			font-size: 50px
		section
			margin-bottom: 80px
		h2
			font-size: 30px
			font-weight: 100
			border-bottom: 1px solid rgba(255, 255, 255, 0.15)
			padding-bottom: 10px
			margin-bottom: 18px
		p
			font-size: 18px
			font-weight: 100
			line-height: 1.4em
			margin-bottom: 20px
			&:last-of-type
				margin-bottom: 0
		ul, ol
			margin-top: 30px
			li
				font-weight: 100
				font-size: 18px
				margin-bottom: 20px
				margin-left: 20px
				line-height: 1.4em
				code
					font-family: monospace
					background-color: rgba(0, 0, 0, 0.2)
					padding: 2px
					border-radius: 3px
					font-size: 16px
				.btn
					margin-left: 5px
					text-shadow: 1px 1px rgba(0, 0, 0, 0.50)
					letter-spacing: -0.25px

		pre
			font-family: "Helvetica", "Arial", sans-serif
			font-size: 16px
			border: 1px solid rgba(0, 0, 0, 0.4)
			border-radius: 4px
			background-color: rgba(0, 0, 0, 0.2)
			padding: 7px 10px
			display: inline-block
			margin-right: 4px
			line-height: 1em
			.mention
				font-family: inherit

		#commands
			table
				width: 100%
				border-radius: 5px
				overflow: hidden
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.3)
				tr:nth-child(2n)
					background-color: rgba(255, 255, 255, 0.15)
				tr:nth-child(2n - 1)
					background-color: rgba(255, 255, 255, 0.05)
				td
					padding: 20px
					vertical-align: middle
					font-size: 15px
					&:first-child	
						width: 46%
						font-family: monospace
					&:nth-child(2)
						line-height: 1.4em
						font-size: 16px

		#faq
			h2
				margin-bottom: 30px
			div	
				margin-bottom: 45px
			strong
				line-height: 1.2em
				font-size: 20px
				margin-bottom: 3px
				display: block
				font-weight: 500
			li
				line-height: 1.4em

	@media screen and (max-width: 860px)
		.documentation-page
			h2
				font-size: 26px
			p, ol li, a.btn, pre
				font-size: 16px
			p, ol li
				line-height: 1.6em
			a.btn
				padding: 4px 10px
			pre
				padding: 4px 2px
			#commands
				table td
					padding: 10px
					font-size: 14px
					&:nth-child(2n)
						font-size: 12px
			#faq
				margin-bottom: -40px
				strong
					font-size: 17px
					line-height: 1.6em

</style>