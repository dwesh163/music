import { SongModel } from '@/models/Song';
import { ErrorType } from '@/types/error';
import { v4 as uuidv4 } from 'uuid';
import { api } from './api';
import { logSongDownload, logSongListen } from './log';
import { ArtistModel } from '@/models/Artist';
import { AlbumModel } from '@/models/Album';

const API_HOST = process.env.API_HOST;
const WS_ENDPOINT = `ws://${API_HOST}/api/ws`;
const API_ENDPOINT = `http://${API_HOST}/api`;

async function getClientId(): Promise<string> {
	const sessionId = uuidv4();

	try {
		const ws = new WebSocket(`${WS_ENDPOINT}?client_id=${sessionId}`);
		await new Promise((resolve, reject) => {
			ws.onopen = resolve;
			ws.onerror = reject;
			setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
		});
		return sessionId;
	} catch (error) {
		console.error('Client ID fetch error:', error);
		throw new Error('Failed to establish WebSocket connection');
	}
}

async function fetchDownloadUrl(trackId: string, clientId: string): Promise<string> {
	const spotifyUrl = `https://open.spotify.com/track/${trackId}`;
	const response = await fetch(`${API_ENDPOINT}/download/url?url=${encodeURIComponent(spotifyUrl)}&client_id=${clientId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url: spotifyUrl, client_id: clientId }),
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.detail || 'Failed to fetch download URL');
	}

	return await response.json();
}

async function saveSongMetadata(trackId: string, downloadPath: string): Promise<void> {
	const track = await api.tracks.get(trackId);

	const artistList = await Promise.all(
		track.artists.map(async (artist) => {
			return await api.artists.get(artist.id);
		})
	);

	const artistObjectIds = await Promise.all(
		artistList.map(async (artist) => {
			const artistDoc = await ArtistModel.findOneAndUpdate(
				{ id: artist.id },
				{
					$setOnInsert: {
						id: artist.id,
						name: artist.name,
						imageUrl: artist.images[0]?.url,
						subscribers: artist.followers.total,
					},
				},
				{ upsert: true, new: true }
			);
			return artistDoc._id;
		})
	);

	const albumDoc = await AlbumModel.findOneAndUpdate(
		{ id: track.album.id },
		{
			$setOnInsert: {
				id: track.album.id,
				name: track.album.name,
				imageUrl: track.album.images[0]?.url,
			},
		},
		{ upsert: true, new: true }
	);

	await SongModel.findOneAndUpdate(
		{ id: trackId },
		{
			$setOnInsert: {
				id: trackId,
				name: track.name,
				artists: artistObjectIds,
				album: albumDoc._id,
				imageUrl: track.album.images[0]?.url,
				path: downloadPath,
			},
		},
		{ upsert: true }
	);
}

export async function downloadTrack(trackId: string): Promise<ErrorType> {
	try {
		const clientId = await getClientId();
		const downloadPath = await fetchDownloadUrl(trackId, clientId);

		await saveSongMetadata(trackId, downloadPath);
		await logSongDownload(trackId);

		return { message: 'Track downloaded successfully', status: 200 };
	} catch (error) {
		console.error('Track download failed:', error);
		return {
			message: error instanceof Error ? error.message : 'Internal server error',
			status: 500,
		};
	}
}

export async function getTrackFile(trackId: string): Promise<Blob | null> {
	try {
		const song = await SongModel.findOne({ id: trackId });
		if (!song) return null;

		const clientId = await getClientId();
		await logSongListen(trackId);

		const response = await fetch(`${API_ENDPOINT}/download/file?file=${encodeURIComponent(song.path)}&client_id=${clientId}`);

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.detail || 'File download failed');
		}

		return await response.blob();
	} catch (error) {
		console.error('Track file fetch failed:', error);
		throw error;
	}
}
