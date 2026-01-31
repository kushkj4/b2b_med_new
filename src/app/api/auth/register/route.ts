import { NextRequest } from 'next/server';
import { AuthController } from '@/api/controllers/auth.controller';

export async function POST(request: NextRequest) {
    return AuthController.register(request);
}
