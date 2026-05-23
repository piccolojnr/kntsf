# Report Writing Rules

This document is the master writing and formatting guide for the final year project report on the NFC-based student permit verification and governance management system. It must be used as the consistency reference for all chapters, appendices, captions, diagrams, tables, screenshot placeholders, and technical explanations generated later.

The report must remain academically formal, technically grounded, naturally written, and consistent with the project structure defined in `MASTER_REPORT_STRUCTURE.md`. It must not read like marketing content, a blog post, or obviously generated text.

## 1. Academic Writing Tone

### Required Style

Use a formal academic style that is clear, direct, and technically precise. The report should sound like a strong final year computing project report written by a capable student who understands the system, its design decisions, and its implementation constraints.

The writing should:

- explain concepts with enough depth for academic assessment;
- use precise technical terms instead of vague claims;
- connect system features to the project objectives;
- describe implementation decisions in relation to actual system behavior;
- avoid emotional, promotional, or exaggerated language;
- maintain a neutral and evidence-based tone.

### Technical Precision

Every technical statement must be traceable to the implemented system, project documentation, test results, or a cited source. Avoid broad claims unless the report provides evidence.

Write:

> The system uses Laravel Sanctum bearer tokens to authenticate mobile API requests and restrict access to student and staff operations.

Do not write:

> The system has world-class security that guarantees complete protection.

### Explanation Depth

Each major system feature should be explained at three levels when relevant:

1. What the feature does.
2. Why it is needed in the project context.
3. How the system implements it at a technical level.

For example, a section on NFC verification should define NFC, explain why it supports faster permit verification, and describe how card UIDs are normalized, hashed, looked up, and logged.

### Sentence Structure

Use varied sentence lengths. Short sentences are useful for clarity, but paragraphs should not become a sequence of identical simple statements. Combine simple and complex sentences naturally.

Acceptable:

> The mobile API separates student workflows from administrative workflows. This separation is important because students mainly access personal permit and profile data, while staff require broader operational endpoints for verification and permit management.

Poor AI-style phrasing:

> The mobile API is very important. It is useful for students. It is useful for staff. It improves the system. It makes the system better.

### Paragraph Flow

Each paragraph should develop one main idea. A strong paragraph normally contains:

- a topic sentence;
- supporting technical explanation;
- a link to the project context, evidence, or next idea.

Avoid paragraphs that are only lists of features. When a list is necessary, introduce it with a sentence and explain the most important items afterward.

### Claims to Avoid

Avoid:

- exaggerated claims such as "perfect", "revolutionary", "unbreakable", "fully secure", or "best-in-class";
- marketing language such as "seamless", "cutting-edge", "powerful solution", or "game-changing";
- conversational storytelling such as "In this chapter, we are going to look at...";
- robotic repetition such as starting several paragraphs with the same transition word;
- unsupported statements about performance, security, or usability.

### Good and Poor Phrasing Examples

Good academic phrasing:

> The proposed system centralizes permit issuance, payment verification, NFC card management, election voting, and audit logging within a single student governance platform. This reduces fragmentation by allowing related administrative workflows to share the same student, permit, and authentication records.

Poor AI-style phrasing:

> This amazing system brings everything together in a very smart and efficient way, making student governance much easier than ever before.

Good academic phrasing:

> Paystack callbacks and webhooks are verified on the server before a permit request is completed. This design avoids relying only on client-side redirects, which may not provide sufficient assurance that payment was successful.

Poor AI-style phrasing:

> Furthermore, Paystack makes payment very simple and reliable for everyone, and the system handles it perfectly.

## 2. Humanization Strategy

The report should be natural without becoming casual. Humanization in this document means producing writing that has realistic variation, clear technical judgment, and disciplined academic flow. It does not mean adding slang, jokes, personal opinions, or informal narration.

### Natural Sentence Variation

Use a mix of sentence patterns:

- direct technical statements;
- explanatory sentences that include reasons;
- contrast sentences where tradeoffs are discussed;
- concise summary sentences at the end of sections.

Avoid making every paragraph follow the same formula. A report that is too mechanically structured can appear generated even when the content is accurate.

