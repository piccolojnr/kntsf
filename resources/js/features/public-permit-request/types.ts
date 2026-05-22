export type PermitRequestPreview = {
    name: string | null;
    student_number: string;
    course: string | null;
    level: string | null;
    has_email: boolean;
    has_phone: boolean;
    can_request: boolean;
    block_reason: string | null;
};

export type PublicPermitRequest = {
    reference: string;
    status: string;
    amount: string;
    currency: string;
    contact_email: string | null;
    requires_review: boolean;
    review_status: string | null;
    student: {
        preview: PermitRequestPreview | null;
    };
    academic_period: {
        name: string;
        academic_year: string;
        semester: string | null;
    };
    payment: {
        reference: string;
        status: string;
        authorization_url: string | null;
        permit_id: number | null;
        permit_code_last4: string | null;
    } | null;
};

export type PermitRequestSettings = {
    permit_requests_enabled: boolean;
    default_amount: number;
    currency: string;
};

export type StudentOption = {
    value: string;
    label: string;
};

export type PublicPermitStudentOptions = {
    student_number_prefix: string;
    courses: StudentOption[];
    levels: StudentOption[];
};
