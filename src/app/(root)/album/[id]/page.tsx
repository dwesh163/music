'use server';

import { AlbumComponents } from '@/components/album';
import { Error } from '@/components/error';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params)?.id;

		const data = await api.albums.get(id);
		const tracks = await api.albums.tracks(id);

		if (!data) {
			return <Error text="Album not found" subText="The album you are looking for does not exist" Icon={AlertCircle} color="text-yellow-500" />;
		}

		return <AlbumComponents album={{ data, tracks }} />;
	} catch (error) {
		console.error('Search page error:', error);
		return <Error text="Something went wrong" subText="We couldn't complete your search. Please try again later" Icon={AlertCircle} color="text-red-500" />;
	}
}
