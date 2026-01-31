'use client';

import Link from 'next/link';

export default function RetailerDashboard() {
    const statCards = [
        { label: 'My Orders', value: '0', icon: '📦', color: 'from-blue-500 to-cyan-500' },
        { label: 'Cart Items', value: '0', icon: '🛒', color: 'from-purple-500 to-pink-500' },
        { label: 'Pending Deliveries', value: '0', icon: '🚚', color: 'from-yellow-500 to-orange-500' },
        { label: 'Total Spent', value: '₹0', icon: '💰', color: 'from-green-500 to-emerald-500' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Retailer Dashboard</h1>
                <p className="text-slate-400 mt-1">Browse products and manage your orders</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className="text-3xl">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">🛍️ Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/retailer/catalog"
                        className="p-4 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg border border-teal-500/30 hover:border-teal-500/50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 mb-3 group-hover:bg-teal-500/30 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium">Browse Catalog</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Search 98,000+ medicines from multiple distributors
                        </p>
                    </Link>

                    <Link
                        href="/retailer/orders"
                        className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-3 group-hover:bg-blue-500/30 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium">View Orders</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Track your orders and delivery status
                        </p>
                    </Link>

                    <Link
                        href="/retailer/cart"
                        className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-3 group-hover:bg-purple-500/30 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium">Shopping Cart</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Review items and checkout
                        </p>
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">📋 Recent Orders</h2>
                    <Link href="/retailer/orders" className="text-teal-400 text-sm hover:text-teal-300 transition-colors">
                        View all →
                    </Link>
                </div>
                <div className="py-12 text-center text-slate-500">
                    <p>No orders yet</p>
                    <p className="text-sm mt-1">Your orders will appear here once you start ordering</p>
                    <Link
                        href="/retailer/catalog"
                        className="inline-flex mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
