import React, { useState } from "react";
import s from "./index.module.scss";
import Head from "next/head";
import c from "classnames";

const SearchBar = () => {
	const [text, setText] = useState("");

	return (
		<>
			<Head>
				<link
					href="https://fonts.googleapis.com/icon?family=Material+Icons"
					rel="stylesheet"
				/>
			</Head>
			<div className={s.searchBar}>
				<i className={c("material-icons", s.icon)}>search</i>
				<input
					type="text"
					placeholder="Search for a Sticker Pack"
					onChange={e => setText(e.target.value)}
					value={text}
					autoFocus
				/>
			</div>
		</>
	);
};

export default SearchBar;
