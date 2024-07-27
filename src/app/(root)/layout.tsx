'use client';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import React from 'react';

import { Player } from '@/components/player';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile/navbar';
import { Header } from '@/components/header';

export default function RootLayout({ children, session }: { children: ReactNode; session?: Session }) {
	return (
		<SessionProvider session={session}>
			<Header />
			<Sidebar />

			<MobileNav />

			<main className="lg:ml-[20%] xl:ml-[15%]">{children}</main>
			{/* <Player /> */}
		</SessionProvider>
	);
}
