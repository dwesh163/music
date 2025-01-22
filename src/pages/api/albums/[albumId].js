import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { getServerSession } from 'next-auth';
import SpotifyWebApi from 'spotify-web-api-node';
import { authOptions } from '../auth/[...nextauth]';
import UserAccess from '/lib/auth';
import WriteLogs from '../../../../lib/logs';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Album(req, res) {
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

		const [[album]] = await connection.execute('SELECT * FROM albums WHERE public_id = ?', [req.query.albumId]);
		WriteLogs(req.method, req.url, session.user.email, 'album', album ? album.spotify_id : req.query.albumId);

		spotifyApi.getAlbum(album ? album.spotify_id : req.query.albumId).then(
			function (data) {
				if (data.body) {
					res.status(200).send(data.body);
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
