import 'next-auth';
import { UserRole } from '@/types';
import { UserStatus } from '@/lib/config/role-config';

declare module 'next-auth' {
    interface User {
        id: string;
        role: UserRole;
        status?: UserStatus;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            status?: UserStatus;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        status?: UserStatus;
    }
}

