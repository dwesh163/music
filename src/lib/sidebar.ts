import { LogModel } from '@/models/Log';
import { api } from './api';
import { getUser } from './auth';
import { RightSidebarType } from '@/types/sidebar';
import { UserModel } from '@/models/User';

export async function getRightSidebarData(): Promise<RightSidebarType | null> {
	try {
		const user = await getUser();
		if (!user) {
			return null;
		}

		const newReleases = await api.browse.getNewReleases();
		const userData = await UserModel.findOne({ email: user.email });

		if (!userData) {
			throw new Error('User not found in database');
		}

		const listenMoreOften = await LogModel.aggregate([
			{
				$match: {
					userId: userData._id,
					type: 'listen',
				},
			},
			{
				$group: {
					_id: '$songId',
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$lookup: {
					from: 'songs',
					localField: '_id',
					foreignField: '_id',
					as: 'song',
				},
			},
			{
				$unwind: '$song',
			},
			{
				$lookup: {
					from: 'artists',
					localField: 'song.artists',
					foreignField: '_id',
					as: 'artists',
				},
			},
			{
				$lookup: {
					from: 'albums',
					localField: 'song.album',
					foreignField: '_id',
					as: 'album',
				},
			},
			{
				$unwind: '$album',
			},
			{
				$project: {
					_id: 0,
					id: '$song.id',
					name: '$song.name',
					artists: {
						$map: {
							input: '$artists',
							as: 'artist',
							in: {
								id: '$$artist.id',
								name: '$$artist.name',
								imageUrl: '$$artist.imageUrl',
							},
						},
					},
					imageUrl: '$song.imageUrl',
					album: {
						id: '$album.id',
						name: '$album.name',
					},
				},
			},
			{
				$limit: 4,
			},
		]);

		const favouriteArtists = await LogModel.aggregate([
			{
				$match: {
					userId: userData._id,
					type: 'listen',
				},
			},
			{
				$lookup: {
					from: 'songs',
					localField: 'songId',
					foreignField: '_id',
					as: 'song',
				},
			},
			{
				$unwind: '$song',
			},
			{
				$unwind: '$song.artists',
			},
			{
				$lookup: {
					from: 'artists',
					localField: 'song.artists',
					foreignField: '_id',
					as: 'artist',
				},
			},
			{
				$unwind: '$artist',
			},
			{
				$group: {
					_id: '$artist._id',
					name: { $first: '$artist.name' },
					imageUrl: { $first: '$artist.imageUrl' },
					subscribers: { $first: '$artist.subscribers' },
					listens: { $sum: 1 },
				},
			},
			{
				$sort: { listens: -1 },
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					imageUrl: 1,
					subscribers: 1,
				},
			},
			{
				$limit: 5,
			},
		]);

		return {
			newReleases,
			listenMoreOften,
			favouriteArtists: favouriteArtists.map((artist) => ({
				...artist,
				subscribers: artist.subscribers.toLocaleString(),
			})),
		};
	} catch (error) {
		console.error('Failed to get right sidebar data:', error);
		return null;
	}
}
