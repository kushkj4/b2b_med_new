import dbConnect from '@/lib/db/mongodb';
import { Product, Company } from '@/lib/db/models';
import { IProduct, ICompany } from '@/types';

interface ProductFilters {
    search?: string;
    company_id?: string;
    therapy?: string;
    drug_type?: string;
    drug_category?: string;
    is_active?: boolean;
}

interface ProductListResult {
    products: IProduct[];
    total: number;
}

interface CompanyListResult {
    companies: ICompany[];
    total: number;
}

class ProductService {
    /**
     * Get products with pagination and filters
     */
    async getProducts(
        page: number,
        limit: number,
        filters: ProductFilters
    ): Promise<ProductListResult> {
        await dbConnect();

        const query: Record<string, unknown> = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { brand: { $regex: filters.search, $options: 'i' } },
                { sku: { $regex: filters.search, $options: 'i' } },
                { company_name: { $regex: filters.search, $options: 'i' } },
            ];
        }

        if (filters.company_id) {
            query.company_id = filters.company_id;
        }

        if (filters.therapy) {
            query.therapy = filters.therapy;
        }

        if (filters.drug_type) {
            query.drug_type = filters.drug_type;
        }

        if (filters.drug_category) {
            query.drug_category = filters.drug_category;
        }

        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query).sort({ brand: 1, name: 1 }).skip(skip).limit(limit),
            Product.countDocuments(query),
        ]);

        return {
            products: products.map((p) => ({
                _id: p._id.toString(),
                sku: p.sku,
                name: p.name,
                brand: p.brand,
                mother_brand: p.mother_brand,
                company_id: p.company_id?.toString(),
                company_name: p.company_name,
                therapy: p.therapy,
                super_group: p.super_group,
                sub_supergroup: p.sub_supergroup,
                group: p.group,
                class: p.class,
                drug_type: p.drug_type,
                drug_category: p.drug_category,
                subgroup: p.subgroup,
                strength: p.strength,
                pack: p.pack,
                pack_unit: p.pack_unit,
                schedule: p.schedule,
                is_rx_required: p.is_rx_required,
                nlem: p.nlem,
                acute_chronic: p.acute_chronic,
                plain_combination: p.plain_combination,
                mrp: p.mrp,
                ptr: p.ptr,
                pts: p.pts,
                brand_launch_date: p.brand_launch_date,
                sku_launch_date: p.sku_launch_date,
                is_active: p.is_active,
                created_at: p.created_at,
            })),
            total,
        };
    }

    /**
     * Get product by ID
     */
    async getProductById(productId: string): Promise<IProduct | null> {
        await dbConnect();

        const p = await Product.findById(productId);
        if (!p) return null;

        return {
            _id: p._id.toString(),
            sku: p.sku,
            name: p.name,
            brand: p.brand,
            mother_brand: p.mother_brand,
            company_id: p.company_id?.toString(),
            company_name: p.company_name,
            therapy: p.therapy,
            super_group: p.super_group,
            sub_supergroup: p.sub_supergroup,
            group: p.group,
            class: p.class,
            drug_type: p.drug_type,
            drug_category: p.drug_category,
            subgroup: p.subgroup,
            strength: p.strength,
            pack: p.pack,
            pack_unit: p.pack_unit,
            schedule: p.schedule,
            is_rx_required: p.is_rx_required,
            nlem: p.nlem,
            acute_chronic: p.acute_chronic,
            plain_combination: p.plain_combination,
            mrp: p.mrp,
            ptr: p.ptr,
            pts: p.pts,
            brand_launch_date: p.brand_launch_date,
            sku_launch_date: p.sku_launch_date,
            is_active: p.is_active,
            created_at: p.created_at,
        };
    }

    /**
     * Update product status
     */
    async updateProductStatus(productId: string, is_active: boolean): Promise<boolean> {
        await dbConnect();

        const result = await Product.findByIdAndUpdate(productId, { is_active });
        return !!result;
    }

    /**
     * Search products (for autocomplete)
     */
    async searchProducts(query: string, limit: number = 10): Promise<IProduct[]> {
        await dbConnect();

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { sku: { $regex: query, $options: 'i' } },
            ],
            is_active: true,
        })
            .limit(limit)
            .select('sku name brand company_name mrp ptr');

        return products.map((p) => ({
            _id: p._id.toString(),
            sku: p.sku,
            name: p.name,
            brand: p.brand,
            mother_brand: '',
            company_id: '',
            company_name: p.company_name,
            therapy: '',
            super_group: '',
            sub_supergroup: '',
            group: '',
            class: '',
            drug_type: '',
            drug_category: '',
            subgroup: '',
            strength: '',
            pack: '',
            pack_unit: 0,
            schedule: '',
            is_rx_required: false,
            nlem: '',
            acute_chronic: '',
            plain_combination: '',
            mrp: p.mrp,
            ptr: p.ptr,
            pts: 0,
            is_active: true,
            created_at: new Date(),
        }));
    }

    /**
     * Get companies with pagination
     */
    async getCompanies(
        page: number,
        limit: number,
        search?: string
    ): Promise<CompanyListResult> {
        await dbConnect();

        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { corporate: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [companies, total] = await Promise.all([
            Company.find(query).sort({ name: 1 }).skip(skip).limit(limit),
            Company.countDocuments(query),
        ]);

        return {
            companies: companies.map((c) => ({
                _id: c._id.toString(),
                name: c.name,
                corporate: c.corporate,
                type: c.type as 'INDIAN' | 'MNC',
                divisions: c.divisions,
                is_active: c.is_active,
                created_at: c.created_at,
            })),
            total,
        };
    }

    /**
     * Get filter options (for dropdowns)
     */
    async getFilterOptions(): Promise<{
        therapies: string[];
        drugTypes: string[];
        drugCategories: string[];
    }> {
        await dbConnect();

        const [therapies, drugTypes, drugCategories] = await Promise.all([
            Product.distinct('therapy'),
            Product.distinct('drug_type'),
            Product.distinct('drug_category'),
        ]);

        return {
            therapies: therapies.filter(Boolean).sort(),
            drugTypes: drugTypes.filter(Boolean).sort(),
            drugCategories: drugCategories.filter(Boolean).sort(),
        };
    }
}

export const productService = new ProductService();
