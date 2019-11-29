import React, { useState } from "react";
import s from "./index.module.scss";
import c from "classnames";

const SearchBar = () => {
	const [text, setText] = useState("");

	return (
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
	);
};

export default SearchBar;
