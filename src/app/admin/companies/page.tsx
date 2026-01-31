'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Building2 } from 'lucide-react';

interface Company {
    _id: string;
    name: string;
    code?: string;
    corporate?: string;
    type: 'INDIAN' | 'MNC';
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    divisions?: string[];
    is_active: boolean;
    created_at: string;
    productCount?: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 24,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        corporate: '',
        type: 'INDIAN' as 'INDIAN' | 'MNC',
        website: '',
        email: '',
        phone: '',
        address: '',
        divisions: '', // Comma separated for input
    });

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });
            if (search) params.set('search', search);
            if (typeFilter) params.set('type', typeFilter);

            const res = await fetch(`/api/admin/companies?${params}`);
            const data = await res.json();

            if (data.success) {
                setCompanies(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, typeFilter]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            corporate: '',
            type: 'INDIAN',
            website: '',
            email: '',
            phone: '',
            address: '',
            divisions: '',
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = {
                ...formData,
                divisions: formData.divisions.split(',').map(d => d.trim()).filter(Boolean),
            };
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                resetForm();
                fetchCompanies();
            } else {
                alert(data.error || 'Failed to create company');
            }
        } catch (error) {
            alert('Failed to create company');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setActionLoading(true);
        try {
            const payload = {
                ...formData,
                divisions: formData.divisions.split(',').map(d => d.trim()).filter(Boolean),
            };
            const res = await fetch(`/api/admin/companies/${selectedCompany._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setShowEditModal(false);
                setSelectedCompany(null);
                resetForm();
                fetchCompanies();
            } else {
                alert(data.error || 'Failed to update company');
            }
        } catch (error) {
            alert('Failed to update company');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (company: Company) => {
        if (!confirm(`Are you sure you want to delete "${company.name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/companies/${company._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchCompanies();
            } else {
                alert(data.error || 'Failed to delete company');
            }
        } catch (error) {
            alert('Failed to delete company');
        }
    };

    const openEditModal = (company: Company) => {
        setSelectedCompany(company);
        setFormData({
            name: company.name,
            code: company.code || '',
            corporate: company.corporate || '',
            type: company.type || 'INDIAN',
            website: company.website || '',
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || '',
            divisions: company.divisions?.join(', ') || '',
        });
        setShowEditModal(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
                    <p className="text-slate-500 mt-1">Manage pharmaceutical manufacturers ({pagination.total} companies)</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Company
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none min-w-[150px]"
                        >
                            <option value="">All Types</option>
                            <option value="INDIAN">Indian</option>
                            <option value="MNC">MNC</option>
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

            {/* Companies Grid */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                        No companies found
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {companies.map((company) => (
                                <div
                                    key={company._id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-600">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${company.type === 'MNC'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {company.type}
                                        </span>
                                    </div>
                                    <h3 className="text-slate-900 font-medium truncate mb-1" title={company.name}>
                                        {company.name}
                                    </h3>
                                    {company.corporate && (
                                        <p className="text-slate-500 text-sm truncate" title={company.corporate}>
                                            {company.corporate}
                                        </p>
                                    )}

                                    {/* Divisions Tag */}
                                    {company.divisions && company.divisions.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {company.divisions.slice(0, 2).map((div, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                                    {div}
                                                </span>
                                            ))}
                                            {company.divisions.length > 2 && (
                                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                                    +{company.divisions.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {company.code && (
                                        <p className="text-slate-400 text-xs mt-2">Code: {company.code}</p>
                                    )}

                                    {/* Actions - visible on hover */}
                                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(company)}
                                            className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200 flex items-center justify-center gap-1"
                                        >
                                            <Edit className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(company)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 flex items-center justify-center"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                <p className="text-slate-500 text-sm">
                                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                    {pagination.total} companies
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 text-slate-500">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
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

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {showCreateModal ? 'Add Company' : 'Edit Company'}
                            </h2>
                        </div>
                        <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INDIAN' | 'MNC' })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="INDIAN">Indian</option>
                                        <option value="MNC">MNC</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Corporate Name</label>
                                <input
                                    type="text"
                                    value={formData.corporate}
                                    onChange={(e) => setFormData({ ...formData, corporate: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Divisions (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.divisions}
                                    onChange={(e) => setFormData({ ...formData, divisions: e.target.value })}
                                    placeholder="e.g. Cardio, Neuro, General"
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        setSelectedCompany(null);
                                        resetForm();
                                    }}
                                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Saving...' : showCreateModal ? 'Create' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
