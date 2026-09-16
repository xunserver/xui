# Phase 7 — Supporting Components (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 6 has landed.

**Goal:** Finish the remaining XUI v1 **Core** catalog in §22 (everything not shipped in Phases 3–6 and not DataGrid).

**Depends on:** Phase 6. Toast/Alert may use Phase 2 presence and Phase 5 overlay rules.

**Unlocks:** Phase 8 hardening against a complete Core surface (minus DataGrid).

**Spec:** `docs/architecture.md` §62 Phase 7; §22 Feedback / Display / leftover Navigation; §9.1 Separator.

---

## In scope

Exactly the Phase 7 bullet list, plus the two §22 navigation leftovers assigned here by the index:

```text
Alert
Toast
Progress
Spinner
Skeleton
EmptyState
Badge
Avatar
Card
Kbd
Separator
DescriptionList
Breadcrumb
Pagination
```

Rules:

- Simple vs compound per §10. Do not force Root/Content onto Badge/Spinner/Separator.
- `Alert` ≠ `AlertDialog`. `Separator` stays native-first.
- No trading semantics (`PnL` colors on Badge, buy/sell Alert variants). Domain tokens remain unused by these components.
- No layout DSL via Card (no Grid/Stack API).
- Toast is not a form of Dialog; it must not steal application focus the way a modal does.

## Out of scope

- DataGrid, Workspace, §23 deferred widgets
- Visual regression platform build-out (Phase 8 consumes these components)
- New token roles unless a DS-* ADR proves a gap

## Definition of done

- Every §22 Core name except `DataGrid` is exported from `@xui/react` and `@xui/react/<name>` as applicable.
- Automated + keyboard/ARIA tests exist for anything with interaction (Toast, Pagination, Breadcrumb links via `render`).
- Company theme and no-tailwind fixtures still boot with a gallery page of these components.
