import React, { memo } from "react";
import s from "./index.module.scss";
import ActiveLink from "components/ActiveLink";

const links = [
	{
		text: "Sticker Packs",
		href: "/packs",
		isExternal: false
	},
	{
		text: "Documentation",
		href: "/docs",
		isExternal: false
	},
	{
		text: "Community",
		href: "https://discord.gg/HNFmKsE",
		isExternal: true
	}
];

const Navigation = () => (
	<nav className={s.mainNavigation}>
		{links.map(link =>
			link.isExternal ? (
				<a
					key={link.href}
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
				>
					{link.text}
				</a>
			) : (
				<ActiveLink key={link.href} href={link.href}>
					<a>{link.text}</a>
				</ActiveLink>
			)
		)}
	</nav>
);

export default memo(Navigation);
