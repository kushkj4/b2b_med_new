'use client';

export default function DistributorDashboard() {
    const statCards = [
        { label: 'My Products', value: '0', icon: '💊', color: 'from-blue-500 to-cyan-500' },
        { label: 'Pending Orders', value: '0', icon: '📦', color: 'from-yellow-500 to-orange-500' },
        { label: 'Active Retailers', value: '0', icon: '🏪', color: 'from-green-500 to-emerald-500' },
        { label: 'Total Sales', value: '₹0', icon: '💰', color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Distributor Dashboard</h1>
                <p className="text-slate-400 mt-1">Manage your inventory and orders</p>
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

            {/* Getting Started */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">🚀 Getting Started</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 mb-3">
                            <span className="text-xl">1</span>
                        </div>
                        <h3 className="text-white font-medium">Add Your Products</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Browse the product catalog and add medicines you want to sell
                        </p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 mb-3">
                            <span className="text-xl">2</span>
                        </div>
                        <h3 className="text-white font-medium">Set Your Prices</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Customize pricing, stock levels, and batch details for each product
                        </p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 mb-3">
                            <span className="text-xl">3</span>
                        </div>
                        <h3 className="text-white font-medium">Start Receiving Orders</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Retailers will discover your products and place orders
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">📊 Recent Orders</h2>
                    <div className="py-12 text-center text-slate-500">
                        <p>No orders yet</p>
                        <p className="text-sm mt-1">Orders will appear here once retailers start ordering</p>
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">🔔 Low Stock Alerts</h2>
                    <div className="py-12 text-center text-slate-500">
                        <p>No alerts</p>
                        <p className="text-sm mt-1">Products with low stock will be listed here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
