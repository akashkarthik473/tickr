# Cursor Agents — Project Rules & Workflow

> Place this file at the root (e.g., `agents.md`) or inside `.cursor/agents.md`. These rules are **binding** for AI actions in this repo.

---

## Core Principles

1. **No unsolicited files**

   * Never create new documentation or files (README variants, design docs, specs, ADRs, notes) unless the user explicitly asks.
   * Prefer editing existing files over adding new ones.

2. **Concise, minimal code**

   * Optimize for the smallest correct change. Keep diffs tight.
   * Reuse the current patterns, style, and abstractions already in the repo.
   * Avoid new libraries, frameworks, or build steps unless explicitly requested.

3. **Use the current stack**

   * Determine the stack from this repo (languages, toolchains, frameworks) and stick to it.
   * Do not introduce new services, infra, or architectural layers.

4. **Ground every change**

   * Before proposing a change: read relevant files, tests, and the bug log (defined below). If a similar fix exists, mirror it.
   * If something is ambiguous, ask a **single, crisp question** before proceeding; otherwise make the best, minimal assumption.

---

## Mandatory Bug/Update Log

**File:** `buglog.csv` at the repository root (plain text CSV). This is the **only** file you may create automatically if missing.

### Purpose

* Persist a chronological record of bugs, updates, and the key *fix patterns* used.
* Every time the user reports a bug or you apply a fix, append a row.

### Required Columns (CSV header)

```
iso_timestamp,short_id,severity,area,files,context_or_repro,root_cause,fix_summary,verification,status,commit
```

* **iso_timestamp**: ISO 8601 with timezone (e.g., `2025-10-16T14:32:10-07:00`).
* **short_id**: short slug or reference (e.g., `steering-debounce-01`).
* **severity**: `low|medium|high|critical`.
* **area**: subsystem or module (e.g., `can`, `bms`, `ui`, `build`).
* **files**: comma-separated paths touched.
* **context_or_repro**: 1–2 sentences with steps or context.
* **root_cause**: concise cause statement.
* **fix_summary**: 1–2 sentences describing the *essence* of the fix.
* **verification**: how the fix was verified (test, log, sim, device).
* **status**: `open|in_progress|fixed|wontfix`.
* **commit**: short commit hash or PR if applicable.

### Example Row

```
2025-10-16T09:41:12-07:00,can-0x515-wrap,high,can,src/can/output.c,"ID 0x515 seq wraps after 255","uint8_t overflow in counter","use uint16_t and mod 1000; reset on init",hardware test on dyno,fixed,1a2b3c4
```

### When to Update `buglog.csv`

* When the user reports a new issue.
* When you propose/land a fix.
* When you learn something material about an ongoing issue (update the **status** or append a new row with the same `short_id` and revised details; prefer new row for significant changes).

---

## Always Read the Log First

Before performing **any** task or proposing changes:

1. If `buglog.csv` exists, **read and parse it**.
2. Identify entries relevant to the current request (match by `area`, file paths, or keywords).
3. Reuse prior **fix patterns** and respect known gotchas from the log.
4. Mention which past entries inform the plan (by `short_id`).

If `buglog.csv` is missing, **create it with the header** above and continue.

---

## Response Format (What you output)

When the user asks you to do something, structure your reply as follows:

**Plan (minimal)**

* 1–3 bullet points for the smallest viable approach.
* Reference any relevant `short_id` from `buglog.csv`.

**Patch**

* Provide a single, self-contained diff for the minimal change. Use existing style and patterns.
* Do not include extra commentary or new files unless requested.

**Tests/Verification**

* Briefly state how to verify the change (unit test, device step, command).

**Buglog Append**

* Provide a single CSV row to append to `buglog.csv` reflecting the change.

---

## File Creation & Editing Policy

* ✅ Allowed automatically: creating **`buglog.csv`** if it doesn’t exist.
* ❌ Disallowed without explicit user request: new docs, READMEs, ADRs, specs, diagrams, extra scripts, CI changes, config files, or new packages.
* ✅ Preferred: editing existing code/tests; small, reversible patches; in-place refactors only when essential.

---

## Diff Style & Constraints

* Keep diffs small and focused; avoid multi-file sweeping changes unless necessary.
* Preserve formatting, comments, naming, and idioms already in the file.
* No speculative abstractions, no premature generalization.
* If a check or guard is needed, implement it in the same style used nearby.

---

## Severity & Triage Hints (for `severity` field)

* `critical`: crash/data loss/safety issue; immediate fix.
* `high`: major malfunction or user-visible defect; prioritize soon.
* `medium`: degraded behavior; schedule.
* `low`: minor issue or cosmetic.

---

## Quick Snippets (optional)

**Initialize `buglog.csv` (shell):**

```bash
[ -f buglog.csv ] || echo "iso_timestamp,short_id,severity,area,files,context_or_repro,root_cause,fix_summary,verification,status,commit" > buglog.csv
```

**Append example (replace values):**

```bash
printf "%s,%s,%s,%s,%s,\"%s\",\"%s\",\"%s\",%s,%s,%s\n" \
  "$(date -Iseconds)" "short-id" "medium" "area" "path/file.c" \
  "brief repro" "root cause" "one-line fix" "unit test" "in_progress" "commit" >> buglog.csv
```

---

## Guardrails Checklist (agent must self-check before replying)

* [ ] Did I avoid creating any new files (besides `buglog.csv`)?
* [ ] Is my plan the **smallest** viable change?
* [ ] Did I read `buglog.csv` and reference relevant `short_id`s?
* [ ] Did I keep code in the current stack and style?
* [ ] Did I include a single concise diff and a CSV row to append?

---

## Notes to Future Maintainers

This repo favors **pragmatic, minimal** fixes and a lightweight bug-history in `buglog.csv`. If you genuinely need additional documentation or new tooling, ask explicitly and justify briefly, then proceed when approved.
