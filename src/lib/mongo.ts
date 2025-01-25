import { AccreditationModel } from '@/models/Accreditation';
import mongoose from 'mongoose';

const MONGO_URI = `mongodb://${process.env.MONGO_USER_USERNAME}:${process.env.MONGO_USER_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE || 'musicsDB'}`;

//@ts-ignore
let cached = global.mongoose;

if (!cached) {
	//@ts-ignore
	cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
			return mongoose;
		});
	}

	cached.conn = await cached.promise;

	init();

	return cached.conn;
}

async function disconnect() {
	await mongoose.disconnect();
}

async function init() {
	const accreditations = [
		{
			name: 'Super Administrator',
			description: 'Has full access to all system features and settings.',
			slug: 'sadm',
			accessLevel: 0,
			authorizations: {
				level: 0,
				app: ['access'],
				musics: ['download', 'play'],
			},
		},
		{
			name: 'Administrator',
			description: 'Has extensive permissions to manage most system resources.',
			slug: 'adm',
			accessLevel: 0,
			authorizations: {
				level: 1,
				app: ['access'],
				musics: ['download', 'play'],
			},
		},
		{
			name: 'Standard User',
			description: 'Limited permissions for basic functionalities.',
			slug: 'std',
			accessLevel: 0,
			authorizations: {
				level: 2,
				app: ['access'],
				musics: ['download', 'play'],
			},
		},
		{
			name: 'Denied User',
			description: 'No permissions to access any system resources.',
			slug: 'den',
			accessLevel: 0,
			authorizations: {
				level: 3,
			},
		},
	];

	accreditations.forEach(async (accreditation) => {
		await AccreditationModel.findOneAndReplace({ name: accreditation.name, accessLevel: accreditation.accessLevel }, accreditation, { upsert: true, new: true });
	});
}

const db = { connect, disconnect };
export default db;
