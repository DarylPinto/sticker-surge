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
				<title>Sticker Packs - Stickers for Discord</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<TitleBar title="Sticker Packs" />

			<Container>
				<SearchBar />
			</Container>
		</main>
	);
};

export default StickerPacksPage;
