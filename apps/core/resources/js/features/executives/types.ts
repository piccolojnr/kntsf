export type ExecutiveRole = {
    name: string;
    label: string;
};

export type Executive = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string | null;
    roles: ExecutiveRole[];
    profile: {
        position: string | null;
        position_description: string | null;
        biography: string | null;
        category: string | null;
        sort_order: number;
        is_published: boolean;
        social_links: Record<string, string> | null;
    } | null;
};

export type ExecutiveOptions = {
    roles: ExecutiveRole[];
};

export type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
};
