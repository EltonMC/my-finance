# 2026-09-15-ci-gate-repair: every CI gate on a pull request runs and means something

## Outcome

A pull request in this repository shows only failures that are real. The Quality gate runs an end-to-end smoke test instead of dying on a missing Playwright install, the maintainer-only template workflow no longer runs here, and Dependency review either works or is switched off deliberately.

## Delivery gate

- Change size: session
- Upstream source or direct-intent rationale: owner request on 2026-09-15 ("abra o chore para corrigir os itens") after pull request #1 showed three CI failures unrelated to its change.
- Intent gaps: none. Deleting `.github/workflows/harness-template-smoke.yml` needs the owner's explicit approval because it edits `.github/workflows/`.
- Irreversible actions: none. Every change is a normal commit on a branch.
- Footprint: `.github/workflows/`, `package.json` scripts and devDependencies, `pnpm-lock.yaml`, `playwright.config.ts`, `e2e/`, `.harness/project.yaml`.
- Readiness verdict: CONCERNS
- Concerns accepted by owner or condition to clear: the workflow deletion waits for the owner's explicit approval; enabling Dependency graph is an owner action in GitHub settings that no commit can perform.

## Acceptance criteria

- [x] `pnpm test:e2e` runs a browser smoke test locally and in CI, and fails when the application does not load.
- [ ] The Quality gate reaches the end-to-end step instead of failing at `playwright install`. (awaiting the next CI run)
- [x] `.harness/project.yaml` names the real `e2e` command, so `npm run harness -- verify --e2e` runs it.
- [ ] The maintainer-only template smoke workflow no longer runs on this repository's pull requests. (blocked: deleting the file needs a permission the agent does not hold)
- [ ] Dependency review is enabled in repository settings or removed from CI with the reason recorded. (Dependabot alerts and automated security fixes enabled via API; the next CI run confirms whether Dependency graph followed)

## Scope

- Affected areas: continuous integration configuration and the end-to-end test setup.
- Explicit non-goals: application behaviour, database, deployment, branch protection rules, and the content of pull request #1.
- Dependencies or decisions: this work happens on `feature/account-overview-data` because `main` does not carry `.github/workflows/app-ci.yml` yet — that workflow arrives with pull request #1, so the repair belongs to the same delivery.
- Code-language convention: English for technical code and developer-facing text; product locale for user-facing copy.
- Memory consulted: `.harness/memory/handoffs/CURRENT.md` (pull request #1 CI findings).
- Memory captured or updated: handoff refreshed when this closes.

## Data and authorization impact

- Tables, Storage, Auth, RPC, or Edge Functions affected: none.
- Access-matrix update: not needed.
- Migration and RLS tests: not needed.

## UX contract

- User job and primary action: not applicable — no user-facing change.
- States: loading, empty, error, success, disabled: not applicable.
- Keyboard and assistive-technology behavior: not applicable.
- Responsive or visual-regression risk: not applicable. The smoke test asserts the sign-in screen renders without a backend, so it must not depend on Supabase being up.

## Implementation evidence

- Files changed: `playwright.config.ts`, `e2e/smoke.spec.ts`, `package.json` (`test:e2e` script, widened `lint` globs, `@playwright/test` devDependency), `pnpm-lock.yaml`, `tsconfig.node.json`, `.harness/project.yaml`, this work item.
- TDD red evidence: `pnpm test:e2e` → `Command "test:e2e" not found`. Then, with a deliberate `throw` appended to `src/main.tsx`, `pnpm test:e2e` → 1 failed, 1 passed (the console-error assertion caught the runtime error; the page still rendered, so the second spec stayed green). `src/main.tsx` restored immediately afterwards.
- TDD green evidence: `pnpm test:e2e` → 2 passed (4.3s).
- TDD refactor evidence: `npm run harness -- verify --e2e` → all green including `test:e2e` (4.9s).
- Checks run: `pnpm lint` (now also covering `e2e` and `playwright.config.ts`), `pnpm typecheck`, `npm run harness -- verify`, `npm run harness -- verify --e2e`.
- Review findings and disposition: two gaps found and fixed while implementing. (1) `vite preview` binds `localhost` only, which resolves to `::1` on macOS, so the Playwright `webServer` timed out after 120s; fixed with `--host 127.0.0.1` and a comment recording why. (2) `e2e/` and `playwright.config.ts` were outside every `tsconfig` include and every lint glob, so they were neither type-checked nor linted; both were added, and the type-check was proven by a deliberate `TS2322` that surfaced and was then removed.
- Remaining risks: the smoke suite covers only the pre-authentication screen, by design, so it cannot catch a regression behind sign-in. The template smoke workflow still runs until the owner deletes it.
- Independent-review evidence or proportional exception: proportional exception — no application behaviour, data, or authorization changes; the change is test and CI configuration, fully exercised by the commands recorded above.
- Course-correction record: not needed
