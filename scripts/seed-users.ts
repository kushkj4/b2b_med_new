import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medb2b';

async function seedUsers() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();

        // Hash passwords
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Demo users with status field
        const users = [
            {
                email: 'admin@medb2b.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                status: 'active',
                is_active: true,
                email_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: 'distributor@medb2b.com',
                password: hashedPassword,
                name: 'Demo Distributor',
                role: 'distributor',
                phone: '9876543210',
                status: 'active',
                is_active: true,
                email_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                email: 'retailer@medb2b.com',
                password: hashedPassword,
                name: 'Demo Retailer',
                role: 'retailer',
                phone: '9876543211',
                status: 'active',
                is_active: true,
                email_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        // Clear existing demo users
        await db.collection('users').deleteMany({
            email: { $in: users.map((u) => u.email) },
        });

        // Insert users
        const insertedUsers = await db.collection('users').insertMany(users);
        console.log(`Inserted ${insertedUsers.insertedCount} users`);

        // Create distributor profile
        const distributorUser = await db.collection('users').findOne({ email: 'distributor@medb2b.com' });
        if (distributorUser) {
            await db.collection('distributors').deleteOne({ user_id: distributorUser._id });
            await db.collection('distributors').insertOne({
                user_id: distributorUser._id,
                company_name: 'Demo Pharma Distributors',
                trade_name: 'DPD',
                gst_number: 'GST1234567890',
                phone: '9876543210',
                email: 'distributor@medb2b.com',
                address: {
                    line1: '123 Pharma Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                },
                drug_license: {
                    number: '20B-MH-123456',
                    type: 'wholesale',
                    expiry: new Date('2026-12-31'),
                    verified: true,
                },
                documents: [],
                settings: {
                    min_order_value: 500,
                    delivery_areas: ['Mumbai', 'Thane', 'Navi Mumbai'],
                    payment_terms: 'Net 30',
                    default_margin: 10,
                },
                is_verified: true,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            });
            console.log('Created distributor profile');
        }

        // Create retailer profile
        const retailerUser = await db.collection('users').findOne({ email: 'retailer@medb2b.com' });
        if (retailerUser) {
            await db.collection('retailers').deleteOne({ user_id: retailerUser._id });
            await db.collection('retailers').insertOne({
                user_id: retailerUser._id,
                store_name: 'Demo Medical Store',
                legal_name: 'Demo Medical Store Pvt Ltd',
                business_category: 'Medical Store',
                retailer_category: 'Retail-Standalone',
                phone: '9876543211',
                email: 'retailer@medb2b.com',
                address: {
                    line1: '456 Health Avenue',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400002',
                },
                drug_license: {
                    number: '20-MH-654321',
                    type: 'retail',
                    expiry: new Date('2026-12-31'),
                    verified: true,
                },
                documents: [],
                credit_limit: 50000,
                credit_used: 0,
                credit_period: 30,
                discount_percentage: 0,
                preferred_distributors: [],
                is_verified: true,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            });
            console.log('Created retailer profile');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\nDemo accounts:');
        console.log('  Admin: admin@medb2b.com / admin123');
        console.log('  Distributor: distributor@medb2b.com / admin123');
        console.log('  Retailer: retailer@medb2b.com / admin123');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seedUsers();
