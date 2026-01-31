import mongoose, { Schema, Document } from 'mongoose';
import { IAuditLog } from '@/types';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id' | 'user_id' | 'entity_id'>, Document {
    user_id: mongoose.Types.ObjectId;
    entity_id?: mongoose.Types.ObjectId;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        user_role: {
            type: String,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        entity_type: {
            type: String,
            required: true,
        },
        entity_id: {
            type: Schema.Types.ObjectId,
        },
        details: {
            type: Schema.Types.Mixed,
        },
        ip_address: {
            type: String,
        },
        user_agent: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

// TTL index - auto-delete after 90 days
AuditLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
