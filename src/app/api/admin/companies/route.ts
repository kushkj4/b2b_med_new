import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Company } from '@/lib/db/models';

// GET /api/admin/companies - List companies with search and pagination
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';
        const all = searchParams.get('all') === 'true'; // For dropdown - fetch all

        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { corporate: { $regex: search, $options: 'i' } },
            ];
        }

        if (type && (type === 'INDIAN' || type === 'MNC')) {
            query.type = type;
        }

        const total = await Company.countDocuments(query);

        // If fetching all for dropdown, return all companies with just id and name
        if (all) {
            const companies = await Company.find(query)
                .select('_id name')
                .sort({ name: 1 })
                .lean();

            return NextResponse.json({
                success: true,
                data: companies,
                total,
            });
        }

        const companies = await Company.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: companies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch companies' },
            { status: 500 }
        );
    }
}

// POST /api/admin/companies - Create a new company
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, corporate, type, website, email, phone } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Company name is required' },
                { status: 400 }
            );
        }

        const company = await Company.create({
            name,
            corporate: corporate || name,
            type: type || 'INDIAN',
            website,
            email,
            phone,
            divisions: [name],
            is_active: true,
            created_at: new Date(),
        });

        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        console.error('Error creating company:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create company' },
            { status: 500 }
        );
    }
}
