'use client';
import React, { useState } from 'react';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Righteous } from 'next/font/google';
import Link from 'next/link';

const righteous = Righteous({
	subsets: ['latin'],
	weight: '400',
});

export default function Navbar({ session }: { session: Session | null }) {
	return (
		<header className="w-full flex justify-between p-6 px-10">
			<Link href="/" className="flex gap-2 justify-center items-center lg:hidden">
				<h1 className={'text-3xl text-[hsl(var(--color))] ' + righteous.className}>MUSICS</h1>
			</Link>
			<div className="items-center gap-4 hidden lg:flex">
				<div className="relative flex-1 md:grow-0">
					<Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
					<Input type="search" placeholder="Search..." className="w-full rounded-lg bg-card pl-8 md:w-[calc(100vw/3)] border-0 focus-visible:ring-1 text-[hsl(var(--color))]" />
				</div>
			</div>

			<div className="relative flex items-center justify-center">
				<Avatar className="border-none shadow-none w-8 h-8 lg:w-11 lg:h-11">
					<AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? 'Guest User'} className="rounded-full" />
					<AvatarFallback>
						{session?.user?.name
							?.split(' ')
							.map((word) => word.charAt(0).toUpperCase())
							.join('')}
					</AvatarFallback>
				</Avatar>
			</div>
		</header>
	);
}
