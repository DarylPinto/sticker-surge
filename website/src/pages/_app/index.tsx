import React from "react";
import "./index.scss";
import App from "next/app";
import Head from "next/head";
import Header from "components/Header";
import { PageTransition } from "next-page-transitions";

class MainApp extends App {
	// Only uncomment this method if you have blocking data requirements for
	// every single page in your application. This disables the ability to
	// perform automatic static optimization, causing every page in your app to
	// be server-side rendered.

	// static async getInitialProps(appContext) {
	// 	// calls page's `getInitialProps` and fills `appProps.pageProps`
	// 	const appProps = await App.getInitialProps(appContext);

	// 	return { ...appProps };
	// }

	render() {
		const { Component, pageProps } = this.props;
		return (
			<>
				<Head>
					<link
						href="https://fonts.googleapis.com/icon?family=Material+Icons"
						rel="stylesheet"
					/>
				</Head>

				<Header />
				
				<PageTransition timeout={100} classNames="page-transition">
					<Component {...pageProps} />
				</PageTransition>
			</>
		);
	}
}

export default MainApp;
