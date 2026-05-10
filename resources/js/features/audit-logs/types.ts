export type AuditActor = {
    id: number;
    name: string;
    email: string;
};

export type AuditMorph = {
    type: string;
    id: number | string | null;
    label: string;
};

export type AuditLog = {
    id: number;
    event: string;
    event_label: string;
    description: string | null;
    actor: AuditActor | null;
    auditable: AuditMorph | null;
    subject: AuditMorph | null;
    metadata: Record<string, unknown> | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    created_at: string | null;
};

export type ActivityItem = {
    id: number;
    event: string;
    label: string;
    description: string | null;
    actor: AuditActor | null;
    subject: AuditMorph | null;
    created_at: string | null;
    metadata: Record<string, unknown> | null;
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
