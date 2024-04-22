import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en" style={{ backgroundColor: '#171719', overflow: 'hidden' }}>
			<Head>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
				<meta name="apple-mobile-web-app-title" content="Musics" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
