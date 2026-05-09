export type AcademicPeriod = {
    id: number;
    name: string;
    academic_year: string;
    semester: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
};

export type AcademicPeriodPermissions = {
    manage: boolean;
};
