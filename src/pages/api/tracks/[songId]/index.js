import fs from 'fs';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import path from 'path';
import { authOptions } from '../../auth/[...nextauth]';
import UserAccess from '/lib/auth';
import WriteLogs from '../../../../../lib/logs';

export default async function getTrack(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!(await UserAccess(session, 'player'))) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	if (req.method === 'GET') {
		try {
			const filePath = path.join(process.cwd(), 'musics/' + req.query.songId + '.mp3');
			const audioFile = fs.readFileSync(filePath);

			WriteLogs(req.method, req.url, session.user.email, 'song', req.query.songId);
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
