import mongoose, { Document } from 'mongoose';

export interface ISong extends Document {
	_id: string;
	id: string;
	path: string;
}

const songSchema = new mongoose.Schema<ISong>({
	id: { type: String, required: true },
	path: { type: String, required: true },
});

export const SongModel = mongoose.models.Song || mongoose.model<ISong>('Song', songSchema);
