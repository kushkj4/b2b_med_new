/**
 * Role Configuration
 * Defines requirements for each user role including required fields and documents
 */

export type UserStatus =
    | 'pending_approval'
    | 'rejected'
    | 'pending_documents'
    | 'pending_verification'
    | 'active';

export interface DocumentRequirement {
    key: string;
    label: string;
    required: boolean;
    description?: string;
}

export interface FieldRequirement {
    key: string;
    label: string;
    type: 'text' | 'date' | 'number' | 'select';
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

export interface RoleConfig {
    displayName: string;
    description: string;
    basicFields: FieldRequirement[];
    requiredDocuments: DocumentRequirement[];
    licenseFields: FieldRequirement[];
}

export const roleConfig: Record<'distributor' | 'retailer', RoleConfig> = {
    distributor: {
        displayName: 'Distributor',
        description: 'Wholesale medicine distributor',
        basicFields: [
            { key: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Your company name' },
            { key: 'trade_name', label: 'Trade Name', type: 'text', required: false, placeholder: 'Trading as (optional)' },
            { key: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '10-digit mobile number' },
            { key: 'gst_number', label: 'GST Number', type: 'text', required: false, placeholder: 'GSTIN (if registered)' },
            { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'City' },
            { key: 'state', label: 'State', type: 'text', required: true, placeholder: 'State' },
        ],
        requiredDocuments: [
            { key: 'drug_license', label: 'Drug License (Form 20B/21B)', required: true, description: 'Valid wholesale drug license' },
            { key: 'gst_certificate', label: 'GST Certificate', required: true, description: 'GST registration certificate' },
            { key: 'pan_card', label: 'PAN Card', required: true, description: 'Company PAN card' },
            { key: 'trade_license', label: 'Trade License', required: false, description: 'Municipal trade license (optional)' },
        ],
        licenseFields: [
            { key: 'drug_license_number', label: 'Drug License Number', type: 'text', required: true, placeholder: 'e.g., 20B-MH-123456' },
            {
                key: 'drug_license_type', label: 'License Type', type: 'select', required: true, options: [
                    { value: 'wholesale', label: 'Wholesale (Form 20B)' },
                    { value: 'retail_wholesale', label: 'Retail + Wholesale (Form 21B)' },
                ]
            },
            { key: 'drug_license_expiry', label: 'License Expiry Date', type: 'date', required: true },
            { key: 'gst_number', label: 'GST Number', type: 'text', required: true, placeholder: 'GSTIN' },
        ],
    },
    retailer: {
        displayName: 'Retailer',
        description: 'Pharmacy / Medical store',
        basicFields: [
            { key: 'store_name', label: 'Store/Pharmacy Name', type: 'text', required: true, placeholder: 'Your pharmacy name' },
            { key: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '10-digit mobile number' },
            { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'City' },
            { key: 'state', label: 'State', type: 'text', required: true, placeholder: 'State' },
        ],
        requiredDocuments: [
            { key: 'drug_license', label: 'Drug License (Form 20/21)', required: true, description: 'Valid retail drug license' },
            { key: 'gst_certificate', label: 'GST Certificate', required: false, description: 'GST registration (if applicable)' },
            { key: 'shop_photo', label: 'Shop Photo', required: true, description: 'Photo of your pharmacy storefront' },
        ],
        licenseFields: [
            { key: 'drug_license_number', label: 'Drug License Number', type: 'text', required: true, placeholder: 'e.g., 20-MH-123456' },
            {
                key: 'drug_license_type', label: 'License Type', type: 'select', required: true, options: [
                    { value: 'retail', label: 'Retail (Form 20)' },
                    { value: 'retail_restricted', label: 'Retail Restricted (Form 21)' },
                ]
            },
            { key: 'drug_license_expiry', label: 'License Expiry Date', type: 'date', required: true },
        ],
    },
};

export const userStatusConfig: Record<UserStatus, { label: string; color: string; description: string }> = {
    pending_approval: {
        label: 'Pending Approval',
        color: 'yellow',
        description: 'Waiting for admin to review application',
    },
    rejected: {
        label: 'Rejected',
        color: 'red',
        description: 'Application was rejected',
    },
    pending_documents: {
        label: 'Pending Documents',
        color: 'orange',
        description: 'Approved, waiting for document upload',
    },
    pending_verification: {
        label: 'Pending Verification',
        color: 'blue',
        description: 'Documents submitted, awaiting verification',
    },
    active: {
        label: 'Active',
        color: 'green',
        description: 'Fully verified and active',
    },
};
