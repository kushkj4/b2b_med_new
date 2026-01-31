import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocument {
    type: string;
    file_url: string;
    file_name: string;
    uploaded_at: Date;
    verified: boolean;
    verified_at?: Date;
    verified_by?: mongoose.Types.ObjectId;
    rejection_reason?: string;
}

export interface IDistributor extends Document {
    user_id: mongoose.Types.ObjectId;
    company_name: string;
    trade_name?: string;
    gst_number?: string;
    drug_license: {
        number?: string;
        type?: string;
        expiry?: Date;
        verified?: boolean;
    };
    address: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    phone?: string;
    email?: string;
    documents: IDocument[];
    verification_notes?: string;
    settings: {
        min_order_value: number;
        delivery_areas: string[];
        payment_terms: string;
        default_margin: number;
    };
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

const DistributorSchema = new Schema<IDistributor>({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    company_name: {
        type: String,
        required: true,
        trim: true,
    },
    trade_name: {
        type: String,
        trim: true,
    },
    gst_number: {
        type: String,
        uppercase: true,
        trim: true,
    },
    drug_license: {
        number: { type: String, trim: true },
        type: { type: String, enum: ['wholesale', 'retail_wholesale'] },
        expiry: { type: Date },
        verified: { type: Boolean, default: false },
    },
    address: {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
    },
    phone: {
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
    settings: {
        min_order_value: { type: Number, default: 500 },
        delivery_areas: [{ type: String }],
        payment_terms: { type: String, default: 'Cash' },
        default_margin: { type: Number, default: 10 },
    },
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
DistributorSchema.index({ user_id: 1 });
DistributorSchema.index({ company_name: 'text' });
DistributorSchema.index({ 'address.city': 1 });
DistributorSchema.index({ 'address.state': 1 });
DistributorSchema.index({ is_verified: 1 });
DistributorSchema.index({ is_active: 1 });

// Update timestamp
DistributorSchema.pre('save', async function () {
    this.updated_at = new Date();
});

const Distributor: Model<IDistributor> = mongoose.models.Distributor || mongoose.model<IDistributor>('Distributor', DistributorSchema);

export default Distributor;
