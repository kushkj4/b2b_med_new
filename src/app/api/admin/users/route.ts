import { NextRequest } from 'next/server';
import { AdminController } from '@/api/controllers/admin.controller';

export async function GET(request: NextRequest) {
    return AdminController.getUsers(request);
}

export async function POST(request: NextRequest) {
    return AdminController.createUser(request);
}
