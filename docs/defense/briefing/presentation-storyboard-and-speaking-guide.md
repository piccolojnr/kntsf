# KNTSF Presentation Storyboard and Speaking Guide

**Project:** NFC-Based Student Permit Verification and Governance Management System for Knutsford University  
**Team:** Daud Abdul-Rahim, Kwuatsenu Divine, and M'Bangot-Menard Naeem Latif Dieudonne  
**Supervisor:** Mr. Bryan Laryea  
**Working presentation length:** 15 minutes  

---

## How to use this guide

This is a **speaking guide**, not a script that everyone must memorize.

Every slide has four clearly separated layers:

1. **Main point** - the one idea the panel should understand.
2. **Speaking prompts** - the points the speaker should explain naturally.
3. **Example talk track** - an example of how the explanation could sound. Adapt it to your own voice; do not read it word for word.
4. **Internal presenter notes** - instructions for the team. These are not said to the panel.

The opening, sensitive factual statements, and conclusion can be rehearsed more closely. The rest should sound like each presenter is explaining a project they understand.

### Tone to aim for

- Professional, but conversational.
- Clear and direct rather than overly academic.
- Confident without exaggerating what was tested or deployed.
- Use technical terms only when they help the panel understand the system.
- Say **"we designed," "we developed,"** and **"our system"** when discussing the project as a team.

### Important factual boundaries

- The submitted report is the historical project record. Do not spend presentation time discussing report corrections.
- The pilot figures validate the digital permit and payment workflow.
- NFC was not fully deployed during the pilot. Do not imply that the pilot was a complete campus-wide NFC rollout.
- The NFC card carries an identifier, not a complete student profile.
- The 337-test result is evidence from the current build after the report was submitted.

---

## Speaker allocation

| Speaker | Main responsibility | Slides and activity | Approximate speaking time |
|---|---|---|---:|
| **Divine** | Opening, problem, solution framing, pilot results, conclusion | Slides 1-3, 9, and 13; website action during demo | 3:55 |
| **Naeem** | Website and mobile experience, rollout, demo narration | Slides 6, 7, and 11; leads slide 12 demo | 5:15 |
| **Daud** | Architecture, payment and permit controls, NFC, security, testing | Slides 4, 5, 8, and 10; performs mobile/NFC demo action | 3:50 |

Daud has the shortest concentrated speaking block. He handles the areas where his developer knowledge is most valuable, but he does not have to introduce the presentation, narrate the entire demonstration, explain non-technical matters, or deliver the conclusion.

---

## Run of show

| Slide | Topic | Speaker | Target |
|---:|---|---|---:|
| 1 | Title and project promise | Divine | 0:25 |
| 2 | Problem and stakes | Divine | 0:55 |
| 3 | Integrated solution | Divine | 0:55 |
| 4 | System architecture | Daud | 1:00 |
| 5 | Permit and payment control | Daud | 0:55 |
| 6 | Website operations | Naeem | 0:55 |
| 7 | Mobile roles | Naeem | 0:55 |
| 8 | NFC, privacy, and security | Daud | 1:15 |
| 9 | Pilot evidence | Divine | 1:05 |
| 10 | Current test evidence | Daud | 0:40 |
| 11 | Budget and rollout | Naeem | 0:55 |
| 12 | Live demonstration | Naeem leads | 2:30 |
| 13 | Conclusion | Divine | 0:35 |

The planned material is approximately 13 minutes. The remaining time is a safety margin for transitions, a panel interruption, or a demonstration recovery.

---

# Slide-by-slide storyboard

## Slide 1 - One platform for trusted student permits and SRC governance

**Speaker:** Divine  
**Target:** 25 seconds  
**Purpose:** Introduce the project and tell the panel what the presentation will prove.

### What appears on the slide

- Full project title.
- Team members and supervisor.
- A short promise: **Faster services, stronger accountability, and safer verification.**

### Main point

The team developed one system that connects student permits, verified payments, SRC activities, and student verification.

### Speaking prompts

- Greet the panel.
- State the project title in a shortened, natural form.
- Explain the overall purpose in one sentence.
- Preview that the team will show the problem, solution, evidence, and demonstration.

### Example talk track - adapt, do not memorize

> Good morning. Our project is an NFC-based student permit verification and governance management system for Knutsford University. We developed it to bring permit requests, verified payments, SRC activities, and student verification into one platform. We will briefly explain the problem, show how the website and mobile application work together, present our results, and demonstrate the verification process.

