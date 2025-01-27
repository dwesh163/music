import { LogModel } from '@/models/Log';
import { getUser } from './auth';
import { SongModel } from '@/models/Song';

export async function logSongListen(songId: string) {
	try {
		const user = await getUser();
		if (!user) return;

		const song = await SongModel.findOne({ id: songId });
		if (!song) return;

		await LogModel.create({
			userId: user.id,
			type: 'listen',
			songId: song?._id,
		});

		return;
	} catch (error) {
		console.error('Song listen failed:', error);
	}
}

export async function logSongDownload(songId: string) {
	try {
		const user = await getUser();
		if (!user) return;

		const song = await SongModel.findOne({ id: songId });
		if (!song) return;

		await LogModel.create({
			userId: user.id,
			type: 'download',
			songId: song?._id,
		});

		return;
	} catch (error) {
		console.error('Song download failed:', error);
	}
}
