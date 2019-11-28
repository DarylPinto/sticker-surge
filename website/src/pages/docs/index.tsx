import React from "react";
import Head from "next/head";
import s from "./index.module.scss";
import TitleBar from "../../components/TitleBar";
import MarkdownArticle from "../../components/MarkdownArticle";

const article = require("../../data/documentation.md");

const StickerPacksPage = () => {	
	return (
		<main>
			<Head>
				<title>Documentation - Stickers for Discord</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<TitleBar title="Documentation" />
			<section className={s.container}>
				<MarkdownArticle markdownText={article.default} />
			</section>
		</main>
	);
};

export default StickerPacksPage;
