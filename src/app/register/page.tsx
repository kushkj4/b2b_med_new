'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { roleConfig } from '@/lib/config/role-config';

type Role = 'distributor' | 'retailer';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<Role>('retailer');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        // Distributor fields
        company_name: '',
        trade_name: '',
        gst_number: '',
        // Retailer fields
        store_name: '',
        // Common
        city: '',
        state: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const config = roleConfig[role];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role,
                phone: formData.phone,
                ...(role === 'distributor' ? {
                    company_name: formData.company_name,
                    trade_name: formData.trade_name,
                    gst_number: formData.gst_number,
                } : {
                    store_name: formData.store_name,
                }),
                city: formData.city,
                state: formData.state,
            };

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                    <p className="text-slate-400 mb-6">
                        Thank you for registering. Your application is now pending review by our admin team.
                        You&apos;ll receive an email once your account is approved.
                    </p>
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-slate-300 mb-2"><strong>What happens next?</strong></p>
                        <ol className="text-sm text-slate-400 list-decimal list-inside space-y-1">
                            <li>Admin reviews your application</li>
                            <li>You&apos;ll receive approval email</li>
                            <li>Login to upload required documents</li>
                            <li>Documents are verified</li>
                            <li>Full access granted!</li>
                        </ol>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            MedB2B
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 mt-1">Join our B2B pharmaceutical platform</p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">I am a:</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('retailer')}
                                className={`p-4 rounded-xl border transition-all ${role === 'retailer'
                                        ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                        : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🏪</div>
                                <p className="font-medium">Retailer</p>
                                <p className="text-xs text-slate-400">Pharmacy / Medical Store</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('distributor')}
                                className={`p-4 rounded-xl border transition-all ${role === 'distributor'
                                        ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                        : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🚚</div>
                                <p className="font-medium">Distributor</p>
                                <p className="text-xs text-slate-400">Wholesale Supplier</p>
                            </button>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="flex items-center gap-1">
                            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                1
                            </div>
                            <span className="text-sm text-teal-400">Basic Info</span>
                        </div>
                        <div className="w-8 h-px bg-slate-600" />
                        <div className="flex items-center gap-1">
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 text-sm">
                                2
                            </div>
                            <span className="text-sm text-slate-500">Documents</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Personal Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="10-digit mobile"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* Role-specific fields */}
                        {role === 'distributor' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name *</label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Your company name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Trade Name</label>
                                        <input
                                            type="text"
                                            name="trade_name"
                                            value={formData.trade_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="Trading as (optional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">GST Number</label>
                                        <input
                                            type="text"
                                            name="gst_number"
                                            value={formData.gst_number}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="GSTIN (optional)"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Store/Pharmacy Name *</label>
                                <input
                                    type="text"
                                    name="store_name"
                                    value={formData.store_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Your pharmacy name"
                                />
                            </div>
                        )}

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="State"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-blue-400 text-sm">
                                <strong>Note:</strong> After registration, your application will be reviewed by our team.
                                Once approved, you&apos;ll need to upload your {role === 'distributor' ? 'drug license and GST certificate' : 'drug license'} to complete verification.
                            </p>
                        </div>

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
                                'Submit Application'
                            )}
                        </button>

                        <p className="text-center text-slate-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-teal-400 hover:text-teal-300">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
