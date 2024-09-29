import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
	_id: string;
	name: string;
	username?: string;
	image?: string;
	email: string;
	password?: string;
	verified?: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
	name: { type: String, required: true },
	username: { type: String, required: false },
	image: { type: String, required: false },
	email: { type: String, required: true },
	password: { type: String, required: false },
	verified: { type: Boolean, required: true, default: false },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
