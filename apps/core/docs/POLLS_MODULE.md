# Polls Module

## Purpose

The Polls module supports student voting and lightweight surveys. Admins and executives can create polls, publish/archive them, and review results when allowed. Students vote through their linked student profile.

## Data Model

Tables:

- `polls`: poll metadata, lifecycle status, visibility, voting window, and result settings.
- `poll_options`: poll choices. Options can be active, archived, or merged into another option.
- `poll_votes`: one vote per student per poll.

`poll_votes` has a unique constraint on `poll_id + student_id`.

## Poll Types

- `fixed_options`: admins define options before publishing.
- `dynamic_options`: students may submit an option while voting.

Fixed polls require at least two active options before publishing.

## Voting Rules

- Only published polls inside their optional start/end window can receive votes.
- Only users linked to a `students` record can vote.
- One vote is allowed per student per poll.
- If `allow_vote_change` is enabled, a student can update their vote.
- Archived polls cannot receive votes.

## Results

`show_results` controls whether normal users can see vote counts. Users with `polls.view_results` can view results regardless.

## Option Lifecycle

Options with votes should not be deleted. They can be merged into another option, which moves votes to the target option and marks the source option as `merged`.

## Permissions

- `polls.view`
- `polls.create`
- `polls.update`
- `polls.publish`
- `polls.delete`
- `polls.vote`
- `polls.view_results`

Admins have full access. Staff can view polls. Students can view and vote.

## Audit Logging

Audit events:

- `poll.created`
- `poll.updated`
- `poll.published`
- `poll.archived`
- `poll.deleted`
- `poll.vote_cast`
- `poll.option_merged`

## Not Built Yet

- Elections.
- Public poll pages.
- Anonymous voting.
- Advanced survey question types.
- Option deletion UI.
