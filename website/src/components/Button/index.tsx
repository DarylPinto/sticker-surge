import React from "react";
import Link from "next/link";
import s from "./index.module.scss";
import c from "classnames";

type ButtonTypes = "primary" | "standard";
type ButtonSizes = "large" | "standard";
type CallbackFunction = () => void;

const buttonClass = (type, size) =>
	c(s.button, {
		[s.primary]: type === "primary",
		[s.large]: size === "large"
	});

/**
 * Action button (executes a function when clicked)
 */
interface ButtonProps {
	type: ButtonTypes;
	size: ButtonSizes;
	action?: CallbackFunction;
	children: any;
}

const Button = ({ type, size, action, children }: ButtonProps) => {
	return (
		<button className={buttonClass(type, size)} onClick={action}>
			{children}
		</button>
	);
};

/**
 * Link Button (goes to a link when clicked)
 */
interface LinkButtonProps {
	type: ButtonTypes;
	size: ButtonSizes;
	link?: string;
	isExternal: boolean;
	children: any;
}

export const LinkButton = ({
	type,
	size,
	link,
	isExternal,
	children
}: LinkButtonProps) => {
	if (isExternal) {
		return (
			<a
				className={buttonClass(type, size)}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		);
	} else {
		return (
			<Link href={link}>
				<a className={buttonClass(type, size)}>{children}</a>
			</Link>
		);
	}
};

export default Button;
