import { NextRequest } from 'next/server';
import { AdminController } from '@/api/controllers/admin.controller';

export async function GET(request: NextRequest) {
    return AdminController.getDistributors(request);
}