### Varied Paragraph Openings

Do not repeatedly begin paragraphs with the same words. Avoid overusing:

- Furthermore,
- Moreover,
- Additionally,
- In conclusion,
- It is important to note that,
- This section discusses.

Use context-specific openings instead:

- "For permit verification, the system..."
- "A related design concern is..."
- "The mobile application depends on..."
- "Unlike the public portal, the dashboard..."
- "This approach was selected because..."

### Controlled Transition Usage

Transitions should guide the reader, not decorate the text. Use them only when they show a real relationship between ideas.

Prefer:

- However, for contrast;
- Therefore, for consequence;
- For example, for evidence;
- In contrast, for comparison;
- As a result, for outcome.

Avoid stacking transitions at the beginning of every paragraph.

### Balanced Complexity

The writing should be readable but not oversimplified. Technical sections may use domain-specific terms, but each term should be introduced clearly. Do not make explanations artificially complex to sound academic.

Use:

> The system stores a hashed representation of the NFC UID rather than the raw UID. This reduces exposure of sensitive card identifiers while still allowing verification through repeatable hash comparison.

Avoid:

> The solution operationalizes an advanced cryptographic abstraction layer to facilitate superior identity assurance.

### Natural Technical Explanations

Technical explanations should follow the actual workflow of the system. When explaining a process, use the order in which the process occurs.

Example structure:

1. User or system action.
2. Validation and authorization.
3. Business logic or domain action.
4. Data persistence.
5. Response, notification, audit log, or visible result.

### Humanization Rules

Apply these rules in every chapter:

- vary paragraph length naturally;
- avoid generic filler sentences;
- avoid repeated stock phrases;
- use examples from the implemented system;
- include limitations or tradeoffs where relevant;
- avoid excessive bullet lists in narrative sections;
- avoid unnatural "perfect" symmetry where every section has identical paragraph counts;
- use active voice where it improves clarity.

The desired voice is formal, practical, and technically aware. The report should sound like a strong technical student project report, not a blog, product brochure, or generated marketing article.

## 3. Terminology Standardization

Consistent terminology is required across all chapters, figures, tables, captions, and appendices.

### Standard Terms

Use the following preferred terms consistently:

| Preferred Term | Avoid or Limit |
| --- | --- |
| mobile application | mobile app, phone app, application app |
| NFC | nfc, Near Field Communication after first definition only |
| NFC card | NFC tag, tap card, student card when referring specifically to NFC |
| verification | validation, checking, scanning when used loosely |
| permit request | permit application, permit form request |
| self-service permit issuance | online permit buying, student permit purchase |
| mobile API | app API, mobile backend, phone API |
| public portal | website, public site, landing page when referring to the formal module |
| executive | exec, SRC member unless quoting a user role |
| student governance platform | SRC system, governance app, management app |
| audit logging | activity tracking, logs, history when used loosely |
| payment verification | payment checking, payment confirmation when referring to server-side verification |
| election voting | voting feature, election system voting |
| operations dashboard | admin panel, backend panel, dashboard app |
| account activation | setup password, signup when describing activation workflow |
| verification workflow | checking flow, scanning process |
| role-based access control | RBAC after first definition |
| application programming interface | API after first definition |
| personal access token | Sanctum token where implementation-specific |
| permit code | permit number when referring to the generated verification code |
| Paystack payment gateway | Paystack after first definition |

### Project Name

Use one of the following project descriptions depending on context:

- "NFC-based student permit verification and governance management system" for the full academic description.
- "student governance platform" for shorter references after the full title has been introduced.
- "proposed system" only when the chapter clearly refers to the project being discussed.

Avoid repeatedly using the full title in every paragraph.

### Capitalization Rules

Use title case for chapter titles and major headings. Use sentence case or title case consistently for lower-level headings according to the report template once final formatting begins.

Capitalize:

- NFC;
- API;
- RBAC;
- SRC when referring to the Students' Representative Council;
- Laravel, React, Inertia.js, Expo React Native, PostgreSQL, Paystack, Sanctum, Tailwind CSS, TypeScript, Pest.

