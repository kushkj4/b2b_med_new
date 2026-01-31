'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, FileText, MapPin, Building, Phone, Mail, Award } from 'lucide-react';

interface Retailer {
    _id: string;
    store_name: string;
    legal_name?: string;
    email?: string;
    phone?: string;
    gst_number?: string;
    retailer_category: string;
    drug_license: {
        number?: string;
        type?: string;
        expiry?: string;
        verified?: boolean;
    };
    address: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    };
    documents: Array<{
        type: string;
        url: string;
        verified: boolean;
        fileName?: string;
    }>;
    credit_limit: number;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    user_id: {
        _id: string;
        name: string;
        email: string;
        status: string;
    };
}

export default function RetailerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [retailer, setRetailer] = useState<Retailer | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [verifyNotes, setVerifyNotes] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const fetchRetailer = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/retailers/${id}`);
            const data = await res.json();
            if (data.success) {
                setRetailer(data.data);
            } else {
                alert('Failed to load retailer details');
                router.push('/admin/retailers');
            }
        } catch (error) {
            console.error('Error fetching retailer:', error);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchRetailer();
    }, [id, fetchRetailer]);

    const handleVerify = async (approved: boolean) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/retailers/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved, notes: verifyNotes }),
            });
            const data = await res.json();
            if (data.success) {
                setShowVerifyModal(false);
                fetchRetailer(); // Reload data
                alert(approved ? 'Retailer approved successfully' : 'Retailer rejected');
            } else {
                alert(data.error || 'Failed to verify');
            }
        } catch (error) {
            alert('Failed to verify');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
            </div>
        );
    }

    if (!retailer) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/retailers"
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{retailer.store_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${retailer.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {retailer.is_verified ? 'Verified' : 'Verification Pending'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${retailer.is_active ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {retailer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-3">
                    {!retailer.is_verified && (
                        <button
                            onClick={() => setShowVerifyModal(true)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Verify Retailer
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Building className="w-5 h-5 text-slate-400" />
                            Business Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">Legal Name</label>
                                <p className="text-slate-900 font-medium mt-1">{retailer.legal_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">Category</label>
                                <p className="text-slate-900 font-medium mt-1">{retailer.retailer_category}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">GST Number</label>
                                <p className="text-slate-900 font-medium mt-1">{retailer.gst_number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">Credit Limit</label>
                                <p className="text-teal-600 font-bold mt-1">₹{retailer.credit_limit?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* License Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-slate-400" />
                            Drug License
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">License Number</label>
                                <p className="text-slate-900 font-medium mt-1">{retailer.drug_license?.number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">License Type</label>
                                <p className="text-slate-900 font-medium mt-1">{retailer.drug_license?.type || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-medium">Expiry Date</label>
                                <p className="text-slate-900 font-medium mt-1">
                                    {retailer.drug_license?.expiry ? new Date(retailer.drug_license.expiry).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Documents Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" />
                            Documents
                        </h2>
                        {retailer.documents && retailer.documents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {retailer.documents.map((doc, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white p-2 rounded border border-slate-200">
                                                <FileText className="w-6 h-6 text-teal-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{doc.type}</p>
                                                <p className="text-xs text-slate-500 truncate">{doc.fileName || 'Document'}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm italic">No documents uploaded.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Info</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-slate-900 font-medium break-all">{retailer.email || retailer.user_id?.email}</p>
                                    <p className="text-xs text-slate-500">Email</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-slate-900 font-medium">{retailer.phone || 'N/A'}</p>
                                    <p className="text-xs text-slate-500">Phone</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-slate-900 font-medium">
                                        {[
                                            retailer.address?.street,
                                            retailer.address?.city,
                                            retailer.address?.state,
                                            retailer.address?.pincode
                                        ].filter(Boolean).join(', ') || 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-500">Address</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Account Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Info</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Registered On</span>
                                <span className="text-sm text-slate-900 font-medium">
                                    {new Date(retailer.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">User Status</span>
                                <span className="text-sm text-slate-900 font-medium capitalize">
                                    {retailer.user_id?.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verify Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Verify Dealer</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Verification Notes</label>
                            <textarea
                                value={verifyNotes}
                                onChange={(e) => setVerifyNotes(e.target.value)}
                                rows={3}
                                placeholder="Add notes (e.g., Documents verified, License valid)..."
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerify(false)}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleVerify(true)}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
