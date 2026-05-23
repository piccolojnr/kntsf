# References Master Plan

Project title: **NFC-Based Student Permit Verification and Governance Management System for Knutsford University**

This document is a references planning and assembly guide for the dissertation. It is not a dissertation chapter and should not be copied directly into the final report as the completed bibliography. Its purpose is to organize source requirements, track verified and unverified references, standardize APA 7th edition formatting, and support the final dissertation assembly process.

No fabricated journals, authors, DOIs, page numbers, publishers, conference titles, publication years, or URLs should be added to the final bibliography. Any uncertain source must remain marked as `[VERIFY SOURCE]` until it has been checked against the original source.

## 1. Introduction

Academic references support the credibility of the dissertation by showing where theoretical, technical, and factual claims come from. In this project, references are especially important in the literature review, where concepts such as client-server architecture, role-based access control, REST APIs, NFC verification, digital identity, electronic voting, mobile development, payment verification, and auditability are discussed.

References are also needed in implementation-related sections where official documentation is used to support explanations of Laravel, Sanctum, React, Inertia.js, Expo React Native, PostgreSQL, Paystack, Spatie packages, Docker, queue systems, caching, and related tools.

Proper citation is part of academic integrity. Sources should be paraphrased in the report's own technical voice, with citations provided for ideas, standards, framework behavior, and factual claims that are not derived directly from the implemented system. Direct quotation should be rare and short. The final reference list should include only sources cited in the dissertation.

## 2. Referencing Strategy

The dissertation should use **APA 7th edition** referencing unless the university format gives a different instruction. APA style requires in-text citations in the body of the report and a corresponding reference list entry for every cited source.

### 2.1 In-Text Citation Strategy

Use citations when:

- Explaining established theories or models.
- Discussing prior research.
- Referencing official documentation.
- Supporting claims about technology behavior.
- Describing security practices, architecture patterns, or standards.
- Comparing related systems.

Do not cite:

- The project's own implementation decisions unless referring to internal project documentation.
- Screenshots, diagrams, or code snippets generated from the project itself.
- Obvious statements that do not require external evidence.

### 2.2 Bibliography Formatting Strategy

The final reference list should:

- Be ordered alphabetically by author or organization name.
- Use hanging indentation in the final Word document.
- Use sentence case for article and webpage titles.
- Use title case for journal names, book titles, and official documentation product names where appropriate.
- Include DOI links when available.
- Include URLs for official documentation and web sources.
- Avoid retrieval dates unless the source is designed to change over time and APA guidance requires it.

### 2.3 Technical Documentation Strategy

Official documentation is acceptable for framework-specific claims. For example, Laravel documentation should be cited when explaining Sanctum, queues, routing, middleware, validation, or authentication behavior. Paystack documentation should be cited when explaining transaction initialization, callbacks, webhooks, or payment verification.

Technical documentation references should be used carefully. They should support implementation explanations, not replace project-specific analysis.

## 3. Reference Categories

### 3.1 Academic Literature Sources

The following table tracks academic source needs. Do not insert a final citation until the source has been verified.

