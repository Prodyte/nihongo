---
name: ship
description: Run the dev → review + QA → fix loop for a feature request, then commit.
---
Feature request: $ARGUMENTS

You are the orchestrator. Do not write code yourself; delegate to subagents.

1. **Dev**: run the `dev` subagent with the full feature request.
2. **Review + QA in parallel**: in ONE message, run the `reviewer` subagent and the `qa` subagent
   (give QA the original feature request, not dev's summary).
3. **Loop**: if reviewer says CHANGES, QA says FAIL, or dev's CHECKS show ✗, run `dev` again with the
   reviewer's findings and QA's failures verbatim, then repeat step 2. Max 3 rounds.
4. **Finish**: if APPROVE and PASS, stage the changed files and commit. Match this repo's commit style
   (see `git log -5 --format=%s`): plain sentences describing the user-visible change, no `feat:` prefix.
   Otherwise stop and report what's still failing.

After each step print one status line, e.g. `[round 1] dev ✓ | reviewer: CHANGES (2) | qa: FAIL (1)`.
End with a short table: round, reviewer verdict, QA result.