Do not capitalize generic module names inside sentences unless they are part of a heading or formal figure/table title.

Write:

> The permit management module handles issuance, revocation, and verification.

Do not write:

> The Permit Management Module handles Issuance, Revocation, and Verification.

### Acronym Introduction Rules

Introduce acronyms on first use in each chapter:

- Near Field Communication (NFC)
- Application Programming Interface (API)
- Role-Based Access Control (RBAC)
- Entity Relationship Diagram (ERD)
- Students' Representative Council (SRC)

After introduction, use the acronym consistently. Do not alternate randomly between the full phrase and acronym unless clarity requires it.

## 4. Technical Writing Rules

### Architecture Decisions

Architecture sections must explain why decisions were made, not only what technologies were used. Each decision should connect to a project requirement, implementation constraint, or maintainability concern.

Recommended pattern:

1. State the design decision.
2. Explain the reason.
3. Mention the implementation approach.
4. Discuss tradeoffs where useful.

Example:

> Laravel Sanctum was selected for mobile API authentication because the project requires token-based access from the Expo React Native application while maintaining Laravel's existing authentication ecosystem. This allows mobile requests to use bearer tokens while dashboard users continue to use session-based authentication.

### Tradeoffs

Discuss tradeoffs honestly when they are relevant. A tradeoff does not weaken the report; it shows technical judgment.

Examples:

- Database-backed queues are simpler to deploy initially, while Redis/Horizon may be more suitable for higher queue volume in future deployments.
- NFC verification improves speed but depends on device hardware support.
- Server-side Paystack verification adds complexity but improves payment reliability.

### Workflow Descriptions

Workflow explanations should follow a clear chronological order. For each workflow, identify:

- the actor;
- the trigger;
- validation or authorization checks;
- main processing steps;
- stored records;
- resulting output;
- audit or log entries where applicable.

### Diagram Introductions

Introduce every diagram before it appears. The preceding paragraph should tell the reader what the diagram represents and why it is included.

Example:

> The overall architecture of the proposed system is shown in Figure 3.1. The diagram illustrates how the public portal, operations dashboard, mobile API, payment gateway, database, queue workers, and NFC verification workflow interact through the Laravel backend.

### API Descriptions

When describing APIs, include:

- endpoint purpose;
- authentication requirement;
- main request fields;
- main response fields;
- validation or authorization rule;
- error handling behavior where relevant.

Do not include a large dump of every endpoint in the chapter body. Use summary tables in the chapter and place full endpoint contracts in the appendix.

### Security Discussion

Security claims must be specific. Explain implemented mechanisms instead of making broad guarantees.

Discuss:

- authentication boundaries;
- role and permission enforcement;
- request validation;
- rate limiting;
- token handling;
- NFC UID hashing;
- permit code hashing where applicable;
- payment verification;
- audit logging;
- public/private data separation.

Avoid:

- "the system is fully secure";
- "hackers cannot access the system";
- "encryption solves all security issues";
- claims not supported by implementation or cited sources.

### Testing Discussion

Testing sections should connect tests to requirements and risks. Do not only state that testing was done.

For each major test area, explain:

- what was tested;
- why it matters;
- expected result;
- actual result;
- whether the test passed;
- any limitation or manual verification requirement.

Use tables for test cases and narrative paragraphs for interpretation.

## 5. Figure and Table Rules

### Figure Naming

Use chapter-based numbering:

```txt
Figure 3.1: Overall System Architecture
Figure 3.2: Database Entity Relationship Diagram
Figure 4.1: Operations Dashboard Login Screen
```

Figure captions must be descriptive and specific. Avoid vague captions such as "System Diagram" or "Screenshot".

### Table Naming

Use chapter-based numbering:

```txt
Table 3.1: Functional Requirements of the Proposed System
Table 4.2: Mobile API Endpoint Summary
Table 4.3: Payment Verification Test Results
```

Table captions must describe the table's purpose, not only its content type.

### Referencing Rules

All figures and tables must:

- be referenced before appearing;
- include a descriptive caption;
- be discussed after appearing;
- use numbering that matches the chapter number;
- appear close to the paragraph that discusses them;
- be listed in the List of Figures or List of Tables where required.

