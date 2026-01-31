export const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'MedB2B API',
        version: '1.0.0',
        description: 'B2B Pharmaceutical Platform API Documentation',
        contact: {
            name: 'MedB2B Support',
            email: 'support@medb2b.com',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
    tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Admin', description: 'Admin management endpoints' },
        { name: 'Products', description: 'Product catalog endpoints' },
        { name: 'Companies', description: 'Pharma company endpoints' },
        { name: 'Distributor', description: 'Distributor-specific endpoints' },
        { name: 'Retailer', description: 'Retailer-specific endpoints' },
    ],
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'name', 'role'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    name: { type: 'string' },
                                    role: { type: 'string', enum: ['distributor', 'retailer'] },
                                    phone: { type: 'string' },
                                    company_name: { type: 'string', description: 'Required for distributors' },
                                    store_name: { type: 'string', description: 'Required for retailers' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    400: { description: 'Bad request' },
                },
            },
        },
        '/api/admin/dashboard': {
            get: {
                tags: ['Admin'],
                summary: 'Get dashboard statistics',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Dashboard stats',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                totalUsers: { type: 'number' },
                                                totalDistributors: { type: 'number' },
                                                totalRetailers: { type: 'number' },
                                                totalProducts: { type: 'number' },
                                                totalCompanies: { type: 'number' },
                                                totalOrders: { type: 'number' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/admin/users': {
            get: {
                tags: ['Admin'],
                summary: 'Get users list with pagination',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'distributor', 'retailer'] } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
                ],
                responses: {
                    200: {
                        description: 'Paginated users list',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PaginatedResponse' },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Admin'],
                summary: 'Create a new user',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'name', 'role'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    name: { type: 'string' },
                                    role: { type: 'string', enum: ['admin', 'distributor', 'retailer'] },
                                    phone: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'User created successfully' },
                    400: { description: 'Bad request' },
                },
            },
        },
        '/api/admin/users/{id}': {
            get: {
                tags: ['Admin'],
                summary: 'Get user by ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'User details' },
                    404: { description: 'User not found' },
                },
            },
            patch: {
                tags: ['Admin'],
                summary: 'Update user',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                    is_active: { type: 'boolean' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'User updated successfully' },
                    404: { description: 'User not found' },
                },
            },
            delete: {
                tags: ['Admin'],
                summary: 'Delete user (soft delete)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'User deleted successfully' },
                    404: { description: 'User not found' },
                },
            },
        },
        '/api/products': {
            get: {
                tags: ['Products'],
                summary: 'Get products with pagination and filters',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'company_id', in: 'query', schema: { type: 'string' } },
                    { name: 'therapy', in: 'query', schema: { type: 'string' } },
                    { name: 'drug_type', in: 'query', schema: { type: 'string' } },
                    { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
                ],
                responses: {
                    200: {
                        description: 'Paginated products list',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PaginatedResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/products/search': {
            get: {
                tags: ['Products'],
                summary: 'Search products (autocomplete)',
                parameters: [
                    { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                ],
                responses: {
                    200: { description: 'Matching products' },
                },
            },
        },
        '/api/products/filters': {
            get: {
                tags: ['Products'],
                summary: 'Get filter options (therapies, drug types)',
                responses: {
                    200: {
                        description: 'Filter options',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                therapies: { type: 'array', items: { type: 'string' } },
                                                drugTypes: { type: 'array', items: { type: 'string' } },
                                                drugCategories: { type: 'array', items: { type: 'string' } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/products/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get product by ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Product details' },
                    404: { description: 'Product not found' },
                },
            },
        },
        '/api/companies': {
            get: {
                tags: ['Companies'],
                summary: 'Get companies list',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Paginated companies list' },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' },
                    error: { type: 'string' },
                    message: { type: 'string' },
                },
            },
            PaginatedResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'number' },
                            limit: { type: 'number' },
                            total: { type: 'number' },
                            totalPages: { type: 'number' },
                        },
                    },
                },
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'distributor', 'retailer'] },
                    phone: { type: 'string' },
                    is_active: { type: 'boolean' },
                    email_verified: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            Product: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    sku: { type: 'string' },
                    name: { type: 'string' },
                    brand: { type: 'string' },
                    company_name: { type: 'string' },
                    therapy: { type: 'string' },
                    drug_type: { type: 'string' },
                    mrp: { type: 'number' },
                    ptr: { type: 'number' },
                    pts: { type: 'number' },
                    is_active: { type: 'boolean' },
                },
            },
            Company: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    corporate: { type: 'string' },
                    type: { type: 'string', enum: ['INDIAN', 'MNC'] },
                    divisions: { type: 'array', items: { type: 'string' } },
                    is_active: { type: 'boolean' },
                },
            },
        },
    },
};
