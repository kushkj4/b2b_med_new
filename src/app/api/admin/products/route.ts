import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Product, Company } from '@/lib/db/models';

// GET /api/admin/products - List products with search and pagination
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const company = searchParams.get('company') || '';

        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { company_name: { $regex: search, $options: 'i' } },
            ];
        }

        if (company) {
            query.company_id = company;
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, brand, sku, company_id, company_name, therapy, drug_type, packaging, mrp } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Product name is required' },
                { status: 400 }
            );
        }

        // If company_id provided, look up the company name
        let finalCompanyName = company_name;
        if (company_id && !company_name) {
            const company = await Company.findById(company_id);
            if (company) {
                finalCompanyName = company.name;
            }
        }

        const product = await Product.create({
            name,
            sku: sku || name,
            brand: brand || name,
            mother_brand: brand || name,
            company_id,
            company_name: finalCompanyName,
            therapy,
            drug_type,
            pack: packaging,
            mrp: mrp || 0,
            ptr: (mrp || 0) * 0.8,
            pts: (mrp || 0) * 0.7,
            is_active: true,
            created_at: new Date(),
        });

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
