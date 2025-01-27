import mongoose, { Document } from 'mongoose';

export interface ISong extends Document {
	_id: string;
	id: string;
	path: string;
	name: string;
	artists: String[];
	album: String;
	imageUrl: string;
}

const songSchema = new mongoose.Schema<ISong>({
	id: { type: String, required: true },
	path: { type: String, required: true },
	name: { type: String, required: true },
	artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
	album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
	imageUrl: { type: String, required: true },
});

export const SongModel = mongoose.models.Song || mongoose.model<ISong>('Song', songSchema);