### Internal presenter notes - do not say aloud

- Keep the opening calm and brief.
- Do not begin listing every feature.
- The title slide should contain no dashboard screenshots or technical diagram.
- Divine hands over to the problem without introducing another speaker yet.

**Transition:** "To understand why we developed the system, we first need to look at the process it was designed to improve."

---

## Slide 2 - Manual processes created delays and weak accountability

**Speaker:** Divine  
**Target:** 55 seconds  
**Purpose:** Explain the problem clearly without exaggerating it.

### What appears on the slide

- Permit activities were handled through separate steps.
- Payment confirmation could take time or be inconsistent.
- Verification and governance records were difficult to monitor and audit.

### Main point

The problem was not only a paper form; it was the lack of one connected process from request to verification.

### Speaking prompts

- Describe the different activities involved in obtaining and verifying a permit.
- Explain that disconnected records make monitoring difficult.
- Mention the effect on both students and administrators.
- Connect the problem to the need for a single system.

### Example talk track - adapt, do not memorize

> Previously, the permit process involved several separate activities. A student could submit a request, but eligibility, payment confirmation, permit issuance, and later verification still had to be coordinated. SRC activities such as announcements, complaints, budgets, and elections also needed reliable records. When these processes are disconnected, students may wait longer and administrators have less visibility. We therefore focused on connecting the complete workflow.

### Internal presenter notes - do not say aloud

- Do not claim that every previous activity was completely manual unless the evidence supports that statement.
- Avoid dramatic language such as "the old system completely failed."
- Use a simple before-workflow visual instead of stock photographs.

**Transition:** "Based on that problem, we designed one platform around the complete student and administrator journey."

---

## Slide 3 - We built one platform around the complete SRC workflow

**Speaker:** Divine  
**Target:** 55 seconds  
**Purpose:** Explain the scope as one integrated solution rather than a list of unrelated features.

### What appears on the slide

- Student permit requests and digital payments.
- Administrative approvals, receipts, complaints, budgets, and elections.
- Mobile access and NFC-assisted verification.

### Main point

The website and mobile application are different ways of accessing the same controlled system.

### Speaking prompts

- Explain the two user-facing channels: website and mobile app.
- State that they use the same backend and database.
- Emphasize one source of truth.
- Avoid reading a long list of features.

### Example talk track - adapt, do not memorize

> Our solution has a website and a mobile application, but they are not separate systems. They use the same backend rules and the same source of data. The website supports public information and administrative work, while the mobile application supports students and authorized verification staff. This means that a permit should not appear valid in one place and invalid in another.

### Internal presenter notes - do not say aloud

- Use one central system visual connected to a student, an SRC administrator, and an authorized verifier.
- The message is integration, not the number of features.
- Hand over to Daud only after making the shared-backend point.

**Transition:** "Daud will now explain the technical structure that keeps the website and mobile application consistent."

---

## Slide 4 - A shared Laravel backend keeps every channel consistent

**Speaker:** Daud  
**Target:** 1 minute  
**Purpose:** Explain the architecture at a level the panel can follow.

### What appears on the slide

- Laravel 13 application and API.
- Inertia, React, and TypeScript website.
- Expo React Native mobile application.
- Sanctum authentication and PostgreSQL production database.

### Main point

Business rules are enforced in one backend instead of being duplicated independently in the website and mobile app.

### Speaking prompts

- Identify the website, mobile app, backend, and database layers.
- Explain that Laravel is the central application and API layer.
- Mention Sanctum and PostgreSQL briefly.
- Explain the benefit: consistent permissions, payments, permits, and verification decisions.

### Example talk track - adapt, do not memorize

> Technically, Laravel is the central application and API layer. The website uses Inertia, React, and TypeScript, while the mobile application is built with Expo React Native. Both clients communicate with the same backend and database. Sanctum protects authenticated API requests, and PostgreSQL is used as the production database. Keeping the main rules in one backend helps us apply the same permission, payment, permit, and verification decisions everywhere.

### Internal presenter notes - do not say aloud

- Do not explain every framework or library.
- The panel needs to understand the responsibility of each layer, not installation details.
- Use a simple three-layer architecture diagram.
- Show Paystack and NFC as integrations, not as databases.

**Transition:** "One important workflow controlled by those backend rules is the permit and payment process."

---

## Slide 5 - A permit is issued only after eligibility and verified payment

