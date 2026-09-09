export type VerificationResult =
    | 'valid'
    | 'invalid'
    | 'expired'
    | 'revoked'
    | 'not_found'
    | 'error'
    | 'card_inactive'
    | 'mismatch';

export type VerificationMethod = 'student_number' | 'permit_code' | 'nfc';

export type VerificationStudent = {
    id: number;
    student_number: string;
    name: string | null;
    email: string | null;
    course?: string | null;
    level?: string | null;
};

export type VerificationPermit = {
    id: number;
    code_last4: string | null;
    status: string;
    starts_at?: string | null;
    expires_at?: string | null;
    academic_period?: {
        id: number;
        name: string;
    } | null;
};

export type VerificationAttemptResult = {
    method: VerificationMethod;
    method_label: string;
    result: VerificationResult;
    result_label: string;
    reason: string | null;
    student: VerificationStudent | null;
    permit: VerificationPermit | null;
};

export type VerificationLog = {
    id: number;
    method: VerificationMethod;
    method_label: string;
    result: VerificationResult;
    result_label: string;
    reason: string | null;
    created_at: string | null;
    student: VerificationStudent | null;
    permit: VerificationPermit | null;
    verifier: {
        id: number;
        name: string;
        email: string;
    } | null;
};

export type VerificationOptions = {
    students: {
        id: number;
        student_number: string;
        name: string | null;
        email: string | null;
        label: string;
    }[];
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
