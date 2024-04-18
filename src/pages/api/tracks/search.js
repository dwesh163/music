import { getServerSession } from 'next-auth';
import SpotifyWebApi from 'spotify-web-api-node';
import { authOptions } from '../auth/[...nextauth]';

export default async function Track(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!session) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	if (req.method === 'POST') {
		const { songName, artistName } = JSON.parse(req.body);

		const spotifyApi = new SpotifyWebApi({
			clientId: process.env.CLIENTID,
			clientSecret: process.env.CLIENTSECRET,
		});

		try {
			const data = await spotifyApi.clientCredentialsGrant();
			const accessToken = data.body.access_token;

			spotifyApi.setAccessToken(accessToken);

			const searchResult = await spotifyApi.searchTracks('track:' + songName + (artistName ? ' artist:' + artistName : ''), { limit: 8 });
			const songInfo = searchResult.body.tracks.items;

			if (songInfo.length == 0 || !songInfo) {
				res.status(200).json({ error: 'Music not found' });
			}

			res.status(200).json(songInfo);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
