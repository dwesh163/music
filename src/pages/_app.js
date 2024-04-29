import 'tailwindcss/tailwind.css';
import { SessionProvider } from 'next-auth/react';
import Player from '@/components/player';
import { useState } from 'react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
	const [isStarted, setIsStarted] = useState(false);

	return (
		<SessionProvider session={session}>
			<Player isStarted={isStarted} setIsStarted={setIsStarted} />
			<Component {...pageProps} isStarted={isStarted} setIsStarted={setIsStarted} />
		</SessionProvider>
	);
}