| Topic | Planned Source Type | Status | Notes |
| --- | --- | --- | --- |
| NFC systems | Journal article, conference paper, or standard | Missing source | Needed for Chapter 2 NFC/contactless authentication discussion. |
| NFC security | Peer-reviewed security paper or standard | Missing source | Should support claims about UID exposure, card misuse, and backend validation. |
| Smart card verification | Journal article or conference paper | Missing source | Useful for NFC and institutional identity verification sections. |
| Digital identity systems | Journal article, standards document, or book chapter | Missing source | Needed for authentication versus verification discussion. |
| Student identity management | Journal article or university information systems paper | Missing source | Useful for Chapter 1 and Chapter 2 institutional context. |
| Governance systems in education | Journal article or conference paper | Missing source | Supports digital governance and student governance platform discussion. |
| Mobile governance applications | Journal article or case study | Missing source | Supports mobile access and student service digitalization. |
| Electronic voting systems | Journal article, conference paper, or book chapter | Missing source | Needed for election integrity, authentication, duplicate voting, and result transparency. |
| E-voting security | Peer-reviewed security paper | Missing source | Should support vote integrity and eligibility discussion. |
| Mobile payment systems | Journal article or industry research source | Missing source | Supports digital payment workflow discussion. |
| Payment verification | Journal article or official payment provider documentation | Missing source | Needed for transaction integrity and verification discussion. |
| Role-Based Access Control | Foundational paper, book, or standards reference | Missing source | Needed for RBAC theoretical framework. |
| Audit logging systems | Journal article or security guidance | Missing source | Supports auditability and accountability claims. |
| REST APIs | Original REST dissertation, technical book, or standards-aligned source | Missing source | Supports REST architecture discussion. |
| Mobile authentication systems | Journal article or official framework documentation | Missing source | Supports token authentication and mobile API security. |
| Client-server architecture | Textbook or architecture reference | Missing source | Supports theoretical framework. |
| Queue systems | Technical book, documentation, or architecture reference | Missing source | Supports asynchronous processing discussion. |
| Caching systems | Technical book or official framework documentation | Missing source | Supports performance and cache invalidation discussion. |

### 3.2 Technical Documentation Sources

These sources should be official documentation where possible. Verify the current page title, organization name, URL, and year/access guidance before final bibliography assembly.

| Technology | Planned Source | Status | Notes |
| --- | --- | --- | --- |
| Laravel | Laravel official documentation | Needs verification | Cite for routing, validation, middleware, queues, notifications, scheduling, and framework behavior. |
| Laravel Sanctum | Laravel Sanctum official documentation | Needs verification | Cite for API token authentication and mobile API protection. |
| Laravel Fortify | Laravel Fortify official documentation | Needs verification | Cite if discussing authentication scaffolding or account setup. |
| React | React official documentation | Needs verification | Cite for frontend component model if needed. |
| Inertia.js | Inertia.js official documentation | Needs verification | Cite for server-driven frontend integration. |
| TypeScript | TypeScript official documentation | Needs verification | Cite only if discussing type safety or development tooling. |
| Tailwind CSS | Tailwind CSS official documentation | Needs verification | Cite for utility-first styling if needed. |
| Shadcn UI | Shadcn UI documentation | Needs verification | Cite if discussing component library choices. |
| React Native | React Native official documentation | Needs verification | Cite for mobile development model. |
| Expo | Expo official documentation | Needs verification | Cite for Expo ecosystem and native capability access. |
| Expo Router | Expo Router official documentation | Needs verification | Cite if route-based mobile navigation is discussed. |
| TanStack Query | TanStack Query official documentation | Needs verification | Cite for mobile data fetching, query caching, and invalidation. |
| PostgreSQL | PostgreSQL official documentation | Needs verification | Cite for relational database features and transactional consistency. |
| Paystack API | Paystack official API documentation | Needs verification | Cite for transaction initialization, verification, callbacks, and webhooks. |
| Spatie Permission | Spatie Laravel Permission documentation | Needs verification | Cite for RBAC implementation. |
| Spatie Media Library | Spatie Laravel Media Library documentation | Needs verification | Cite for media/document handling if used in final text. |
| Docker | Docker official documentation | Needs verification | Cite for containerization and deployment structure. |
| PHP | PHP official documentation | Needs verification | Cite only if language/runtime behavior is discussed. |

### 3.3 Standards and Architectural References

| Topic | Planned Source Type | Status | Notes |
| --- | --- | --- | --- |
| REST architecture | Original dissertation or trusted architectural source | Missing source | The original REST dissertation is acceptable if accurately cited. |
| Client-server architecture | Software architecture textbook or academic source | Missing source | Use for Chapter 2 theoretical framework. |
| API authentication | Security documentation, OWASP guidance, or framework docs | Missing source | Supports token-based API access discussion. |
| RBAC models | Foundational RBAC paper or NIST-related source | Missing source | Important for Chapter 2 and security design. |
| Queue systems | Official Laravel documentation or architecture reference | Needs verification | Supports asynchronous processing explanation. |
| Caching systems | Laravel documentation or systems architecture reference | Needs verification | Supports cache invalidation and performance discussion. |
| Mobile system architecture | Mobile application architecture source | Missing source | Supports Expo React Native discussion. |

