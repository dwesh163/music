import { getSession } from 'next-auth/react';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Track(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!session) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	if (req.method === 'GET') {
		try {
			const connection = await connectMySQL();

			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);
			const [playlistInfo] = await connection.execute('SELECT * FROM playlists WHERE playlist_user = ?', [user.user_id]);

			if (playlistInfo.length === 0) {
				return res.status(404).json({ error: 'Playlist not found' });
			}

			res.status(200).json(
				playlistInfo.map((item) => ({
					name: item.playlist_name,
					id: item.public_id,
				}))
			);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} else if (req.method === 'POST') {
		try {
			let { playlistName } = JSON.parse(req.body);

			playlistName = playlistName.trim().replaceAll(/\ \ +/g, ' ');

			if (!playlistName || playlistName == '') {
				return res.status(400).send({ error: 'Missing playlist name' });
			}

			if (playlistName.length > 50) {
				return res.status(400).send({ error: 'Playlist name to long' });
			}

			const connection = await connectMySQL();
			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);

			const [[playlist]] = await connection.execute('SELECT * FROM playlists WHERE playlist_name = ? AND playlist_user = ?', [playlistName.trim(), user.user_id]);

			if (playlist) {
				return res.status(400).send({ error: 'Playlist already exists' });
			}

			const [[rows]] = await connection.execute('SELECT COUNT(*) AS playlistCount FROM playlists WHERE playlist_user = ?', [user.user_id]);
			const { playlistCount } = rows;

			await connection.execute('INSERT INTO playlists (playlist_name, public_id, playlist_user) VALUES (?, ?, ?)', [playlistName.trim(), uuidv4(), user.user_id]);

			res.status(201).send({ message: 'Playlist created successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).send({ error: 'Internal Server Error' });
		}
	} else if (req.method === 'DELETE') {
		try {
			let playlistId;

			if (req.body.playlistId) {
				playlistId = req.body.playlistId;
			} else {
				playlistId = JSON.parse(req.body).playlistId;
			}

			if (!playlistId) {
				return res.status(400).send({ error: 'Missing playlist Id' });
			}

			const connection = await connectMySQL();
			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);
			const [[playlist]] = await connection.execute('SELECT * FROM playlists WHERE public_id = ? AND playlist_user = ?', [playlistId, user.user_id]);

			if (playlist.playlist_name == 'Liked') {
				return res.status(403).send({ error: 'unauthorized' });
			}

			if (!playlist) {
				return res.status(400).send({ error: 'Playlist not exists' });
			}

			await connection.execute('DELETE FROM playlists WHERE public_id = ? AND playlist_user = ?', [playlistId, user.user_id]);

			res.status(201).send({ message: 'Playlist delete successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).send({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
