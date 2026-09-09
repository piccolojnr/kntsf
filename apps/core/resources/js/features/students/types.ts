export type Student = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    course: string | null;
    level: string | null;
    created_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    account_status: 'not_activated' | 'pending_setup' | 'activated';
    account_status_label: string;
};

export type Paginated<T> = {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
};

export type StudentIndexPermissions = {
    create: boolean;
    update: boolean;
    delete: boolean;
    import: boolean;
    activateAccount: boolean;
};

export type StudentOption = {
    value: string;
    label: string;
};

export type StudentFormOptions = {
    student_number_prefix: string;
    courses: StudentOption[];
    levels: StudentOption[];
};
