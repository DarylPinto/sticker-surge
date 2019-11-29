import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
	href: string,
	children: any
}

const ActiveLink = ({ href, children }: Props) => {
	const router = useRouter();

	const dataActive = router.pathname === href ? {"data-active": true} : {};
	return <Link href={href}>{React.cloneElement(children, dataActive)}</Link>;
};

export default ActiveLink;
