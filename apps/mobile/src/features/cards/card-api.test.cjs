/* global __dirname */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInThisContext } = require("node:vm");
const ts = require("typescript");

// Load the real API modules without booting React Native or SecureStore.
function loadCardApi(client) {
  const cache = new Map();
  const sourceRoot = path.resolve(__dirname, "../..");
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    });
    const localRequire = (specifier) => {
      if (specifier === "@/lib/api/api-client") return { apiClient: client };
      if (specifier.startsWith("@/"))
        return load(path.join(sourceRoot, `${specifier.slice(2)}.ts`));
      if (specifier.startsWith("."))
        return load(path.resolve(path.dirname(filename), `${specifier}.ts`));
      return require(specifier);
    };
    runInThisContext(`(function(require, module, exports) {${outputText}\n})`, {
      filename,
    })(localRequire, module, module.exports);
    return module.exports;
  }
  return load(path.join(__dirname, "card-api.ts"));
}

const student = { id: "42", studentId: "KNT-2026-001" };
const cardDto = {
  id: 73,
  status: "active",
  uid_last4: "ABCD",
  issued_at: "2026-09-01T12:00:00Z",
  student: { id: 42, student_number: student.studentId, name: "Test Student" },
};
const page = (cards) => ({
  data: {
    data: cards,
    meta: { current_page: 1, per_page: 100, total: cards.length, last_page: 1 },
  },
});

test("registration sends the selected student's database ID and scanned UID", async () => {
  const api = loadCardApi({
    post: async (url, body) => {
      assert.equal(url, "/api/mobile/operations/nfc-cards/register");
      assert.deepEqual(body, { student_id: "42", uid: "04ABCD" });
      return { data: { data: cardDto } };
    },
  });
  const card = await api.assignCardToStudent({
    mode: "register",
    student,
    uid: " 04abcd ",
  });
  assert.equal(card.studentId, student.studentId);
  assert.equal(card.student.id, "42");
  assert.equal(card.student.studentId, student.studentId);
});

test("replacement finds the active card in the backend's nested student resource", async () => {
  const api = loadCardApi({
    get: async (url, options) => {
      assert.equal(url, "/api/mobile/operations/nfc-cards");
      assert.equal(options.params.search, student.studentId);
      return page([
        {
          ...cardDto,
          id: 99,
          status: "replaced",
          issued_at: "2026-09-02T12:00:00Z",
        },
        {
          ...cardDto,
          id: 88,
          student: { id: 43, student_number: "KNT-2026-0010" },
        },
        cardDto,
      ]);
    },
    post: async (url, body) => {
      assert.equal(url, "/api/mobile/operations/nfc-cards/73/replace");
      assert.deepEqual(body, { uid: "04DCBA" });
      return { data: { data: { ...cardDto, id: 74 } } };
    },
  });
  const card = await api.assignCardToStudent({
    mode: "replace",
    student,
    uid: "04dcba",
  });
  assert.equal(card.id, "74");
});

test("replacement fallback fetches student detail by database ID", async () => {
  const api = loadCardApi({
    get: async (url) => {
      if (url === "/api/mobile/operations/nfc-cards") return page([]);
      assert.equal(url, "/api/mobile/operations/students/42");
      return { data: { data: { active_nfc_card: cardDto } } };
    },
  });
  assert.equal(
    (await api.getCurrentCardByStudentId(student.studentId, student.id)).id,
    "73",
  );
});

test("replacement does not mistake a lookup failure for a missing card", async () => {
  const api = loadCardApi({
    get: async (url) => {
      if (url === "/api/mobile/operations/nfc-cards") return page([]);
      throw Object.assign(new Error("Your session has expired."), {
        status: 401,
      });
    },
  });
  await assert.rejects(
    api.assignCardToStudent({ mode: "replace", student, uid: "04ABCD" }),
    {
      message: "Your session has expired.",
      status: 401,
    },
  );
});

test("replacement rejects inactive cards without submitting a replacement", async () => {
  const api = loadCardApi({
    get: async (url) =>
      url === "/api/mobile/operations/nfc-cards"
        ? page([{ ...cardDto, status: "lost" }])
        : { data: { data: { active_nfc_card: null } } },
    post: async () => assert.fail("Must not replace an inactive card"),
  });
  await assert.rejects(
    api.assignCardToStudent({ mode: "replace", student, uid: "04ABCD" }),
    /No active NFC card/,
  );
});

test("assignment rejects an empty UID before making a request", async () => {
  const api = loadCardApi({});
  await assert.rejects(
    api.assignCardToStudent({ mode: "register", student, uid: " " }),
    /scanned card UID is required/,
  );
});
