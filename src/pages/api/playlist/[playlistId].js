import { getSession } from 'next-auth/react';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import UserAccess from '/lib/auth';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function PlayList(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!(await UserAccess(session, 'player'))) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	if (req.method === 'GET') {
		try {
			const connection = await connectMySQL();

			const playlistId = req.query.playlistId;
			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);
			const [[playlistInfo]] = await connection.execute('SELECT * FROM playlists WHERE playlist_user = ? AND public_id = ?', [user.user_id, playlistId]);

			if (!playlistInfo) {
				return res.status(404).json({ error: 'Playlist not found' });
			}

			let playlist = {};

			playlist.playlist = { name: playlistInfo.playlist_name, id: playlistInfo.public_id };
			playlist.tracks = [];

			const [tracksId] = await connection.execute('SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY added_date DESC', [playlistInfo.playlist_id]);

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
				track.date = trackId.added_date;
				playlist.tracks.push(track);
			}

			res.status(200).json(playlist);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}
	if (req.method === 'POST') {
		const connection = await connectMySQL();
		let songId;

		if (req.body.songId) {
			songId = req.body.songId;
		} else {
			songId = JSON.parse(req.body).songId;
		}

		if (!songId) {
			return res.status(404).json({ error: 'Song not found' });
		}

		const playlistId = req.query.playlistId;
		const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);
		const [[playlistInfo]] = await connection.execute('SELECT * FROM playlists WHERE playlist_user = ? AND public_id = ?', [user.user_id, playlistId]);

		if (!playlistInfo) {
			return res.status(404).json({ error: 'Playlist not found' });
		}

		const [[track]] = await connection.execute('SELECT * FROM tracks WHERE track_public_id = ?', [songId]);
		if (!track) {
			return res.status(404).json({ error: 'Song not found' });
		}

		const [[playlist_tracks]] = await connection.execute('SELECT * FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [playlistInfo.playlist_id, track.track_id]);

		if (!playlist_tracks) {
			await connection.execute('INSERT INTO playlist_tracks (playlist_id, track_id, added_date) VALUES (?, ?, ?)', [playlistInfo.playlist_id, track.track_id, new Date()]);
		}
		res.status(200).json({ status: 'ok' });
	}
	if (req.method == 'DELETE') {
		const connection = await connectMySQL();
		let songId;

		if (req.body.songId) {
			songId = req.body.songId;
		} else {
			songId = JSON.parse(req.body).songId;
		}

		if (!songId) {
			return res.status(404).json({ error: 'Song not found' });
		}

		const playlistId = req.query.playlistId;
		const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);
		const [[playlistInfo]] = await connection.execute('SELECT * FROM playlists WHERE playlist_user = ? AND public_id = ?', [user.user_id, playlistId]);

		if (!playlistInfo) {
			return res.status(404).json({ error: 'Playlist not found' });
		}

		const [[track]] = await connection.execute('SELECT * FROM tracks WHERE track_public_id = ?', [songId]);
		if (!track) {
			return res.status(404).json({ error: 'Song not found' });
		}

		const [[playlist_tracks]] = await connection.execute('SELECT * FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [playlistInfo.playlist_id, track.track_id]);

		if (playlist_tracks) {
			await connection.execute('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [playlistInfo.playlist_id, track.track_id]);
			res.status(200).json({ status: 'remove' });
		} else {
			res.status(403).json({ error: 'Song not in playlist "' + playlistInfo.playlist_name + '"' });
		}
	}
	res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
}
