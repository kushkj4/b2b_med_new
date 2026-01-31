import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDocument } from './Distributor';

export interface IRetailer extends Document {
    user_id: mongoose.Types.ObjectId;
    store_name: string;
    legal_name?: string;
    business_category: string;
    retailer_category: string;
    gst_number?: string;
    pan?: string;
    drug_license: {
        number?: string;
        type?: string;
        start_date?: Date;
        expiry?: Date;
        verified?: boolean;
    };
    address: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        landmark?: string;
    };
    location?: {
        type: string;
        coordinates: number[];
    };
    phone?: string;
    alternate_phone?: string;
    email?: string;
    documents: IDocument[];
    verification_notes?: string;
    credit_limit: number;
    credit_used: number;
    credit_period: number;
    discount_percentage: number;
    preferred_distributors: mongoose.Types.ObjectId[];
    is_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const DocumentSchema = new Schema({
    type: { type: String, required: true },
    file_url: { type: String, required: true },
    file_name: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    verified_at: { type: Date },
    verified_by: { type: Schema.Types.ObjectId, ref: 'User' },
    rejection_reason: { type: String },
});

const RetailerSchema = new Schema<IRetailer>({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    store_name: {
        type: String,
        required: true,
        trim: true,
    },
    legal_name: {
        type: String,
        trim: true,
    },
    business_category: {
        type: String,
        default: 'Medical Store',
    },
    retailer_category: {
        type: String,
        enum: ['Retail-Standalone', 'Retail-Chain', 'Hospital-Pharmacy', 'Nursing-Home', 'Clinic'],
        default: 'Retail-Standalone',
    },
    gst_number: {
        type: String,
        uppercase: true,
        trim: true,
    },
    pan: {
        type: String,
        uppercase: true,
        trim: true,
    },
    drug_license: {
        number: { type: String, trim: true },
        type: { type: String, enum: ['retail', 'retail_restricted'] },
        start_date: { type: Date },
        expiry: { type: Date },
        verified: { type: Boolean, default: false },
    },
    address: {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        landmark: { type: String, trim: true },
    },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number],
    },
    phone: {
        type: String,
        trim: true,
    },
    alternate_phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    documents: [DocumentSchema],
    verification_notes: {
        type: String,
    },
    credit_limit: {
        type: Number,
        default: 50000,
    },
    credit_used: {
        type: Number,
        default: 0,
    },
    credit_period: {
        type: Number,
        default: 30,
    },
    discount_percentage: {
        type: Number,
        default: 0,
    },
    preferred_distributors: [{
        type: Schema.Types.ObjectId,
        ref: 'Distributor',
    }],
    is_verified: {
        type: Boolean,
        default: false,
    },
    is_active: {
        type: Boolean,
        default: true,
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
RetailerSchema.index({ user_id: 1 });
RetailerSchema.index({ store_name: 'text', legal_name: 'text' });
RetailerSchema.index({ 'address.city': 1 });
RetailerSchema.index({ 'address.state': 1 });
RetailerSchema.index({ 'address.pincode': 1 });
RetailerSchema.index({ location: '2dsphere' });
RetailerSchema.index({ is_verified: 1 });
RetailerSchema.index({ is_active: 1 });

// Update timestamp
RetailerSchema.pre('save', async function () {
    this.updated_at = new Date();
});

const Retailer: Model<IRetailer> = mongoose.models.Retailer || mongoose.model<IRetailer>('Retailer', RetailerSchema);

export default Retailer;
