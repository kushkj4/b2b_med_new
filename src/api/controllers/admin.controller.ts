import { NextRequest } from 'next/server';
import { AdminService } from '@/api/services/admin.service';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/api/utils/response';

export class AdminController {
    // ==================== DASHBOARD ====================

    static async getDashboard(request: NextRequest) {
        try {
            const stats = await AdminService.getDashboardStats();
            return successResponse(stats);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch dashboard', 500);
        }
    }

    // ==================== USERS ====================

    static async getUsers(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url);
            const pagination = getPaginationParams(request);

            const filters = {
                role: searchParams.get('role') || undefined,
                status: searchParams.get('status') as any || undefined,
                search: searchParams.get('search') || undefined,
                is_active: searchParams.get('is_active') === 'true' ? true :
                    searchParams.get('is_active') === 'false' ? false : undefined,
            };

            const result = await AdminService.getUsers(filters, pagination);
            return paginatedResponse(result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch users', 500);
        }
    }

    static async getUserById(request: NextRequest, id: string) {
        try {
            const user = await AdminService.getUserById(id);
            return successResponse(user);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'User not found', 404);
        }
    }

    static async createUser(request: NextRequest) {
        try {
            const body = await request.json();

            if (!body.email || !body.password || !body.name || !body.role) {
                return errorResponse('Email, password, name, and role are required', 400);
            }

            const user = await AdminService.createUser(body);
            return successResponse(user, 'User created successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create user', 400);
        }
    }

    static async updateUser(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const user = await AdminService.updateUser(id, body);
            return successResponse(user, 'User updated successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update user', 400);
        }
    }

    static async deleteUser(request: NextRequest, id: string) {
        try {
            await AdminService.deleteUser(id);
            return successResponse(null, 'User deleted successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to delete user', 400);
        }
    }

    static async approveUser(request: NextRequest, id: string) {
        try {
            // Get admin ID from session (would come from auth)
            const adminId = 'system'; // TODO: Get from session
            const user = await AdminService.approveUser(id, adminId);
            return successResponse(user, 'User approved successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to approve user', 400);
        }
    }

    static async rejectUser(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const reason = body.reason || 'Application does not meet requirements';
            const user = await AdminService.rejectUser(id, reason);
            return successResponse(user, 'User rejected');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to reject user', 400);
        }
    }

    // ==================== DISTRIBUTORS ====================

    static async getDistributors(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url);
            const pagination = getPaginationParams(request);

            const filters = {
                search: searchParams.get('search') || undefined,
                city: searchParams.get('city') || undefined,
                is_verified: searchParams.get('is_verified') === 'true' ? true :
                    searchParams.get('is_verified') === 'false' ? false : undefined,
                is_active: searchParams.get('is_active') === 'true' ? true :
                    searchParams.get('is_active') === 'false' ? false : undefined,
            };

            const result = await AdminService.getDistributors(filters, pagination);
            return paginatedResponse(result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch distributors', 500);
        }
    }

    static async getDistributorById(request: NextRequest, id: string) {
        try {
            const distributor = await AdminService.getDistributorById(id);
            return successResponse(distributor);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Distributor not found', 404);
        }
    }

    static async updateDistributor(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const distributor = await AdminService.updateDistributor(id, body);
            return successResponse(distributor, 'Distributor updated successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update distributor', 400);
        }
    }

    static async verifyDistributor(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const adminId = 'system'; // TODO: Get from session
            const distributor = await AdminService.verifyDistributor(id, adminId, body.approved, body.notes);
            return successResponse(distributor, body.approved ? 'Distributor verified' : 'Verification rejected');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to verify distributor', 400);
        }
    }

    // ==================== RETAILERS ====================

    static async getRetailers(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url);
            const pagination = getPaginationParams(request);

            const filters = {
                search: searchParams.get('search') || undefined,
                city: searchParams.get('city') || undefined,
                is_verified: searchParams.get('is_verified') === 'true' ? true :
                    searchParams.get('is_verified') === 'false' ? false : undefined,
                is_active: searchParams.get('is_active') === 'true' ? true :
                    searchParams.get('is_active') === 'false' ? false : undefined,
            };

            const result = await AdminService.getRetailers(filters, pagination);
            return paginatedResponse(result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch retailers', 500);
        }
    }

    static async getRetailerById(request: NextRequest, id: string) {
        try {
            const retailer = await AdminService.getRetailerById(id);
            return successResponse(retailer);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Retailer not found', 404);
        }
    }

    static async updateRetailer(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const retailer = await AdminService.updateRetailer(id, body);
            return successResponse(retailer, 'Retailer updated successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update retailer', 400);
        }
    }

    static async verifyRetailer(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const adminId = 'system'; // TODO: Get from session
            const retailer = await AdminService.verifyRetailer(id, adminId, body.approved, body.notes);
            return successResponse(retailer, body.approved ? 'Retailer verified' : 'Verification rejected');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to verify retailer', 400);
        }
    }

    // ==================== PRODUCTS ====================

    static async getProducts(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url);
            const pagination = getPaginationParams(request);

            const filters = {
                search: searchParams.get('search') || undefined,
                company_id: searchParams.get('company_id') || undefined,
                therapy: searchParams.get('therapy') || undefined,
                drug_type: searchParams.get('drug_type') || undefined,
                is_active: searchParams.get('is_active') === 'true' ? true :
                    searchParams.get('is_active') === 'false' ? false : undefined,
            };

            const result = await AdminService.getProducts(filters, pagination);
            return paginatedResponse(result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch products', 500);
        }
    }

    static async getProductById(request: NextRequest, id: string) {
        try {
            const product = await AdminService.getProductById(id);
            return successResponse(product);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Product not found', 404);
        }
    }

    static async createProduct(request: NextRequest) {
        try {
            const body = await request.json();
            const product = await AdminService.createProduct(body);
            return successResponse(product, 'Product created successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create product', 400);
        }
    }

    static async updateProduct(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const product = await AdminService.updateProduct(id, body);
            return successResponse(product, 'Product updated successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update product', 400);
        }
    }

    static async deleteProduct(request: NextRequest, id: string) {
        try {
            await AdminService.deleteProduct(id);
            return successResponse(null, 'Product deleted successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to delete product', 400);
        }
    }

    // ==================== COMPANIES ====================

    static async getCompanies(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url);
            const pagination = getPaginationParams(request);

            const filters = {
                search: searchParams.get('search') || undefined,
                type: searchParams.get('type') as 'INDIAN' | 'MNC' | undefined,
                is_active: searchParams.get('is_active') === 'true' ? true :
                    searchParams.get('is_active') === 'false' ? false : undefined,
            };

            const result = await AdminService.getCompanies(filters, pagination);
            return paginatedResponse(result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch companies', 500);
        }
    }

    static async getCompanyById(request: NextRequest, id: string) {
        try {
            const company = await AdminService.getCompanyById(id);
            return successResponse(company);
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Company not found', 404);
        }
    }

    static async createCompany(request: NextRequest) {
        try {
            const body = await request.json();
            const company = await AdminService.createCompany(body);
            return successResponse(company, 'Company created successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create company', 400);
        }
    }

    static async updateCompany(request: NextRequest, id: string) {
        try {
            const body = await request.json();
            const company = await AdminService.updateCompany(id, body);
            return successResponse(company, 'Company updated successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update company', 400);
        }
    }

    static async deleteCompany(request: NextRequest, id: string) {
        try {
            await AdminService.deleteCompany(id);
            return successResponse(null, 'Company deleted successfully');
        } catch (error) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to delete company', 400);
        }
    }
}
