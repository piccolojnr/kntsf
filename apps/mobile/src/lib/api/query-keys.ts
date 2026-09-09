export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  student: {
    all: ["student"] as const,
    profile: () => [...queryKeys.student.all, "profile"] as const,
    card: () => [...queryKeys.student.all, "card"] as const,
  },
  permits: {
    all: ["permits"] as const,
    lists: () => [...queryKeys.permits.all, "list"] as const,
    student: () => [...queryKeys.permits.all, "student"] as const,
  },
  permitRequests: {
    all: ["permit-requests"] as const,
    lists: () => [...queryKeys.permitRequests.all, "list"] as const,
    options: () => [...queryKeys.permitRequests.all, "options"] as const,
    detail: (reference?: string | null) =>
      [...queryKeys.permitRequests.all, "detail", reference ?? ""] as const,
  },
  elections: {
    all: ["elections"] as const,
    lists: () => [...queryKeys.elections.all, "list"] as const,
    detail: (id: string | number) => [...queryKeys.elections.all, "detail", id] as const,
    results: (id: string | number) => [...queryKeys.elections.all, "results", id] as const,
  },
  content: {
    all: ["content"] as const,
    home: () => [...queryKeys.content.all, "home"] as const,
    lists: (type: string, params?: object) =>
      [...queryKeys.content.all, type, "list", params ?? {}] as const,
    detail: (type: string, slug: string) =>
      [...queryKeys.content.all, type, "detail", slug] as const,
  },
  verification: {
    all: ["verification"] as const,
    logs: () => [...queryKeys.verification.all, "logs"] as const,
    logsList: (params?: object) =>
      [...queryKeys.verification.all, "logs", params ?? {}] as const,
  },
  operations: {
    all: ["operations"] as const,
    summary: () => [...queryKeys.operations.all, "summary"] as const,
    students: () => [...queryKeys.operations.all, "students"] as const,
    auditLogs: (params?: object) =>
      [...queryKeys.operations.all, "audit-logs", params ?? {}] as const,
    cards: (params?: object) =>
      [...queryKeys.operations.all, "nfc-cards", params ?? {}] as const,
    permits: (params?: object) =>
      [...queryKeys.operations.all, "permits", params ?? {}] as const,
  },
} as const;
