/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { userStatusConfig } from '@/lib/config/role-config';
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';

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
        expiry?: Date;
        verified?: boolean;
    };
    address: {
        city?: string;
        state?: string;
        pincode?: string;
    };
    documents: any[];
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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminRetailersPage() {
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState('');
    const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyNotes, setVerifyNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRetailers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });
            if (search) params.set('search', search);
            if (verifiedFilter) params.set('is_verified', verifiedFilter);

            const res = await fetch(`/api/admin/retailers?${params}`);
            const data = await res.json();

            if (data.success) {
                setRetailers(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch retailers:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, verifiedFilter]);

    useEffect(() => {
        fetchRetailers();
    }, [fetchRetailers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleVerify = async (approved: boolean) => {
        if (!selectedRetailer) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/retailers/${selectedRetailer._id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved, notes: verifyNotes }),
            });
            const data = await res.json();
            if (data.success) {
                setShowVerifyModal(false);
                setSelectedRetailer(null);
                setVerifyNotes('');
                fetchRetailers();
            } else {
                alert(data.error || 'Failed to verify');
            }
        } catch (error) {
            alert('Failed to verify');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const config = userStatusConfig[status as keyof typeof userStatusConfig];
        if (!config) return null;

        const colorMap: Record<string, string> = {
            yellow: 'bg-yellow-100 text-yellow-800',
            red: 'bg-red-100 text-red-800',
            orange: 'bg-orange-100 text-orange-800',
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
        };

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorMap[config.color]}`}>
                {config.label}
            </span>
        );
    };

    const getCategoryBadge = (category: string) => {
        const colorMap: Record<string, string> = {
            'Retail-Standalone': 'bg-blue-100 text-blue-800',
            'Retail-Chain': 'bg-purple-100 text-purple-800',
            'Hospital-Pharmacy': 'bg-green-100 text-green-800',
            'Nursing-Home': 'bg-orange-100 text-orange-800',
            'Clinic': 'bg-cyan-100 text-cyan-800',
        };
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorMap[category] || 'bg-slate-100 text-slate-600'}`}>
                {category}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Retailers</h1>
                    <p className="text-slate-500 mt-1">Manage pharmacy and medical store accounts</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
                        <span className="text-slate-500 text-sm">Total: </span>
                        <span className="text-slate-900 font-medium">{pagination.total}</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 shadow-sm">
                        <span className="text-green-700 text-sm">Verified: </span>
                        <span className="text-green-800 font-medium">
                            {retailers.filter(r => r.is_verified).length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by store name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={verifiedFilter}
                            onChange={(e) => {
                                setVerifiedFilter(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none min-w-[150px]"
                        >
                            <option value="">All Status</option>
                            <option value="true">Verified</option>
                            <option value="false">Not Verified</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Retailers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Store</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Contact</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Location</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Credit Limit</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Verified</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {retailers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                                No retailers found
                                            </td>
                                        </tr>
                                    ) : (
                                        retailers.map((retailer) => (
                                            <tr key={retailer._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-slate-900 font-medium">{retailer.store_name}</p>
                                                        {retailer.legal_name && (
                                                            <p className="text-slate-500 text-sm">{retailer.legal_name}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getCategoryBadge(retailer.retailer_category)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-slate-900 text-sm">{retailer.user_id?.name}</p>
                                                        <p className="text-slate-500 text-sm">{retailer.email || retailer.user_id?.email}</p>
                                                        {retailer.phone && (
                                                            <p className="text-slate-500 text-sm">{retailer.phone}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">
                                                    {retailer.address?.city && retailer.address?.state
                                                        ? `${retailer.address.city}, ${retailer.address.state}`
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-900 font-medium">
                                                    ₹{retailer.credit_limit?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {retailer.user_id && getStatusBadge(retailer.user_id.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${retailer.is_verified
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {retailer.is_verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/retailers/${retailer._id}`}
                                                            className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50 text-sm flex items-center gap-1 shadow-sm"
                                                        >
                                                            <Eye className="w-3 h-3" /> View
                                                        </Link>
                                                        {!retailer.is_verified && retailer.user_id?.status === 'pending_verification' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRetailer(retailer);
                                                                    setShowVerifyModal(true);
                                                                }}
                                                                className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded hover:bg-teal-100 text-sm"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-slate-500 text-sm">
                                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                    {pagination.total} retailers
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Verify Modal */}
            {showVerifyModal && selectedRetailer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Verify Retailer</h2>
                        <p className="text-slate-600 mb-4">
                            Verifying: <strong>{selectedRetailer.store_name}</strong>
                        </p>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-4">
                            <p className="text-sm text-slate-600 mb-2">Documents submitted: {selectedRetailer.documents?.length || 0}</p>
                            <p className="text-sm text-slate-600">License: {selectedRetailer.drug_license?.number || 'Not provided'}</p>
                            <p className="text-sm text-slate-600">Category: {selectedRetailer.retailer_category}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Verification Notes</label>
                            <textarea
                                value={verifyNotes}
                                onChange={(e) => setVerifyNotes(e.target.value)}
                                rows={3}
                                placeholder="Add notes about the verification..."
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowVerifyModal(false);
                                    setVerifyNotes('');
                                }}
                                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerify(false)}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                            <button
                                onClick={() => handleVerify(true)}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
