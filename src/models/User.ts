import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
	_id: string;
	id: string;
	name: string;
	username?: string;
	image?: string;
	email: string;
	verified?: boolean;
	password?: string;
	twoFactorEnabled: boolean;
	twoFactorSecret?: string;
	accreditation: String;
}

const userSchema = new mongoose.Schema<IUser>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	username: { type: String, required: false },
	image: { type: String, required: false },
	email: { type: String, required: true },
	password: { type: String, required: false },
	verified: { type: Boolean, required: false, default: false },
	twoFactorEnabled: { type: Boolean, required: true, default: false },
	twoFactorSecret: { type: String, required: false },
	accreditation: { type: mongoose.Schema.Types.ObjectId, ref: 'Accreditation' },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
