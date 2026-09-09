export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type Visibility = 'public' | 'internal';

export type Announcement = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    category: string | null;
    status: PublishStatus;
    visibility: Visibility;
    is_featured: boolean;
    published_at: string | null;
    archived_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    featured_image_url: string | null;
    author: {
        id: number;
        name: string;
        email: string;
    };
};

export type AnnouncementDefaults = {
    status: PublishStatus;
    visibility: Visibility;
    is_featured: boolean;
};

export type AnnouncementPermissions = {
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