### 3.4 Security and Verification References

| Topic | Planned Source Type | Status | Notes |
| --- | --- | --- | --- |
| Hashing | Security documentation, cryptography reference, or OWASP guidance | Missing source | Supports hashed permit codes and NFC UIDs. |
| Authentication | OWASP, framework documentation, or security textbook | Missing source | Supports login, token authentication, and account activation. |
| Authorization | RBAC literature, OWASP, or framework documentation | Missing source | Supports role/permission enforcement. |
| Audit logging | Security guidance or academic source | Missing source | Supports accountability and traceability claims. |
| Rate limiting | Framework documentation or security guidance | Missing source | Supports throttling of sensitive routes. |
| Transaction integrity | Database documentation or systems source | Missing source | Supports payment and voting transaction discussion. |
| Verification systems | Academic source or identity/security source | Missing source | Supports permit and identity verification analysis. |

### 3.5 Payment System References

| Topic | Planned Source Type | Status | Notes |
| --- | --- | --- | --- |
| Paystack transaction initialization | Paystack official documentation | Needs verification | Required for Chapter 4 payment implementation discussion. |
| Paystack transaction verification | Paystack official documentation | Needs verification | Required for payment verification claims. |
| Paystack webhooks/callbacks | Paystack official documentation | Needs verification | Required if webhook handling is discussed. |
| Idempotent payment handling | Payment systems documentation or engineering source | Missing source | Useful for duplicate prevention explanation. |
| Transactional integrity | PostgreSQL documentation or database systems source | Missing source | Supports locking and transaction handling. |

### 3.6 NFC and Smart Card References

| Topic | Planned Source Type | Status | Notes |
| --- | --- | --- | --- |
| NFC communication | NFC Forum documentation or technical standard | Missing source | Use verified official or standards source. |
| Smart card systems | Academic paper or technical standard | Missing source | Supports broader contactless card discussion. |
| NFC verification systems | Journal or conference paper | Missing source | Useful for related systems review. |
| Android NFC workflows | Android official developer documentation | Needs verification | Useful if discussing Android NFC behavior. |
| Mobile NFC limitations | Android/iOS official documentation or technical source | Missing source | Needed for limitations and future work sections. |
| NFC security concerns | Academic security paper | Missing source | Supports UID handling and backend verification discussion. |

### 3.7 Mobile Development References

| Topic | Planned Source Type | Status | Notes |
| --- | --- | --- | --- |
| Expo React Native | Expo official documentation | Needs verification | Supports mobile implementation choices. |
| Expo Router | Expo Router documentation | Needs verification | Supports mobile navigation discussion. |
| React Native architecture | React Native official documentation or academic source | Needs verification | Supports cross-platform development discussion. |
| Mobile API integration | Technical documentation or mobile architecture source | Missing source | Supports API-driven mobile app discussion. |
| Token persistence | Security source or framework documentation | Missing source | Cite carefully if discussed in final text. |
| TanStack Query | TanStack Query official documentation | Needs verification | Supports query caching and invalidation discussion. |

## 4. APA Reference Formatting Examples

The examples below show structure only. They are not real references and should not be inserted into the final bibliography.

### 4.1 Journal Article

```txt
Author, A. A., Author, B. B., & Author, C. C. (Year). Title of the article in sentence case. Journal Title in Title Case, volume(issue), page range. https://doi.org/xxxxx
```

### 4.2 Conference Paper

```txt
Author, A. A., & Author, B. B. (Year). Title of conference paper in sentence case. In Editor A. A. (Ed.), Proceedings of the Conference Name (pp. xx-xx). Publisher. https://doi.org/xxxxx
```

### 4.3 Technical Documentation

```txt
Organization Name. (Year or n.d.). Title of documentation page in sentence case. Product or Documentation Name. URL
```

### 4.4 Website Source

```txt
Organization Name. (Year, Month Day). Title of webpage in sentence case. Website Name. URL
```

