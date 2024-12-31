import type { Metadata } from 'next';
import type { Session } from 'next-auth';
import '@/styles/globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import React from 'react';

export const metadata: Metadata = {
	title: 'Kooked Music',
	description: 'A music platform for everyone',
};

type RootLayoutProps = any;

export default function RootLayout(props: RootLayoutProps) {
	const { children, session } = props;
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body>
				<SessionProvider session={session}>{children}</SessionProvider>
			</body>
		</html>
	);
}
