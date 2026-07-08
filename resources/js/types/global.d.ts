import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            publicContent: {
                news: boolean;
                events: boolean;
                documents: boolean;
            };
            [key: string]: unknown;
        };
    }
}
