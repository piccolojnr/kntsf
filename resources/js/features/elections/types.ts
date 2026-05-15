export type ElectionStatus = 'draft' | 'scheduled' | 'active' | 'closed' | 'archived';
export type CandidateStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export type ElectionCandidate = {
    id: number;
    student_id: number;
    student_name: string;
    student_number: string;
    slogan: string | null;
    manifesto: string | null;
    status: CandidateStatus;
    poster_url: string | null;
    votes_count: number | null;
};

export type ElectionPosition = {
    id: number;
    title: string;
    description: string | null;
    max_winners: number;
    status: string;
    sort_order: number;
    candidates: ElectionCandidate[];
};

export type Election = {
    id: number;
    academic_period_id: number;
    title: string;
    slug: string;
    description: string | null;
    status: ElectionStatus;
    starts_at: string | null;
    ends_at: string | null;
    results_visible: boolean;
    is_open: boolean;
    votes_count: number;
    academic_period: { id: number; name: string; academic_year: string };
    creator: { id: number; name: string };
    positions: ElectionPosition[];
};

export type ElectionPermissions = {
    create?: boolean;
    update?: boolean;
    publish?: boolean;
    manage_candidates?: boolean;
    vote?: boolean;
    view_results?: boolean;
    delete?: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export type AcademicPeriodOption = {
    id: number;
    name: string;
    academic_year: string;
    semester: string | null;
};

export type StudentOption = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    label: string;
};

export type ElectionFormOptions = {
    students: StudentOption[];
};
