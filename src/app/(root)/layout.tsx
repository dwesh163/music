import { ReactNode } from 'react';
import React from 'react';
import { getServerSession } from 'next-auth';
import Sidebar from '@/components/sidebar';
import Navbar from '@/components/navbar';

export default async function RootLayout({ children }: { children: ReactNode }) {
	const session = await getServerSession();

	return (
		<div className="relative flex h-screen bg-background">
			{/* Image de fond */}
			{/* <div className="absolute inset-0 z-100 bg-cover bg-no-repeat bg-top h-full" style={{ backgroundImage: "url('Screenshot from 2024-09-29 20-34-36.png')" }}></div> */}

			<Sidebar session={session} />
			<main className="relative z-10 w-full">
				<Navbar session={session} />
				{children}
			</main>
		</div>
	);
}
