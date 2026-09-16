# Phase 9 — DataGrid Beta (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan after Phases 0–2. May run **in parallel** with Phases 4–8. Must not block Phase 11.

**Goal:** Ship `@xui/data-grid` as an independent `0.x` beta: XUI-owned grid model, virtualization, and realtime-friendly cells, without turning `Table` into a grid and without owning the market-data store.

**Depends on:** Phases 0–2. Tokens from Phase 1. Keyboard/focus internals from Phase 2. May compose Button from Phase 3 for headers if that phase has landed; if not, keep header controls internal until Button exists.

**Unlocks:** Phase 10 may embed the beta grid. Phase 11 still ships Core without waiting for grid 1.0.

**Spec:** `docs/architecture.md` §62 Phase 9; §§24–28, 34 (grid scroll), 36–44, 53, 58; ARCH-017, ARCH-018.

---

## In scope (§28 included + §62 Phase 9)

```text
column model
row identity
virtualization
sorting
selection
resize
pinning
keyboard
realtime integration
benchmarks
```

Mapped to §28:

- row virtualization, **fixed** row height
- sorting
- row selection
- column resizing, visibility, reorder, pinning
- sticky header
- keyboard grid navigation
- controlled state
- manual/server operation integration

Architecture:

```text
Public API → XUI Grid Model → Table Engine + Virtualizer + Interaction → XUI Renderer → DOM/ARIA
```

Realtime path:

```text
Realtime Store (app) → visible cell subscription → cell renderer
```

Public XUI types: `DataGridColumn<T>`, DataGrid state, `DataGridHandle`. **Never** expose TanStack `ColumnDef`, Table instance, or TanStack-only types even if TanStack Table / Virtual are the first engines (§26).

Principles:

- Stable row identity: `getRowId={row => row.id}`. Index is not semantic identity.
- DOM may be `div` + ARIA grid (not native `<table>`) to support virtualization, pin, cell nav, resize.
- DataGrid **owns its scroll viewport**. Do not wrap core scrolling in a generic ScrollArea (§27, §34).
- Compatible with `useSyncExternalStore`. Context may hold a **stable store handle**, never the whole high-frequency value set (§37).
- Subscription granularity ≈ rendering granularity: a cell subscribes to `(rowId, field)`, not entire `rows[]` (§38).
- Frame-batch visual publication with `requestAnimationFrame`. No fake 16ms timer (§39). Snapshot UIs may latest-win; event streams must not drop ordered events (§40).
- Scheduling lanes: interaction is Immediate; live values/resize/scroll visuals are Frame; expensive filter is Deferred. Interaction must not wait behind realtime paint (§41).
- Inactive/hidden views: may pause visual notification, measurement, virtualizer recalc, decoration. Must **not** auto-unsubscribe app WebSockets. On reactivation, read latest snapshot, do not replay history (§42).
- Performance rules §43. CSS containment only after benchmarks (§44).
- Benchmarks must fix scenario knobs in §58 (row count, columns, row height, cell complexity, update rate, viewport, sort/filter mode, hardware). No vague “supports 100k rows”. CI detects regressions vs a baseline.
- CSS: `@import "@xui/data-grid/styles.css"` separate from Core. Class example `.xui-data-grid-cell`.
- `@xui/data-grid` depends on `@xui/react`; the reverse remains forbidden.

## Out of scope (§28 deferred — not beta, not Core)

```text
cell editing
range selection
clipboard
grouping / aggregation
TreeGrid
dynamic row height
column virtualization
```

Also out of scope: XUI-owned realtime store, Chart engine, making Table accept grid props.

## Definition of done

- Beta package version stays `0.x`. Changesets do not bump Core to 1.0 because of grid work.
- Public `.d.ts` has no TanStack types.
- Browser tests: keyboard grid navigation, selection, column resize, pin, sort.
- At least one documented realtime fixture using an external store and per-cell subscription.
- Benchmark suite exists with a frozen scenario; CI fails on regression, not on missing marketing numbers.
- Core `Table` still has no virtualization dependency.
