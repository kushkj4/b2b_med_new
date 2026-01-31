'use client';

import { useEffect, useState, useCallback } from 'react';

interface Product {
    _id: string;
    name: string;
    brand: string;
    sku: string;
    company_id: string;
    company_name: string;
    therapy?: string;
    drug_type?: string;
    pack?: string;
    mrp: number;
    is_active: boolean;
    created_at: string;
}

interface Company {
    _id: string;
    name: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [companySearch, setCompanySearch] = useState('');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        sku: '',
        company_id: '',
        company_name: '',
        therapy: '',
        drug_type: '',
        pack: '',
        mrp: '',
    });

    const fetchCompanies = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/companies?all=true');
            const data = await res.json();
            if (data.success) {
                setCompanies(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/products?${params}`);
            const data = await res.json();

            if (data.success) {
                setProducts(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
            brand: '',
            sku: '',
            company_id: '',
            company_name: '',
            therapy: '',
            drug_type: '',
            pack: '',
            mrp: '',
        });
        setCompanySearch('');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    mrp: parseFloat(formData.mrp) || 0,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                resetForm();
                fetchProducts();
            } else {
                alert(data.error || 'Failed to create product');
            }
        } catch (error) {
            alert('Failed to create product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${selectedProduct._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    mrp: parseFloat(formData.mrp) || 0,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setShowEditModal(false);
                setSelectedProduct(null);
                resetForm();
                fetchProducts();
            } else {
                alert(data.error || 'Failed to update product');
            }
        } catch (error) {
            alert('Failed to update product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/products/${product._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            } else {
                alert(data.error || 'Failed to delete product');
            }
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            brand: product.brand || '',
            sku: product.sku || '',
            company_id: product.company_id || '',
            company_name: product.company_name || '',
            therapy: product.therapy || '',
            drug_type: product.drug_type || '',
            pack: product.pack || '',
            mrp: product.mrp?.toString() || '',
        });
        setCompanySearch(product.company_name || '');
        setShowEditModal(true);
    };

    const selectCompany = (company: Company) => {
        setFormData({
            ...formData,
            company_id: company._id,
            company_name: company.name,
        });
        setCompanySearch(company.name);
        setShowCompanyDropdown(false);
    };

    const filteredCompanies = companies.filter((c) =>
        c.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">
                        Manage product catalog ({pagination.total.toLocaleString()} products)
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </button>
            </div>

            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search products by name, brand, SKU, or company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                No products found
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-gray-900 font-medium truncate max-w-xs">{product.name}</p>
                                                        <p className="text-gray-500 text-sm">{product.brand}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm font-mono truncate max-w-[150px]">
                                                    {product.sku || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm truncate max-w-[150px]">
                                                    {product.company_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{product.pack || '-'}</td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">
                                                    {product.mrp ? `₹${product.mrp.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${product.is_active !== false
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                            }`}
                                                    >
                                                        {product.is_active !== false ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium border border-gray-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product)}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium border border-red-200"
                                                        >
                                                            Delete
                                                        </button>
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
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                <p className="text-gray-600 text-sm">
                                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                    {pagination.total.toLocaleString()} products
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium border border-gray-200"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-gray-600 text-sm">
                                        Page {pagination.page} of {pagination.totalPages.toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium border border-gray-200"
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
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {showCreateModal ? 'Add Product' : 'Edit Product'}
                        </h2>
                        <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Company Dropdown */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={companySearch}
                                    onChange={(e) => {
                                        setCompanySearch(e.target.value);
                                        setShowCompanyDropdown(true);
                                        if (!e.target.value) {
                                            setFormData({ ...formData, company_id: '', company_name: '' });
                                        }
                                    }}
                                    onFocus={() => setShowCompanyDropdown(true)}
                                    placeholder="Search and select company..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                {showCompanyDropdown && filteredCompanies.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredCompanies.slice(0, 50).map((company) => (
                                            <button
                                                key={company._id}
                                                type="button"
                                                onClick={() => selectCompany(company)}
                                                className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                                            >
                                                {company.name}
                                            </button>
                                        ))}
                                        {filteredCompanies.length > 50 && (
                                            <div className="px-4 py-2 text-gray-500 text-sm border-t border-gray-100">
                                                Type to filter {filteredCompanies.length - 50} more companies...
                                            </div>
                                        )}
                                    </div>
                                )}
                                {formData.company_name && (
                                    <p className="mt-1 text-sm text-blue-600">Selected: {formData.company_name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Therapy</label>
                                    <input
                                        type="text"
                                        value={formData.therapy}
                                        onChange={(e) => setFormData({ ...formData, therapy: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Drug Type</label>
                                    <input
                                        type="text"
                                        value={formData.drug_type}
                                        onChange={(e) => setFormData({ ...formData, drug_type: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pack</label>
                                    <input
                                        type="text"
                                        value={formData.pack}
                                        onChange={(e) => setFormData({ ...formData, pack: e.target.value })}
                                        placeholder="e.g., 10 TAB"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.mrp}
                                        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        setSelectedProduct(null);
                                        resetForm();
                                        setShowCompanyDropdown(false);
                                    }}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                    {actionLoading ? 'Saving...' : showCreateModal ? 'Create' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showCompanyDropdown && (
                <div className="fixed inset-0 z-[5]" onClick={() => setShowCompanyDropdown(false)} />
            )}
        </div>
    );
}
