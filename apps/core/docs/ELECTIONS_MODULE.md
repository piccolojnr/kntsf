# Elections Module

## Purpose

The Elections module manages SRC elections separately from Polls. Elections are stricter: votes are immutable, candidate approval matters, students can vote once per position, and eligibility depends on active student account and permit status.

## Election Lifecycle

Statuses:

- `draft`: internal setup.
- `scheduled`: published and ready for a future start.
- `active`: voting can happen when the current time is inside the optional start/end window.
- `closed`: voting is stopped.
- `archived`: retained for records but no longer operational.

Elections belong to an academic period through `academic_period_id`.

## Candidate Lifecycle

Candidate statuses:

- `pending`
- `approved`
- `rejected`
- `withdrawn`

Only approved candidates can receive votes. Candidate records support future campaign media through Media Library collections:

- `poster`
- `gallery`

## Vote Integrity

Election votes are stored in `election_votes` without update timestamps. The table enforces:

- one vote per student per position through `unique(election_position_id, student_id)`
- candidate, position, election, student references
- immutable `cast_at`

The current implementation does not provide vote editing.

## Eligibility Rules

A student can vote only when:

- the election is active
- the current time is inside the election start/end window when those dates are set
- the candidate belongs to the selected position
- the candidate is approved
- the user is linked to a student profile
- the user account is active and has a password
- the student has an active permit for the election academic period

## Future NFC/Mobile Hooks

The vote action centralizes eligibility checks in `CastElectionVoteAction`, so future NFC/mobile verification can be added before the vote insert without changing controllers or UI flow.

## Audit Events

- `election.created`
- `election.updated`
- `election.published`
- `election.started`
- `election.closed`
- `election.archived`
- `candidate.approved`
- `candidate.rejected`
- `candidate.withdrawn`
- `election.vote_cast`

Ballot audit metadata intentionally stores the position but not unnecessary sensitive ballot detail.

## Not Built Yet

- Public/mobile voting endpoints.
- NFC verification gate.
- Live counting or realtime dashboards.
- Candidate self-nomination workflow.
- Advanced result exports.