**Speaker:** Daud  
**Target:** 55 seconds  
**Purpose:** Show that permit and payment states are controlled by the backend.

### What appears on the slide

- Request and eligibility checks.
- Paystack payment initiation and server-side verification.
- Permit issuance, receipt, status history, and renewal.

### Main point

A payment redirect is not treated as proof of payment; the backend verifies the transaction before the permit is issued.

### Speaking prompts

- Walk through request, eligibility, payment, verification, and issuance.
- Explain server-side verification in plain language.
- Mention that duplicate processing is prevented.
- Connect the issued permit to receipts, history, renewal, and verification.

### Example talk track - adapt, do not memorize

> A student first submits a permit request. After the required checks, the student can begin payment through Paystack. However, returning from the payment page is not enough for the system to assume that payment succeeded. The backend verifies the transaction and records the result. The permit is issued only after that verified state is confirmed. The same record then supports the receipt, permit history, renewal, and later verification.

### Internal presenter notes - do not say aloud

- Keep this explanation focused on control and reliability.
- If asked technically, Daud can explain server-side verification and idempotent processing in more detail.
- Do not make unsupported claims about Paystack guaranteeing that all payment failures are impossible.

**Transition:** "Naeem will now show how administrators and students interact with these controlled workflows."

---

## Slide 6 - The website centralizes daily SRC operations

**Speaker:** Naeem  
**Target:** 55 seconds  
**Purpose:** Explain the practical value of the website.

### What appears on the slide

- Permit review, payment records, and operational dashboards.
- Announcements, complaints, budgets, reports, and elections.
- A public portal for approved SRC information.

### Main point

The website gives authorized administrators one place to manage connected SRC activities while keeping public and private information separate.

### Speaking prompts

- Explain what administrators can manage.
- Mention the public portal separately.
- Explain that access depends on roles.
- Focus on usefulness rather than reading every menu item.

### Example talk track - adapt, do not memorize

> The website provides the main workspace for authorized administrators. It allows them to review permit activity, monitor payments, issue receipts, manage complaints, publish announcements, track budgets, and administer elections. There is also a public-facing area for approved SRC information. Private administrative records remain restricted, while public information can be accessed more easily by students.

### Internal presenter notes - do not say aloud

- Use one current dashboard screenshot and one public portal screenshot.
- Remove or blur personal information.
- Do not use a dashboard showing only zeros or empty states.

**Transition:** "The same separation of responsibilities continues in the mobile application."

---

## Slide 7 - The mobile app separates student and staff workflows

**Speaker:** Naeem  
**Target:** 55 seconds  
**Purpose:** Explain how the mobile experience changes according to the user role.

### What appears on the slide

- Students: requests, payments, permits, receipts, announcements, and elections.
- Authorized staff: scan and verify permits.
- Users see only the actions allowed for their roles.

### Main point

Students and verification staff use the same mobile application for different authorized tasks.

### Speaking prompts

- Explain the student workflow first.
- Explain the narrower verification-staff workflow.
- Mention role-based access in plain language.
- State that the app displays the backend's decision rather than deciding validity by itself.

### Example talk track - adapt, do not memorize

> The mobile application presents different functions depending on the user's role. Students can submit requests, complete payments, view permits and receipts, follow announcements, and participate in elections when eligible. Authorized staff use a more focused verification workflow. The app itself does not independently decide whether a permit is valid; it displays the current result returned by the backend.

### Internal presenter notes - do not say aloud

- Pair a student screen with a staff verification screen.
- Avoid touring every screen during the presentation.
- Do not show an election screenshot saying the presenter is not eligible.

**Transition:** "Daud will now explain what happens during an NFC scan and how the design protects student information."

---

## Slide 8 - NFC verification is fast, private, and backend-controlled

**Speaker:** Daud  
**Target:** 1 minute 15 seconds  
**Purpose:** Explain the NFC process, privacy boundary, and major security controls.

### What appears on the slide

- The NFC card carries an identifier, not a complete student profile.
- The backend checks the current permit and verifier authorization.
- Role control, validation, audit logs, rate limits, and verified payments protect sensitive actions.

### Main point

The NFC identifier starts the lookup, but the authenticated backend makes the verification decision.

### Speaking prompts

- Describe the scan as a short sequence.
- State clearly what is and is not stored on the NFC card.
- Explain that the verifier must be authorized.
- Mention the major security controls without turning the slide into a security lecture.
- Acknowledge that copied identifiers remain a risk requiring backend controls and stronger future options.

