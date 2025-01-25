import { SongModel } from '@/models/Song';
import { ErrorType } from '@/types/error';
import { v4 as uuidv4 } from 'uuid';

export async function getClientId(): Promise<string | null> {
	try {
		const sessioinId = uuidv4();

		const ws = new WebSocket(`ws://${process.env.API_HOST}/api/ws?client_id=${sessioinId}`);

		await new Promise((resolve) => (ws.onopen = resolve));

		return sessioinId;
	} catch (error) {
		console.error('Client ID fetch error:', error);
		return null;
	}
}

export async function downloadTrack(trackId: string): Promise<ErrorType> {
	try {
		const clientId = await getClientId();
		if (!clientId) throw new Error('No valid client ID');

		const response = await fetch(`http://${process.env.API_HOST}/api/download/url?url=https:%2F%2Fopen.spotify.com%2Ftrack%2F${trackId}&client_id=${clientId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				url: `https://open.spotify.com/track/${trackId}`,
				client_id: clientId,
			}),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.detail);
		await SongModel.create({ id: trackId, path: data });

		return { message: 'Track downloaded successfully', status: 200 };
	} catch (error) {
		console.error('Track download failed:', error);
		return { message: 'Internal server error', status: 500 };
	}
}

export async function getTrackFile(trackId: string): Promise<Blob | null> {
	const clientId = await getClientId();
	if (!clientId) throw new Error('No valid client ID');

	const song = await SongModel.findOne({ id: trackId });
	if (!song) return null;

	const response = await fetch(`http://${process.env.API_HOST}/api/download/file?file=${encodeURIComponent(song.path)}&client_id=${clientId}`);

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.detail || 'File download failed');
	}

	return await response.blob();
}
