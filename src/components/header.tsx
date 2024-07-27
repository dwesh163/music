import React from 'react';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import Link from 'next/link';
import { Disc3 } from 'lucide-react';
import { UserDropdown } from './user-dropdown';

export function Header() {
	const { data: session, status } = useSession();

	return (
		<header className="w-full flex justify-between p-5 border-b lg:relative fixed bg-background z-50">
			<div className="flex justify-start items-center">
				<Link href="/" className="flex gap-0.5 justify-center items-center">
					<Disc3 />
					<h1 className="text-2xl font-black">Tonalys</h1>
				</Link>
			</div>
			{status === 'unauthenticated' ? (
				<Button asChild>
					<Link href="/auth/signin">Login</Link>
				</Button>
			) : (
				<UserDropdown />
			)}
		</header>
	);
}
