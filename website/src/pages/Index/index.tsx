import React from "react";
import Head from "next/head";
import s from "./index.module.scss";
import { LinkButton } from "../../components/Button";
import { INVITE_URL } from "../../data/constants";

const taglines = [
	"Make your server more expressive",
	"Spice up your server",
	"Meme it up in your server",
	"Liven up the mood in your server",
	"Keep your server interesting",
	"Add some fun to your server",
	"Express yourself in your server",
	"Try something new in your server",
	"Bring a bit of humor to your server",
	"Trash talk your buddies in new ways",
	"Turn your server up a notch"
];

const HomePage = () => {
	// const tagline = taglines[Math.floor(Math.random() * taglines.length)];
	const tagline = taglines[0];

	return (
		<main className={s.page}>
			<Head>
				<title>Stickers for Discord</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={s.headline}>
				<span>{tagline} with</span>
				<h1>Stickers for Discord</h1>
			</div>

			<div className={s.buttonGroup}>
				<LinkButton
					type="primary"
					size="large"
					link={INVITE_URL}
					isExternal={true}
				>
					Add to Discord
				</LinkButton>
				{"  "}
				<LinkButton
					type="standard"
					size="large"
					link="/docs"
					isExternal={false}
				>
					Learn More
				</LinkButton>
			</div>
		</main>
	);
};

export default HomePage;
