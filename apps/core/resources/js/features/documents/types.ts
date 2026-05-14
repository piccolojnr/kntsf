export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type Visibility = 'public' | 'internal';

export type DocumentFile = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    human_size: string;
    url: string;
};

export type Document = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    description: string | null;
    category: string | null;
    status: PublishStatus;
    visibility: Visibility;
    is_featured: boolean;
    published_at: string | null;
    archived_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    featured_image_url: string | null;
    files: DocumentFile[];
    author: {
        id: number;
        name: string;
        email: string;
    };
};

export type DocumentDefaults = {
    status: PublishStatus;
    visibility: Visibility;
    is_featured: boolean;
};

export type DocumentPermissions = {
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
