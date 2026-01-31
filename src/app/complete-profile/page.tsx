'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { roleConfig, DocumentRequirement, FieldRequirement } from '@/lib/config/role-config';

export default function CompleteProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [documents, setDocuments] = useState<Record<string, File | null>>({});
    const [licenseData, setLicenseData] = useState<Record<string, string>>({});

    const role = session?.user?.role as 'distributor' | 'retailer' | undefined;
    const config = role && (role === 'distributor' || role === 'retailer')
        ? roleConfig[role]
        : null;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center max-w-md">
                    <p className="text-white">Invalid user role. Please contact support.</p>
                </div>
            </div>
        );
    }

    const handleFileChange = (key: string, file: File | null) => {
        setDocuments((prev) => ({ ...prev, [key]: file }));
    };

    const handleLicenseChange = (key: string, value: string) => {
        setLicenseData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required documents
            const missingDocs = config.requiredDocuments
                .filter((doc) => doc.required && !documents[doc.key])
                .map((doc) => doc.label);

            if (missingDocs.length > 0) {
                throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
            }

            // Validate required license fields
            const missingFields = config.licenseFields
                .filter((field) => field.required && !licenseData[field.key])
                .map((field) => field.label);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Create FormData for file upload
            const formData = new FormData();

            // Add license data
            formData.append('licenseData', JSON.stringify(licenseData));

            // Add documents
            Object.entries(documents).forEach(([key, file]) => {
                if (file) {
                    formData.append(key, file);
                }
            });

            const res = await fetch('/api/profile/complete', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit documents');
            }

            // Redirect to dashboard or pending verification page
            router.push(`/${role}/dashboard?status=submitted`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const renderField = (field: FieldRequirement) => {
        switch (field.type) {
            case 'select':
                return (
                    <select
                        value={licenseData[field.key] || ''}
                        onChange={(e) => handleLicenseChange(field.key, e.target.value)}
                        required={field.required}
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={licenseData[field.key] || ''}
                        onChange={(e) => handleLicenseChange(field.key, e.target.value)}
                        required={field.required}
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                );
            default:
                return (
                    <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={licenseData[field.key] || ''}
                        onChange={(e) => handleLicenseChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                );
        }
    };

    const renderDocumentUpload = (doc: DocumentRequirement) => {
        const file = documents[doc.key];

        return (
            <div
                key={doc.key}
                className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg"
            >
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="text-white font-medium">
                            {doc.label}
                            {doc.required && <span className="text-red-400 ml-1">*</span>}
                        </p>
                        {doc.description && (
                            <p className="text-slate-400 text-sm">{doc.description}</p>
                        )}
                    </div>
                    {file && (
                        <span className="text-green-400 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Uploaded
                        </span>
                    )}
                </div>

                <label className="block">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                        className="hidden"
                    />
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${file
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}>
                        {file ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-green-400">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleFileChange(doc.key, null);
                                    }}
                                    className="text-slate-400 hover:text-red-400"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div>
                                <svg className="w-8 h-8 mx-auto text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-slate-400 text-sm">Click to upload or drag and drop</p>
                                <p className="text-slate-500 text-xs mt-1">PDF, JPG, or PNG (max 5MB)</p>
                            </div>
                        )}
                    </div>
                </label>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
                    <p className="text-slate-400 mt-2">
                        Upload your documents to verify your {config.displayName} account
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                            ✓
                        </div>
                        <span className="text-sm text-green-400">Basic Info</span>
                    </div>
                    <div className="w-8 h-px bg-teal-500" />
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            2
                        </div>
                        <span className="text-sm text-teal-400">Documents</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {/* License Information */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">License Information</h2>
                        <div className="space-y-4">
                            {config.licenseFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Upload Documents</h2>
                        <div className="space-y-4">
                            {config.requiredDocuments.map(renderDocumentUpload)}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-blue-400 text-sm">
                            <strong>Important:</strong> Please ensure all documents are clear and readable.
                            Our team will verify your documents within 24-48 hours. You&apos;ll receive an email
                            notification once verification is complete.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit for Verification'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
