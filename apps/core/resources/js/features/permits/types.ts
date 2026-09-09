export type PermitStatus = 'active' | 'expired' | 'revoked';

export type Permit = {
    id: number;
    code_last4: string | null;
    status: PermitStatus;
    status_label: string;
    starts_at: string | null;
    expires_at: string | null;
    amount_paid: string;
    currency: string;
    card_delivered_at: string | null;
    revoked_at: string | null;
    revocation_reason: string | null;
    student: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        course: string | null;
        level: string | null;
    };
    academic_period: {
        id: number;
        name: string;
        academic_year: string;
        semester: string | null;
    } | null;
    issued_by: {
        id: number;
        name: string;
        email: string;
    } | null;
    revoked_by: {
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

export type PermitPermissions = {
    issue: boolean;
    revoke: boolean;
    markCardDelivered: boolean;
    delete: boolean;
};

export type PermitOptions = {
    students: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        label: string;
    }[];
    academic_periods: { id: number; label: string; is_active: boolean }[];
    issue_defaults: {
        amount_paid: number;
        currency: string;
        starts_at: string;
        expires_at: string;
    };
};
