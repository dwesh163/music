'use client';
import { Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';

function useDebouncedSearch(search: string, router: any) {
	useEffect(() => {
		if (!search) return;

		const debounceTimer = setTimeout(() => {
			const query = new URLSearchParams();
			query.set('s', search);

			router.push(`/search?${query.toString()}`);
		}, 500);

		return () => clearTimeout(debounceTimer);
	}, [search, router]);
}

function useSyncSearchWithUrl(setSearch: (value: string) => void) {
	useEffect(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.has('s')) {
			setSearch(url.searchParams.get('s') ?? '');
		}
	}, [setSearch]);
}

export function Header() {
	const [search, setSearch] = useState('');
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (pathname !== '/search') {
			setSearch('');
		}
	}, [pathname]);

	useDebouncedSearch(search, router);
	useSyncSearchWithUrl(setSearch);

	return (
		<div className="flex items-center justify-between gap-4 py-6">
			<div className="relative flex-1 w-full max-w-xl">
				<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
				<Input placeholder="Search by artists, songs or albums" className="pl-9 h-10 w-full focus-visible:ring-2 bg-gray-800/50 rounded-full text-gray-300" value={search} onChange={(e) => setSearch(e.target.value)} />
			</div>
		</div>
	);
}
