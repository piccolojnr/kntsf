import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const PREVIEW_DIR = path.join(ROOT, "docs", "presentation", "previews", "build-v1");
const CORE_DIR = await resolveCoreDir();
const OUT = path.join(ROOT, "docs", "presentation", "archive", "final-defense-deck-initial.pptx");
const RENDER_DIR = path.join(PREVIEW_DIR, "rendered");
const CAMPUS = path.join(CORE_DIR, "public", "images", "campus-hero.jpg");
const LOGO = path.join(CORE_DIR, "public", "images", "kntsf-logo.png");
const ADMIN = path.join(PREVIEW_DIR, "frames", "admin00001.png");
const STUDENT = path.join(PREVIEW_DIR, "frames", "student00001.png");
const VERIFIED = path.join(PREVIEW_DIR, "frames", "verified00001.png");

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

const campusBytes = new Uint8Array(await fs.readFile(CAMPUS));
const logoBytes = new Uint8Array(await fs.readFile(LOGO));
const adminBytes = new Uint8Array(await fs.readFile(ADMIN));
const studentBytes = new Uint8Array(await fs.readFile(STUDENT));
const verifiedBytes = new Uint8Array(await fs.readFile(VERIFIED));

const W = 1280;
const H = 720;
const C = {
  bg: "#F8F9FB",
  white: "#FFFFFF",
  ink: "#101828",
  muted: "#667085",
  rule: "#D0D5DD",
  panel: "#EAECF0",
  panel2: "#F2F4F7",
  accent: "#6C5CE7",
  accentSoft: "#EEEAFE",
  green: "#087A5B",
  greenSoft: "#DCFCE7",
  gold: "#B45309",
  goldSoft: "#FEF3C7",
  red: "#B42318",
  redSoft: "#FEE4E2",
  navy: "#111827",
};
const FONT = "Arial";

function addRect(slide, x, y, w, h, fill, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || "rect",
    name: opts.name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: opts.line || { style: "solid", fill: opts.lineColor || fill, width: opts.lineWidth ?? 0 },
    ...(opts.borderRadius ? { borderRadius: opts.borderRadius } : {}),
  });
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    name: opts.name,
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize: opts.fontSize ?? 22,
    typeface: FONT,
    color: opts.color ?? C.ink,
    bold: opts.bold ?? false,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.vAlign ?? "top",
    autoFit: opts.autoFit ?? "shrinkText",
    insets: opts.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
    ...(opts.lineSpacing ? { lineSpacing: opts.lineSpacing } : {}),
  };
  return box;
}

