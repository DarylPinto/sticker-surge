import React from "react";
import Head from "next/head";
import s from "./index.module.scss";
import TitleBar from "components/TitleBar";
import Container from "components/Container";
import SearchBar from "components/SearchBar";

const StickerPacksPage = () => {
	return (
		<main>
			<Head>
				<title key="title">Sticker Packs - Stickers for Discord</title>
				<meta
					key="description"
					name="description"
					content="Check out the wide variety of stickers collected by the Discord community. Dive in and start using your favorites today!"
				/>
			</Head>

			<TitleBar title="Sticker Packs" />

			<Container>
				<SearchBar />
			</Container>
		</main>
	);
};

export default StickerPacksPage;
