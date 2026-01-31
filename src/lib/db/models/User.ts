import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserStatus } from '@/lib/config/role-config';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'distributor' | 'retailer';
    phone?: string;
    status: UserStatus;
    rejection_reason?: string;
    approved_at?: Date;
    approved_by?: mongoose.Types.ObjectId;
    is_active: boolean;
    email_verified: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'distributor', 'retailer'],
        required: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending_approval', 'rejected', 'pending_documents', 'pending_verification', 'active'],
        default: 'pending_approval',
    },
    rejection_reason: {
        type: String,
    },
    approved_at: {
        type: Date,
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    last_login: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ created_at: -1 });

// Update timestamp on save
UserSchema.pre('save', async function () {
    this.updated_at = new Date();
});

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
