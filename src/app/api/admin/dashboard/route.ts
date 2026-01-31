import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User, Product, Company, Distributor, Retailer } from '@/lib/db/models';

// GET /api/admin/dashboard - Get dashboard stats
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const [
            totalUsers,
            totalProducts,
            totalCompanies,
            totalDistributors,
            totalRetailers,
            pendingApprovals,
            activeUsers,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Company.countDocuments(),
            Distributor.countDocuments(),
            Retailer.countDocuments(),
            User.countDocuments({ status: { $in: ['pending_approval', 'pending_verification', 'pending_documents'] } }),
            User.countDocuments({ status: 'active' }),
        ]);

        // Get recent users
        const recentUsers = await User.find()
            .select('name email role status created_at')
            .sort({ created_at: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalProducts,
                    totalCompanies,
                    totalDistributors,
                    totalRetailers,
                    totalUsers,
                    pendingApprovals,
                    activeUsers,
                },
                recentUsers,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard' },
            { status: 500 }
        );
    }
}
