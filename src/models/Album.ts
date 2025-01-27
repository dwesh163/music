import mongoose, { Document } from 'mongoose';

export interface IAlbum extends Document {
	_id: string;
	id: string;
	name: string;
	imageUrl: string;
}

const albumSchema = new mongoose.Schema<IAlbum>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	imageUrl: { type: String, required: true },
});

export const AlbumModel = mongoose.models.Album || mongoose.model<IAlbum>('Album', albumSchema);
