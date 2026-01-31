import mongoose, { Schema, Document } from 'mongoose';
import { ICompany } from '@/types';

export interface ICompanyDocument extends Omit<ICompany, '_id'>, Document { }

const CompanySchema = new Schema<ICompanyDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        corporate: {
            type: String,
            trim: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['INDIAN', 'MNC'],
            default: 'INDIAN',
        },
        divisions: [{
            type: String,
        }],
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

// Text search index
CompanySchema.index({ name: 'text', corporate: 'text' });

export const Company = mongoose.models.Company || mongoose.model<ICompanyDocument>('Company', CompanySchema);
