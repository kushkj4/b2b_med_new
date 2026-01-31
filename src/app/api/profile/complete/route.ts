import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import { User, Distributor, Retailer } from '@/lib/db/models';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();


        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        if (user.status !== 'pending_documents') {
            return NextResponse.json(
                { success: false, error: 'Profile completion not required at this stage' },
                { status: 400 }
            );
        }

        // Parse the multipart form data
        const formData = await request.formData();
        const licenseDataStr = formData.get('licenseData') as string;
        const licenseData = licenseDataStr ? JSON.parse(licenseDataStr) : {};

        // Process uploaded files
        const uploadedDocuments: { type: string; file_url: string; file_name: string; uploaded_at: Date }[] = [];

        for (const [key, value] of formData.entries()) {
            if (key !== 'licenseData' && value instanceof File) {
                // In production, you would upload to S3/cloud storage
                // For now, we'll store a placeholder URL
                const fileName = `${session.user.id}/${key}/${value.name}`;
                uploadedDocuments.push({
                    type: key,
                    file_url: `/uploads/${fileName}`, // Placeholder
                    file_name: value.name,
                    uploaded_at: new Date(),
                });
            }
        }

        // Update the role-specific profile
        if (user.role === 'distributor') {
            await Distributor.findOneAndUpdate(
                { user_id: user._id },
                {
                    $set: {
                        'drug_license.number': licenseData.drug_license_number,
                        'drug_license.type': licenseData.drug_license_type,
                        'drug_license.expiry': licenseData.drug_license_expiry,
                        gst_number: licenseData.gst_number,
                    },
                    $push: { documents: { $each: uploadedDocuments } },
                }
            );
        } else if (user.role === 'retailer') {
            await Retailer.findOneAndUpdate(
                { user_id: user._id },
                {
                    $set: {
                        'drug_license.number': licenseData.drug_license_number,
                        'drug_license.type': licenseData.drug_license_type,
                        'drug_license.expiry': licenseData.drug_license_expiry,
                    },
                    $push: { documents: { $each: uploadedDocuments } },
                }
            );
        }

        // Update user status to pending verification
        user.status = 'pending_verification';
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Documents submitted successfully. Your account is now pending verification.',
        });
    } catch (error) {
        console.error('Profile completion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to complete profile' },
            { status: 500 }
        );
    }
}
