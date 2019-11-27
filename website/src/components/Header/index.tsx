import React, { memo } from "react";
import s from "./index.module.scss";
import Navigation from "components/Navigation";

const Header = () => (
	<header className={s.mainHeader}>
		<img src="/images/logo.svg" alt="Stickers for Discord" />
		<Navigation />
	</header>
);

export default memo(Header);
