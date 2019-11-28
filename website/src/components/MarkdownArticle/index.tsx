import React from "react";
import marked from "marked";
import s from "./index.module.scss";

interface Props {
	markdownText: string;
}

const MarkdownArticle = ({ markdownText }: Props) => {
	return (
		<article
			className={s.markdown}
			dangerouslySetInnerHTML={{ __html: marked(markdownText) }}
		/>
	);
};

export default MarkdownArticle;
