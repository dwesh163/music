'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Loader2, Search } from 'lucide-react';
import type { AllSearch } from '@/types/search';
import { SearchAll } from '@/components/search/search-all';
import { Input } from '@/components/ui/input';
import { searchAll } from '@/lib/jiosaavn-api';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Typing context types
type TypingContextType = [boolean, React.Dispatch<React.SetStateAction<boolean>>];

const TypingContext = createContext<TypingContextType | undefined>(undefined);

const TypingProvider = ({ children }: { children: ReactNode }) => {
	const [isTyping, setIsTyping] = useState(false);
	return <TypingContext.Provider value={[isTyping, setIsTyping]}>{children}</TypingContext.Provider>;
};

const useIsTyping = (): TypingContextType => {
	const context = useContext(TypingContext);
	if (!context) {
		throw new Error('useIsTyping must be used within a TypingProvider');
	}
	return context;
};

type MobileSearchProps = {
	topSearch: React.JSX.Element;
};

const MobileSearch: React.FC<MobileSearchProps> = ({ topSearch }) => {
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [searchResult, setSearchResult] = useState<AllSearch | null>(null);

	const debouncedQuery = useDebounce(query.trim(), 1000);
	const [_, setIsTyping] = useIsTyping();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const searchQuery = urlParams.get('search');
		if (searchQuery) {
			setQuery(searchQuery);
		}
	}, []);

	useEffect(() => {
		(async () => {
			if (!debouncedQuery) return setSearchResult(null);
			setIsLoading(true);
			const data = await searchAll(debouncedQuery);
			setIsLoading(false);
			setSearchResult(data);
		})();
	}, [debouncedQuery]);

	useEffect(() => {
		if (debouncedQuery.length) {
			setIsTyping(true);
			const url = new URL(window.location.href);
			url.searchParams.set('search', debouncedQuery);
			window.history.pushState({}, '', url.toString());
		} else {
			setIsTyping(false);
			const url = new URL(window.location.href);
			url.searchParams.delete('search');
			window.history.pushState({}, '', url.toString());
		}
	}, [debouncedQuery, setIsTyping]);

	return (
		<div className="lg:pt-0 pt-20">
			<div className="relative mx-auto sm:max-w-md w-11/12 mt-5">
				<Search className="absolute left-2 top-3 size-4 text-muted-foreground" />
				<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-8" />
			</div>

			{!debouncedQuery.length && topSearch}

			{isLoading && (
				<div className="text-center text-xs text-muted-foreground mt-5">
					<Loader2 className="mr-2 inline-block animate-spin" /> Loading Results
				</div>
			)}

			{searchResult && <SearchAll query={query} data={searchResult} />}
		</div>
	);
};

export default function App({ topSearch }: MobileSearchProps) {
	return (
		<TypingProvider>
			<MobileSearch topSearch={topSearch} />
		</TypingProvider>
	);
}
