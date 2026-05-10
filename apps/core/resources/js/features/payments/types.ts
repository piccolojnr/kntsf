export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export type Payment = {
    id: number;
    reference: string;
    gateway: string;
    gateway_reference: string | null;
    status: PaymentStatus;
    status_label: string;
    amount: string;
    currency: string;
    paid_at: string | null;
    verified_at: string | null;
    failure_reason: string | null;
    student: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        course: string | null;
        level: string | null;
    };
    permit: {
        id: number;
        code_last4: string | null;
        status: string;
        academic_period: {
            id: number;
            name: string;
            academic_year: string;
            semester: string | null;
        } | null;
    } | null;
    created_by: {
        id: number;
        name: string;
        email: string;
    } | null;
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

export type PaymentOptions = {
    students: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        label: string;
    }[];
    academic_periods: { id: number; label: string; is_active: boolean }[];
};