### Example talk track - adapt, do not memorize

> During verification, the phone reads the NFC identifier and sends an authenticated request to the backend. The backend checks whether the staff member is authorized, finds the linked permit, and returns the current result. The card does not need to store the student's complete profile or the permit decision. We also use role-based access, server-side validation, audit logs, rate limits, and secure payment verification to protect sensitive actions.

### Internal presenter notes - do not say aloud

- Do not say that NFC completely prevents copying or fraud.
- If asked about copied UIDs, explain that the identifier alone is not sufficient because authorization and current backend state are also checked.
- Future strengthening could include cryptographic tags, controlled devices, or additional verification factors.
- Use a simple sequence: tap, authenticated request, backend checks, result.

**Transition:** "The next question is whether the operational workflow was exercised at a meaningful scale."

---

## Slide 9 - The pilot validated permit and payment operations at scale

**Speaker:** Divine  
**Target:** 1 minute 5 seconds  
**Purpose:** Explain what the pilot figures prove and what they do not prove.

### What appears on the slide

- **2,021** students.
- **2,769** permits.
- **2,769** successful payments.
- **GHS 276,900** processed.

### Main point

The pilot provides operational evidence for the digital permit and payment workflow, but not for a completed campus-wide NFC deployment.

### Speaking prompts

- State the four figures clearly.
- Explain what the numbers mean instead of merely reading them.
- State the NFC pilot limitation clearly.
- Avoid suggesting that every permit represents a different student.

### Example talk track - adapt, do not memorize

> During the pilot, the system recorded 2,021 students, 2,769 permits, and 2,769 successful payments, representing GHS 276,900. These figures show that the digital permit and payment workflow was used at a meaningful scale. However, NFC was not fully deployed during the pilot. We therefore present these results as evidence for the permit and payment operations, not as proof of a completed campus-wide NFC rollout.

### Internal presenter notes - do not say aloud

- The team must agree on the evidence-based explanation for why permits exceed students before rehearsing Q&A.
- Do not improvise an explanation during the defense.
- The wording of the NFC limitation should remain consistent across all three speakers.

**Transition:** "Daud will add the latest automated validation evidence from the current build."

---

## Slide 10 - The latest build passed 337 automated tests

**Speaker:** Daud  
**Target:** 40 seconds  
**Purpose:** Present current technical evidence without implying that the submitted report was changed.

### What appears on the slide

- 337 tests passed.
- 1,657 assertions.
- TypeScript checks and mobile lint passed.
- No failed checks in the verified run.

### Main point

Validation continued after report submission, and the current build has newer automated test evidence.

### Speaking prompts

- State the test and assertion counts.
- Mention the TypeScript and mobile lint checks.
- Describe the evidence as post-submission validation.
- Do not spend time explaining the whole testing framework.

### Example talk track - adapt, do not memorize

> Development and validation continued after the report was submitted. In the latest verified build, 337 automated tests passed with 1,657 assertions. The TypeScript checks and mobile lint also passed. If this count differs from the report, it is because the report contains the submission-time result, while this slide shows validation of the current build.

### Internal presenter notes - do not say aloud

- Use a cropped, readable test result rather than a full terminal screen.
- Label the evidence **Post-submission validation**.
- Be ready to explain what the main groups of tests cover if asked.

**Transition:** "Naeem will now explain how the system could be introduced through the submitted budget and a phased rollout."

---

## Slide 11 - A phased GHS 32,450 rollout keeps implementation realistic

**Speaker:** Naeem  
**Target:** 55 seconds  
**Purpose:** Connect the submitted budget to a realistic implementation approach.

### What appears on the slide

- Submitted budget: **GHS 32,450**.
- Phase 1: controlled setup, training, and verification points.
- Phase 2: wider permit and staff-verification use.
- Phase 3: monitoring, support, and improvement.

### Main point

The system should be introduced in controlled stages rather than treated as an immediate campus-wide switch.

### Speaking prompts

- State the submitted budget once.
- Explain why a phased rollout reduces operational risk.
- Describe the three phases at a high level.
- Do not invent new budget line items.

### Example talk track - adapt, do not memorize

> The submitted implementation budget is GHS 32,450. We recommend using a phased rollout rather than switching the whole institution at once. The first phase would confirm accounts, training, and controlled verification points. The second would expand permit use and authorized staff coverage. The third would focus on monitoring, support, and improvements based on actual use.