function addBullets(slide, items, x, y, w, h, opts = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text.set(items.map((item) => ({
    bulletCharacter: "•",
    marginLeft: 24,
    indent: -14,
    spaceAfter: opts.spaceAfter ?? 14,
    runs: Array.isArray(item) ? item : [item],
  })));
  box.text.style = {
    fontSize: opts.fontSize ?? 22,
    typeface: FONT,
    color: opts.color ?? C.ink,
    autoFit: "shrinkText",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return box;
}

function addLine(slide, x, y, w, h = 0, color = C.rule, width = 2) {
  return slide.shapes.add({
    geometry: "straightConnector1",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function baseSlide(pres, no, section, title) {
  const slide = pres.slides.add();
  slide.background.fill = C.bg;
  addText(slide, section.toUpperCase(), 48, 30, 420, 20, { fontSize: 13, bold: true, color: C.accent });
  addText(slide, title, 48, 58, 1170, 76, { fontSize: 48, bold: true, autoFit: "shrinkText" });
  addLine(slide, 48, 674, 1134, 0, C.rule, 1);
  addText(slide, "KNTSF", 48, 684, 100, 18, { fontSize: 12, bold: true, color: C.muted });
  addText(slide, String(no).padStart(2, "0"), 1130, 684, 52, 18, { fontSize: 12, color: C.muted, align: "right" });
  return slide;
}

function addNotes(slide, speaker, mainPoint, talkTrack, internal, sources) {
  const notes = [
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
  ].join("\n");
  slide.speakerNotes.textFrame.setText(notes);
  slide.speakerNotes.setVisible(true);
}

const p = Presentation.create({ slideSize: { width: W, height: H } });

// 1 — cover (Codex Grid 08 hierarchy: large text field + dominant hero)
{
  const s = p.slides.add();
  s.background.fill = C.bg;
  addRect(s, 0, 0, 24, H, C.accent);
  addText(s, "FINAL YEAR PROJECT", 58, 46, 430, 24, { fontSize: 14, bold: true, color: C.accent });
  addText(s, "NFC-Based Student Permit Verification and Governance Management System", 58, 108, 560, 250, { fontSize: 54, bold: true, lineSpacing: 0.95 });
  addText(s, "One connected platform for permits, verified payments, SRC operations, and student verification.", 58, 384, 545, 96, { fontSize: 23, color: C.muted });
  addText(s, "Daud Abdul-Rahim  •  Kwuatsenu Divine  •  M'Bangot-Menard Naeem Latif Dieudonne", 58, 538, 570, 58, { fontSize: 17, bold: true });
  addText(s, "Supervisor: Mr. Bryan Laryea", 58, 612, 420, 24, { fontSize: 16, color: C.muted });
  s.images.add({ blob: campusBytes, contentType: "image/jpeg", alt: "Knutsford University campus", fit: "cover", geometry: "roundRect", borderRadius: 18, position: { left: 670, top: 42, width: 560, height: 610 } });
  addRect(s, 692, 66, 118, 118, C.white, { geometry: "roundRect", borderRadius: 16, lineColor: C.white });
  s.images.add({ blob: logoBytes, contentType: "image/png", alt: "Knutsford University mark", fit: "contain", position: { left: 702, top: 76, width: 98, height: 98 } });
  addText(s, "Faster services • stronger accountability • safer verification", 690, 594, 514, 38, { fontSize: 17, bold: true, color: C.white, align: "center", vAlign: "middle" });
  addNotes(s, "Divine", "Introduce the project as one connected platform and preview the proof points.", "Good morning. Our project is an NFC-based student permit verification and governance management system for Knutsford University. We developed it to connect permit requests, verified payments, SRC activities, and student verification in one platform. We will explain the problem, show how the system works, present our evidence, and demonstrate the connected workflow.", "Keep the opening under 25 seconds. Do not list every feature. Move directly into the problem.", ["KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md", "KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "kntsf-core/public/images/campus-hero.jpg", "kntsf-core/public/images/kntsf-logo.png"]);
}

// 2 — problem
{
  const s = baseSlide(p, 2, "The problem", "Disconnected processes created delays and weak accountability");
  addText(s, "The challenge was not just a paper form. It was the missing connection between each decision.", 48, 150, 560, 72, { fontSize: 25, color: C.muted });
  addBullets(s, [
    [{ run: "Students", textStyle: { bold: true } }, " could wait while eligibility and payment were confirmed."],
    [{ run: "Administrators", textStyle: { bold: true } }, " had to coordinate records across separate activities."],
    [{ run: "Verification staff", textStyle: { bold: true } }, " needed a current, auditable permit decision."],
  ], 48, 262, 560, 270, { fontSize: 22, spaceAfter: 24 });
  addText(s, "A fragmented journey", 700, 154, 430, 34, { fontSize: 24, bold: true });
  const labels = ["Request", "Payment", "Approval", "Verification"];
  labels.forEach((label, i) => {
    const y = 214 + i * 94;
    addRect(s, 704, y, 398, 66, C.white, { geometry: "roundRect", borderRadius: 10, lineColor: C.rule, lineWidth: 1 });
    addText(s, `${String(i + 1).padStart(2, "0")}  ${label}`, 728, y + 17, 320, 32, { fontSize: 22, bold: true });
    if (i < labels.length - 1) {
      addLine(s, 903, y + 66, 0, 28, C.rule, 2);
      addText(s, "break", 916, y + 70, 58, 20, { fontSize: 12, bold: true, color: C.red });
    }
  });
  addRect(s, 700, 604, 434, 42, C.redSoft, { geometry: "roundRect", borderRadius: 8, lineColor: C.redSoft });
  addText(s, "Result: slower service and limited audit visibility", 718, 615, 398, 22, { fontSize: 16, bold: true, color: C.red });
  addNotes(s, "Divine", "Explain that the real problem was the disconnected end-to-end workflow.", "Previously, the permit process involved several separate activities. A request could be submitted, but eligibility, payment confirmation, permit issuance, and later verification still had to be coordinated. When those records are disconnected, students may wait longer and administrators have less visibility. We therefore focused on connecting the complete workflow.", "Avoid saying every old activity completely failed or was entirely manual. Transition by saying the solution was designed around the full journey.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 3 — integrated solution
{
  const s = baseSlide(p, 3, "The solution", "One backend connects the website, mobile app, and verification decisions");
  addText(s, "Different interfaces. One controlled source of truth.", 48, 150, 600, 42, { fontSize: 25, color: C.muted });
  // connectors first
  addLine(s, 408, 246, 88, 108, C.accent, 3);
  addLine(s, 784, 246, 88, 108, C.accent, 3);
  addLine(s, 640, 354, 0, 188, C.accent, 3);
  addRect(s, 496, 278, 288, 152, C.navy, { geometry: "roundRect", borderRadius: 18, lineColor: C.navy });
  addText(s, "SHARED BACKEND", 528, 307, 224, 28, { fontSize: 18, bold: true, color: "#C4B5FD", align: "center" });
  addText(s, "Laravel rules + one database", 528, 348, 224, 52, { fontSize: 25, bold: true, color: C.white, align: "center", vAlign: "middle" });
  const nodes = [
    { x: 88, y: 176, title: "Website", body: "Public information and administrative operations" },
    { x: 872, y: 176, title: "Mobile app", body: "Student services and authorized staff verification" },
    { x: 482, y: 510, title: "Current decision", body: "The same permit, payment, role, and audit state everywhere" },
  ];
  nodes.forEach((n, i) => {
    addRect(s, n.x, n.y, i === 2 ? 316 : 320, 126, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
    addText(s, n.title, n.x + 24, n.y + 20, (i === 2 ? 268 : 272), 30, { fontSize: 24, bold: true, color: C.accent });
    addText(s, n.body, n.x + 24, n.y + 60, (i === 2 ? 268 : 272), 48, { fontSize: 17, color: C.muted });
  });
  addNotes(s, "Divine", "Show that the website and mobile application are channels into the same controlled system.", "Our solution has a website and a mobile application, but they are not separate systems. They use the same backend rules and the same source of data. The website supports public information and administrative work, while the mobile application supports students and authorized verification staff. A permit should therefore not appear valid in one channel and invalid in another.", "After the shared-backend point, hand over to Daud for the architecture.", ["SYSTEM_ARCHITECTURE.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 4 — architecture
{
  const s = baseSlide(p, 4, "Architecture", "Laravel enforces the business rules for every channel");
  addText(s, "Web and mobile remain independent interfaces, while permissions, payments, permits, and verification stay centralized.", 48, 148, 1140, 54, { fontSize: 23, color: C.muted });
  // connectors first
  addLine(s, 330, 298, 160, 0, C.rule, 3);
  addLine(s, 330, 478, 80, 0, C.rule, 3);
  addLine(s, 410, 298, 0, 180, C.rule, 3);
  addLine(s, 410, 298, 80, 0, C.rule, 3);
  addLine(s, 780, 298, 146, 0, C.rule, 3);
  addLine(s, 640, 386, 0, 120, C.rule, 3);
  addLine(s, 640, 386, 330, 120, C.rule, 3);
  const node = (x,y,w,h,title,body,fill=C.white,titleColor=C.ink) => {
    addRect(s,x,y,w,h,fill,{geometry:"roundRect",borderRadius:14,lineColor:fill===C.white?C.rule:fill,lineWidth:1});
    addText(s,title,x+20,y+18,w-40,30,{fontSize:23,bold:true,color:titleColor,align:"center"});
    addText(s,body,x+20,y+58,w-40,h-72,{fontSize:16,color:fill===C.navy?"#D0D5DD":C.muted,align:"center"});
  };
  node(60,236,270,124,"Website","Inertia • React • TypeScript");
  node(60,416,270,124,"Mobile app","Expo React Native");
  node(490,226,290,160,"Laravel 13","Application + API\nSanctum authentication",C.navy,C.white);
  node(926,236,280,124,"PostgreSQL","Production data store");
  node(492,506,296,112,"Paystack","Server-side payment verification",C.accentSoft,C.accent);
  node(866,506,340,112,"NFC + staff device","Identifier initiates an authenticated lookup",C.greenSoft,C.green);
  addRect(s, 390, 420, 500, 58, C.bg, { geometry: "roundRect", borderRadius: 8, lineColor: C.bg });
  addText(s, "Central rule: clients display the backend's current decision", 400, 430, 480, 36, { fontSize: 18, bold: true, color: C.accent, align: "center" });
  addNotes(s, "Daud", "Explain the responsibility of each technical layer without turning the slide into a framework inventory.", "Technically, Laravel is the central application and API layer. The website uses Inertia, React, and TypeScript, while the mobile application is built with Expo React Native. Both clients communicate with the same backend and database. Sanctum protects authenticated API requests, and PostgreSQL is used for production data. Keeping the main rules in one backend applies the same permission, payment, permit, and verification decisions everywhere.", "Keep this to about one minute. Paystack and NFC are integrations, not databases.", ["SYSTEM_ARCHITECTURE.md", "kntsf-core/docs/MOBILE_API.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 5 — permit and payment process (Codex Grid 17 hierarchy)
{
  const s = baseSlide(p, 5, "Controlled workflow", "A permit is issued only after eligibility and verified payment");
  addText(s, "A browser redirect is not accepted as proof of payment; the backend verifies the transaction first.", 48, 148, 1120, 48, { fontSize: 23, color: C.muted });
  addLine(s, 116, 346, 1000, 0, C.rule, 3);
  const steps = [
    { x: 82, n: "01", title: "Request", body: "Student submits the permit request." },
    { x: 342, n: "02", title: "Eligibility", body: "Backend applies the required checks." },
    { x: 602, n: "03", title: "Verify payment", body: "Paystack result is confirmed server-side." },
    { x: 862, n: "04", title: "Issue permit", body: "Receipt, history, renewal, and verification use the same record." },
  ];
  steps.forEach((st, i) => {
    addRect(s, st.x + 96, 328, 36, 36, i === 3 ? C.green : C.accent, { geometry: "ellipse", lineColor: i === 3 ? C.green : C.accent });
    addText(s, st.n, st.x, 242, 90, 28, { fontSize: 16, bold: true, color: C.accent });
    addText(s, st.title, st.x, 280, 224, 34, { fontSize: 24, bold: true });
    addText(s, st.body, st.x, 392, 224, 104, { fontSize: 18, color: C.muted });
  });
  addRect(s, 82, 548, 1004, 72, C.greenSoft, { geometry: "roundRect", borderRadius: 10, lineColor: C.greenSoft });
  addText(s, "Outcome", 106, 568, 98, 24, { fontSize: 16, bold: true, color: C.green });
  addText(s, "The permit is created only from a verified backend state; duplicate processing is controlled.", 220, 562, 832, 34, { fontSize: 20, bold: true, color: C.green });
  addNotes(s, "Daud", "Explain why server-side payment verification controls permit issuance.", "A student first submits a permit request. After the required checks, the student can begin payment through Paystack. Returning from the payment page is not enough for the system to assume that payment succeeded. The backend verifies the transaction and records the result. The permit is issued only after that verified state is confirmed.", "If asked, explain server-side verification and idempotent processing. Do not claim that every payment failure is impossible.", ["kntsf-core/docs/PAYSTACK_INTEGRATION.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 6 — website operations
{
  const s = baseSlide(p, 6, "Website experience", "The website centralizes daily SRC operations");
  s.images.add({ blob: adminBytes, contentType: "image/png", alt: "Administrator permit detail from the KNTSF website", fit: "contain", geometry: "roundRect", borderRadius: 12, position: { left: 48, top: 154, width: 700, height: 434 } });
  addRect(s, 778, 154, 404, 434, C.white, { geometry: "roundRect", borderRadius: 12, lineColor: C.rule, lineWidth: 1 });
  addText(s, "Authorized workspace", 810, 184, 336, 32, { fontSize: 24, bold: true, color: C.accent });
  addBullets(s, [
    "Review permit activity and payment records",
    "Issue receipts and monitor status history",
    "Manage complaints, announcements, budgets, reports, and elections",
    "Separate public information from restricted administrative records",
  ], 810, 244, 332, 270, { fontSize: 20, spaceAfter: 16 });
  addRect(s, 810, 522, 336, 44, C.accentSoft, { geometry: "roundRect", borderRadius: 8, lineColor: C.accentSoft });
  addText(s, "Role permissions control access", 826, 533, 304, 22, { fontSize: 17, bold: true, color: C.accent, align: "center" });
  addNotes(s, "Naeem", "Explain the practical value of a single administrative workspace and the public/private boundary.", "The website gives authorized administrators one place to review permit activity, monitor payments, issue receipts, manage complaints, publish announcements, track budgets, and administer elections. A separate public-facing area exposes only approved SRC information. Private administrative records remain restricted through role permissions.", "Focus on usefulness. Do not read every menu item. The screenshot uses prepared demonstration data.", ["recording/combined video.mp4", "kntsf-core/docs/PUBLIC_PORTAL.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 7 — mobile roles
{
  const s = baseSlide(p, 7, "Mobile experience", "One mobile app presents different workflows by role");
  addText(s, "The app displays the backend's decision; it does not independently decide whether a permit is valid.", 48, 146, 1140, 44, { fontSize: 22, color: C.muted });
  addRect(s, 48, 214, 548, 392, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
  addRect(s, 636, 214, 548, 392, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
  s.images.add({ blob: studentBytes, contentType: "image/png", alt: "Student permit view in the KNTSF mobile application", fit: "cover", crop: { left: 0.295, top: 0, right: 0.497, bottom: 0 }, geometry: "roundRect", borderRadius: 10, position: { left: 78, top: 238, width: 180, height: 344 } });
  s.images.add({ blob: verifiedBytes, contentType: "image/png", alt: "Authorized staff permit verification result", fit: "cover", crop: { left: 0.295, top: 0, right: 0.497, bottom: 0 }, geometry: "roundRect", borderRadius: 10, position: { left: 666, top: 238, width: 180, height: 344 } });
  addText(s, "Student", 292, 244, 258, 34, { fontSize: 25, bold: true, color: C.accent });
  addBullets(s, ["Permit requests", "Payments and receipts", "Current permit status", "Announcements and elections"], 292, 300, 258, 220, { fontSize: 19, spaceAfter: 13 });
  addText(s, "Authorized staff", 880, 244, 258, 34, { fontSize: 25, bold: true, color: C.green });
  addBullets(s, ["Focused verification workflow", "Student-number fallback", "Current backend result", "Verification audit record"], 880, 300, 258, 220, { fontSize: 19, spaceAfter: 13 });
  addNotes(s, "Naeem", "Explain that students and staff use the same app for different authorized tasks.", "The mobile application presents different functions depending on the user's role. Students can submit requests, complete payments, view permits and receipts, follow announcements, and participate in elections when eligible. Authorized staff use a focused verification workflow. The application displays the current result returned by the backend rather than deciding validity by itself.", "Avoid touring every screen. The recording demonstrates the student-number fallback path, not an NFC tap.", ["recording/combined video.mp4", "kntsf-core/docs/MOBILE_API.md", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md"]);
}

// 8 — NFC/privacy/security
{
  const s = baseSlide(p, 8, "Verification and security", "NFC starts the lookup; the backend decides");
  addText(s, "The card carries an identifier—not a complete student profile or a permanent permit decision.", 48, 146, 1130, 44, { fontSize: 23, color: C.muted });
  // connectors first
  addLine(s, 336, 330, 122, 0, C.accent, 3);
  addLine(s, 754, 330, 122, 0, C.accent, 3);
  const blocks = [
    { x: 62, title: "1  Tap", body: "The phone reads the registered NFC identifier.", fill: C.accentSoft, color: C.accent },
    { x: 458, title: "2  Check", body: "The backend confirms the verifier, linked record, and current permit state.", fill: C.navy, color: C.white },
    { x: 876, title: "3  Return", body: "Only the authorized verification result is displayed and logged.", fill: C.greenSoft, color: C.green },
  ];
  blocks.forEach((b) => {
    addRect(s, b.x, 238, 300, 186, b.fill, { geometry: "roundRect", borderRadius: 16, lineColor: b.fill });
    addText(s, b.title, b.x + 28, 270, 244, 34, { fontSize: 25, bold: true, color: b.color });
    addText(s, b.body, b.x + 28, 322, 244, 76, { fontSize: 19, color: b.fill === C.navy ? "#E5E7EB" : C.muted });
  });
  addText(s, "Controls around the lookup", 62, 478, 420, 32, { fontSize: 24, bold: true });
  const controls = ["Role-based access", "Server validation", "Audit logs", "Rate limits", "Verified payments"];
  controls.forEach((label, i) => {
    const x = 62 + i * 222;
    addRect(s, x, 536, 192, 54, i === 2 ? C.accentSoft : C.white, { geometry: "roundRect", borderRadius: 8, lineColor: C.rule, lineWidth: 1 });
    addText(s, label, x + 12, 550, 168, 26, { fontSize: 16, bold: true, color: i === 2 ? C.accent : C.ink, align: "center" });
  });
  addText(s, "Limitation: copied identifiers remain a risk; stronger deployments can add cryptographic tags or controlled devices.", 62, 620, 1114, 32, { fontSize: 16, color: C.muted });
  addNotes(s, "Daud", "Explain the privacy boundary and why the server, not the card, determines validity.", "During verification, the phone reads the NFC identifier and sends an authenticated request to the backend. The backend checks whether the staff member is authorized, finds the linked permit, and returns the current result. The card does not need to store the student's complete profile. We also use role-based access, validation, audit logs, rate limits, and secure payment verification around sensitive actions.", "Do not say NFC completely prevents copying. Acknowledge the limitation and the stronger future options if asked.", ["kntsf-core/docs/VERIFICATION_MODULE.md", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md", "KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx"]);
}

// 9 — pilot metrics (Codex Grid 19 hierarchy)
{
  const s = baseSlide(p, 9, "Pilot evidence", "The pilot exercised the digital permit and payment workflow at scale");
  addText(s, "These figures validate permit and payment operations—not a completed campus-wide NFC rollout.", 48, 146, 1138, 46, { fontSize: 23, color: C.muted });
  const stats = [
    { x: 48, stat: "2,021", label: "registered student records", color: C.accent },
    { x: 432, stat: "2,769", label: "permit records linked to successful payments", color: C.accent },
    { x: 816, stat: "GHS 276,900", label: "value of successful pilot transactions", color: C.green },
  ];
  stats.forEach((st) => {
    addRect(s, st.x, 244, 350, 250, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
    addText(s, st.stat, st.x + 28, 292, 294, 72, { fontSize: st.stat.length > 8 ? 43 : 56, bold: true, color: st.color });
    addText(s, st.label, st.x + 28, 386, 294, 70, { fontSize: 19, color: C.muted });
  });
  addRect(s, 48, 532, 1118, 82, C.goldSoft, { geometry: "roundRect", borderRadius: 10, lineColor: C.goldSoft });
  addText(s, "Why permits exceed students", 72, 551, 298, 28, { fontSize: 19, bold: true, color: C.gold });
  addText(s, "The figures count different things: 2,021 registered students versus 2,769 processed permit/payment records. Some students have repeated records across permit periods.", 390, 548, 744, 46, { fontSize: 18, color: C.ink });
  addNotes(s, "Divine", "Present the four pilot figures and clearly limit what they prove.", "During the pilot, the system captured 2,021 registered student records and processed 2,769 permit and successful payment records, representing GHS 276,900. These figures show meaningful use of the digital permit and payment workflow. NFC was not fully deployed during that pilot, so we do not present these numbers as proof of a completed campus-wide NFC rollout.", "If asked why permits exceed students, use the agreed explanation about repeated permit records across periods. Do not call every repeated record a renewal.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md"]);
}

// 10 — validation
{
  const s = baseSlide(p, 10, "Post-submission validation", "The latest verified build passed 337 automated tests");
  addText(s, "Development and validation continued after the report was submitted.", 48, 148, 900, 38, { fontSize: 23, color: C.muted });
  addRect(s, 48, 228, 480, 330, C.navy, { geometry: "roundRect", borderRadius: 16, lineColor: C.navy });
  addText(s, "337", 88, 270, 390, 100, { fontSize: 88, bold: true, color: C.white });
  addText(s, "automated tests passed", 88, 382, 380, 40, { fontSize: 25, bold: true, color: "#C4B5FD" });
  addText(s, "1,657 assertions", 88, 456, 380, 42, { fontSize: 29, bold: true, color: C.white });
  addRect(s, 572, 228, 596, 330, C.white, { geometry: "roundRect", borderRadius: 16, lineColor: C.rule, lineWidth: 1 });
  addText(s, "Verified checks", 608, 264, 510, 34, { fontSize: 25, bold: true });
  addBullets(s, ["Laravel feature and API tests", "TypeScript checks passed", "Mobile lint passed", "No failed checks in the verified run"], 608, 330, 510, 190, { fontSize: 21, spaceAfter: 17 });
  addRect(s, 48, 596, 1120, 48, C.accentSoft, { geometry: "roundRect", borderRadius: 8, lineColor: C.accentSoft });
  addText(s, "The report contains the submission-time count; this slide reports the newer current-build validation.", 72, 609, 1072, 24, { fontSize: 17, bold: true, color: C.accent, align: "center" });
  addNotes(s, "Daud", "Present the current validation evidence without implying the submitted report was changed.", "Validation continued after the report was submitted. In the latest verified build, 337 automated tests passed with 1,657 assertions. The TypeScript checks and mobile lint also passed. If this count differs from the report, it is because the report contains the submission-time result while this slide shows the current build.", "Keep this to about 40 seconds. Be ready to name the main test groups if asked.", ["KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 11 — budget and rollout
{
  const s = baseSlide(p, 11, "Implementation path", "A phased GHS 32,450 rollout keeps adoption realistic");
  addRect(s, 48, 162, 270, 430, C.navy, { geometry: "roundRect", borderRadius: 16, lineColor: C.navy });
  addText(s, "SUBMITTED BUDGET", 78, 202, 210, 24, { fontSize: 14, bold: true, color: "#C4B5FD", align: "center" });
  addText(s, "GHS\n32,450", 78, 260, 210, 150, { fontSize: 50, bold: true, color: C.white, align: "center", vAlign: "middle" });
  addText(s, "Implementation envelope", 78, 466, 210, 48, { fontSize: 18, color: "#D0D5DD", align: "center" });
  addText(s, "Controlled stages reduce operational risk and create room for training, monitoring, and improvement.", 360, 160, 806, 58, { fontSize: 23, color: C.muted });
  addLine(s, 408, 366, 700, 0, C.rule, 3);
  const phases = [
    { x: 374, label: "PHASE 1", title: "Prepare", body: "Confirm accounts, training, and controlled verification points." },
    { x: 630, label: "PHASE 2", title: "Expand", body: "Widen permit use and authorized staff coverage." },
    { x: 886, label: "PHASE 3", title: "Improve", body: "Monitor adoption, support users, and refine the system." },
  ];
  phases.forEach((ph, i) => {
    addRect(s, ph.x + 88, 348, 36, 36, i === 2 ? C.green : C.accent, { geometry: "ellipse", lineColor: i === 2 ? C.green : C.accent });
    addText(s, ph.label, ph.x, 268, 212, 22, { fontSize: 14, bold: true, color: C.accent });
    addText(s, ph.title, ph.x, 302, 212, 34, { fontSize: 25, bold: true });
    addText(s, ph.body, ph.x, 410, 212, 112, { fontSize: 18, color: C.muted });
  });
  addNotes(s, "Naeem", "Connect the submitted budget to a controlled three-phase implementation approach.", "The submitted implementation budget is GHS 32,450. We recommend using a phased rollout rather than switching the whole institution at once. The first phase confirms accounts, training, and controlled verification points. The second expands permit use and staff coverage. The third focuses on monitoring, support, and improvements based on actual use.", "Do not invent or revise budget line items. Do not imply the rollout has already happened.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
}

// 12 — demo
{
  const s = baseSlide(p, 12, "Demonstration", "One record connects every channel");
  addText(s, "Student 26100001  •  permit ending 0259  •  active status", 48, 146, 850, 34, { fontSize: 21, color: C.muted });
  addRect(s, 48, 206, 420, 320, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
  addRect(s, 510, 206, 300, 320, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
  addRect(s, 852, 206, 300, 320, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.rule, lineWidth: 1 });
  addText(s, "Administrator", 72, 220, 372, 30, { fontSize: 21, bold: true, color: C.accent, align: "center" });
  addText(s, "Student", 534, 220, 252, 30, { fontSize: 21, bold: true, color: C.accent, align: "center" });
  addText(s, "Staff verification", 876, 220, 252, 30, { fontSize: 21, bold: true, color: C.green, align: "center" });
  s.images.add({ blob: adminBytes, contentType: "image/png", alt: "Administrator permit record", fit: "contain", position: { left: 66, top: 266, width: 384, height: 216 } });
  s.images.add({ blob: studentBytes, contentType: "image/png", alt: "Student mobile permit record", fit: "cover", crop: { left: 0.295, top: 0, right: 0.497, bottom: 0 }, geometry: "roundRect", borderRadius: 8, position: { left: 574, top: 258, width: 172, height: 250 } });
  s.images.add({ blob: verifiedBytes, contentType: "image/png", alt: "Staff permit verification result", fit: "cover", crop: { left: 0.295, top: 0, right: 0.497, bottom: 0 }, geometry: "roundRect", borderRadius: 8, position: { left: 916, top: 258, width: 172, height: 250 } });
  addText(s, "→", 470, 335, 38, 48, { fontSize: 36, bold: true, color: C.accent, align: "center" });
  addText(s, "→", 812, 335, 38, 48, { fontSize: 36, bold: true, color: C.accent, align: "center" });
  addRect(s, 48, 562, 1104, 76, C.accentSoft, { geometry: "roundRect", borderRadius: 10, lineColor: C.accentSoft });
  addText(s, "What the demonstration proves", 72, 582, 292, 28, { fontSize: 18, bold: true, color: C.accent });
  addText(s, "The website, student app, and authorized staff workflow return the same backend-controlled record.", 382, 576, 740, 42, { fontSize: 19, bold: true, color: C.ink });
  addNotes(s, "Naeem narrates; Divine and Daud operate", "Demonstrate one record across administrator, student, and staff views.", "We will now follow one record through the system. Divine will show the active permit from the administrator's view. We will then open the same permit in the student's mobile application. Finally, Daud will use the authorized staff workflow to retrieve the current result from the backend. The recording demonstrates the student-number fallback path.", "Use recording/combined video.mp4 as the 32-second fallback. If the live NFC tap is not available, say clearly that the student-number fallback uses the same authenticated verification service. Do not claim the recording shows NFC scanning.", ["recording/combined video.mp4", "KNTSF_PRESENTATION_FACT_LOCK_AND_DEMO_PLAN.md"]);
}

// 13 — close
{
  const s = p.slides.add();
  s.background.fill = C.navy;
  addText(s, "CONCLUSION", 58, 48, 260, 24, { fontSize: 14, bold: true, color: "#C4B5FD" });
  addText(s, "One accountable system replaces fragmented decisions", 58, 106, 1010, 132, { fontSize: 58, bold: true, color: C.white, lineSpacing: 0.96 });
  addText(s, "The project connects:", 58, 286, 360, 34, { fontSize: 23, color: "#D0D5DD" });
  const closing = [
    "a shared backend across web and mobile",
    "verified payment before permit issuance",
    "backend-controlled verification with an honest phased rollout",
  ];
  closing.forEach((t, i) => {
    const y = 350 + i * 72;
    addRect(s, 60, y + 5, 18, 18, i === 2 ? C.green : C.accent, { geometry: "ellipse", lineColor: i === 2 ? C.green : C.accent });
    addText(s, t, 104, y, 850, 40, { fontSize: 24, bold: true, color: C.white });
  });
  addRect(s, 958, 472, 250, 120, C.white, { geometry: "roundRect", borderRadius: 14, lineColor: C.white });
  addText(s, "Questions", 978, 502, 210, 52, { fontSize: 36, bold: true, color: C.accent, align: "center", vAlign: "middle" });
  addText(s, "Evidence supports continued, controlled institutional adoption.", 58, 614, 780, 36, { fontSize: 20, color: "#C4B5FD" });
  addNotes(s, "Divine", "Resolve the opening by restating the integrated achievement and the phased recommendation.", "In conclusion, our project brings permit, payment, governance, and verification activities into one system. The website and mobile application use the same backend rules, payments are verified before permit issuance, and verification returns the current backend result. The pilot provides meaningful evidence for the digital permit and payment workflow. We therefore recommend a controlled, phased rollout with training, monitoring, and continued improvement. Thank you. We are ready for your questions.", "Pause after inviting questions. Divine receives the first question and routes technical questions to Daud and workflow or rollout questions to Naeem.", ["KNTSF_REPORT_UPDATED_WITH_PILOT_RESULTS_AND_BUDGET.docx", "KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md"]);
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
