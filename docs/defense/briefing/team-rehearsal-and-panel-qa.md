# KNTSF team rehearsal and panel Q&A guide

**Project:** NFC-Based Student Permit Verification and Governance Management System for Knutsford University  
**Presenters:** Divine, Naeem, and Daud  
**Presentation target:** 12-13 minutes, followed by questions  
**Demo:** `docs/demo/videos/combined-demo.mp4` (32 seconds)

---

## What this document is for

Use this during rehearsal. It is not another script to memorize.

For each slide, remember:

1. the one point the panel must understand;
2. the fact or screen that supports it; and
3. the sentence that hands over to the next speaker.

Speak to the panel, not to the screen. It is fine to change the wording. Do not change the figures, the system status, or the stated limitations.

---

## Speaking order and target time

| Slide | Speaker | Main job | Target |
|---:|---|---|---:|
| 1 | Divine | Introduce the project and presentation claim | 0:25 |
| 2 | Divine | Explain the problem | 0:50 |
| 3 | Divine | Present the connected solution | 0:50 |
| 4 | Daud | Explain the shared architecture | 1:00 |
| 5 | Daud | Explain payment verification and permit issuance | 0:55 |
| 6 | Naeem | Explain the administrator website | 0:50 |
| 7 | Naeem | Explain the two mobile roles | 0:50 |
| 8 | Daud | Explain NFC and the security boundary | 1:10 |
| 9 | Divine | Present the pilot evidence and limitation | 1:00 |
| 10 | Daud | Present current test evidence | 0:40 |
| 11 | Naeem | Explain the budget and phased rollout | 0:55 |
| 12 | Naeem leads | Introduce, play, and close the recorded demo | 1:20 |
| 13 | Divine | Conclude and invite questions | 0:35 |

**Expected total:** about 11 minutes 35 seconds. This leaves room for pauses, speaker movement, and a brief interruption without forcing anyone to rush.

---

## Handovers to practise

These lines are deliberately simple. Use them or say the same thing in your own words.

### Divine to Daud after slide 3

> That is the overall solution. Daud will explain how the website and mobile app stay connected through the same backend.

### Daud to Naeem after slide 5

> Those rules control the permit process behind the scenes. Naeem will now show how administrators and students use the system.

### Naeem to Daud after slide 7

> The mobile experience changes with the user's role. Daud will explain what happens when an authorized staff member verifies a student.

### Daud to Divine after slide 8

> That explains the technical verification flow. Divine will now present what the pilot results actually proved.

### Divine to Daud after slide 9

> Those are the submission-time pilot figures. Daud will add the newer test evidence from the current build.

### Daud to Naeem after slide 10

> The current build passed the verified checks. Naeem will now explain how we would move from the project stage to controlled adoption.

### Naeem to Divine after slide 12

> The recording shows one permit record appearing consistently across the administrator, student, and staff views. Divine will conclude.

---

## Slide 12: recorded demonstration routine

The recording is short, so do not talk continuously over it. Give the panel a clear claim before playback, let them watch, then explain what they saw.

### Before playback: Naeem, about 15 seconds

> This recording follows one prepared permit record through three views. First, the administrator confirms it. Next, the student sees it in the app. Finally, authorized staff retrieve the current verification result.

### During playback

- Divine points out the administrator permit record when it appears.
- Naeem points out that the student sees the same permit and status.
- Daud points out that the final staff screen returns the backend result.
- Keep each comment to one short sentence. Do not describe every tap.

### After playback: Naeem, about 15 seconds

> The important point is consistency. The three screens are not carrying separate permit decisions. They are showing the same backend-controlled record.

### If the video does not play

Do not spend presentation time troubleshooting.

> The recording is not playing on this machine, so we will use the still sequence on the slide. It shows the same prepared record in the administrator, student, and verification views.

Then explain the three stages shown on slide 12 and continue.

---

## How to handle panel questions