### Internal presenter notes - do not say aloud

- Use a three-stage roadmap.
- The budget should appear as the overall implementation envelope.
- Do not claim that this rollout has already happened if it has not.

**Transition:** "We will now demonstrate how one record moves from the student workflow to administrative confirmation and staff verification."

---

## Slide 12 - Demo: from student request to staff verification

**Speaker:** Naeem narrates; Divine and Daud operate  
**Target:** 2 minutes 30 seconds  
**Purpose:** Prove that the website, mobile app, payment/permit record, and verification process are connected.

### What appears on the slide

1. Student account and permit/payment status.
2. Administrative confirmation on the website.
3. Student permit in the mobile application.
4. Authorized staff NFC scan and backend result.

### Main point

The demonstration follows one record through the connected workflow instead of touring unrelated screens.

### Speaking prompts for Naeem

- Begin by stating what the demonstration will prove.
- Narrate only the connection between each step.
- Let Divine operate the website.
- Let Daud operate the mobile/NFC verification step.
- Finish by summarizing what the panel has just seen.

### Example talk track - adapt, do not memorize

> We will now follow one record through the system. First, we will show the student's permit and payment status. Divine will then show the same record from the administrative side. After that, we will open the permit in the mobile application. Finally, Daud will use the authorized staff workflow to scan the NFC identifier and display the current result returned by the backend.

### Internal presenter notes - do not say aloud

- Naeem narrates; Daud should not explain continuously while operating the phone.
- Do not tour menus or open features that are unrelated to the verification flow.
- Use dedicated demo accounts and safe data.
- Prepare the required permit and transaction state before entering the room.
- Charge the phones, enable NFC, disable distracting notifications, and test the network.
- Keep a local backup recording of the same workflow.

### Demo recovery wording

If the live device connection fails, Naeem can say:

> The live device connection is currently unavailable, so we will use our locally recorded run of the same workflow. The verification decision shown still comes from the backend record and an authorized request.

**Transition:** "That demonstration brings the website, mobile application, permit record, and verification process together. Divine will now conclude."

---

## Slide 13 - The project turns fragmented services into one accountable system

**Speaker:** Divine  
**Target:** 35 seconds  
**Purpose:** Resolve the opening and leave the panel with one clear conclusion.

### What appears on the slide

- One source of truth across website and mobile.
- Controlled permits, payments, governance, and verification.
- Evidence supports a phased institutional rollout.

### Main point

The project connects previously separate activities into one accountable platform and provides evidence for continued phased adoption.

### Speaking prompts

- Restate the overall achievement.
- Mention the shared backend, verified payments, and backend-controlled NFC result.
- Refer to the pilot carefully.
- End with the phased rollout recommendation.
- Invite questions.

### Example talk track - adapt, do not memorize

> In conclusion, our project brings previously separate permit, payment, governance, and verification activities into one system. The website and mobile application use the same backend rules, payments are verified before permit issuance, and NFC checks return the current backend result. The pilot provides meaningful evidence for the digital permit and payment workflow. We therefore recommend a controlled, phased rollout with training, monitoring, and continued improvement. Thank you. We are ready for your questions.

### Internal presenter notes - do not say aloud

- Do not end with a separate slide that only says "Thank you."
- Pause after the conclusion instead of continuing to explain.
- All three members should face the panel.
- Divine receives the first question and routes it to the agreed owner.

---

# Demonstration runbook

## Before entering the room

- Create one safe student demo account and one authorized staff account.
- Remove or blur real student names, IDs, phone numbers, emails, payment references, and complaint information.
- Prepare the permit, payment, and receipt records in the exact state needed.
- Charge both phones and the presentation laptop.
- Enable NFC and test the tag or card.
- Confirm the network connection.
- Open the required screens before the presentation begins.
- Record a 60-90 second backup demonstration and store it locally.

## Two-and-a-half-minute demo sequence

| Time | Owner | Action |
|---|---|---|
| 0:00-0:20 | Naeem | State the demonstration claim: one record, one backend, two user channels. |
| 0:20-0:55 | Divine | Show the permit/payment state on the website and the administrator's view. |
| 0:55-1:25 | Naeem | Show the student-facing permit and receipt state in the mobile app. |
| 1:25-2:10 | Daud | Perform the staff NFC scan and display the backend-controlled result. Explain only if clarification is needed. |
| 2:10-2:30 | Naeem | Restate what the demonstration proved and hand back to Divine. |

