# KNTSF Presentation Fact Lock and Demo Plan

**Purpose:** Internal preparation document for the three presenters  
**Use with:** `KNTSF_PRESENTATION_STORYBOARD_SPEAKING_GUIDE.md`  
**Status:** Facts checked against the submitted report, pilot database, current Laravel project, mobile application, and automated tests

---

## 1. The facts all three speakers must use

| Topic | Confirmed position | Safe wording for the panel |
|---|---|---|
| Registered students | **2,021** student records were captured during the pilot. | "The pilot captured 2,021 registered student records." |
| Processed permit records | **2,769** permit records were linked to successful payments at the report snapshot. | "The pilot processed 2,769 permit and payment records." |
| Successful payments | **2,769** successfully completed payment records were linked to permits. | "There were 2,769 successful payments linked to permit processing." |
| Revenue | **GHS 276,900**, which is exactly 2,769 × GHS 100. | "Those successful transactions represented GHS 276,900." |
| NFC pilot status | NFC was **not fully deployed** during the reported pilot. | "The pilot validated the permit and payment workflow; NFC was technically implemented and demonstrated separately, but was not fully rolled out during that pilot." |
| Submitted budget | **GHS 32,450**. | "The submitted implementation budget was GHS 32,450." |
| Current test evidence | The presentation guide records **337 tests and 1,657 assertions** from the latest full verified run. A focused re-check of mobile API and presentation seed behavior also passed: **10 tests, 53 assertions**. | "Validation continued after submission, and the current build has newer automated test evidence." |
| Deployment | The system is implemented and has production-oriented configuration, but a complete campus-wide deployment must not be claimed. The configured public domain could not complete a TLS connection during this audit. | "The current build is implemented and demo-ready once its presentation environment is confirmed; full institutional rollout remains phased future work." |

### The exact explanation for permits exceeding students

This point is now resolved from the original pilot database.

- **2,021** counts registered student records.
- **2,769** counts successful permit/payment records, not unique students.
- The database contains repeated permit records for the same students across the recorded period.
- **895 students** had two or more permit records; some had as many as five.
- At the report snapshot, the 2,769 linked records belonged to **1,546 distinct students**.

**Recommended panel answer:**

> The two figures measure different things. The 2,021 figure is the number of registered student records, while 2,769 is the number of processed permit and successful payment records. The pilot database contains repeated permit records for some students across permit periods, so the transaction count can be higher than the number of unique students.

Do not call every repeated record a renewal unless the panel asks and the team can confirm the operational reason for each record. The evidence supports **repeated permit records across periods**.

### Why the financial total is reliable

The report was created on 10 June 2026. A database snapshot using records before that date produces:

- 2,769 linked successful payments;
- 2,769 linked permits;
- 1,546 distinct students represented; and
- GHS 276,900 total revenue.

This exactly reconciles the four figures used in the submitted report.

---

## 2. Claims to avoid

- Do not say NFC was fully deployed across campus during the pilot.
- Do not describe 2,769 permits as 2,769 different students.
- Do not say every repeated permit was definitely a renewal.
- Do not say the NFC identifier makes copying or fraud impossible.
- Do not say the card stores the complete student profile.
- Do not say the system is fully deployed merely because a public domain is configured.
- Do not mix the seeded presentation dataset with the historical pilot dataset. The current local seed uses GHS 50 transactions; the historical report used GHS 100 transactions.
- Do not present post-submission test results as if they appeared in the submitted report.

---

## 3. What the current implementation can demonstrate

The website and mobile application share the Laravel backend. The current routes support:

- mobile login and role-aware access;
- student profile, permit, NFC-card, request, and payment workflows;
- staff student search and operational summaries;
- verification by **student number**, **permit code**, and **NFC UID**;
- permit issuance and NFC card registration, replacement, and revocation;
- web dashboards, permit-request review, verification screens, and logs; and
- audit records for verification actions.

The mobile scan screen has a built-in **student-number fallback** when NFC is unavailable. It does not provide a manual NFC-UID entry box. A genuine NFC demonstration therefore requires an NFC-capable Android device and a physical tag whose UID has been registered in the backend.

---

## 4. Recommended demonstration story

The demo should prove one claim: **the same student and permit record is recognized across the administrative website, student app, and staff verification workflow.**

### Primary live route — 2 minutes 30 seconds

