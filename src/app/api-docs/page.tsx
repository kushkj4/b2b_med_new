'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerSpec } from '@/api/swagger';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-900 text-white py-4 px-6">
                <h1 className="text-2xl font-bold">MedB2B API Documentation</h1>
                <p className="text-slate-400 text-sm">Interactive API reference</p>
            </div>
            <SwaggerUI spec={swaggerSpec} />
        </div>
    );
}
