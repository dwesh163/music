export async function downloadTrack(trackId: string): Promise<ErrorType> {
	try {
		const clientId = await getClientId();
		if (!clientId) throw new Error('No valid client ID');

		const response = await fetch(`${process.env.API_URL}/api/download/url?url=https:%2F%2Fopen.spotify.com%2Ftrack%2F${trackId}&client_id=${clientId}`, {
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

