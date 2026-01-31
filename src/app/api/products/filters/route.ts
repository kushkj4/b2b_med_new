import { productController } from '@/api/controllers/product.controller';

export async function GET() {
    return productController.getFilters();
}
