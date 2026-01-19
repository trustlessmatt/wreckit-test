# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. **Check for stale archives** (see Archive Check below)
4. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
5. Pick the **highest priority** user story where `passes: false`
6. Implement that single user story
7. Run quality checks (typecheck: `npx tsc --noEmit`, lint: `npm run lint`)
8. Update AGENTS.md files if you discover reusable patterns (see below)
9. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
10. Update the PRD to set `passes: true` for the completed story
11. Append your progress to `progress.txt`

## Archive Check (Step 3)

Before starting work, check if the current `prd.json` and `progress.txt` are from a **different feature** than the one you're about to work on:

1. Read `prd.json` and note the `branchName`
2. Check if an `archive/` directory exists with content from this same branch
3. **If the progress.txt has completed work from a DIFFERENT branchName:**
   - Create archive folder: `archive/YYYY-MM-DD-feature-name/`
   - Copy current `prd.json` and `progress.txt` to the archive
   - Reset `progress.txt` with just the Codebase Patterns header (preserve patterns, clear iteration logs)

4. **If the branchName matches OR progress.txt only has the Codebase Patterns header:**
   - Do NOT archive - continue with current files

**Example check:**
- Current `prd.json` has `branchName: "ralph/feature-a"`
- `progress.txt` has iteration logs mentioning `ralph/feature-b`
- → Archive needed! Move old files to `archive/2026-01-18-feature-b/`

**Skip archiving if:**
- This is the first run (no iteration logs in progress.txt)
- The branchName in prd.json matches the feature in progress.txt

## Progress Report Format

APPEND to progress.txt (never replace, always append):

```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

Include the thread URL if available so future iterations can reference previous work.

The learnings section is critical - it helps future iterations avoid repeating mistakes and understand the codebase better.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```
## Codebase Patterns
### Database
- Drizzle ORM with PostgreSQL
- Schema in `db/schema.ts`
- Migrations via `npm run db:generate` and `npm run db:push`
- Type inference: `typeof users.$inferSelect`

### API Routes
- Next.js App Router in `app/api/`
- Auth: Privy JWT verification via `privy.verifyAuthToken(token)`
- Response format: `{ data }` for success, `{ error }` for errors

### PokemonTCG Integration
- API client in `lib/pokemon-tcg.ts`
- Rate limited: 1000 requests/day, 30 requests/minute
- API key via `POKEMON_TCG_API_KEY` env var
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update AGENTS.md Files

Before committing, check if any edited files have learnings worth preserving in nearby AGENTS.md files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing AGENTS.md** - Look for AGENTS.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good AGENTS.md additions:**

- "When modifying schema, always run `npm run db:generate` to create migrations"
- "This API route requires valid Bearer token from Privy auth"
- "Tests require DATABASE_URL to be set"

**Do NOT add:**

- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update AGENTS.md if you have **genuinely reusable knowledge** that would help future work in that directory.

## Quality Requirements

- ALL commits must pass your project's quality checks
  - Typecheck: `npx tsc --noEmit`
  - Lint: `npm run lint` (if available)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
```
<promise>COMPLETE</promise>
```

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
