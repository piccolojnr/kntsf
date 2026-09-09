import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const PREVIEW_DIR = path.join(ROOT, "docs", "presentation", "previews", "build-v2");
const CORE_DIR = await resolveCoreDir();
const OUT = path.join(ROOT, "docs", "presentation", "current", "final-defense-deck.pptx");
const RENDER_DIR = path.join(PREVIEW_DIR, "rendered");
const campusBytes = new Uint8Array(await fs.readFile(path.join(CORE_DIR, "public", "images", "campus-hero.jpg")));
const logoBytes = new Uint8Array(await fs.readFile(path.join(CORE_DIR, "public", "images", "kntsf-logo.png")));
const adminBytes = new Uint8Array(await fs.readFile(path.join(ROOT, "docs", "presentation", "previews", "build-v1", "frames", "admin00001.png")));
const studentBytes = new Uint8Array(await fs.readFile(path.join(ROOT, "docs", "presentation", "previews", "build-v1", "frames", "student00001.png")));
const verifiedBytes = new Uint8Array(await fs.readFile(path.join(ROOT, "docs", "presentation", "previews", "build-v1", "frames", "verified00001.png")));

async function resolveCoreDir() {
  for (const candidate of [path.join(ROOT, "apps", "core"), path.join(ROOT, "kntsf-core")]) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next supported project layout.
    }
  }

  throw new Error("Could not find the core application directory.");
}

const W = 1280, H = 720;
const D = {
  navy: "#080D1A",
  navy2: "#111827",
  navy3: "#1A2235",
  ink: "#101828",
  paper: "#F4F6FA",
  white: "#FFFFFF",
  soft: "#D4DAE6",
  muted: "#98A2B3",
  mutedDark: "#667085",
  violet: "#8B5CF6",
  violet2: "#6D4AFF",
  violetSoft: "#EDE9FE",
  cyan: "#38BDF8",
  green: "#10B981",
  greenDark: "#047857",
  coral: "#FF6B6B",
  amber: "#F59E0B",
  lineDark: "#27324A",
  lineLight: "#CBD5E1",
};
const HEAD = "Aptos Display";
const BODY = "Aptos";

function rect(slide, x, y, w, h, fill, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: opts.line || { style: "solid", fill: opts.stroke || fill, width: opts.strokeWidth ?? 0 },
    ...(opts.radius ? { borderRadius: opts.radius } : {}),
  });
}

function txt(slide, value, x, y, w, h, opts = {}) {
  const t = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  t.text = value;
  t.text.style = {
    fontSize: opts.size ?? 22,
    typeface: opts.font || BODY,
    bold: opts.bold ?? false,
    color: opts.color ?? D.ink,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.vAlign ?? "top",
    autoFit: opts.autoFit ?? "shrinkText",
    insets: opts.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
    ...(opts.lineSpacing ? { lineSpacing: opts.lineSpacing } : {}),
  };
  return t;
}

