import { NextRequest } from 'next/server';
import { productController } from '@/api/controllers/product.controller';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return productController.getProduct(id);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return productController.updateProduct(request, id);
}
