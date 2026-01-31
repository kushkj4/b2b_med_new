// User roles
export type UserRole = 'admin' | 'distributor' | 'retailer';

// User interface
export interface IUser {
    _id?: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    is_active: boolean;
    email_verified: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}

// Company (Pharma Manufacturer)
export interface ICompany {
    _id?: string;
    name: string;
    corporate: string;
    type: 'INDIAN' | 'MNC';
    divisions: string[];
    is_active: boolean;
    created_at: Date;
}

// Product (Medicine Master)
export interface IProduct {
    _id?: string;
    sku: string;
    name: string;
    brand: string;
    mother_brand: string;
    company_id: string;
    company_name: string;
    therapy: string;
    super_group: string;
    sub_supergroup: string;
    group: string;
    class: string;
    drug_type: string;
    drug_category: string;
    subgroup: string;
    strength: string;
    pack: string;
    pack_unit: number;
    schedule: string;
    is_rx_required: boolean;
    nlem: string;
    acute_chronic: string;
    plain_combination: string;
    mrp: number;
    ptr: number;
    pts: number;
    brand_launch_date?: Date;
    sku_launch_date?: Date;
    is_active: boolean;
    created_at: Date;
}

// Distributor
export interface IDistributor {
    _id?: string;
    user_id: string;
    company_name: string;
    trade_name: string;
    gst_number: string;
    drug_license: {
        number: string;
        type: string;
        expiry: Date;
    };
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    phone: string;
    email: string;
    settings: {
        min_order_value: number;
        delivery_areas: string[];
        payment_terms: string;
        default_margin: number;
    };
    is_verified: boolean;
    is_active: boolean;
    verified_at?: Date;
    verified_by?: string;
    created_at: Date;
    updated_at: Date;
}

// Retailer
export interface IRetailer {
    _id?: string;
    user_id: string;
    store_name: string;
    legal_name: string;
    business_category: string;
    retailer_category: string;
    gst_number: string;
    pan?: string;
    drug_license_1: {
        number: string;
        type: string;
        start_date?: Date;
        expiry: Date;
        is_active: boolean;
    };
    drug_license_2?: {
        number: string;
        type: string;
        expiry: Date;
        is_active: boolean;
    };
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    phone: string;
    email: string;
    credit_limit: number;
    credit_used: number;
    credit_period: number;
    discount_percentage: number;
    is_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

// Distributor Inventory (Product-Distributor Mapping)
export interface IDistributorInventory {
    _id?: string;
    distributor_id: string;
    product_id: string;
    sku: string;
    product_name: string;
    brand: string;
    company_name: string;
    base_ptr: number;
    custom_ptr: number;
    margin_percentage: number;
    quantity: number;
    reserved_quantity: number;
    min_stock_level: number;
    batch_number: string;
    manufacturing_date?: Date;
    expiry_date: Date;
    is_active: boolean;
    is_in_stock: boolean;
    last_updated: Date;
    created_at: Date;
}

// Order Item
export interface IOrderItem {
    product_id: string;
    inventory_id: string;
    sku: string;
    product_name: string;
    brand: string;
    quantity: number;
    unit_price: number;
    total: number;
    batch_number?: string;
    expiry_date?: Date;
}

// Order Status
export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

// Order
export interface IOrder {
    _id?: string;
    order_number: string;
    retailer_id: string;
    distributor_id: string;
    items: IOrderItem[];
    item_count: number;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    status: OrderStatus;
    status_history: {
        status: string;
        changed_at: Date;
        changed_by: string;
        notes?: string;
    }[];
    notes?: string;
    internal_notes?: string;
    created_at: Date;
    updated_at: Date;
}

// Cart Item
export interface ICartItem {
    distributor_id: string;
    inventory_id: string;
    product_id: string;
    sku: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    added_at: Date;
}

// Cart
export interface ICart {
    _id?: string;
    retailer_id: string;
    items: ICartItem[];
    updated_at: Date;
    expires_at: Date;
}

// Audit Log
export interface IAuditLog {
    _id?: string;
    user_id: string;
    user_role: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: Record<string, unknown>;
    ip_address: string;
    user_agent: string;
    created_at: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
