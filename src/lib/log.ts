import { LogModel } from '@/models/Log';
import { getUser } from './auth';

export async function logSongListen(songId: string) {
	try {
		const user = await getUser();

		if (!user) {
			return;
		}

		await LogModel.create({
			userId: user.id,
			type: 'listen',
			songId,
		});

		return;
	} catch (error) {
		console.error('Song listen failed:', error);
	}
}

