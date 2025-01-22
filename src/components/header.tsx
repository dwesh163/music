'use client';

import { Search } from 'lucide-react';
import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';

export default function TopBar({ user }: { user: User }) {
	const [search, setSearch] = useState('');
	const router = useRouter();

	useEffect(() => {
		const query = new URLSearchParams();
		if (search) {
			query.set('s', search);
			router.replace(`/s?${query.toString()}`);
		}
	}, [search, router]);

	return (
		<div className="flex items-center justify-between gap-4 mb-8">
			<div className="relative flex-1 w-full max-w-xl">
				<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
				<Input placeholder="Search by artists, songs or albums" className="pl-9 h-10 w-full focus-visible:ring-2 bg-gray-800/50 rounded-full text-gray-300" value={search} onChange={(e) => setSearch(e.target.value)} />
			</div>
			<div className="flex items-center gap-4">
				<Avatar className="border shadow-sm w-8 h-8 lg:w-10 lg:h-10">
					<AvatarImage src={user.image} alt={user.name} />
					<AvatarFallback>
						{user.name
							?.split(' ')
							.map((word) => word.charAt(0).toUpperCase())
							.join('')}
					</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
}
