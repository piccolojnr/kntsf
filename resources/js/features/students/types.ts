export type Student = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    course: string | null;
    level: string | null;
    created_at: string | null;
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
};

export type StudentIndexPermissions = {
    create: boolean;
    update: boolean;
    delete: boolean;
};
