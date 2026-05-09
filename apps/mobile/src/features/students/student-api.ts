import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";

import { Student, StudentDto } from "./student-types";

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

function normalizeStudent(dto: StudentDto): Student {
  return {
    id: String(dto.id),
    studentId: dto.studentId ?? dto.student_id ?? "",
    name: dto.name ?? "",
    email: dto.email ?? "",
    course: dto.course ?? dto.programme ?? dto.program ?? "",
    level: dto.level ?? "",
    phone: dto.phone ?? dto.number ?? "",
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
      MobileApiResponse<ApiListResponse<StudentDto>>
    >("/api/mobile/operations/students", {
      params: {
        search: params?.search,
        studentId: params?.studentId,
        page: params?.page,
        limit: params?.limit,
      },
    });

    const data = getMobileData(response.data);

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
      MobileApiResponse<ApiListResponse<StudentDto>>
    >("/api/mobile/operations/students", {
      params: {
        search: params?.search,
        studentId: params?.studentId,
        page: params?.page,
        limit: params?.limit,
      },
    });
    const data = getMobileData(response.data);

    return {
      items: data.items.map(normalizeStudent),
      pagination: data.pagination,
    };
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getStudentById(id: string) {
  const students = await getStudents({ search: id, page: 1, limit: 20 });
  return students.find((student) => student.id === id) ?? null;
}

export async function getStudentByStudentId(studentId: string) {
  const normalizedStudentId = studentId.trim();
  const students = await getStudents({
    search: normalizedStudentId,
    studentId: normalizedStudentId,
    page: 1,
    limit: 20,
  });

  return (
    students.find((student) => student.studentId === normalizedStudentId) ??
    null
  );
}

export async function getStudentProfile() {
  try {
    const response = await apiClient.get<
      MobileApiResponse<StudentDto | { student: StudentDto }>
    >("/api/mobile/student/profile");
    const data = getMobileData(response.data);

    return normalizeStudent("student" in data ? data.student : data);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 404) {
      return null;
    }

    throw toUserFacingError(error);
  }
}
