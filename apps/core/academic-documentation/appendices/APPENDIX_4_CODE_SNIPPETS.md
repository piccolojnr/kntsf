# Appendix 4: Code Snippets

## 4.1 Mobile API Authentication

Mobile clients authenticate with Sanctum personal access tokens. Protected routes require `auth:sanctum` middleware and policy checks on student-scoped data.

## 4.2 Permit Verification

Verification endpoints accept NFC UID, student number, or permit code, normalize input, query active permits, and write verification logs.

## 4.3 Election Vote Constraint

Vote creation validates open election window, approved candidate, active student account, active permit where required, and rejects duplicate votes per position.

```php
// Illustrative guard: one vote per student per position
ElectionVote::create([
    'election_id' => $election->id,
    'election_position_id' => $position->id,
    'election_candidate_id' => $candidate->id,
    'student_id' => $student->id,
]);
```
