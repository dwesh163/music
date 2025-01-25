'use server';
import { Error } from '@/components/error';
import { Header } from '@/components/header';
import { SearchResults } from '@/components/search';
import { api } from '@/lib/api';
import { AlertCircle, SearchIcon } from 'lucide-react';

export default async function SearchPage({ params, searchParams }: { params: any; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
	try {
		const search = (await searchParams)?.s;

		if (!search || typeof search !== 'string') {
			return <Error text="What are you looking for?" subText="Enter an artist, track or an album to start searching" Icon={SearchIcon} color="text-gray-400" />;
		}

		const results = await api.search(search, ['track', 'artist', 'album']);

		if (!results || (results.tracks.items.length === 0 && results.artists.items.length === 0 && results.albums.items.length === 0)) {
			return <Error text="No results found" subText="Try a different search term or check your spelling" Icon={AlertCircle} color="text-yellow-500" />;
		}

		return (
			<div className="w-full h-full sm:px-6 px-3">
				<Header />
				<h2 className="sm:text-2xl text-xl sm:font-bold font-semibold sm:mb-4 mb-2">Search Results for "{search.trim()}"</h2>
				<SearchResults results={results} />
			</div>
		);
	} catch (error) {
		console.error('Search page error:', error);
		return <Error text="Something went wrong" subText="We couldn't complete your search. Please try again later" Icon={AlertCircle} color="text-red-500" />;
	}
}
