import 'tailwindcss/tailwind.css';
import { SessionProvider } from 'next-auth/react';
import Player from '@/components/player';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
	const [isStarted, setIsStarted] = useState(false);
	const router = useRouter();
	const path = ['/', '/playlists', '/playlists/[playlistId]', '/albums', '/albums/[albumId]', '/tracks', '/artists', '/artists/[artistId]', '/admin/whitelist', '/admin/logs'];

	return (
		<SessionProvider session={session}>
			{path.includes(router.pathname) && <Player isStarted={isStarted} setIsStarted={setIsStarted} />}
			<Component {...pageProps} isStarted={isStarted} setIsStarted={setIsStarted} />
		</SessionProvider>
	);
}
