import { simulateDelay } from "@/lib/api/mock-api";

import { Student } from "./student-types";

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

export async function getStudents() {
  await simulateDelay(250);
  return mockStudents.map(cloneStudent);
}

export async function getStudentById(id: string) {
  await simulateDelay(200);

  const student = mockStudents.find((item) => item.id === id);

  return student ? cloneStudent(student) : null;
}

export async function getStudentByStudentId(studentId: string) {
  await simulateDelay(200);

  const normalizedStudentId = studentId.trim();
  const student = mockStudents.find(
    (item) => item.studentId === normalizedStudentId,
  );

  return student ? cloneStudent(student) : null;
}
