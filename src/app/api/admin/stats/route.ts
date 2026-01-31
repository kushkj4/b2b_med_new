import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User, Product, Company, Distributor, Retailer } from '@/lib/db/models';

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
    try {
        await dbConnect();

        const [
            totalUsers,
            totalProducts,
            totalCompanies,
            totalDistributors,
            totalRetailers,
            pendingApprovals,
            pendingVerification,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Company.countDocuments(),
            Distributor.countDocuments(),
            Retailer.countDocuments(),
            User.countDocuments({ status: 'pending_approval' }),
            User.countDocuments({ status: 'pending_verification' }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalCompanies,
                totalDistributors,
                totalRetailers,
                pendingApprovals,
                pendingVerification,
            },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
