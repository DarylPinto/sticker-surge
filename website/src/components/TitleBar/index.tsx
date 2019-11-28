import React, { memo } from "react";
import s from "./index.module.scss";

interface Props {
	title: string;
	description?: string;
}

const TitleBar = ({ title, description }: Props) => {
	return (
		<div className={s.titleBar}>
			<h1>{title}</h1>
			{description && <p>{description}</p>}
		</div>
	);
};

export default memo(TitleBar);
