import { NextRequest } from 'next/server';
import { AdminController } from '@/api/controllers/admin.controller';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return AdminController.getRetailerById(request, id);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return AdminController.updateRetailer(request, id);
}
