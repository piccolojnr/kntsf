const MOCK_VALID_STUDENT_ID = "26102859";
const MOCK_EXPIRED_STUDENT_ID = "26102860";
const MOCK_NO_PERMIT_STUDENT_ID = "26102863";

function ensureDevOnly() {
  if (!__DEV__) {
    throw new Error("Development verification helpers are not available in production.");
  }
}

export function getMockValidStudentId() {
  ensureDevOnly();
  return MOCK_VALID_STUDENT_ID;
}

export function getMockExpiredStudentId() {
  ensureDevOnly();
  return MOCK_EXPIRED_STUDENT_ID;
}

export function getMockNoPermitStudentId() {
  ensureDevOnly();
  return MOCK_NO_PERMIT_STUDENT_ID;
}
