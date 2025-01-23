'use server';

import { ArtistComponents } from '@/components/artist';
import { Error } from '@/components/error';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default async function ArtistwPage({ params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params)?.id;

		const data = await api.artists.get(id);
		const topTracks = await api.artists.topTracks(id, 'FR');
		const albums = await api.artists.albums(id, undefined, undefined, 5);

		if (!data) {
			return <Error text="Artist not found" subText="The artist you are looking for does not exist" Icon={AlertCircle} color="text-yellow-500" />;
		}

		return <ArtistComponents artist={{ data, topTracks, albums }} />;
	} catch (error) {
		console.error('Search page error:', error);
		return <Error text="Something went wrong" subText="We couldn't complete your search. Please try again later" Icon={AlertCircle} color="text-red-500" />;
	}
}
