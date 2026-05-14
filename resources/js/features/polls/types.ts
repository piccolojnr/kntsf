export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type Visibility = 'public' | 'internal';
export type PollType = 'fixed_options' | 'dynamic_options';
export type PollOptionStatus = 'active' | 'merged' | 'archived';

export type PollOption = {
    id: number;
    text: string;
    status: PollOptionStatus;
    merged_into_id: number | null;
    sort_order: number;
    votes_count: number | null;
};

export type Poll = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    type: PollType;
    status: PublishStatus;
    visibility: Visibility;
    starts_at: string | null;
    ends_at: string | null;
    show_results: boolean;
    allow_vote_change: boolean;
    is_open: boolean;
    created_at: string | null;
    updated_at: string | null;
    votes_count: number;
    options: PollOption[];
    user_vote: {
        id: number;
        poll_option_id: number;
    } | null;
    creator: {
        id: number;
        name: string;
        email: string;
    };
};

export type PollDefaults = {
    type: PollType;
    status: PublishStatus;
    visibility: Visibility;
    show_results: boolean;
    allow_vote_change: boolean;
};

export type PollPermissions = {
    create?: boolean;
    update?: boolean;
    publish?: boolean;
    archive?: boolean;
    delete?: boolean;
    vote?: boolean;
    view_results?: boolean;
    merge_options?: boolean;
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