- Divine receives the question and pauses briefly before routing it.
- The person who owns the topic answers first.
- One answer should normally take 20-40 seconds.
- A second person adds something only if a fact is missing.
- If the panel interrupts, stop and listen. Answer the narrower question they asked.
- If you do not know an implementation detail, do not guess.

A safe way to handle an unknown detail is:

> We did not test that specific case, so I do not want to overstate the result. Based on the current design, our next step would be to test it under controlled conditions before deployment.

---

# Likely panel questions and answers

## Problem, objectives, and scope

### 1. What problem does the project solve?

**First owner:** Divine

> It connects activities that would otherwise be handled as separate steps. A permit request, eligibility check, payment confirmation, permit issuance, and later verification all use one controlled record. The system also gives the SRC one place to manage related student services and governance activities.

### 2. What is new about your solution?

**First owner:** Divine

> The main contribution is the integration. We did not treat the website, mobile app, payment process, and verification process as separate products. They share one backend, so the same rules and records apply across the different user channels.

### 3. Why did you include both a website and a mobile application?

**First owner:** Naeem

> They serve different working situations. Administrators need a larger workspace for reviewing records and managing operations. Students and verification staff need quick access on a phone. Both use the same backend, so adding two interfaces does not create two versions of the truth.

### 4. Is this only a permit system?

**First owner:** Divine

> Permits and verification are central, but the wider scope covers SRC operations such as announcements, complaints, reports, budgets, and elections. In the presentation we focus on the permit journey because it gives the clearest end-to-end example of the connected system.

---

## Architecture and technology

### 5. Explain the system architecture in simple terms.

**First owner:** Daud

> The Laravel application is the central backend. It stores the rules and communicates with the database. The website uses Inertia, React, and TypeScript, while the mobile app uses Expo React Native. Both clients request data and actions from the Laravel backend, which makes the final authorization and permit decisions.

### 6. Why did you choose Laravel?

**First owner:** Daud

> Laravel gave us routing, validation, authentication support, database tools, queues, and testing in one mature framework. That suited a system with many related workflows and access rules. It also allowed the web application and mobile API to share the same business logic.

### 7. Why Expo React Native for the mobile app?

**First owner:** Daud

> It allowed us to build the mobile interface in TypeScript and share one project across supported mobile platforms. It also gave us access to native device functions needed by the app. For the NFC function, the actual presentation environment still needs a compatible device and build.

### 8. Why PostgreSQL?

**First owner:** Daud

> The system contains related records such as students, payments, permits, users, roles, and verification logs. PostgreSQL is a good fit for that relational structure and supports the consistency we need between those records.

### 9. How do you stop the website and mobile app from disagreeing?

**First owner:** Daud

> The main rules are enforced in the backend rather than being duplicated in each interface. The website and mobile app request the current state from the same system. The interface can display a result, but it does not create its own permit decision.

---

## Payment and permit controls

### 10. How do you know a payment actually succeeded?

**First owner:** Daud

> We do not treat the browser redirect as proof. The backend verifies the transaction with Paystack and records the verified result. Permit issuance depends on that server-side state.

### 11. What if Paystack sends the same result more than once?

**First owner:** Daud

> The processing is designed to avoid issuing another permit simply because the same transaction is reported again. The backend checks the stored payment and permit state before completing the action. In technical terms, the operation is handled idempotently.

### 12. Can a student create a permit without paying?

**First owner:** Daud

> The normal workflow requires the eligibility conditions and a verified payment state before issuance. A student-facing screen cannot bypass those backend checks.

---

## NFC, verification, and security

### 13. What exactly is stored on the NFC card?

**First owner:** Daud

> The card carries an identifier, not the complete student profile and not a permanent permit decision. The backend uses the identifier to find the linked record and return the current status to an authorized verifier.

### 14. Why use NFC when staff can search by student number?

**First owner:** Daud