### 4.5 Book Reference

```txt
Author, A. A. (Year). Title of book in sentence case and italics (Edition if applicable). Publisher.
```

### 4.6 API Documentation

```txt
Organization Name. (Year or n.d.). Title of API endpoint or guide in sentence case. API Documentation Name. URL
```

## 5. In-Text Citation Rules

### 5.1 Narrative Citations

Use narrative citations when the author or organization is part of the sentence.

```txt
Author (Year) explains that ...
Laravel (Year or n.d.) describes Sanctum as ...
```

### 5.2 Parenthetical Citations

Use parenthetical citations when the source supports the idea but is not part of the sentence.

```txt
Token-based authentication is commonly used to protect API access (Author, Year).
```

### 5.3 Two Authors

```txt
Author and Author (Year) argue that ...
(Author & Author, Year)
```

### 5.4 Three or More Authors

APA 7 uses `et al.` from the first citation.

```txt
Author et al. (Year) found that ...
(Author et al., Year)
```

### 5.5 Organizational Authors

For official documentation, the organization is usually the author.

```txt
Laravel (n.d.) explains ...
(Laravel, n.d.)
```

Verify whether the documentation page has a more specific organizational author before final assembly.

### 5.6 Direct Quotes

Direct quotes should be rare. If used, include page number, paragraph number, or section identifier where available.

```txt
(Author, Year, p. 15)
(Organization, Year, para. 4)
```

Paraphrasing is preferred for this dissertation.

## 6. Citation Consistency Rules

Use these rules across all chapters and appendices:

- Use APA 7th edition consistently.
- Do not mix APA, IEEE, Harvard, and MLA styles.
- Use sentence case for article titles and webpage titles.
- Use title case for journal names and major publication names.
- Use `https://doi.org/...` format for DOIs.
- Do not write `Retrieved from` unless APA requires a retrieval date.
- Use retrieval dates only for pages that are designed to change frequently.
- Keep organization names consistent, such as `Laravel`, `PostgreSQL Global Development Group`, or the verified official author name.
- Match every in-text citation to a reference list entry.
- Remove every reference list entry that is not cited in the dissertation.
- Do not cite unofficial blog posts when official documentation or peer-reviewed literature is available.
- Use official documentation for framework-specific behavior.
- Use academic literature for theory, comparison, and evaluation.

## 7. Missing References Checklist

| Reference Topic | Status | Notes |
| --- | --- | --- |
| NFC communication literature | Missing source | Needed for Chapter 2 and limitations sections. |
| NFC security literature | Missing source | Needed for UID hashing and card misuse discussion. |
| Digital identity verification | Missing source | Needed for Chapter 2 theoretical framework. |
| Electronic voting systems | Missing source | Needed for election integrity and duplicate voting discussion. |
| Mobile governance systems | Missing source | Useful for Chapter 1 and Chapter 2. |
| Student governance platforms | Missing source | Useful if available, but may be limited. |
| RBAC foundational reference | Missing source | Important for Chapter 2 and Chapter 3 security design. |
| REST architecture source | Missing source | Important for Chapter 2 REST API architecture. |
| Client-server architecture source | Missing source | Needed for theoretical framework. |
| Audit logging/security reference | Missing source | Supports accountability discussion. |
| Hashing/security reference | Missing source | Supports permit/NFC hashing discussion. |
| Rate limiting/security reference | Missing source | Supports sensitive endpoint protection. |
| Laravel documentation | Needs verification | Required for backend implementation references. |
| Sanctum documentation | Needs verification | Required for mobile API authentication references. |
| Fortify documentation | Needs verification | Cite if account setup/authentication scaffolding is discussed. |
| React documentation | Needs verification | Cite if frontend architecture is discussed. |
| Inertia.js documentation | Needs verification | Required for dashboard/frontend integration discussion. |
| Expo documentation | Needs verification | Required for mobile application implementation discussion. |
| React Native documentation | Needs verification | Required for cross-platform mobile claims. |
| Expo Router documentation | Needs verification | Cite if mobile navigation is discussed. |
| TanStack Query documentation | Needs verification | Cite if query caching/invalidation is discussed. |
| PostgreSQL documentation | Needs verification | Required for database and transaction claims. |
| Paystack documentation | Needs verification | Required for payment initialization and verification. |
| Spatie Permission documentation | Needs verification | Required for RBAC implementation references. |
| Spatie Media Library documentation | Needs verification | Required if media/document handling is discussed. |
| Docker documentation | Needs verification | Required for deployment appendix if Docker is referenced. |

