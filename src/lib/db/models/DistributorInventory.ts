import mongoose, { Schema, Document } from 'mongoose';
import { IDistributorInventory } from '@/types';

export interface IDistributorInventoryDocument extends Omit<IDistributorInventory, '_id' | 'distributor_id' | 'product_id'>, Document {
    distributor_id: mongoose.Types.ObjectId;
    product_id: mongoose.Types.ObjectId;
}

const DistributorInventorySchema = new Schema<IDistributorInventoryDocument>(
    {
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: 'Distributor',
            required: true,
            index: true,
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true,
        },
        // Denormalized for performance
        sku: {
            type: String,
            required: true,
            trim: true,
        },
        product_name: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
            trim: true,
        },
        company_name: {
            type: String,
            trim: true,
        },
        // Pricing
        base_ptr: {
            type: Number,
            required: true,
        },
        custom_ptr: {
            type: Number,
            required: true,
        },
        margin_percentage: {
            type: Number,
            default: 0,
        },
        // Stock
        quantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        reserved_quantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        min_stock_level: {
            type: Number,
            default: 10,
        },
        // Batch & Expiry
        batch_number: {
            type: String,
            trim: true,
        },
        manufacturing_date: {
            type: Date,
        },
        expiry_date: {
            type: Date,
            index: true,
        },
        // Status
        is_active: {
            type: Boolean,
            default: true,
        },
        is_in_stock: {
            type: Boolean,
            default: true,
        },
        last_updated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

// Compound unique index
DistributorInventorySchema.index({ distributor_id: 1, product_id: 1 }, { unique: true });

// Index for catalog queries
DistributorInventorySchema.index({ is_active: 1, is_in_stock: 1 });

// Text search
DistributorInventorySchema.index({ product_name: 'text', brand: 'text', sku: 'text' });

export const DistributorInventory = mongoose.models.DistributorInventory ||
    mongoose.model<IDistributorInventoryDocument>('DistributorInventory', DistributorInventorySchema);