---

# Q&A ownership

| Owner | Questions they should answer first |
|---|---|
| **Daud** | Laravel architecture, API and authentication, database, Paystack verification, NFC mechanism, role security, audit logs, automated testing, and technical failure modes. |
| **Divine** | Problem statement, objectives, pilot meaning, reported figures, institutional value, conclusion, and recommendations. |
| **Naeem** | Student and administrator workflows, website and mobile usability, public portal, budget, rollout, training, and demonstration flow. |

## High-risk questions to rehearse

### Why does the current test count differ from the submitted report?

The report contains the test result available at submission time. The 337-test result is post-submission validation of the current build.

### Was NFC tested in the pilot?

NFC was not fully deployed during the pilot. The pilot figures validate the digital permit and payment workflow. NFC is demonstrated and technically validated separately.

### Does the NFC card store student information?

The card carries an identifier. The authenticated backend uses that identifier to retrieve the current permit result and only returns information allowed for the authorized verifier.

### What happens if an NFC UID is copied?

The identifier alone should not be treated as complete proof. The backend also checks the verifier's authorization, the linked record, and the current permit state. Stronger future deployments could add cryptographic tags or controlled verification devices.

### Why are there more permits than students?

The figures measure different things. The 2,021 figure counts registered student records, while 2,769 counts processed permit and successful payment records. The original pilot database contains repeated permit records for some students across permit periods, so the number of processed records can exceed the number of unique students. Do not describe every repeated record as a renewal unless that operational detail is confirmed.

### Is the system fully deployed?

The system is implemented, but the reported pilot was not a complete campus-wide NFC rollout. Describe the current build and demonstration accurately, and present full institutional deployment as phased future work.

---

# Required presentation assets

- Official university or project mark in high resolution.
- Fresh administrative dashboard screenshot with meaningful demo data.
- Public portal screenshot containing approved information only.
- Student mobile screenshots showing permit status, receipt/history, and one governance feature.
- Authorized staff verification screen and NFC result.
- Cropped automated-test output showing 337 passed tests and 1,657 assertions.
- Clean architecture, permit lifecycle, and NFC sequence diagrams rebuilt for presentation size.
- Local backup demonstration recording and one still image for the slide deck.

## Do not reuse

- Screenshots containing real student personal information.
- A dashboard showing only zeros or empty data.
- Obsolete test output.
- An election screen saying the presenter is not eligible.
- Dense report diagrams with labels that will be unreadable on a projector.
- Unofficial, distorted, or low-resolution logos.
- Screenshots containing browser clutter, notifications, or unrelated phone content.

---

# Rehearsal plan

## 1. Factual lock

Agree on:

- The exact deployment status.
- What the pilot did and did not validate.
- Why the permit count exceeds the student count.
- How the submitted budget should be described.
- Each member's individual contribution.

## 2. Natural-language rehearsal

- Each speaker reads the speaking prompts first.
- Explain the slide without looking at the example talk track.
- Use the example only to recover missing points or improve the order.
- Replace phrases that do not sound natural in the speaker's voice.

## 3. Timed rehearsal

- Complete the core presentation in approximately 13 minutes.
- If the presentation is too long, reduce repeated feature explanations and demo narration first.
- Do not rush the architecture explanation or the pilot limitation.

## 4. Failure rehearsal

- Practice switching to the backup demonstration within ten seconds.
- Continue confidently without repeatedly apologizing.
- Practice explaining what the backup recording proves.

## 5. Panel rehearsal

- Ask difficult questions about security, methodology, deployment, budget, limitations, testing, and individual contribution.
- The agreed owner answers first.
- Other members add information only when it improves the answer.

---

# Final-day checklist

- PowerPoint and PDF copies of the final deck open correctly on the presentation laptop.
- Fonts, diagrams, screenshots, and videos work without internet where possible.
- Phones are charged, NFC is enabled, and notification previews are disabled.
- Demo accounts are already signed in.
- The backup recording is stored locally and tested.
- Each speaker has a one-page cue sheet containing only slide prompts, transitions, and Q&A areas.
- The team has one agreed statement about limitations and one realistic next-step recommendation.

---

## Next step

Before building the PowerPoint, the team should review this guide together and change any example wording that does not sound natural for the assigned speaker. The speaking prompts and factual boundaries should remain consistent even when the exact wording changes.
