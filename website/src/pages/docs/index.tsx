import React from "react";
import Head from "next/head";
import s from "./index.module.scss";
import TitleBar from "components/TitleBar";
import MarkdownArticle from "components/MarkdownArticle";
import { BOT_INVITE_URL } from "data/constants";

// Load page content from markdown file 
const article = require("data/documentation.md");
// replace placeholders
const markdown = article.default.replace(/%%BOT_INVITE_URL%%/g, BOT_INVITE_URL);

const StickerPacksPage = () => {	
	return (
		<main>
			<Head>
				<title key="title">Documentation - Stickers for Discord</title>
				<meta
					key="description"
					name="description"
					content="Whether you're setting up stickers for the first time or simply looking for bot commands, the docs are the place to be!"
				/>
			</Head>
			<TitleBar title="Documentation" />
			<section className={s.container}>
				<MarkdownArticle markdownText={markdown} />
			</section>
		</main>
	);
};

export default StickerPacksPage;