Correct:

> Figure 3.1 presents the overall system architecture and shows how the major application surfaces connect to the Laravel backend.

Incorrect:

> See the diagram below.

### Discussion After Figures and Tables

After each figure or table, add a short discussion explaining the main insight. Do not leave visual materials unsupported.

Example:

> As shown in Figure 3.1, the Laravel backend acts as the central coordination layer for public, dashboard, and mobile workflows. This design reduces duplication because payment verification, permit issuance, and audit logging can reuse shared domain actions.

## 6. Screenshot Placeholder Rules

Use screenshot placeholders when the actual screenshot will be inserted later. Placeholders must be clear, uppercase, and specific.

Required placeholder format:

```txt
[INSERT FIGURE — Student Permit Request Screen]
```

Use the same uppercase placeholder pattern across all chapters so screenshots can be inserted later without renaming captions or rewriting references.

### Placeholder Examples

Dashboard screens:

```txt
[INSERT FIGURE — Operations Dashboard Overview]
[INSERT FIGURE — Student Management Screen]
[INSERT FIGURE — Reports Dashboard Screen]
[INSERT FIGURE — Audit Logs Filter Screen]
```

Mobile screens:

```txt
[INSERT FIGURE — Mobile Student Permit Screen]
[INSERT FIGURE — Mobile NFC Scan Screen]
[INSERT FIGURE — Mobile Election Voting Screen]
[INSERT FIGURE — Mobile Profile Screen]
```

Verification screens:

```txt
[INSERT FIGURE — Permit Code Verification Screen]
[INSERT FIGURE — NFC Verification Result Screen]
[INSERT FIGURE — Student Number Verification Screen]
```

Election screens:

```txt
[INSERT FIGURE — Election Setup Screen]
[INSERT FIGURE — Candidate Approval Screen]
[INSERT FIGURE — Election Results Screen]
```

Payment screens:

```txt
[INSERT FIGURE — Paystack Payment Initialization Screen]
[INSERT FIGURE — Permit Request Payment Success Screen]
[INSERT FIGURE — Payment Verification Recovery Screen]
```

### Screenshot Placement

Screenshots should support implementation evidence, not replace explanation. Each screenshot must have:

- a preceding reference;
- a figure number and caption when finalized;
- a short explanation after it;
- no sensitive personal data unless masked.

## 7. Diagram Rules

Diagrams should clarify the design and workflow of the system. They should not be decorative.

### Architecture Diagrams

Architecture diagrams must show the main application surfaces and backend components:

- public portal;
- operations dashboard;
- mobile API;
- Laravel controllers and domain actions;
- database;
- queue/cache layer;
- Paystack integration;
- NFC verification flow where relevant.

Keep architecture diagrams readable. Use consistent labels across the diagram and chapter text.

### ERDs

Entity Relationship Diagrams should include the core entities:

- users;
- students;
- academic periods;
- permits;
- permit requests;
- payments;
- NFC cards;
- verification logs;
- audit logs;
- announcements, events, and documents;
- polls, poll options, and poll votes;
- elections, positions, candidates, and votes.

Use singular or plural entity names consistently. If database table names are used, keep them consistent with the implementation.

### Flowcharts

Use flowcharts for process logic such as:

- permit issuance;
- self-service permit request;
- payment verification;
- NFC verification;
- election voting;
- account activation.

Flowcharts should show decision points clearly. Avoid long text inside flowchart boxes.

### Sequence Diagrams

Use sequence diagrams where actor-system interactions are important. Suitable examples include:

- Paystack callback and webhook verification;
- mobile login and authenticated API request;
- NFC scan verification;
- self-service permit issuance;
- mobile election voting.

### Use Case Diagrams

Use case diagrams should identify actors and their main interactions with the system. Keep them high-level. Detailed business rules belong in the text, not inside the use case diagram.

### Diagram Quality Rules

All diagrams must:

- use consistent naming;
- avoid clutter;
- support nearby explanation;
- be readable in grayscale if printed;
- use captions and figure numbers;
- match terminology used in the report text.

