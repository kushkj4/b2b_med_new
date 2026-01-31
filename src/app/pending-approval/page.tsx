export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">Application Pending</h1>

                <p className="text-slate-400 mb-6">
                    Your application is currently under review by our admin team.
                    This usually takes 1-2 business days.
                </p>

                <div className="bg-slate-700/30 rounded-lg p-4 mb-6 text-left">
                    <p className="text-slate-300 text-sm mb-3"><strong>What happens next?</strong></p>
                    <ul className="text-sm text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400">1.</span>
                            <span>Our team reviews your application details</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-slate-500">2.</span>
                            <span>You&apos;ll receive an email notification</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-slate-500">3.</span>
                            <span>If approved, you can upload your documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-slate-500">4.</span>
                            <span>After verification, you get full access</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <p className="text-blue-400 text-sm">
                        <strong>Need help?</strong><br />
                        Contact our support team at <a href="mailto:support@medb2b.com" className="underline">support@medb2b.com</a>
                    </p>
                </div>

                <a
                    href="/login"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Login
                </a>
            </div>
        </div>
    );
}
