import mongoose, { Document } from 'mongoose';

export interface IArtist extends Document {
	_id: string;
	id: string;
	name: string;
	imageUrl: string;
	subscribers: number;
}

const artistSchema = new mongoose.Schema<IArtist>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	imageUrl: { type: String, required: true },
	subscribers: { type: Number, required: true },
});

export const ArtistModel = mongoose.models.Artist || mongoose.model<IArtist>('Artist', artistSchema);
