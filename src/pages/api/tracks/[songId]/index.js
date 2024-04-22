import fs from 'fs';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import path from 'path';
import { authOptions } from '../../auth/[...nextauth]';

export default async function getTrack(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (req.method === 'GET') {
		if (!session) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		try {
			const filePath = path.join(process.cwd(), 'musics/' + req.query.songId + '.mp3');
			const audioFile = fs.readFileSync(filePath);

			res.setHeader('Content-Type', 'audio/mpeg');
			res.status(200).send(audioFile);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Erreur interne du serveur' });
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).json({ error: `La méthode ${req.method} n'est pas autorisée` });
	}
}
