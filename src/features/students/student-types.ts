export type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  level: string;
  phone: string;
};

export type StudentDto = Partial<Student> & {
  id: string | number;
  student_id?: string;
  programme?: string;
  program?: string;
};
