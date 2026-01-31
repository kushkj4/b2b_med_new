import mongoose, { Schema, Document } from 'mongoose';
import { ICart } from '@/types';

export interface ICartDocument extends Omit<ICart, '_id' | 'retailer_id'>, Document {
    retailer_id: mongoose.Types.ObjectId;
}

const CartItemSchema = new Schema({
    distributor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Distributor',
        required: true,
    },
    inventory_id: {
        type: Schema.Types.ObjectId,
        ref: 'DistributorInventory',
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    sku: { type: String, required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true },
    added_at: { type: Date, default: Date.now },
}, { _id: true });

const CartSchema = new Schema<ICartDocument>(
    {
        retailer_id: {
            type: Schema.Types.ObjectId,
            ref: 'Retailer',
            required: true,
            unique: true,
            index: true,
        },
        items: [CartItemSchema],
        expires_at: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            index: { expireAfterSeconds: 0 }, // TTL index
        },
    },
    {
        timestamps: { createdAt: false, updatedAt: 'updated_at' },
    }
);

export const Cart = mongoose.models.Cart || mongoose.model<ICartDocument>('Cart', CartSchema);
