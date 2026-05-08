import { USE_MOCK_API } from "@/constants/config";
import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
import { ApiListResponse } from "@/lib/api/api-types";
import { simulateDelay } from "@/lib/api/mock-api";

import { Student, StudentDto } from "./student-types";

type MobileApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type OperationsListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

const mockStudents: Student[] = [
  {
    id: "student-1",
    studentId: "26102859",
    name: "Ama Boateng",
    email: "ama.boateng@example.com",
    course: "Computer Science",
    level: "300",
    phone: "+233201110001",
  },
  {
    id: "student-2",
    studentId: "26102860",
    name: "Kwesi Mensah",
    email: "kwesi.mensah@example.com",
    course: "Business Administration",
    level: "200",
    phone: "+233201110002",
  },
  {
    id: "student-3",
    studentId: "26102861",
    name: "Efua Owusu",
    email: "efua.owusu@example.com",
    course: "Civil Engineering",
    level: "400",
    phone: "+233201110003",
  },
  {
    id: "student-4",
    studentId: "26102862",
    name: "Kojo Asare",
    email: "kojo.asare@example.com",
    course: "Nursing",
    level: "100",
    phone: "+233201110004",
  },
  {
    id: "student-5",
    studentId: "26102863",
    name: "Abena Adjei",
    email: "abena.adjei@example.com",
    course: "Law",
    level: "300",
    phone: "+233201110005",
  },
];

function cloneStudent(student: Student) {
  return { ...student };
}

function normalizeStudent(dto: StudentDto): Student {
  return {
    id: String(dto.id),
    studentId: dto.studentId ?? dto.student_id ?? "",
    name: dto.name ?? "",
    email: dto.email ?? "",
    course: dto.course ?? dto.programme ?? dto.program ?? "",
    level: dto.level ?? "",
    phone: dto.phone ?? "",
  };
}

function getMobileData<T>(response: MobileApiResponse<T>) {
  if (!response.success) {
    throw new Error(response.message ?? "The request could not be completed.");
  }

  return response.data;
}

async function getMockStudents(params?: OperationsListParams) {
  await simulateDelay(250);
  const search = params?.search?.trim().toLowerCase();
  const students = mockStudents.map(cloneStudent).map(normalizeStudent);

  if (!search) {
    return students;
  }

  return students.filter((student) => {
    return (
      student.studentId.toLowerCase().includes(search) ||
      student.name.toLowerCase().includes(search)
    );
  });
}

export async function getStudents(params?: OperationsListParams) {
  if (USE_MOCK_API) {
    return getMockStudents(params);
  }

  try {
    const response = await apiClient.get<
      MobileApiResponse<ApiListResponse<StudentDto>>
    >("/api/mobile/operations/students", {
      params: {
        search: params?.search,
        page: params?.page,
        limit: params?.limit,
      },
    });

    return getMobileData(response.data).items.map(normalizeStudent);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 404) {
      return getMockStudents(params);
    }

    throw toUserFacingError(error);
  }
}

export async function getStudentById(id: string) {
  // TODO(real-api): replace lookup with apiClient.get(`/api/mobile/students/${id}`).
  await simulateDelay(200);

  const student = mockStudents.find((item) => item.id === id);

  return student ? normalizeStudent(cloneStudent(student)) : null;
}

export async function getStudentByStudentId(studentId: string) {
  // TODO(real-api): replace lookup with backend student ID search endpoint.
  await simulateDelay(200);

  const normalizedStudentId = studentId.trim();
  const student = mockStudents.find(
    (item) => item.studentId === normalizedStudentId,
  );

  return student ? normalizeStudent(cloneStudent(student)) : null;
}

export async function getStudentProfile(fallbackUser?: {
  id: string;
  email: string;
  studentId?: string;
}) {
  void fallbackUser;

  try {
    const response =
      await apiClient.get<MobileApiResponse<StudentDto | { student: StudentDto }>>(
        "/api/mobile/student/profile",
      );
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
