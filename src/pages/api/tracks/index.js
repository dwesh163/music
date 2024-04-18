import { getSession } from 'next-auth/react';
import SpotifyWebApi from 'spotify-web-api-node';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import fs from 'fs';

const path = require('path');
const { spawn } = require('child_process');

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

	if (req.method === 'POST') {
		const { spotifyId } = JSON.parse(req.body);
		const connection = await connectMySQL();
		const id = uuidv4();
		let searchResult;
		let songInfo;

		const spotifyApi = new SpotifyWebApi({
			clientId: process.env.CLIENTID,
			clientSecret: process.env.CLIENTSECRET,
		});

		try {
			const data = await spotifyApi.clientCredentialsGrant();
			const accessToken = data.body.access_token;

			spotifyApi.setAccessToken(accessToken);

			searchResult = await spotifyApi.getTrack(spotifyId);
			songInfo = searchResult.body;

			if (!songInfo) {
				res.status(404).send('Music not found');
				return;
			}

			let [[track]] = await connection.execute('SELECT * FROM tracks WHERE spotify_id = ?', [songInfo.id]);
			if (track) {
				if (track.track_public_id) {
					const filePath = path.join('musics', `${track.track_public_id}.mp3`);
					console.log(filePath);
					if (fs.existsSync(filePath)) {
						res.status(200).json({ download: 'true', id: track.track_public_id });
					} else {
						res.status(200).json({ download: 'progress', id: track.track_public_id });
					}
				}
				return;
			}

			let [[album]] = await connection.execute('SELECT * FROM albums WHERE spotify_id = ?', [songInfo.album.id]);
			if (!album) {
				await connection.execute('INSERT INTO albums (album_name, album_image, album_type, spotify_id, public_id, release_date, total_tracks) VALUES (?, ?, ?, ?, ?, ?, ?)', [songInfo.album.name, songInfo.album.images[0].url, songInfo.album.album_type, songInfo.album.id, uuidv4(), new Date(songInfo.album.release_date), songInfo.album.total_tracks]);
				[[album]] = await connection.execute('SELECT * FROM albums WHERE spotify_id = ?', [songInfo.album.id]);
			}
			[[album]] = await connection.execute('SELECT * FROM albums WHERE spotify_id = ?', [songInfo.album.id]);

			for (const albumArtist of songInfo.album.artists) {
				let [[artist]] = await connection.execute('SELECT * FROM artists WHERE spotify_id = ?', [albumArtist.id]);
				if (!artist) {
					await connection.execute('INSERT INTO artists (artist_name, artist_type, spotify_id, public_id) VALUES (?, ?, ?, ?)', [albumArtist.name, albumArtist.type, albumArtist.id, uuidv4()]);
					[[artist]] = await connection.execute('SELECT * FROM artists WHERE spotify_id = ?', [albumArtist.id]);
				}

				const [existingRelation] = await connection.execute('SELECT * FROM album_artist WHERE album_id = ? AND artist_id = ?', [album.album_id, artist.artist_id]);
				if (existingRelation.length === 0) {
					await connection.execute('INSERT INTO album_artist (album_id, artist_id) VALUES (?, ?)', [album.album_id, artist.artist_id]);
				}
			}

			if (!track) {
				await connection.execute('INSERT INTO tracks (name, duration, disc_number, track_number, popularity, album_id, spotify_id, track_public_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [songInfo.name, songInfo.duration_ms.toString().slice(0, 3), songInfo.disc_number, songInfo.track_number, songInfo.popularity, album.album_id, songInfo.id, id]);
				[[track]] = await connection.execute('SELECT * FROM tracks WHERE spotify_id = ?', [songInfo.id]);
			}
			[[track]] = await connection.execute('SELECT * FROM tracks WHERE spotify_id = ?', [songInfo.id]);

			for (const trackArtist of songInfo.artists) {
				let [[artist]] = await connection.execute('SELECT * FROM artists WHERE spotify_id = ?', [trackArtist.id]);
				if (!artist) {
					await connection.execute('INSERT INTO artists (artist_name, artist_type, spotify_id, public_id) VALUES (?, ?, ?, ?)', [trackArtist.name, trackArtist.type, trackArtist.id, uuidv4()]);
				}

				[[artist]] = await connection.execute('SELECT * FROM artists WHERE spotify_id = ?', [trackArtist.id]);

				const [existingRelation] = await connection.execute('SELECT * FROM track_artist WHERE track_id = ? AND artist_id = ?', [track.track_id, artist.artist_id]);
				if (existingRelation.length === 0) {
					await connection.execute('INSERT INTO track_artist (track_id, artist_id) VALUES (?, ?)', [track.track_id, artist.artist_id]);
				}
			}

			const command = 'spotdl';
			const args = ['--output', `musics/downloads/${id}`, `https://open.spotify.com/intl-fr/track/${spotifyId}`];
			const download = spawn(command, args);

			console.log('Start download');

			download.stdout.on('data', (data) => {
				console.log(data.toString());
				if (data.toString().includes('Downloaded')) {
					const folderPath = `musics/downloads/${id}`;

					if (!fs.existsSync('musics/downloads')) {
						fs.mkdirSync('musics/downloads', { recursive: true });
					}

					fs.readdir(folderPath, (err, files) => {
						if (err) {
							console.error('Error', err);
							return;
						}

						if (files.length === 1) {
							const filename = files[0];
							const oldPath = path.join(folderPath, filename);
							const newPath = path.join('musics', `${id}.mp3`);
							fs.rename(oldPath, newPath, (err) => {
								if (err) {
									console.error('Error renaming the file:', err);
									return;
								}
								console.log('The file has been renamed successfully.');
							});
						} else {
							console.error('There is not a single file in the folder.');
						}
					});

					fs.rm(folderPath);
				}
			});

			download.on('close', (code) => {
				console.log(`child process exited with code ${code}`);
			});

			res.status(200).json({ download: 'progress', id: id });
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