function bullets(slide, items, x, y, w, h, opts = {}) {
  const t = slide.shapes.add({ geometry: "textbox", position: { left: x, top: y, width: w, height: h }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  t.text.set(items.map((item) => ({ bulletCharacter: "•", marginLeft: 24, indent: -14, spaceAfter: opts.spaceAfter ?? 16, runs: [item] })));
  t.text.style = { fontSize: opts.size ?? 22, typeface: BODY, color: opts.color ?? D.ink, autoFit: "shrinkText", insets: { top: 0, right: 0, bottom: 0, left: 0 } };
  return t;
}

function line(slide, x, y, w, h = 0, color = D.lineDark, width = 2) {
  return slide.shapes.add({ geometry: "straightConnector1", position: { left: x, top: y, width: w, height: h }, fill: "none", line: { style: "solid", fill: color, width } });
}

function chrome(slide, no, label, dark = true) {
  const fg = dark ? D.soft : D.mutedDark;
  txt(slide, `${String(no).padStart(2, "0")} / 13`, 56, 34, 112, 20, { size: 13, bold: true, color: dark ? D.violet : D.violet2 });
  txt(slide, label.toUpperCase(), 176, 34, 420, 20, { size: 13, bold: true, color: fg });
  txt(slide, "KNTSF  •  FINAL YEAR PROJECT", 932, 680, 292, 18, { size: 11, bold: true, color: fg, align: "right" });
}

function title(slide, value, dark = true, y = 76, size = 50) {
  return txt(slide, value, 56, y, 1168, 100, { size, font: HEAD, bold: true, color: dark ? D.white : D.ink, lineSpacing: 0.94 });
}

function addNotes(slide, speaker, mainPoint, talkTrack, internal, sources) {
  slide.speakerNotes.textFrame.setText([
    `Speaker: ${speaker}`,
    `Main point: ${mainPoint}`,
    "",
    "Example wording — adapt; do not read verbatim:",
    talkTrack,
    "",
    "Internal presenter note — do not say aloud:",
    internal,
    "",
    "[Sources]",
    ...sources.map((s) => `- ${s}`),
  ].join("\n"));
  slide.speakerNotes.setVisible(true);
}

function darkSlide(p, no, label) {
  const s = p.slides.add();
  s.background.fill = D.navy;
  chrome(s, no, label, true);
  return s;
}

function lightSlide(p, no, label) {
  const s = p.slides.add();
  s.background.fill = D.paper;
  chrome(s, no, label, false);
  return s;
}

const p = Presentation.create({ slideSize: { width: W, height: H } });

// 1 — cinematic cover
{
  const s = p.slides.add();
  s.background.fill = D.navy;
  s.images.add({ blob: campusBytes, contentType: "image/jpeg", alt: "Knutsford University campus", fit: "cover", position: { left: 610, top: 0, width: 670, height: 720 } });
  rect(s, 0, 0, 716, 720, D.navy);
  rect(s, 56, 0, 8, 720, D.violet);
  s.images.add({ blob: logoBytes, contentType: "image/png", alt: "Knutsford University mark", fit: "contain", position: { left: 88, top: 52, width: 92, height: 92 } });
  txt(s, "FINAL YEAR PROJECT", 204, 82, 350, 24, { size: 15, bold: true, color: D.cyan });
  txt(s, "NFC-Based Student\nPermit Verification\nand Governance\nManagement System", 88, 176, 548, 314, { size: 58, font: HEAD, bold: true, color: D.white, lineSpacing: 0.91 });
  txt(s, "One backend. Two channels. One trusted decision.", 88, 512, 520, 42, { size: 24, color: D.soft });
  line(s, 88, 588, 460, 0, D.lineDark, 2);
  txt(s, "Daud Abdul-Rahim  •  Kwuatsenu Divine", 88, 610, 520, 25, { size: 16, bold: true, color: D.white });
  txt(s, "M'Bangot-Menard Naeem Latif Dieudonne", 88, 640, 520, 25, { size: 16, bold: true, color: D.white });
  txt(s, "Supervisor  /  Mr. Bryan Laryea", 840, 654, 376, 24, { size: 15, bold: true, color: D.white, align: "right" });
  addNotes(s, "Divine", "Introduce the project as one connected platform and preview the proof points.", "Good morning. Our project is an NFC-based student permit verification and governance management system for Knutsford University. We developed it to connect permit requests, verified payments, SRC activities, and student verification in one platform. We will explain the problem, show how the system works, present our evidence, and demonstrate the connected workflow.", "Keep the opening under 25 seconds. Do not list every feature. Move directly into the problem.", ["KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md", "KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "kntsf-core/public/images/campus-hero.jpg", "kntsf-core/public/images/kntsf-logo.png"]);
}

// 2 — problem
{
  const s = darkSlide(p, 2, "The problem");
  title(s, "The gaps between decisions caused the real delay", true, 82, 54);
  txt(s, "The process broke into four separate moments:", 56, 190, 620, 36, { size: 24, color: D.muted });
  const words = ["REQUEST", "PAYMENT", "APPROVAL", "VERIFY"];
  words.forEach((w, i) => {
    const x = 56 + i * 296;
    txt(s, `0${i + 1}`, x, 292, 58, 28, { size: 17, bold: true, color: D.violet });
    txt(s, w, x, 330, 238, 46, { size: 31, font: HEAD, bold: true, color: D.white });
    if (i < 3) txt(s, "//", x + 238, 329, 48, 44, { size: 30, bold: true, color: D.coral, align: "center" });
  });
  line(s, 56, 404, 1116, 0, D.lineDark, 2);
  const consequences = [
    { x: 56, head: "Students waited", body: "while eligibility and payment were reconciled." },
    { x: 430, head: "Administrators searched", body: "across records with limited shared visibility." },
    { x: 804, head: "Staff needed certainty", body: "from a current and auditable permit decision." },
  ];
  consequences.forEach((c, i) => {
    rect(s, c.x, 468, 6, 118, i === 2 ? D.green : D.violet);
    txt(s, c.head, c.x + 24, 468, 320, 34, { size: 23, bold: true, color: D.white });
    txt(s, c.body, c.x + 24, 516, 320, 70, { size: 19, color: D.muted });
  });
  txt(s, "The design target was a connected journey—not simply a digital form.", 56, 632, 850, 34, { size: 21, bold: true, color: D.cyan });
  addNotes(s, "Divine", "Explain that the real problem was the disconnected end-to-end workflow.", "Previously, the permit process involved several separate activities. A request could be submitted, but eligibility, payment confirmation, permit issuance, and later verification still had to be coordinated. When those records are disconnected, students may wait longer and administrators have less visibility. We therefore focused on connecting the complete workflow.", "Avoid saying every old activity completely failed or was entirely manual. Transition by saying the solution was designed around the full journey.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 3 — solution
{
  const s = lightSlide(p, 3, "The solution");
  title(s, "Different interfaces now share one controlled source of truth", false, 78, 50);
  txt(s, "ONE", 54, 170, 300, 150, { size: 122, font: HEAD, bold: true, color: D.violetSoft });
  txt(s, "system", 60, 286, 250, 50, { size: 33, bold: true, color: D.violet2 });
  // connectors first
  line(s, 350, 348, 130, 0, D.violet2, 4);
  line(s, 800, 348, 130, 0, D.violet2, 4);
  line(s, 640, 458, 0, 96, D.violet2, 4);
  rect(s, 480, 234, 320, 230, D.navy, { radius: 18 });
  txt(s, "SHARED BACKEND", 520, 272, 240, 28, { size: 17, bold: true, color: D.cyan, align: "center" });
  txt(s, "Laravel rules\n+ one database", 520, 326, 240, 86, { size: 31, font: HEAD, bold: true, color: D.white, align: "center" });
  txt(s, "WEBSITE", 58, 380, 250, 34, { size: 25, bold: true, color: D.ink });
  txt(s, "Public information and administrative operations", 58, 426, 300, 76, { size: 20, color: D.mutedDark });
  txt(s, "MOBILE APP", 930, 380, 250, 34, { size: 25, bold: true, color: D.ink });
  txt(s, "Student services and authorized staff verification", 930, 426, 292, 76, { size: 20, color: D.mutedDark });
  txt(s, "CURRENT DECISION", 504, 572, 272, 28, { size: 18, bold: true, color: D.greenDark, align: "center" });
  txt(s, "Same permit • payment • role • audit state", 430, 612, 420, 30, { size: 19, color: D.mutedDark, align: "center" });
  addNotes(s, "Divine", "Show that the website and mobile application are channels into the same controlled system.", "Our solution has a website and a mobile application, but they are not separate systems. They use the same backend rules and the same source of data. The website supports public information and administrative work, while the mobile application supports students and authorized verification staff. A permit should therefore not appear valid in one channel and invalid in another.", "After the shared-backend point, hand over to Daud for the architecture.", ["SYSTEM_ARCHITECTURE.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 4 — architecture
{
  const s = darkSlide(p, 4, "Architecture");
  title(s, "Laravel is the control layer for every channel", true, 82, 54);
  txt(s, "The interfaces stay independent; the business rules stay centralized.", 56, 178, 820, 34, { size: 23, color: D.muted });
  // edges first
  line(s, 316, 346, 176, 0, D.lineDark, 3);
  line(s, 316, 492, 88, 0, D.lineDark, 3);
  line(s, 404, 346, 0, 146, D.lineDark, 3);
  line(s, 788, 346, 164, 0, D.lineDark, 3);
  line(s, 640, 438, 0, 92, D.lineDark, 3);
  line(s, 760, 438, 240, 92, D.lineDark, 3);
  const node = (x,y,w,h,label,sub,accent,fill=D.navy3) => {
    rect(s,x,y,w,h,fill,{radius:14,stroke:D.lineDark,strokeWidth:1});
    rect(s,x,y,8,h,accent);
    txt(s,label,x+28,y+23,w-50,34,{size:24,font:HEAD,bold:true,color:D.white});
    txt(s,sub,x+28,y+68,w-50,h-82,{size:17,color:D.muted});
  };
  node(56,286,260,120,"Website","Inertia • React • TypeScript",D.violet);
  node(56,432,260,120,"Mobile app","Expo React Native",D.cyan);
  node(492,252,296,186,"Laravel 13","Application + API\nSanctum authentication",D.violet2,D.violet2);
  node(952,286,272,120,"PostgreSQL","Production data store",D.cyan);
  node(492,530,296,112,"Paystack","Server-side payment verification",D.amber);
  node(936,530,288,112,"NFC + staff device","Authenticated lookup begins here",D.green);
  txt(s, "PERMISSIONS  /  PAYMENTS  /  PERMITS  /  VERIFICATION", 344, 468, 556, 28, { size: 16, bold: true, color: D.soft, align: "center" });
  addNotes(s, "Daud", "Explain the responsibility of each technical layer without turning the slide into a framework inventory.", "Technically, Laravel is the central application and API layer. The website uses Inertia, React, and TypeScript, while the mobile application is built with Expo React Native. Both clients communicate with the same backend and database. Sanctum protects authenticated API requests, and PostgreSQL is used for production data. Keeping the main rules in one backend applies the same permission, payment, permit, and verification decisions everywhere.", "Keep this to about one minute. Paystack and NFC are integrations, not databases.", ["SYSTEM_ARCHITECTURE.md", "kntsf-core/docs/MOBILE_API.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 5 — controlled permit workflow
{
  const s = lightSlide(p, 5, "Controlled workflow");
  title(s, "Verified payment is the gate before permit issuance", false, 82, 54);
  txt(s, "A browser redirect never becomes proof of payment by itself.", 56, 178, 820, 34, { size: 23, color: D.mutedDark });
  const steps = [
    ["01", "Request", "Student submits the permit request."],
    ["02", "Eligibility", "Backend applies the required checks."],
    ["03", "Verify", "Paystack is confirmed server-side."],
    ["04", "Issue", "One record powers the receipt and later verification."],
  ];
  steps.forEach((st, i) => {
    const x = 56 + i * 292;
    txt(s, st[0], x, 274, 130, 72, { size: 58, font: HEAD, bold: true, color: i === 3 ? D.green : D.violet2 });
    line(s, x, 360, 238, 0, i === 3 ? D.green : D.violet2, 5);
    txt(s, st[1], x, 394, 238, 38, { size: 28, font: HEAD, bold: true });
    txt(s, st[2], x, 450, 238, 88, { size: 19, color: D.mutedDark });
  });
  rect(s, 56, 590, 1168, 58, D.green);
  txt(s, "ISSUE CONDITION", 80, 608, 180, 22, { size: 15, bold: true, color: D.white });
  txt(s, "A verified backend state exists—and duplicate processing is controlled.", 282, 603, 900, 30, { size: 21, bold: true, color: D.white });
  addNotes(s, "Daud", "Explain why server-side payment verification controls permit issuance.", "A student first submits a permit request. After the required checks, the student can begin payment through Paystack. Returning from the payment page is not enough for the system to assume that payment succeeded. The backend verifies the transaction and records the result. The permit is issued only after that verified state is confirmed.", "If asked, explain server-side verification and idempotent processing. Do not claim that every payment failure is impossible.", ["kntsf-core/docs/PAYSTACK_INTEGRATION.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 6 — website hero
{
  const s = lightSlide(p, 6, "Website experience");
  rect(s, 0, 0, 370, 720, D.navy);
  txt(s, "06 / 13", 56, 34, 100, 20, { size: 13, bold: true, color: D.violet });
  txt(s, "WEBSITE EXPERIENCE", 56, 70, 260, 20, { size: 13, bold: true, color: D.soft });
  txt(s, "One workspace\nfor daily SRC\noperations", 56, 126, 264, 190, { size: 48, font: HEAD, bold: true, color: D.white, lineSpacing: 0.93 });
  txt(s, "Permit activity\nPayment records\nComplaints and reports\nAnnouncements and elections", 56, 370, 270, 170, { size: 21, color: D.soft, lineSpacing: 1.12 });
  rect(s, 56, 588, 230, 48, D.violet2, { radius: 8 });
  txt(s, "ROLE-CONTROLLED ACCESS", 68, 602, 206, 22, { size: 15, bold: true, color: D.white, align: "center" });
  s.images.add({ blob: adminBytes, contentType: "image/png", alt: "Administrator permit record on the KNTSF website", fit: "cover", crop: { left: 0, top: 0.07, right: 0, bottom: 0.07 }, position: { left: 410, top: 72, width: 814, height: 576 } });
  addNotes(s, "Naeem", "Explain the practical value of a single administrative workspace and the public/private boundary.", "The website gives authorized administrators one place to review permit activity, monitor payments, issue receipts, manage complaints, publish announcements, track budgets, and administer elections. A separate public-facing area exposes only approved SRC information. Private administrative records remain restricted through role permissions.", "Focus on usefulness. Do not read every menu item. The screenshot uses prepared demonstration data.", ["recording/combined video.mp4", "kntsf-core/docs/PUBLIC_PORTAL.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 7 — mobile roles
{
  const s = darkSlide(p, 7, "Mobile experience");
  title(s, "The same app changes with the user's role", true, 78, 52);
  txt(s, "Students access services. Authorized staff access verification.", 56, 172, 820, 34, { size: 23, color: D.muted });
  s.images.add({ blob: studentBytes, contentType: "image/png", alt: "Student permit screen", fit: "cover", crop: { left: 0.295, top: 0, right: 0.497, bottom: 0 }, geometry: "roundRect", borderRadius: 18, position: { left: 236, top: 234, width: 220, height: 398 } });
  s.images.add({ blob: verifiedBytes, contentType: "image/png", alt: "Authorized staff verification result", fit: "cover", crop: { left: 0.295, top: 0, right: 0.497, bottom: 0 }, geometry: "roundRect", borderRadius: 18, position: { left: 824, top: 234, width: 220, height: 398 } });
  txt(s, "STUDENT", 56, 280, 150, 28, { size: 18, bold: true, color: D.violet });
  txt(s, "Requests\nPayments\nPermits\nReceipts\nElections", 56, 330, 150, 210, { size: 24, font: HEAD, bold: true, color: D.white, lineSpacing: 1.13 });
  txt(s, "AUTHORIZED STAFF", 1072, 280, 156, 50, { size: 18, bold: true, color: D.green, align: "right" });
  txt(s, "Verify\nSearch\nRead result\nCreate audit trail", 1072, 350, 156, 176, { size: 23, font: HEAD, bold: true, color: D.white, align: "right", lineSpacing: 1.13 });
  line(s, 486, 432, 294, 0, D.lineDark, 2);
  txt(s, "BACKEND DECISION", 500, 402, 266, 24, { size: 14, bold: true, color: D.cyan, align: "center" });
  txt(s, "The phone displays the result. It does not invent it.", 496, 450, 274, 76, { size: 20, color: D.soft, align: "center" });
  addNotes(s, "Naeem", "Explain that students and staff use the same app for different authorized tasks.", "The mobile application presents different functions depending on the user's role. Students can submit requests, complete payments, view permits and receipts, follow announcements, and participate in elections when eligible. Authorized staff use a focused verification workflow. The application displays the current result returned by the backend rather than deciding validity by itself.", "Avoid touring every screen. The recording demonstrates the student-number fallback path, not an NFC tap.", ["recording/combined video.mp4", "kntsf-core/docs/MOBILE_API.md", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md"]);
}

// 8 — NFC verification
{
  const s = lightSlide(p, 8, "Verification and security");
  title(s, "NFC starts the lookup. The backend decides.", false, 82, 56);
  txt(s, "The card stores an identifier—not a complete student profile or permit decision.", 56, 182, 1020, 34, { size: 23, color: D.mutedDark });
  const phases = [
    ["1", "TAP", "Phone reads the registered identifier."],
    ["2", "CHECK", "Backend confirms the verifier, linked record, and current status."],
    ["3", "RETURN", "Authorized result is displayed and logged."],
  ];
  phases.forEach((ph, i) => {
    const x = 56 + i * 390;
    txt(s, ph[0], x, 278, 92, 110, { size: 100, font: HEAD, bold: true, color: i === 2 ? D.green : D.violet2 });
    txt(s, ph[1], x + 102, 298, 228, 34, { size: 28, font: HEAD, bold: true });
    txt(s, ph[2], x + 102, 348, 234, 90, { size: 19, color: D.mutedDark });
    if (i < 2) txt(s, "→", x + 330, 316, 48, 50, { size: 34, bold: true, color: D.lineLight, align: "center" });
  });
  line(s, 56, 484, 1168, 0, D.lineLight, 2);
  txt(s, "ROLE ACCESS  •  SERVER VALIDATION  •  AUDIT LOGS  •  RATE LIMITS  •  VERIFIED PAYMENTS", 56, 524, 1168, 36, { size: 18, bold: true, color: D.violet2, align: "center" });
  rect(s, 56, 594, 8, 52, D.amber);
  txt(s, "Copied identifiers remain a risk. Stronger deployments can add cryptographic tags or controlled devices.", 84, 599, 1090, 42, { size: 18, color: D.mutedDark });
  addNotes(s, "Daud", "Explain the privacy boundary and why the server, not the card, determines validity.", "During verification, the phone reads the NFC identifier and sends an authenticated request to the backend. The backend checks whether the staff member is authorized, finds the linked permit, and returns the current result. The card does not need to store the student's complete profile. We also use role-based access, validation, audit logs, rate limits, and secure payment verification around sensitive actions.", "Do not say NFC completely prevents copying. Acknowledge the limitation and the stronger future options if asked.", ["kntsf-core/docs/VERIFICATION_MODULE.md", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md", "KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx"]);
}

// 9 — pilot evidence
{
  const s = darkSlide(p, 9, "Pilot evidence");
  title(s, "The pilot proved the permit and payment workflow", true, 82, 54);
  txt(s, "It did not prove a completed campus-wide NFC rollout.", 56, 178, 820, 36, { size: 23, color: D.coral });
  const stats = [
    { x: 56, value: "2,021", label: "registered student records", color: D.violet },
    { x: 426, value: "2,769", label: "processed permit/payment records", color: D.cyan },
    { x: 796, value: "GHS 276,900", label: "successful pilot transaction value", color: D.green },
  ];
  stats.forEach((st, i) => {
    txt(s, st.value, st.x, 282, i === 2 ? 430 : 320, 92, { size: i === 2 ? 58 : 76, font: HEAD, bold: true, color: st.color });
    line(s, st.x, 392, i === 2 ? 428 : 318, 0, st.color, 5);
    txt(s, st.label, st.x, 422, i === 2 ? 420 : 320, 70, { size: 20, color: D.soft });
  });
  txt(s, "WHY PERMITS EXCEED STUDENTS", 56, 550, 360, 24, { size: 16, bold: true, color: D.amber });
  txt(s, "The figures count different things. Some students have repeated permit records across recorded periods.", 56, 588, 980, 52, { size: 22, color: D.white });
  addNotes(s, "Divine", "Present the four pilot figures and clearly limit what they prove.", "During the pilot, the system captured 2,021 registered student records and processed 2,769 permit and successful payment records, representing GHS 276,900. These figures show meaningful use of the digital permit and payment workflow. NFC was not fully deployed during that pilot, so we do not present these numbers as proof of a completed campus-wide NFC rollout.", "If asked why permits exceed students, use the agreed explanation about repeated permit records across periods. Do not call every repeated record a renewal.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md"]);
}

// 10 — current validation
{
  const s = lightSlide(p, 10, "Post-submission validation");
  title(s, "The current build has newer automated evidence", false, 82, 54);
  txt(s, "The report remains the submission-time record.", 56, 178, 760, 34, { size: 23, color: D.mutedDark });
  txt(s, "337", 56, 264, 480, 150, { size: 132, font: HEAD, bold: true, color: D.violet2 });
  txt(s, "automated tests passed", 64, 420, 430, 42, { size: 27, font: HEAD, bold: true });
  line(s, 582, 268, 0, 236, D.lineLight, 2);
  txt(s, "1,657", 650, 290, 470, 118, { size: 92, font: HEAD, bold: true, color: D.greenDark });
  txt(s, "assertions", 660, 414, 420, 40, { size: 27, font: HEAD, bold: true });
  const checks = ["Laravel feature + API tests", "TypeScript checks", "Mobile lint"];
  checks.forEach((c, i) => {
    const x = 56 + i * 384;
    line(s, x, 552, 330, 0, i === 2 ? D.green : D.violet2, 4);
    txt(s, c, x, 578, 330, 40, { size: 20, bold: true, align: "center" });
  });
  txt(s, "NO FAILED CHECKS IN THE VERIFIED RUN", 56, 648, 760, 24, { size: 16, bold: true, color: D.violet2 });
  addNotes(s, "Daud", "Present the current validation evidence without implying the submitted report was changed.", "Validation continued after the report was submitted. In the latest verified build, 337 automated tests passed with 1,657 assertions. The TypeScript checks and mobile lint also passed. If this count differs from the report, it is because the report contains the submission-time result while this slide shows the current build.", "Keep this to about 40 seconds. Be ready to name the main test groups if asked.", ["KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 11 — rollout
{
  const s = darkSlide(p, 11, "Implementation path");
  title(s, "A phased rollout keeps adoption realistic", true, 82, 54);
  txt(s, "SUBMITTED IMPLEMENTATION BUDGET", 56, 206, 360, 24, { size: 15, bold: true, color: D.violet });
  txt(s, "GHS 32,450", 56, 248, 520, 100, { size: 78, font: HEAD, bold: true, color: D.white });
  txt(s, "One implementation envelope—introduced in controlled stages.", 56, 366, 500, 62, { size: 23, color: D.muted });
  line(s, 596, 352, 568, 0, D.lineDark, 4);
  const phases = [
    ["01", "PREPARE", "Accounts, training, controlled verification points"],
    ["02", "EXPAND", "Wider permit use and authorized staff coverage"],
    ["03", "IMPROVE", "Monitoring, support, and refinement"],
  ];
  phases.forEach((ph, i) => {
    const x = 592 + i * 198;
    rect(s, x, 336, 30, 30, i === 2 ? D.green : D.violet, { geometry: "ellipse" });
    txt(s, ph[0], x, 244, 80, 24, { size: 15, bold: true, color: i === 2 ? D.green : D.violet });
    txt(s, ph[1], x, 278, 176, 32, { size: 24, font: HEAD, bold: true, color: D.white });
    txt(s, ph[2], x, 404, 174, 116, { size: 18, color: D.soft });
  });
  rect(s, 56, 574, 1110, 4, D.violet);
  txt(s, "TRAIN  →  DEPLOY  →  MONITOR  →  IMPROVE", 56, 606, 1110, 34, { size: 22, font: HEAD, bold: true, color: D.cyan, align: "center" });
  addNotes(s, "Naeem", "Connect the submitted budget to a controlled three-phase implementation approach.", "The submitted implementation budget is GHS 32,450. We recommend using a phased rollout rather than switching the whole institution at once. The first phase confirms accounts, training, and controlled verification points. The second expands permit use and staff coverage. The third focuses on monitoring, support, and improvements based on actual use.", "Do not invent or revise budget line items. Do not imply the rollout has already happened.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 12 — demo launch
{
  const s = darkSlide(p, 12, "Demonstration");
  title(s, "One record. Three views. Thirty-two seconds.", true, 82, 54);
  txt(s, "Student 26100001  •  permit 0259  •  active", 56, 178, 760, 34, { size: 23, color: D.muted });
  rect(s, 56, 258, 188, 188, D.violet2, { geometry: "ellipse" });
  txt(s, "▶", 100, 298, 100, 90, { size: 70, bold: true, color: D.white, align: "center", vAlign: "middle" });
  txt(s, "32 SEC", 56, 474, 188, 44, { size: 30, font: HEAD, bold: true, color: D.white, align: "center" });
  line(s, 290, 352, 860, 0, D.lineDark, 4);
  const stages = [
    ["01", "ADMINISTRATOR", "Confirms the prepared permit record"],
    ["02", "STUDENT", "Views the same permit in the app"],
    ["03", "STAFF", "Retrieves the current backend result"],
  ];
  stages.forEach((st, i) => {
    const x = 332 + i * 286;
    rect(s, x, 334, 36, 36, i === 2 ? D.green : D.violet, { geometry: "ellipse" });
    txt(s, st[0], x, 258, 64, 24, { size: 15, bold: true, color: i === 2 ? D.green : D.violet });
    txt(s, st[1], x, 294, 238, 30, { size: 22, font: HEAD, bold: true, color: D.white });
    txt(s, st[2], x, 402, 230, 84, { size: 19, color: D.soft });
  });
  rect(s, 290, 554, 860, 64, D.navy3);
  txt(s, "WHAT IT PROVES", 318, 575, 178, 22, { size: 15, bold: true, color: D.cyan });
  txt(s, "Every channel returns the same backend-controlled record.", 510, 568, 610, 34, { size: 22, bold: true, color: D.white });
  addNotes(s, "Naeem narrates; Divine and Daud operate", "Demonstrate one record across administrator, student, and staff views.", "We will now follow one record through the system. Divine will show the active permit from the administrator's view. We will then open the same permit in the student's mobile application. Finally, Daud will use the authorized staff workflow to retrieve the current result from the backend. The recording demonstrates the student-number fallback path.", "Play recording/combined video.mp4 as the 32-second backup. If the live NFC tap is not available, say clearly that the student-number fallback uses the same authenticated verification service. Do not claim the recording shows NFC scanning.", ["recording/combined video.mp4", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md"]);
}

// 13 — close
{
  const s = p.slides.add();
  s.background.fill = D.navy;
  s.images.add({ blob: campusBytes, contentType: "image/jpeg", alt: "Knutsford University campus", fit: "cover", position: { left: 760, top: 0, width: 520, height: 720 } });
  rect(s, 0, 0, 846, 720, D.navy);
  rect(s, 56, 0, 8, 720, D.green);
  txt(s, "13 / 13", 88, 48, 100, 20, { size: 13, bold: true, color: D.green });
  txt(s, "CONCLUSION", 208, 48, 250, 20, { size: 13, bold: true, color: D.soft });
  txt(s, "One accountable\nsystem replaces\nfragmented decisions.", 88, 124, 650, 240, { size: 62, font: HEAD, bold: true, color: D.white, lineSpacing: 0.92 });
  const points = ["Shared backend across web and mobile", "Verified payment before permit issuance", "Backend-controlled verification with phased adoption"];
  points.forEach((pt, i) => {
    rect(s, 90, 426 + i * 60, 16, 16, i === 2 ? D.green : D.violet, { geometry: "ellipse" });
    txt(s, pt, 128, 418 + i * 60, 590, 34, { size: 21, bold: true, color: D.white });
  });
  rect(s, 920, 500, 250, 112, D.white, { radius: 14 });
  txt(s, "Questions", 944, 532, 202, 50, { size: 38, font: HEAD, bold: true, color: D.violet2, align: "center" });
  txt(s, "Evidence supports continued, controlled institutional adoption.", 88, 632, 650, 32, { size: 20, color: D.cyan });
  addNotes(s, "Divine", "Resolve the opening by restating the integrated achievement and the phased recommendation.", "In conclusion, our project brings permit, payment, governance, and verification activities into one system. The website and mobile application use the same backend rules, payments are verified before permit issuance, and verification returns the current backend result. The pilot provides meaningful evidence for the digital permit and payment workflow. We therefore recommend a controlled, phased rollout with training, monitoring, and continued improvement. Thank you. We are ready for your questions.", "Pause after inviting questions. Divine receives the first question and routes technical questions to Daud and workflow or rollout questions to Naeem.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md", "kntsf-core/public/images/campus-hero.jpg"]);
}

await fs.mkdir(RENDER_DIR, { recursive: true });
for (const [i, slide] of p.slides.items.entries()) {
  const stem = `slide-${String(i + 1).padStart(2, "0")}`;
  const png = await p.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(RENDER_DIR, `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(RENDER_DIR, `${stem}.layout.json`), await layout.text());
}
const montage = await p.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(PREVIEW_DIR, "deck-montage.webp"), new Uint8Array(await montage.arrayBuffer()));
const pptx = await PresentationFile.exportPptx(p);
await pptx.save(OUT);
console.log(`Saved ${OUT}`);