## 8. Recommended Reference Sources

Use credible academic and official sources.

Recommended academic databases:

- Google Scholar.
- IEEE Xplore.
- ACM Digital Library.
- SpringerLink.
- ScienceDirect.
- Taylor & Francis Online.
- Wiley Online Library.

Recommended technical sources:

- Official Laravel documentation.
- Official React documentation.
- Official React Native documentation.
- Official Expo documentation.
- Official PostgreSQL documentation.
- Official Paystack API documentation.
- Official Docker documentation.
- Official Inertia.js documentation.
- Official Tailwind CSS documentation.
- Official Spatie package documentation.
- Official TanStack Query documentation.
- OWASP guidance for security-related topics where appropriate.
- Standards bodies such as NFC Forum, ISO, or NIST where accessible and relevant.

Avoid:

- Unsourced blog posts.
- AI-generated summaries.
- Random tutorial websites.
- Unverified PDFs.
- Citation generators without manual checking.
- References copied from another paper without reading the source.

## 9. Dissertation Citation Coverage Plan

| Chapter | Major Citation Areas | Citation Density |
| --- | --- | --- |
| Chapter One | Digital governance, manual verification problems, mobile systems, NFC context, payment systems, e-voting context | Moderate |
| Chapter Two | Theoretical framework, literature review, related systems, NFC, RBAC, REST, digital identity, e-voting, payment systems, technologies | High |
| Chapter Three | Architecture decisions, database design principles, REST/API design, security design, RBAC, transactions, queues, caching | Moderate |
| Chapter Four | Official framework documentation, Laravel, Sanctum, Expo, React Native, PostgreSQL, Paystack, Spatie packages, Docker | Moderate |
| Chapter Five | Limitations, future work, deployment recommendations, security recommendations | Low to moderate |
| Appendices | Technical documentation references only where needed | Low |

Chapter Two should contain the highest number of academic references. Chapter Four should rely more on official documentation and project evidence. Chapter Five should not introduce many new sources unless discussing future work or recognized limitations.

## 10. Reference Assembly Workflow

Use this workflow before final dissertation submission:

1. Search for academic sources for all missing literature topics.
2. Download or save citation details from the original source.
3. Verify author names, year, title, journal/conference name, volume, issue, pages, DOI, and URL.
4. Collect official documentation references from original documentation pages.
5. Replace `[Reference to ...]` placeholders in the chapters with verified in-text citations.
6. Add every cited source to the reference list.
7. Format all references in APA 7th edition.
8. Alphabetize the reference list.
9. Check that every in-text citation appears in the reference list.
10. Remove uncited references from the final bibliography.
11. Check for duplicate sources listed under slightly different names.
12. Verify DOI and URL links.
13. Confirm that direct quotes, if any, include page or paragraph information.
14. Review the final bibliography against the university format/template.
15. Update the Word document reference section and final table of contents if needed.

## 11. Final Reference Readiness Summary

The dissertation is reference-ready only after all placeholders have been replaced with verified sources. At this stage, the safest approach is to treat all academic literature items as missing until the exact source has been found and checked. Official technical documentation sources are easier to verify, but their titles, organization names, and URLs should still be checked before final assembly.

Current readiness:

- APA 7th edition strategy: prepared.
- Reference categories: prepared.
- Technical documentation source plan: prepared.
- Academic literature source plan: prepared.
- Missing references checklist: prepared.
- Final bibliography: not yet complete.

Before submission, the final reference list must contain only verified and cited sources. No source should be added because it looks relevant unless it has actually been consulted and supports a specific claim in the dissertation.