> Student-number search is a useful fallback, but NFC reduces manual entry and can make routine checks faster. Both routes still depend on the same backend. NFC changes how the record is located; it does not replace the authorization and validity checks.

### 15. What happens if somebody copies the NFC identifier?

**First owner:** Daud

> A copied identifier is a real risk, so we do not claim that the identifier alone proves identity. The verifier must be authenticated, and the backend checks the linked record and its current status. A stronger institutional version could add cryptographic tags, controlled staff devices, or another verification factor.

### 16. Was NFC tested during the pilot?

**First owner:** Divine

> NFC was not fully deployed during the reported pilot. The pilot figures validate the permit and payment workflow. The NFC workflow was implemented and demonstrated separately, so we keep those two kinds of evidence separate.

### 17. What happens when there is no internet connection?

**First owner:** Daud

> The current verification decision comes from the backend, so a network connection is required for a fresh result. We prefer that limitation to showing an outdated permit as valid. A future version could support carefully designed offline caching, but it would need strict expiry and synchronization rules.

### 18. How do you protect student information?

**First owner:** Daud

> We limit access by role, validate requests on the server, authenticate protected API calls, and keep audit records for sensitive actions. The NFC card does not need to expose the full student profile. A production rollout would also require institutional policies for retention, access review, backups, and incident response.

### 19. Who is allowed to verify a permit?

**First owner:** Daud

> Only a signed-in user with the required staff permission should access that workflow. The backend checks the user's authorization before returning the protected result.

---

## Pilot figures and testing

### 20. Why are there 2,769 permits but only 2,021 students?

**First owner:** Divine

> The figures count different things. The 2,021 figure is registered student records. The 2,769 figure counts processed permit and successful payment records. The pilot data contains repeated permit records for some students across recorded periods, so the number of transactions can be higher than the number of unique students.

### 21. How was GHS 276,900 calculated?

**First owner:** Divine

> The historical pilot snapshot contained 2,769 successful transactions at GHS 100 each. Multiplying those gives GHS 276,900. The current demonstration seed uses a different test amount, so we do not mix it with the historical pilot total.

### 22. What did the pilot prove?

**First owner:** Divine

> It showed that the digital permit and payment workflow operated with a meaningful number of records. It did not prove a completed campus-wide NFC deployment, and we state that limitation directly.

### 23. Why does the slide say 337 tests when the submitted report may show another number?

**First owner:** Daud

> The report contains the result available at submission time. Development and validation continued afterward. The 337 tests and 1,657 assertions are evidence from the current build, so we label them as post-submission validation.

### 24. Do automated tests prove the whole system works?

**First owner:** Daud

> No. They give repeatable evidence for the cases we wrote and ran, but they do not replace user testing, deployment testing, security review, or long-term operational monitoring. We use the test count as one part of the evidence.

---

## Deployment, budget, and limitations

### 25. Is the system fully deployed now?

**First owner:** Divine

> The system is implemented and we have a working demonstration, but we are not claiming a complete campus-wide deployment. Full adoption would need a controlled production environment, staff preparation, physical NFC setup, monitoring, and support.

### 26. What is the GHS 32,450 budget for?

**First owner:** Naeem

> It is the submitted implementation budget for moving the project into a controlled institutional rollout. We present it as one implementation envelope, not as money already spent during the pilot.

### 27. How would you roll it out at the university?

**First owner:** Naeem

> We would begin with accounts, staff training, and a small number of controlled verification points. After monitoring that stage, the university could widen permit use and staff coverage. Support and review should continue throughout the rollout.

### 28. What is the biggest limitation?

**First owner:** Divine

> The main evidence limitation is that NFC was not fully deployed in the reported pilot. Technically, verification also depends on network access, and a basic NFC identifier can be copied. Those limitations are why we recommend phased adoption and stronger tag or device controls for a full rollout.

### 29. What would you improve next?

