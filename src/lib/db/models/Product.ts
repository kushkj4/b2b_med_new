import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '@/types';

export interface IProductDocument extends Omit<IProduct, '_id' | 'company_id'>, Document {
    company_id: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProductDocument>(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
            trim: true,
            index: true,
        },
        mother_brand: {
            type: String,
            trim: true,
        },
        company_id: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            index: true,
        },
        company_name: {
            type: String,
            trim: true,
            index: true,
        },
        therapy: {
            type: String,
            trim: true,
            index: true,
        },
        super_group: {
            type: String,
            trim: true,
        },
        sub_supergroup: {
            type: String,
            trim: true,
        },
        group: {
            type: String,
            trim: true,
        },
        class: {
            type: String,
            trim: true,
        },
        drug_type: {
            type: String,
            trim: true,
            index: true,
        },
        drug_category: {
            type: String,
            trim: true,
        },
        subgroup: {
            type: String,
            trim: true,
        },
        strength: {
            type: String,
            trim: true,
        },
        pack: {
            type: String,
            trim: true,
        },
        pack_unit: {
            type: Number,
        },
        schedule: {
            type: String,
            trim: true,
        },
        is_rx_required: {
            type: Boolean,
            default: false,
        },
        nlem: {
            type: String,
            trim: true,
        },
        acute_chronic: {
            type: String,
            trim: true,
        },
        plain_combination: {
            type: String,
            trim: true,
        },
        mrp: {
            type: Number,
            required: true,
        },
        ptr: {
            type: Number,
        },
        pts: {
            type: Number,
        },
        brand_launch_date: {
            type: Date,
        },
        sku_launch_date: {
            type: Date,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

// Text search index for product search
ProductSchema.index({
    name: 'text',
    brand: 'text',
    company_name: 'text',
    sku: 'text'
});

export const Product = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
