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

    if (Array.isArray(response.data)) {
      return response.data.map(normalizeStudent);
    }

    if ("meta" in response.data && Array.isArray(response.data.data)) {
      return unwrapPaginated<StudentDto>(response.data).items.map(normalizeStudent);
    }

    const data = getMobileData(response.data as MobileApiResponse<ApiListResponse<StudentDto>>);

    return data.items.map(normalizeStudent);
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

    if (Array.isArray(response.data)) {
      return {
        items: response.data.map(normalizeStudent),
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        },
      };
    }

    if ("meta" in response.data && Array.isArray(response.data.data)) {
      const data = unwrapPaginated<StudentDto>(response.data);

      return {
        items: data.items.map(normalizeStudent),
        pagination: data.pagination,
      };
    }

    const data = getMobileData(response.data as MobileApiResponse<ApiListResponse<StudentDto>>);

    return {
      items: data.items.map(normalizeStudent),
      pagination: data.pagination,
    };
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
