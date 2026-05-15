export type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export type AnnouncementSummary = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    published_at: string | null;
    image_url: string | null;
    author: { name: string } | null;
};

export type AnnouncementDetail = AnnouncementSummary & {
    content: string;
};

export type EventSummary = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    location: string | null;
    category: string | null;
    starts_at: string | null;
    ends_at: string | null;
    image_url: string | null;
    organizer: { name: string } | null;
};

export type EventDetail = EventSummary & {
    description: string;
};

export type DocumentSummary = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    published_at: string | null;
    image_url: string | null;
    author: { name: string } | null;
    files: Array<{ id: number; file_name: string; human_size: string; url: string }>;
};

export type DocumentDetail = DocumentSummary & {
    description: string | null;
};

export type ExecutiveSummary = {
    id: number;
    name: string | null;
    position: string | null;
    position_description: string | null;
    biography: string | null;
    category: string | null;
    avatar_url: string | null;
};

export type ElectionSummary = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    results_visible: boolean;
    votes_count: number | null;
    academic_period: {
        name: string;
        academic_year: string;
        semester: string | null;
    };
};

export type ElectionDetail = ElectionSummary & {
    positions: Array<{
        id: number;
        title: string;
        description: string | null;
        max_winners: number;
        candidates: Array<{
            id: number;
            student_name: string | null;
            student_number: string;
            slogan: string | null;
            manifesto: string | null;
            poster_url: string | null;
            votes_count: number | null;
        }>;
    }>;
};
