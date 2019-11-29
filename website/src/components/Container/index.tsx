import React from 'react';
import s from "./index.module.scss";

interface Props {
	children: any
}

const Container = ({ children }: Props) => {
	return (
		<div className={s.container}>
			{children}
		</div>
	);
};

export default Container;
