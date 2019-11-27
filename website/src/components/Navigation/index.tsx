import React, { memo } from "react";
import Link from "next/link";

const links = [
	{
		text: "Sticker Packs",
		href: "/sticker-packs",
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
	<nav>
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
				<Link key={link.href} href={link.href}>
					<a>{link.text}</a>
				</Link>
			)
		)}
	</nav>
);

export default memo(Navigation);
