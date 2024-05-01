import { getServerSession } from 'next-auth/next';
import SpotifyWebApi from 'spotify-web-api-node';
import { authOptions } from './auth/[...nextauth]';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import UserAccess from '/lib/auth';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Home(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!(await UserAccess(session, 'player'))) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	const spotifyApi = new SpotifyWebApi({
		clientId: process.env.CLIENTID,
		clientSecret: process.env.CLIENTSECRET,
	});

	if (req.method === 'GET') {
		try {
			const connection = await connectMySQL();

			const [rows] = await connection.execute('SELECT DISTINCT a.spotify_id FROM artists a JOIN album_artist aa ON a.artist_id = aa.artist_id JOIN albums al ON aa.album_id = al.album_id JOIN tracks t ON al.album_id = t.album_id JOIN playlist_tracks pt ON t.track_id = pt.track_id JOIN playlists pl ON pt.playlist_id = pl.playlist_id JOIN users u ON pl.playlist_user = u.user_id WHERE u.user_email = ?', [session.user.email]);

			const seedArtists = rows.map((row) => row.spotify_id);

			seedArtists.sort(() => Math.random() - 0.5);

			const shuffledSeedArtists = seedArtists.slice(0, 4);

			const data = await spotifyApi.clientCredentialsGrant();
			const accessToken = data.body.access_token;
			spotifyApi.setAccessToken(accessToken);

			const recommendations = await spotifyApi.getRecommendations({
				min_energy: 0.4,
				seed_artists: shuffledSeedArtists,
				min_popularity: 50,
				limit: 10,
			});

			res.status(200).send({ recommendations: recommendations.body });
		} catch (error) {
			console.error('Error:', error);
			res.status(500).send({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).send({ error: `The ${req.method} method is not allowed` });
	}
}
