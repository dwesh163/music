import { getSession } from 'next-auth/react';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Info(req, res) {
	const session = await getSession({ req });

	if (req.method === 'GET') {
		const { songId } = req.query;

		if (!session) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		if (!songId) {
			res.status(400).json({ error: 'Paramètre public_id manquant' });
			return;
		}

		try {
			const connection = await connectMySQL();

			const [[track]] = await connection.execute('SELECT * FROM tracks WHERE track_public_id = ?', [songId]);

			if (!track) {
				res.status(404).json({ error: 'Aucune piste trouvée pour ce public_id' });
				return;
			}

			const [[album]] = await connection.execute('SELECT * FROM albums WHERE album_id = ?', [track.album_id]);
			const [artists] = await connection.execute('SELECT * FROM artists INNER JOIN track_artist ON artists.artist_id = track_artist.artist_id WHERE track_artist.track_id = ?', [track.track_id]);

			const trackInfo = {
				track: {
					name: track.name,
					duration: track.duration,
					id: track.track_public_id,
					src: process.env.NEXTAUTH_URL + '/api/tracks/' + track.track_public_id,
				},
				album: {
					name: album.album_name,
					image: album.album_image,
				},
				artists: artists.map((item) => ({
					name: item.artist_name,
					id: item.public_id,
				})),
			};

			res.status(200).json(trackInfo);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
