import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Company } from '@/lib/db/models';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/admin/companies/[id] - Get single company
export async function GET(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = await params;

        const company = await Company.findById(id).lean();
        if (!company) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        console.error('Error fetching company:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch company' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/companies/[id] - Update company
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const company = await Company.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        ).lean();

        if (!company) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        console.error('Error updating company:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update company' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/companies/[id] - Delete company
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = await params;

        const company = await Company.findByIdAndDelete(id);
        if (!company) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Company deleted' });
    } catch (error) {
        console.error('Error deleting company:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete company' },
            { status: 500 }
        );
    }
}
