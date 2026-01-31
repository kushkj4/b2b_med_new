import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse } from '@/types';

// Standard API response helper
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        message,
    });
}

// Paginated response helper
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): NextResponse<PaginatedResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

// Error response helper
export function errorResponse(
    error: string,
    status: number = 400
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}

// Parse pagination params from request
export function getPaginationParams(req: NextRequest): { page: number; limit: number; skip: number } {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

// Parse search params
export function getSearchParams(req: NextRequest): { search: string; sortBy: string; sortOrder: 1 | -1 } {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    return { search, sortBy, sortOrder };
}

// Validate required fields
export function validateRequired(
    body: Record<string, unknown>,
    fields: string[]
): string | null {
    for (const field of fields) {
        if (!body[field]) {
            return `${field} is required`;
        }
    }
    return null;
}
