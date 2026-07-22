# Agent Instructions

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `effinrich/invoice-flow`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default Matt Pocock triage label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: read root `CONTEXT.md` and root `docs/adr/` when present. See `docs/agents/domain.md`.

## Learned User Preferences

- Prefer Bun for installs and scripts (`bun.lock` is committed).
- Prefer focused, incremental fixes over broad rewrites; treat vibe-generated structure as imperfect but keep changes scoped.
- Persist editable Settings / business defaults in Supabase profiles, not as static UI-only values.

## Learned Workspace Facts

- Vite dev server runs on port 3000 (`strictPort: true`).
- Auth is Supabase Auth; signed-in home is `/invoices` (AppLayout + left nav). `/create` stays public for guest invoicing.
- Routing uses hash history; signed-in home is `/#/invoices`. Magic-link/OAuth `emailRedirectTo` must be origin-only (`http://localhost:3000/`) — no hash — then the app routes to `/invoices`.
- Business/sender settings live in Supabase `public.profiles` (`supabase/migrations/`) and prefill Invoice Creator when signed in.
- UI still uses `@blinkdotnew/ui` in places; `CONTEXT.md` may still describe Blink Auth/DB even though runtime auth/profiles are Supabase.
