export type RoleRecord = {
    id: number;
    name: string;
    label: string;
    users_count: number;
    permissions: string[];
    is_protected: boolean;
};

export type PermissionGroups = Record<string, string[]>;
