export type NfcCardStatus =
    | 'active'
    | 'inactive'
    | 'revoked'
    | 'lost'
    | 'stolen'
    | 'replaced'
    | 'damaged';

export type NfcCard = {
    id: number;
    uid_last4: string | null;
    status: NfcCardStatus;
    status_label: string;
    issued_at: string | null;
    activated_at: string | null;
    deactivated_at: string | null;
    replaced_at: string | null;
    lost_at: string | null;
    student: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        course: string | null;
        level: string | null;
    };
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

export type NfcCardOptions = {
    students: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        label: string;
    }[];
};
