import { NextRequest } from 'next/server';
import { productService } from '@/api/services/product.service';
import {
    successResponse,
    errorResponse,
    paginatedResponse,
    getPaginationParams,
    getSearchParams,
} from '@/api/utils/response';

class ProductController {
    /**
     * GET /api/products
     * Get products with pagination and filters
     */
    async getProducts(req: NextRequest) {
        try {
            const { page, limit } = getPaginationParams(req);
            const { search } = getSearchParams(req);

            const url = new URL(req.url);
            const filters = {
                search: search || undefined,
                company_id: url.searchParams.get('company_id') || undefined,
                therapy: url.searchParams.get('therapy') || undefined,
                drug_type: url.searchParams.get('drug_type') || undefined,
                drug_category: url.searchParams.get('drug_category') || undefined,
                is_active: url.searchParams.get('is_active')
                    ? url.searchParams.get('is_active') === 'true'
                    : undefined,
            };

            const { products, total } = await productService.getProducts(page, limit, filters);

            return paginatedResponse(products, page, limit, total);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get products';
            return errorResponse(message, 500);
        }
    }

    /**
     * GET /api/products/:id
     * Get product by ID
     */
    async getProduct(productId: string) {
        try {
            const product = await productService.getProductById(productId);

            if (!product) {
                return errorResponse('Product not found', 404);
            }

            return successResponse(product);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get product';
            return errorResponse(message, 500);
        }
    }

    /**
     * PATCH /api/products/:id
     * Update product status
     */
    async updateProduct(req: NextRequest, productId: string) {
        try {
            const body = await req.json();

            const result = await productService.updateProductStatus(productId, body.is_active);

            if (!result) {
                return errorResponse('Product not found', 404);
            }

            return successResponse(null, 'Product updated successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update product';
            return errorResponse(message, 400);
        }
    }

    /**
     * GET /api/products/search
     * Search products (autocomplete)
     */
    async searchProducts(req: NextRequest) {
        try {
            const url = new URL(req.url);
            const query = url.searchParams.get('q') || '';
            const limit = parseInt(url.searchParams.get('limit') || '10');

            if (!query || query.length < 2) {
                return successResponse([]);
            }

            const products = await productService.searchProducts(query, limit);

            return successResponse(products);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to search products';
            return errorResponse(message, 500);
        }
    }

    /**
     * GET /api/products/filters
     * Get filter options
     */
    async getFilters() {
        try {
            const filters = await productService.getFilterOptions();
            return successResponse(filters);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get filters';
            return errorResponse(message, 500);
        }
    }

    /**
     * GET /api/companies
     * Get companies list
     */
    async getCompanies(req: NextRequest) {
        try {
            const { page, limit } = getPaginationParams(req);
            const { search } = getSearchParams(req);

            const { companies, total } = await productService.getCompanies(page, limit, search);

            return paginatedResponse(companies, page, limit, total);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get companies';
            return errorResponse(message, 500);
        }
    }
}

export const productController = new ProductController();
