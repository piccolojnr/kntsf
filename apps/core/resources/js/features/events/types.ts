export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type Visibility = 'public' | 'internal';

export type Event = {
    id: number;
    title: string;
    slug: string;
    description: string;
    excerpt: string | null;
    location: string | null;
    category: string | null;
    status: PublishStatus;
    visibility: Visibility;
    is_featured: boolean;
    starts_at: string | null;
    ends_at: string | null;
    max_attendees: number | null;
    current_attendees: number;
    published_at: string | null;
    archived_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    banner_url: string | null;
    organizer: {
        id: number;
        name: string;
        email: string;
    };
};

export type EventDefaults = {
    status: PublishStatus;
    visibility: Visibility;
    is_featured: boolean;
};

export type EventPermissions = {
    create?: boolean;
    update?: boolean;
    publish?: boolean;
    archive?: boolean;
    delete?: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta?: Record<string, unknown>;
};
