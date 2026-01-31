import { NextRequest } from 'next/server';
import { productController } from '@/api/controllers/product.controller';

export async function GET(request: NextRequest) {
    return productController.searchProducts(request);
}
