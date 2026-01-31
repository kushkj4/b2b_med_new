import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, OrderStatus } from '@/types';

export interface IOrderDocument extends Omit<IOrder, '_id' | 'retailer_id' | 'distributor_id'>, Document {
    retailer_id: mongoose.Types.ObjectId;
    distributor_id: mongoose.Types.ObjectId;
}

const OrderItemSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    inventory_id: {
        type: Schema.Types.ObjectId,
        ref: 'DistributorInventory',
        required: true,
    },
    sku: { type: String, required: true },
    product_name: { type: String, required: true },
    brand: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true },
    total: { type: Number, required: true },
    batch_number: { type: String },
    expiry_date: { type: Date },
}, { _id: false });

const StatusHistorySchema = new Schema({
    status: { type: String, required: true },
    changed_at: { type: Date, default: Date.now },
    changed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
}, { _id: false });

const OrderSchema = new Schema<IOrderDocument>(
    {
        order_number: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        retailer_id: {
            type: Schema.Types.ObjectId,
            ref: 'Retailer',
            required: true,
            index: true,
        },
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: 'Distributor',
            required: true,
            index: true,
        },
        items: [OrderItemSchema],
        item_count: {
            type: Number,
            default: 0,
        },
        subtotal: {
            type: Number,
            required: true,
        },
        discount_amount: {
            type: Number,
            default: 0,
        },
        tax_amount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[],
            default: 'pending',
            index: true,
        },
        status_history: [StatusHistorySchema],
        notes: {
            type: String,
        },
        internal_notes: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Index for queries
OrderSchema.index({ created_at: -1 });
OrderSchema.index({ retailer_id: 1, status: 1 });
OrderSchema.index({ distributor_id: 1, status: 1 });

export const Order = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
