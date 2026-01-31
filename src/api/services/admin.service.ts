/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/db/mongodb';
import bcrypt from 'bcryptjs';
import { User, Distributor, Retailer, Product, Company, Order } from '@/lib/db/models';
import { UserStatus } from '@/lib/config/role-config';
import mongoose from 'mongoose';

interface PaginationParams {
    page: number;
    limit: number;
}

interface UserFilters {
    role?: string;
    status?: UserStatus;
    search?: string;
    is_active?: boolean;
}

interface ProductFilters {
    search?: string;
    company_id?: string;
    therapy?: string;
    drug_type?: string;
    is_active?: boolean;
}

interface CompanyFilters {
    search?: string;
    type?: 'INDIAN' | 'MNC';
    is_active?: boolean;
}

export class AdminService {
    // ==================== DASHBOARD ====================

    static async getDashboardStats() {
        await dbConnect();

        const [
            totalUsers,
            totalDistributors,
            totalRetailers,
            totalProducts,
            totalCompanies,
            totalOrders,
            activeUsers,
            pendingApprovals,
            pendingVerifications,
            recentUsers,
        ] = await Promise.all([
            User.countDocuments(),
            Distributor.countDocuments(),
            Retailer.countDocuments(),
            Product.countDocuments(),
            Company.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ is_active: true, status: 'active' }),
            User.countDocuments({ status: 'pending_approval' }),
            User.countDocuments({ status: 'pending_verification' }),
            User.find()
                .sort({ created_at: -1 })
                .limit(5)
                .select('name email role status created_at')
                .lean(),
        ]);

        return {
            totalUsers,
            totalDistributors,
            totalRetailers,
            totalProducts,
            totalCompanies,
            totalOrders,
            activeUsers,
            pendingApprovals,
            pendingVerifications,
            verifiedDistributors: await Distributor.countDocuments({ is_verified: true }),
            verifiedRetailers: await Retailer.countDocuments({ is_verified: true }),
            pendingOrders: await Order.countDocuments({ status: 'pending' }),
            recentUsers,
        };
    }

    // ==================== USERS ====================

    static async getUsers(filters: UserFilters, pagination: PaginationParams) {
        await dbConnect();

        const query: any = {};

        if (filters.role) {
            query.role = filters.role;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (typeof filters.is_active === 'boolean') {
            query.is_active = filters.is_active;
        }
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ created_at: -1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .select('-password')
                .lean(),
            User.countDocuments(query),
        ]);

        return {
            data: users,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async getUserById(id: string) {
        await dbConnect();

        const user = await User.findById(id).select('-password').lean();
        if (!user) {
            throw new Error('User not found');
        }

        // Get role-specific profile
        let profile = null;
        if (user.role === 'distributor') {
            profile = await Distributor.findOne({ user_id: id }).lean();
        } else if (user.role === 'retailer') {
            profile = await Retailer.findOne({ user_id: id }).lean();
        }

        return { ...user, profile };
    }

    static async createUser(data: any) {
        await dbConnect();


        // Check if email exists
        const existing = await User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await User.create({
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
            role: data.role,
            phone: data.phone,
            status: data.role === 'admin' ? 'active' : 'pending_approval',
            is_active: true,
        });

        return user;
    }

    static async updateUser(id: string, data: any) {
        await dbConnect();

        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Update allowed fields
        const allowedFields = ['name', 'phone', 'is_active', 'status'];
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                (user as any)[field] = data[field];
            }
        });

        await user.save();
        return user;
    }

    static async deleteUser(id: string) {
        await dbConnect();

        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Soft delete
        user.is_active = false;
        user.status = 'rejected';
        await user.save();

        return user;
    }

    static async approveUser(id: string, adminId: string) {
        await dbConnect();

        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.status !== 'pending_approval') {
            throw new Error('User is not pending approval');
        }

        user.status = 'pending_documents';
        user.approved_at = new Date();
        user.approved_by = new mongoose.Types.ObjectId(adminId);
        await user.save();

        return user;
    }

    static async rejectUser(id: string, reason: string) {
        await dbConnect();

        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        user.status = 'rejected';
        user.rejection_reason = reason;
        await user.save();

        return user;
    }

    // ==================== DISTRIBUTORS ====================

    static async getDistributors(filters: any, pagination: PaginationParams) {
        await dbConnect();

        const query: any = {};

        if (typeof filters.is_verified === 'boolean') {
            query.is_verified = filters.is_verified;
        }
        if (typeof filters.is_active === 'boolean') {
            query.is_active = filters.is_active;
        }
        if (filters.search) {
            query.$or = [
                { company_name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
            ];
        }
        if (filters.city) {
            query['address.city'] = { $regex: filters.city, $options: 'i' };
        }

        const [distributors, total] = await Promise.all([
            Distributor.find(query)
                .sort({ created_at: -1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .populate('user_id', 'name email status')
                .lean(),
            Distributor.countDocuments(query),
        ]);

        return {
            data: distributors,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async getDistributorById(id: string) {
        await dbConnect();

        const distributor = await Distributor.findById(id)
            .populate('user_id', 'name email status phone created_at')
            .lean();

        if (!distributor) {
            throw new Error('Distributor not found');
        }

        return distributor;
    }

    static async updateDistributor(id: string, data: any) {
        await dbConnect();

        const distributor = await Distributor.findById(id);
        if (!distributor) {
            throw new Error('Distributor not found');
        }

        // Update allowed fields
        Object.keys(data).forEach((key) => {
            if (data[key] !== undefined) {
                (distributor as any)[key] = data[key];
            }
        });

        await distributor.save();
        return distributor;
    }

    static async verifyDistributor(id: string, adminId: string, approved: boolean, notes?: string) {
        await dbConnect();

        const distributor = await Distributor.findById(id);
        if (!distributor) {
            throw new Error('Distributor not found');
        }

        const user = await User.findById(distributor.user_id);
        if (!user) {
            throw new Error('User not found');
        }

        distributor.is_verified = approved;
        distributor.verification_notes = notes;
        await distributor.save();

        if (approved) {
            user.status = 'active';
        } else {
            user.status = 'pending_documents';
        }
        await user.save();

        return distributor;
    }

    // ==================== RETAILERS ====================

    static async getRetailers(filters: any, pagination: PaginationParams) {
        await dbConnect();

        const query: any = {};

        if (typeof filters.is_verified === 'boolean') {
            query.is_verified = filters.is_verified;
        }
        if (typeof filters.is_active === 'boolean') {
            query.is_active = filters.is_active;
        }
        if (filters.search) {
            query.$or = [
                { store_name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
            ];
        }
        if (filters.city) {
            query['address.city'] = { $regex: filters.city, $options: 'i' };
        }

        const [retailers, total] = await Promise.all([
            Retailer.find(query)
                .sort({ created_at: -1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .populate('user_id', 'name email status')
                .lean(),
            Retailer.countDocuments(query),
        ]);

        return {
            data: retailers,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async getRetailerById(id: string) {
        await dbConnect();

        const retailer = await Retailer.findById(id)
            .populate('user_id', 'name email status phone created_at')
            .lean();

        if (!retailer) {
            throw new Error('Retailer not found');
        }

        return retailer;
    }

    static async updateRetailer(id: string, data: any) {
        await dbConnect();

        const retailer = await Retailer.findById(id);
        if (!retailer) {
            throw new Error('Retailer not found');
        }

        Object.keys(data).forEach((key) => {
            if (data[key] !== undefined) {
                (retailer as any)[key] = data[key];
            }
        });

        await retailer.save();
        return retailer;
    }

    static async verifyRetailer(id: string, adminId: string, approved: boolean, notes?: string) {
        await dbConnect();

        const retailer = await Retailer.findById(id);
        if (!retailer) {
            throw new Error('Retailer not found');
        }

        const user = await User.findById(retailer.user_id);
        if (!user) {
            throw new Error('User not found');
        }

        retailer.is_verified = approved;
        retailer.verification_notes = notes;
        await retailer.save();

        if (approved) {
            user.status = 'active';
        } else {
            user.status = 'pending_documents';
        }
        await user.save();

        return retailer;
    }

    // ==================== PRODUCTS ====================

    static async getProducts(filters: ProductFilters, pagination: PaginationParams) {
        await dbConnect();

        const query: any = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { brand: { $regex: filters.search, $options: 'i' } },
                { sku: { $regex: filters.search, $options: 'i' } },
                { company_name: { $regex: filters.search, $options: 'i' } },
            ];
        }
        if (filters.company_id) {
            query.company_id = filters.company_id;
        }
        if (filters.therapy) {
            query.therapy = filters.therapy;
        }
        if (filters.drug_type) {
            query.drug_type = filters.drug_type;
        }
        if (typeof filters.is_active === 'boolean') {
            query.is_active = filters.is_active;
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ name: 1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return {
            data: products,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async getProductById(id: string) {
        await dbConnect();

        const product = await Product.findById(id).lean();
        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }

    static async createProduct(data: any) {
        await dbConnect();

        const product = await Product.create(data);
        return product;
    }

    static async updateProduct(id: string, data: any) {
        await dbConnect();

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }

    static async deleteProduct(id: string) {
        await dbConnect();

        const product = await Product.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }

        product.is_active = false;
        await product.save();

        return product;
    }

    // ==================== COMPANIES ====================

    static async getCompanies(filters: CompanyFilters, pagination: PaginationParams) {
        await dbConnect();

        const query: any = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { corporate: { $regex: filters.search, $options: 'i' } },
            ];
        }
        if (filters.type) {
            query.type = filters.type;
        }
        if (typeof filters.is_active === 'boolean') {
            query.is_active = filters.is_active;
        }

        const [companies, total] = await Promise.all([
            Company.find(query)
                .sort({ name: 1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .lean(),
            Company.countDocuments(query),
        ]);

        return {
            data: companies,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async getCompanyById(id: string) {
        await dbConnect();

        const company = await Company.findById(id).lean();
        if (!company) {
            throw new Error('Company not found');
        }

        // Get product count
        const productCount = await Product.countDocuments({ company_id: id });

        return { ...company, productCount };
    }

    static async createCompany(data: any) {
        await dbConnect();

        const company = await Company.create(data);
        return company;
    }

    static async updateCompany(id: string, data: any) {
        await dbConnect();

        const company = await Company.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        if (!company) {
            throw new Error('Company not found');
        }

        return company;
    }

    static async deleteCompany(id: string) {
        await dbConnect();

        const company = await Company.findById(id);
        if (!company) {
            throw new Error('Company not found');
        }

        company.is_active = false;
        await company.save();

        return company;
    }
}