**First owner:** Naeem, then Daud if technical detail is requested

> We would first strengthen the deployment environment and run a controlled NFC trial with trained staff. We would also monitor usability and verification failures. On the technical side, stronger NFC credentials, controlled verifier devices, and carefully designed resilience for weak networks would be sensible next steps.

---

## Team contribution questions

### 30. Who did what?

Each person must answer this in the first person and name work they genuinely completed. Do not use a vague shared answer.

Before the rehearsal, complete these lines:

- **Divine:** "My main contribution was ____________________. I also worked on ____________________."
- **Naeem:** "My main contribution was ____________________. I also worked on ____________________."
- **Daud:** "I led the technical development of ____________________. I also handled ____________________."

After each answer, be ready to explain one real decision, difficulty, or lesson from that work.

### 31. Why should we believe all three members understand the project?

**First owner:** Divine

> We divided the presentation by responsibility, but we rehearsed the complete system together. Each member understands the problem, the shared workflow, the evidence, and the limitations. Daud takes the deeper implementation questions because he led the technical development.

---

## Questions the team should ask one another during rehearsal

Practise beyond the prepared answers. Take turns asking follow-up questions such as:

- "Can you show where that rule is enforced?"
- "What evidence supports that claim?"
- "What would fail if the backend were unavailable?"
- "Why did you choose this approach over a QR code?"
- "What part of the system did users find difficult?"
- "Which result came from the submitted report, and which came later?"
- "If the university approved the project tomorrow, what would you do first?"
- "What did your team learn from the pilot?"

The goal is not to produce a perfect speech. The goal is to remain clear when the panel changes the wording of the question.

---

## First full rehearsal: 60-minute session

### 0-10 minutes: fact lock

Each person says these facts without reading:

- 2,021 registered student records;
- 2,769 permit/payment records;
- GHS 276,900 historical pilot transaction value;
- NFC was not fully deployed in the reported pilot;
- 337 tests and 1,657 assertions are from the current build;
- GHS 32,450 is the submitted implementation budget.

Correct any disagreement before continuing.

### 10-25 minutes: individual sections

Each speaker presents only their own slides. The others listen for unclear claims, long sentences, and wording that sounds memorized.

### 25-40 minutes: uninterrupted timed run

Run the deck from slide 1 to slide 13. Do not restart after a mistake. Record the rehearsal on a phone and write down the final time.

### 40-50 minutes: difficult Q&A

Ask questions 15, 16, 20, 23, 25, and 30 from this guide. Add one follow-up after every answer.

### 50-60 minutes: repair and repeat

Repeat only the weak transitions, the demo introduction, the pilot limitation, and any Q&A answer that became confused.

---

## Rehearsal score sheet

Score each item from 1 to 5 after the uninterrupted run.

| Area | Score | Note |
|---|---:|---|
| Finished within 12-13 minutes |  |  |
| Opening was calm and clear |  |  |
| Speakers did not read the slides |  |  |
| Handovers sounded natural |  |  |
| Technical explanation was understandable |  |  |
| Pilot limitation was stated correctly |  |  |
| Recorded demo started without delay |  |  |
| Answers were brief and direct |  |  |
| Team did not interrupt one another |  |  |
| Each member explained a genuine contribution |  |  |

Any score below 4 becomes the focus of the next rehearsal.

---

## Final reminders

- Do not apologize for the submitted report unless the panel identifies a specific issue.
- Do not pretend NFC was part of the complete reported pilot.
- Do not call every permit record a different student.
- Do not mix the GHS 50 demonstration record with the GHS 100 historical pilot amount.
- Do not let a technical answer become a five-minute lecture.
- Do not argue with the panel. Clarify the claim and acknowledge the limit.
- When one teammate is answering, the others should look engaged rather than searching through notes.

The strongest version of this presentation is calm and specific. The team built a real system, has evidence for parts of it, and knows where the evidence stops.
