# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, with TypeScript entrypoints under `src/index.ts`, orchestration logic in `src/stripe-sync`, and SQL helpers plus migrations in `src/database`. Tests reside in `src/__tests__`, mirroring the module being exercised. Built bundles and emitted declaration files are written to `dist/`, while runnable integration samples live in `examples/{cloudflare-worker,deno-fresh,hono-js}`—use them as blueprints rather than editing library code inside those directories.

## Build, Test, and Development Commands
Run `pnpm build` to trigger `tsup`, producing both ESM and CJS artifacts and copying migrations into `dist/migrations`. Use `pnpm lint` and `pnpm format` to enforce Biome rules and auto-format prior to committing. `pnpm test` executes the Vitest suite once; `pnpm test:watch` keeps rerunning while you iterate; `pnpm test:coverage` generates coverage data and is the preferred pre-push check. `pnpm clean` removes `dist/` when you need a fresh build.

## Coding Style & Naming Conventions
All code is TypeScript targeting Node 18+ modules; keep imports ESM-friendly and prefer async/await. Match Biome defaults (2-space indentation, single quotes, trailing commas where valid) and run the formatter before sending a PR. File names are kebab-case for folders (`stripe-sync`) and camelCase for helper files. Exported symbols should be PascalCase for classes (`StripeSync`) and camelCase for functions (`syncBackfill`). Keep SQL files and migration folders snake_case to mirror database table names.

## Testing Guidelines
Vitest powers the suite; colocate specs beside their subjects inside `src/__tests__` and name files `<module>.test.ts`. Mock Stripe and Postgres boundaries with `pg-mem` or fixtures under `src/__tests__/fixtures` to keep tests deterministic. Aim for coverage on every new module and verify behavior with `pnpm test:coverage`; add regression tests for every bug fix affecting sync flows or migrations.

## Commit & Pull Request Guidelines
Follow the repo’s conventional short, imperative commits (`added examples`, `update migrations`). Keep related edits in a single commit when possible and describe API or schema changes in the body. PRs should link the motivating issue, summarize behavioral impact, list new commands or env vars, and attach screenshots/logs for UI or schema diff tools when relevant. Block merges on green CI and on reviewer sign-off for database or public API changes.

## Security & Configuration Tips
Never hard-code `stripeSecretKey`, `stripeWebhookSecret`, or Postgres URLs—load them via environment variables or a secrets manager, even in examples. When developing locally, rotate test keys regularly and scrub logs before sharing. Review `src/database/migrations` before shipping to ensure the `stripe` schema stays backward compatible for downstream consumers.
