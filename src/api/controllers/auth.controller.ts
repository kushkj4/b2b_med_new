/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/api/services/auth.service';
import { successResponse, errorResponse } from '@/api/utils/response';

export class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user (Step 1)
     */
    static async register(request: NextRequest) {
        try {
            const body = await request.json();

            // Validation
            if (!body.email || !body.password || !body.name || !body.role) {
                return errorResponse('Email, password, name, and role are required', 400);
            }

            if (!['distributor', 'retailer'].includes(body.role)) {
                return errorResponse('Invalid role. Must be distributor or retailer', 400);
            }

            if (body.password.length < 6) {
                return errorResponse('Password must be at least 6 characters', 400);
            }

            const user = await AuthService.register(body);

            return successResponse(user, 'Registration successful. Your application is pending approval.');
        } catch (error) {
            console.error('Registration error:', error);
            return errorResponse(
                error instanceof Error ? error.message : 'Registration failed',
                400
            );
        }
    }

    /**
     * POST /api/auth/approve/:id
     * Approve a user application (Admin only)
     */
    static async approveUser(request: NextRequest, userId: string, adminId: string) {
        try {
            const user = await AuthService.approveUser(userId, adminId);
            return successResponse(user, 'User approved successfully');
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Approval failed',
                400
            );
        }
    }

    /**
     * POST /api/auth/reject/:id
     * Reject a user application (Admin only)
     */
    static async rejectUser(request: NextRequest, userId: string, adminId: string) {
        try {
            const body = await request.json();
            const reason = body.reason || 'Application does not meet requirements';

            const user = await AuthService.rejectUser(userId, adminId, reason);
            return successResponse(user, 'User rejected');
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Rejection failed',
                400
            );
        }
    }
}
