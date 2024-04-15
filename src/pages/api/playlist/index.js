import { getSession } from 'next-auth/react';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

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

			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_id_public = ?', [session.user.id]);
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
			const { playlistName } = req.body;

			if (!playlistName) {
				return res.status(400).json({ error: 'Missing playlist name' });
			}

			const connection = await connectMySQL();
			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_id_public = ?', [session.user.id]);

			await connection.execute('INSERT INTO playlists (playlist_name, public_id, playlist_user) VALUES (?, ?)', [playlistName, uuidv4(), user.user_id]);

			res.status(201).json({ message: 'Playlist created successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['GET', 'POST']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
