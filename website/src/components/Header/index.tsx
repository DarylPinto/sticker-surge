import React from "react";
import s from "./index.module.scss";
import Link from "next/link";
import Navigation from "../Navigation";

const Header = () => (
	<header className={s.mainHeader}>
		<div className={s.container}>
			<Link href="/">
				<a>
					<img src="/images/logo.svg" alt="Stickers for Discord" />
				</a>
			</Link>
			<Navigation />
		</div>
	</header>
);

export default Header;