| Time | Owner | Action | Narration focus |
|---:|---|---|---|
| 0:00–0:15 | Naeem | Introduce the single-record journey. | "We will follow one student record through the connected system." |
| 0:15–0:50 | Divine | On the website, find the prepared student and show the active permit/payment record. | Administrator visibility and one source of truth. |
| 0:50–1:20 | Naeem | On the student app, show the same student's permit and status. | Student access to the same backend record. |
| 1:20–2:05 | Daud | In the staff mobile workflow, scan the registered NFC tag and show the returned status. | Phone reads the identifier; authenticated backend makes the decision. |
| 2:05–2:30 | Naeem | Summarize the connection and hand back to Divine. | Website, mobile, and verification all used one record. |

### Fallback route A — NFC or device failure

Daud verifies the same prepared student using student number **26100001**. This path is explicitly supported by the mobile scan screen and still proves that the staff app requests the current decision from the backend.

Suggested recovery line:

> The device is not reading the physical tag at the moment, so we will use the system's student-number fallback. This uses the same authenticated verification service and returns the same current permit decision from the backend.

### Fallback route B — network or public-server failure

Play a locally stored 60–90 second recording of the successful primary route. Keep one still image of the final valid result in the slide deck as the final fallback.

Suggested recovery line:

> The live connection is unavailable, so we will show our locally recorded run of the same workflow. The recording follows the same authenticated request and backend verification process.

---

## 5. Prepared local presentation records

These are **development seed accounts**, not credentials for production use.

| Role | Name | Login | Presentation use |
|---|---|---|---|
| Administrator | Nathaniel K. Ansah | `nathaniel.ansah@kntsf.edu.gh` | Website dashboard and records |
| Verification staff | Selina Adomako | `selina.adomako@kntsf.edu.gh` | Mobile verification workflow |
| Student | Ama Serwaa Mensah | `ama.mensah@students.kntsf.edu.gh` | Student-facing mobile view |

The development seeder assigns the temporary password `password`. Use it only in an isolated local presentation environment. Change it before exposing any environment publicly.

Prepared student details:

- Student number: **26100001**
- Student: **Ama Serwaa Mensah**
- Current seeded permit reference hint: **KNT-26-0431-0259**
- Seeded NFC UID: **04:46:78:1E:C8**
- Seeded permit amount: **GHS 50** — do not confuse this with the GHS 100 historical pilot amount.

Important: a random physical NFC tag will not match the seeded UID. Before the presentation, register the actual physical tag to the chosen presentation student, or use the student-number fallback.

---

## 6. Demo-readiness blockers to resolve before building the slides

### 1. Choose the backend environment

The mobile app currently points to `https://kntsf.ri-tech.tech` in development, preview, and production configuration. During this audit, the domain resolved but the TLS handshake failed. The local site `http://kntsf-core.test` was also not running.

Before rehearsal, choose one reliable route:

- repair and verify the public HTTPS environment; or
- configure a presentation build to use the laptop's local-network backend and test it from the actual phone.

### 2. Prepare the physical NFC tag

- Use an NFC-capable Android phone with the development client or installed build.
- Register the tag's real UID to the chosen presentation student.
- Verify that the card and permit are active.
- Test the same scan at least three times.

### 3. Freeze the demo record

- Do not use the record for unrelated testing after the final rehearsal.
- Keep its payment, permit, and NFC status unchanged.
- Record the final successful workflow locally.

### 4. Protect presentation data

- Use only seeded or approved demonstration records.
- Disable notification previews.
- Avoid showing environment files, secret keys, raw UID hashes, or real complaint information.

---

## 7. Rehearsal order

1. **Technical setup rehearsal:** Daud confirms backend, mobile connection, staff login, NFC tag, and fallback verification.
2. **Demo choreography rehearsal:** Divine, Naeem, and Daud complete the exact 2:30 sequence without touring menus.
3. **Fact-lock rehearsal:** all three answer the five high-risk questions below using the same facts.
4. **Full timed rehearsal:** complete the entire presentation in about 13 minutes.
5. **Failure rehearsal:** switch from NFC to student-number fallback, then from live demo to recording, without stopping the presentation.

### Five questions everyone must be ready for

1. Why are there more permits than students?
2. What exactly did the pilot validate?
3. Was NFC fully deployed during the pilot?
4. Is the system currently fully deployed?
5. What happens if the network, phone, or NFC scan fails?

---

## 8. Decision before PowerPoint production

Do not start the final PowerPoint until the team has completed one successful rehearsal using the exact presentation environment. The immediate next decision is whether the live demonstration will use:

1. the repaired public server, or
2. a controlled local-network backend.

Once that is fixed, capture fresh screenshots and the backup video from the same environment. Those assets can then be used to build the final slide deck without contradicting the live demonstration.
