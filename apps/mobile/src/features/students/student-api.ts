import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { ApiListResponse } from "@/lib/api/api-types";

import { MobileHomeContent, Student, StudentDto } from "./student-types";

type MobileApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type OperationsListParams = {
  search?: string;
  studentId?: string;
  page?: number;
  limit?: number;
};

export type StudentsListResult = ApiListResponse<Student>;

type StudentListEnvelope = {
  students?: StudentDto[];
  items?: StudentDto[];
  data?: StudentDto[];
  pagination?: ApiListResponse<StudentDto>["pagination"];
  links?: Record<string, string | null>;
  meta?: Record<string, unknown>;
};

export function normalizeStudent(dto: StudentDto): Student {
  const activeNfcCard = dto.active_nfc_card ?? dto.nfc_card ?? null;

  return {
    id: String(dto.id),
    studentId: dto.studentId ?? dto.student_number ?? dto.student_id ?? "",
    name: dto.name ?? "",
    email: dto.email ?? "",
    course: dto.course ?? dto.programme ?? dto.program ?? "",
    level: dto.level ?? "",
    phone: dto.phone ?? dto.number ?? "",
    accountStatus: dto.accountStatus ?? dto.account_status,
    activeNfcCard: activeNfcCard
      ? {
        id: String(activeNfcCard.id),
        status: activeNfcCard.status ?? "inactive",
        uidLast4: activeNfcCard.uid_last4,
        uid: activeNfcCard.uid_last4 ? `.... ${activeNfcCard.uid_last4}` : "",
        registeredAt:
          activeNfcCard.activated_at ?? activeNfcCard.issued_at ?? "",
        issuedAt: activeNfcCard.issued_at,
        activatedAt: activeNfcCard.activated_at,
      }
      : null,
  };
}

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getStudentDtosFromEnvelope(envelope: StudentListEnvelope) {
  return envelope.students ?? envelope.items ?? envelope.data ?? [];
}

function normalizeStudentListResponse(
  response: unknown,
): StudentsListResult {
  if (Array.isArray(response)) {
    return {
      items: response.map(normalizeStudent),
      pagination: {
        page: 1,
        limit: response.length,
        total: response.length,
        totalPages: 1,
      },
    };
  }

  if (!isObject(response)) {
    return {
      items: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 1,
      },
    };
  }

  if ("success" in response) {
    const data = getMobileData(response as MobileApiResponse<StudentListEnvelope>);
    const students = getStudentDtosFromEnvelope(data);

    return {
      items: students.map(normalizeStudent),
      pagination:
        data.pagination ?? {
          page: 1,
          limit: students.length,
          total: students.length,
          totalPages: 1,
        },
    };
  }

  if ("meta" in response && Array.isArray(response.data)) {
    const data = unwrapPaginated<StudentDto>(
      response as {
        data: StudentDto[];
        links?: Record<string, string | null>;
        meta?: Record<string, unknown>;
      },
    );

    return {
      items: data.items.map(normalizeStudent),
      pagination: data.pagination,
    };
  }

  if ("data" in response && Array.isArray(response.data)) {
    const students = response.data as StudentDto[];

    return {
      items: students.map(normalizeStudent),
      pagination: {
        page: 1,
        limit: students.length,
        total: students.length,
        totalPages: 1,
      },
    };
  }

  if ("data" in response && isObject(response.data)) {
    const envelope = response.data as StudentListEnvelope;
    const students = getStudentDtosFromEnvelope(envelope);

    return {
      items: students.map(normalizeStudent),
      pagination:
        envelope.pagination ?? {
          page: 1,
          limit: students.length,
          total: students.length,
          totalPages: 1,
        },
    };
  }

  const envelope = response as StudentListEnvelope;
  const students = getStudentDtosFromEnvelope(envelope);

  return {
    items: students.map(normalizeStudent),
    pagination:
      envelope.pagination ?? {
        page: 1,
        limit: students.length,
        total: students.length,
        totalPages: 1,
      },
  };
}

export async function getStudents(params?: OperationsListParams) {
  try {
    const response = await apiClient.get<
      | MobileApiResponse<ApiListResponse<StudentDto>>
      | { data: StudentDto[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
      | StudentDto[]
    >("/api/mobile/operations/students/search", {
      params: {
        search: params?.search,
        student_number: params?.studentId,
        page: params?.page,
        per_page: params?.limit,
      },
    });


    return normalizeStudentListResponse(response.data).items;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getStudentsPage(
  params?: OperationsListParams,
): Promise<StudentsListResult> {
  try {
    const response = await apiClient.get<
      | MobileApiResponse<ApiListResponse<StudentDto>>
      | { data: StudentDto[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
      | StudentDto[]
    >("/api/mobile/operations/students/search", {
      params: {
        search: params?.search,
        student_number: params?.studentId,
        page: params?.page,
        per_page: params?.limit,
      },
    });



    return normalizeStudentListResponse(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getStudentById(id: string) {
  try {
    const response = await apiClient.get<
      StudentDto | { data: StudentDto } | { student: StudentDto }
    >(`/api/mobile/operations/students/${encodeURIComponent(id)}`);
    const data = unwrapData<StudentDto | { student: StudentDto }>(response.data);

    return normalizeStudent("student" in data ? data.student : data);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 404) {
      return null;
    }

    throw toUserFacingError(error);
  }
}

export async function getStudentByStudentId(studentId: string) {
  const normalizedStudentId = studentId.trim();
  const students = await getStudents({
    search: normalizedStudentId,
    studentId: normalizedStudentId,
    page: 1,
    limit: 20,
  });

  const found =
    students.find((student) => student.studentId === normalizedStudentId) ?? null;

  if (found) {
    return found;
  }

  return getStudentById(normalizedStudentId);
}

export async function getStudentProfile() {
  try {
    const response = await apiClient.get<
      StudentDto | { student: StudentDto } | MobileApiResponse<StudentDto | { student: StudentDto }>
    >("/api/mobile/student/profile");
    const data = unwrapData<StudentDto | { student: StudentDto }>(response.data);

    return normalizeStudent("student" in data ? data.student : data);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 404) {
      return null;
    }

    throw toUserFacingError(error);
  }
}

export async function getMobileHomeContent() {
  try {
    const response = await apiClient.get<MobileHomeContent | { data: MobileHomeContent }>(
      "/api/mobile/content/home",
    );

    return unwrapData<MobileHomeContent>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}
