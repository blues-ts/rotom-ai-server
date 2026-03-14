import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
    clerkUserId: string;
    name: string;
    email: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    clerkUserId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String, default: "" },
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);