## 8. Chapter Consistency Rules

### Heading Hierarchy

Follow the numbering structure in `MASTER_REPORT_STRUCTURE.md`.

Use:

```txt
CHAPTER THREE — SYSTEM ANALYSIS AND DESIGN
3.1 Introduction
3.2 Analysis of Existing System
3.2.1 Existing Manual Processes
```

Avoid excessive subsection depth. Do not go beyond four numbering levels unless the university template requires it.

### Chapter Introduction

Every chapter must begin with an introduction that:

- states the purpose of the chapter;
- connects the chapter to the previous chapter where relevant;
- previews the major sections;
- avoids overly broad textbook-style openings.

### Chapter Summary

Every chapter must end with a summary that:

- briefly restates the chapter's main contribution;
- does not introduce new evidence;
- prepares the reader for the next chapter;
- avoids repeating the introduction word for word.

### Section Transitions

Transitions between sections should be brief and purposeful. Do not add transition paragraphs that only restate the table of contents.

Good:

> Having established the limitations of the existing manual process, the next section describes the functional and non-functional requirements of the proposed system.

Poor:

> Now that this section is done, the next section will talk about another important thing.

### Chapter-Specific Consistency

Chapter One should focus on the problem, aim, objectives, scope, and significance. It should not contain deep implementation details.

Chapter Two should review literature, technologies, and related systems. It must cite sources and avoid presenting project implementation as literature.

Chapter Three should explain analysis, requirements, architecture, database design, workflows, and security design.

Chapter Four should present implementation evidence, module behavior, API design, screenshots, code snippets, testing, and deployment notes.

Chapter Five should summarize outcomes, conclude against objectives, and recommend realistic future work.

## 9. Citation and Referencing Rules

Use APA style as required by the project format. Citations are required for research literature, frameworks, official documentation, technologies, standards, and factual claims not derived from the implemented system.

### Citation Expectations

Cite sources when discussing:

- NFC technology and contactless verification;
- electronic voting systems;
- mobile application architecture;
- REST API architecture;
- RBAC;
- security practices;
- payment gateway behavior;
- Laravel, React, Expo, PostgreSQL, Sanctum, and other frameworks or tools;
- related systems and comparative studies.

### Paraphrasing

Paraphrase sources in the report's own technical voice. Do not copy long passages from documentation or papers.

Good:

> Token-based API authentication is commonly used in mobile applications because it allows authenticated requests without relying on browser sessions (Author, Year).

Poor:

> Copying a paragraph directly from a documentation page without quotation or citation.

### Technical Documentation References

Official documentation may be referenced for framework behavior, API usage, and implementation details. Examples include Laravel, Expo, React, PostgreSQL, Paystack, and Sanctum documentation.

Use documentation citations to support technology explanations, not to replace project-specific analysis.

### Research Paper References

Research papers should be used for conceptual and comparative discussions, especially in Chapter Two. When reviewing papers, identify:

- the problem studied;
- the method or system proposed;
- the relevant findings;
- how the work relates to the proposed system;
- limitations or gaps.

### Reference List

The reference list must include every cited source and exclude uncited sources. Maintain consistent APA formatting across books, journal papers, conference papers, and web documentation.

## 10. Page Distribution Guidance

Use the master report structure as the target distribution. The report should be detailed because the project contains multiple substantial modules, but it must not be padded with repetitive explanation.

Recommended ranges:

| Section | Recommended Range |
| --- | --- |
| Front matter | 10-15 pages |
| Chapter One | 10-15 pages |
| Chapter Two | 25-35 pages |
| Chapter Three | 35-45 pages |
| Chapter Four | 40-50 pages |
| Chapter Five | 10-15 pages |
| References | 5-10 pages |
| Appendices | 20-40 pages |

### Screenshot Density

Screenshots should be concentrated mainly in Chapter Four and Appendix F.

Recommended use:

- Chapter Three: limited UI design placeholders only.
- Chapter Four: screenshots for major implemented modules.
- Appendix F: complete screenshot set.

Avoid placing screenshots after every small feature. Use screenshots where they provide evidence of important workflows or completed modules.

