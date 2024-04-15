import { getSession } from 'next-auth/react';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { useRouter } from 'next/router';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Track(req, res) {
	const session = await getSession({ req });

	if (!session) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	if (req.method === 'GET') {
		try {
			const connection = await connectMySQL();

			const playlistId = req.query.playlistId;
			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_id_public = ?', [session.user.id]);
			const [[playlistInfo]] = await connection.execute('SELECT * FROM playlists WHERE playlist_user = ? AND public_id = ?', [user.user_id, playlistId]);

			if (!playlistInfo) {
				return res.status(404).json({ error: 'Playlist not found' });
			}

			let playlist = {};

			playlist.playlist = { name: playlistInfo.playlist_name, id: playlistInfo.public_id };
			playlist.tracks = [];

			const [tracksId] = await connection.execute('SELECT * FROM playlist_tracks WHERE playlist_id = ?', [playlistInfo.playlist_id]);

			for (const trackId of tracksId) {
				let [[track]] = await connection.execute('SELECT * FROM tracks WHERE track_id = ?', [trackId.track_id]);
				let [track_artist] = await connection.execute('SELECT * FROM track_artist WHERE track_id = ?', [trackId.track_id]);

				track.artists = [];

				for (const artistId of track_artist) {
					let [[artist]] = await connection.execute('SELECT * FROM artists WHERE artist_id = ?', [artistId.artist_id]);
					track.artists.push(artist);
				}
				const [[album]] = await connection.execute('SELECT * FROM albums WHERE album_id = ?', [track.album_id]);

				track.album = album;
				playlist.tracks.push(track);
			}

			res.status(200).json(playlist);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
