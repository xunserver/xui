# Phase 2 — Internal Infrastructure (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 1 has landed.

**Goal:** Put composition, prop/ref merging, controlled state, and overlay infrastructure inside `@xui/react` as **unpublished** internals, behind a replaceable behavior-engine adapter, with no public component catalog yet except `VisuallyHidden`.

**Depends on:** Phase 1 (tokens/cascade exist; internals must not put token values in React Context).

**Unlocks:** Phase 3 validation components.

**Spec:** `docs/architecture.md` §§9–14, 19 (shared overlay infrastructure only), 52–53; ARCH-007–011, ARCH-019.

---

## In scope

Public (documented, SemVer):

- `VisuallyHidden` — §9.1 native-first primitive needed by Dialog/Popover a11y in Phase 3.

Unpublished (`packages/react/src/internal/`, not in export map, not `@xui/primitives`):

- Composition: the single `render={<Element />}` mechanism. XUI owns prop merge, ref merge, event composition, ARIA preservation.
- `mergeProps`
- `mergeRefs`
- Controlled / uncontrolled helpers matching the vocabulary in §13 (`open` / `defaultOpen` / `onOpenChange`, and the same pattern for `value`, `checked`, `pressed`).
- Primitive / behavior **adapter** wrapping one mature engine (Base UI or equivalent). Engine remains replaceable.
- Overlay shared internals from §19:
  - Portal
  - Position
  - Focus (trap / restore)
  - Dismiss (outside press, Escape, nested overlays)
  - Presence
  - Layer
  - Scroll lock
- Allowed React Context topics only: locale, direction, portal container, stable service/store **references**. Never visual tokens.

Public contract rules this phase must lock with tests:

- Do not also export `as`, `asChild`, or `component`.
- Do not reimplement focus trap, outside press, Escape dismissal, nested overlay, modal scroll lock, roving focus, typeahead, menu keyboard, select keyboard, or collision positioning in XUI-owned algorithm code — the engine does that.
- Do not leak engine types, engine props, engine CSS variables, engine state, render APIs, middleware arrays, or instance objects into public `.d.ts` or documented CSS.
- No `window` / `document` / `localStorage` / `ResizeObserver` / global listeners at **module top level**. Interactive internals may use them inside effects after `'use client'`.
- Do not publish `@xui/overlay`, `@xui/collection`, `@xui/utils`, `@xui/internal`.

## Out of scope

- Button, Input, Field, Popover, Dialog (Phase 3). Internals may be integration-tested with throwaway test components, not public ones.
- Collection virtualization, scheduling lanes, `useSyncExternalStore` realtime helpers (Phase 9 / application).
- Choosing DataGrid engines (Phase 9) or resize engines (Phase 6).
- Tailwind as a runtime dependency.

## Definition of done

- A unit-tested `render` merge preserves `className`, `ref`, native handlers, and ARIA from both the XUI component and the substitution element.
- Public package types (`tsc` on a consumer fixture) cannot import engine types from `@xui/react`.
- A browser test can open/close a **test-only** overlay using the internal adapter: focus is trapped while open, restored on close, Escape dismisses, body scroll locks for modal mode.
- `VisuallyHidden` is exported from `@xui/react` and `@xui/react` still has no `@xui/tailwind` / `@xui/data-grid` dependency.