### Diagram Density

Diagrams should be concentrated in Chapter Three, with selected implementation diagrams in Chapter Four where necessary.

Recommended diagrams:

- Overall system architecture;
- ERD;
- permit request flow;
- NFC verification flow;
- payment verification flow;
- mobile API authentication flow;
- election voting flow;
- public portal content flow;
- role and permission access overview if needed.

### Appendix Size

Appendices should contain supporting material that would interrupt the main chapter flow, such as:

- full API endpoint lists;
- database schema extracts;
- extended test results;
- complete screenshot galleries;
- longer code snippets;
- deployment configuration samples;
- NFC and payment verification evidence.

## 11. Code Snippet Rules

Code snippets are acceptable only when they provide useful implementation evidence. They should not dominate the report.

### When to Include Code

Include snippets for:

- important route definitions;
- API resource examples;
- validation rules;
- payment verification logic;
- NFC hashing or verification logic;
- election vote constraints;
- queue jobs or domain actions;
- security middleware or policy examples.

### Snippet Size

Preferred snippet length: 10-30 lines.

Longer code should be moved to an appendix unless the surrounding analysis depends on it. Never include large unreadable files in the main body.

### Caption Style

Use listing captions consistently:

```txt
Listing 4.1: Mobile API Authentication Route Definition
Listing 4.2: Paystack Payment Verification Action
```

If the university template does not support "Listing", use figure-style captions only when required, but keep code numbering consistent.

### Explanation Expectations

Every code snippet must be introduced before it appears and explained afterward.

The explanation should identify:

- what the code does;
- why the snippet is relevant;
- how it supports a requirement;
- any security or validation behavior shown.

Avoid code dumps with no interpretation.

## 12. Final Writing Checklist

Use this checklist before accepting any generated chapter.

### Tone and Style

- [ ] Academic tone is maintained.
- [ ] Writing is formal but natural.
- [ ] No marketing language is used.
- [ ] No robotic repetitive phrasing appears.
- [ ] Paragraph openings are varied.
- [ ] Transition words are not overused.
- [ ] Passive voice is not overused.
- [ ] Lists are used only where they improve clarity.

### Technical Accuracy

- [ ] Technical claims match the implemented system.
- [ ] Architecture decisions explain why they were made.
- [ ] Tradeoffs are discussed where useful.
- [ ] Security claims are specific and supported.
- [ ] Testing discussion includes expected and actual outcomes.
- [ ] No unsupported claims are present.
- [ ] Code snippets are short, relevant, and explained.

### Terminology

- [ ] Standard terminology is used consistently.
- [ ] Acronyms are introduced before use.
- [ ] Capitalization is consistent.
- [ ] "mobile application", "mobile API", "public portal", "permit request", and "student governance platform" are used consistently.

### Figures, Tables, and Screenshots

- [ ] Every figure is referenced before appearing.
- [ ] Every table is referenced before appearing.
- [ ] Every figure and table has a descriptive caption.
- [ ] Figures and tables are discussed after appearing.
- [ ] Figure numbering matches the chapter number.
- [ ] Table numbering matches the chapter number.
- [ ] Screenshot placeholders use the approved format.
- [ ] Sensitive data in screenshots is masked or avoided.

### Chapter Structure

- [ ] The chapter starts with an introduction.
- [ ] The chapter ends with a summary.
- [ ] Heading hierarchy matches the master report structure.
- [ ] Subsections do not go into unnecessary depth.
- [ ] Transitions between major sections are clear.
- [ ] The chapter stays within its intended scope.

### Citations and References

- [ ] APA-style citations are included where required.
- [ ] Research and documentation sources are paraphrased properly.
- [ ] Framework and tool claims are cited when necessary.
- [ ] Every in-text citation appears in the reference list.
- [ ] The reference list excludes uncited sources.

### Final Consistency

- [ ] The chapter supports the report objectives.
- [ ] The writing does not sound like a blog post.
- [ ] The writing does not sound like generated marketing content.
- [ ] The content is detailed enough without artificial padding.
- [ ] The chapter aligns with `MASTER_REPORT_STRUCTURE.md`.
