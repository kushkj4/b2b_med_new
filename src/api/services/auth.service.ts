import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import { User, Distributor, Retailer } from '@/lib/db/models';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role: 'distributor' | 'retailer';
    phone?: string;
    // Distributor fields
    company_name?: string;
    trade_name?: string;
    gst_number?: string;
    // Retailer fields
    store_name?: string;
    // Common
    city?: string;
    state?: string;
}

export class AuthService {
    /**
     * Register a new user (Step 1 - Basic info, status: pending_approval)
     */
    static async register(input: RegisterInput) {
        await dbConnect();

        // Check if email exists
        const existingUser = await User.findOne({ email: input.email.toLowerCase() });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Validate role-specific fields
        if (input.role === 'distributor' && !input.company_name) {
            throw new Error('Company name is required for distributors');
        }
        if (input.role === 'retailer' && !input.store_name) {
            throw new Error('Store name is required for retailers');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 12);

        // Create user with pending_approval status
        const user = await User.create({
            email: input.email.toLowerCase(),
            password: hashedPassword,
            name: input.name,
            role: input.role,
            phone: input.phone,
            status: 'pending_approval',
            is_active: true,
            email_verified: false,
        });

        // Create role-specific profile
        if (input.role === 'distributor') {
            await Distributor.create({
                user_id: user._id,
                company_name: input.company_name,
                trade_name: input.trade_name,
                gst_number: input.gst_number,
                phone: input.phone,
                email: input.email.toLowerCase(),
                address: {
                    city: input.city,
                    state: input.state,
                },
                is_verified: false,
                is_active: true,
            });
        } else if (input.role === 'retailer') {
            await Retailer.create({
                user_id: user._id,
                store_name: input.store_name,
                phone: input.phone,
                email: input.email.toLowerCase(),
                address: {
                    city: input.city,
                    state: input.state,
                },
                is_verified: false,
                is_active: true,
            });
        }

        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
        };
    }

    /**
     * Approve a user application
     */
    static async approveUser(userId: string, adminId: string) {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.status !== 'pending_approval') {
            throw new Error('User is not pending approval');
        }

        user.status = 'pending_documents';
        user.approved_at = new Date();
        user.approved_by = adminId as any;
        await user.save();

        // TODO: Send approval email

        return user;
    }

    /**
     * Reject a user application
     */
    static async rejectUser(userId: string, adminId: string, reason: string) {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.status !== 'pending_approval') {
            throw new Error('User is not pending approval');
        }

        user.status = 'rejected';
        user.rejection_reason = reason;
        await user.save();

        // TODO: Send rejection email

        return user;
    }

    /**
     * Validate user credentials
     */
    static async validateCredentials(email: string, password: string) {
        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        return user;
    }

    /**
     * Update user's last login time
     */
    static async updateLastLogin(userId: string) {
        await dbConnect();
        await User.findByIdAndUpdate(userId, { last_login: new Date() });
    }
}
