import { NextRequest } from 'next/server';
import { AdminController } from '@/api/controllers/admin.controller';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return AdminController.approveUser(request, id);
}
