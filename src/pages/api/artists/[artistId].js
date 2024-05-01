import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { getServerSession } from 'next-auth';
import SpotifyWebApi from 'spotify-web-api-node';
import { authOptions } from '../auth/[...nextauth]';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Artist(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!(await UserAccess(session, 'player'))) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	const spotifyApi = new SpotifyWebApi({
		clientId: process.env.CLIENTID,
		clientSecret: process.env.CLIENTSECRET,
	});

	if (req.method === 'GET') {
		const connection = await connectMySQL();

		const data = await spotifyApi.clientCredentialsGrant();
		const accessToken = data.body.access_token;

		spotifyApi.setAccessToken(accessToken);

		let artistData = {};

		const [[artist]] = await connection.execute('SELECT * FROM artists WHERE public_id = ?', [req.query.artistId]);
		spotifyApi.getArtist(artist ? artist.spotify_id : req.query.artistId).then(
			function (data) {
				if (data.body) {
					artistData.artist = data.body;
					spotifyApi.getArtistTopTracks(artist ? artist.spotify_id : req.query.artistId, 'FR').then(
						function (data) {
							if (data.body) {
								artistData.songs = data.body;
								res.status(200).send(artistData);
							} else {
								res.status(200).send({ error: 'Artist not found' });
							}
						},
						function (err) {
							console.log('Something went wrong!', err);
						}
					);
				} else {
					res.status(200).send({ error: 'Artist not found' });
				}
			},
			function (err) {
				console.error(err);
				res.status(500).send({ error: 'Internal server error' });
			}
		);
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).send({ error: `The ${req.method} method is not allowed` });
	}
}
