# Phase 6 — Desktop Foundation (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 5 has landed.

**Goal:** Ship Toolbar, Panel, Resizable, and Table so a dense desktop app can be composed **without** a docking/workspace engine.

**Depends on:** Phase 5 (Tabs exist to compose with Panel). Phase 1 density/tokens. Phase 2 merge/composition.

**Unlocks:** Phase 7 remaining catalog; Phase 10 terminal chrome; Phase 8 layout a11y.

**Spec:** `docs/architecture.md` §62 Phase 6; §§12 (no Box/Stack DSL — ARCH-012), 24 (Table only), 29–35; ARCH-016, ARCH-017.

---

## In scope

### `Toolbar`

Desktop action cluster. Uses Button/Toggle from earlier phases. No business actions (no Buy/Sell).

### `Panel` (§30)

Compound: `Panel.Root`, `Panel.Header`, `Panel.Body`.

Owns: surface, border, background, header/body structure, min-size safety, theme integration.

Does **not** own: resize, collapse, dock, drag, tabs, loading, data fetching.

Class `.xui-panel`. Panel does **not** steal scroll ownership by default (§34).

### `Resizable` (§31–33)

Compound: `Resizable.Root`, `Resizable.Panel`, `Resizable.Handle`.

`Panel.Root` = visual surface. `Resizable.Panel` = geometric region. Do not conflate them.

Supports: horizontal split, vertical split, nested split, min/max constraints, default size, collapse, keyboard resize, layout callbacks.

Size contract: explicit units `"30%"`, `"240px"`, `"20rem"`. Avoid ambiguous `minSize={240}`.

Events: `onLayoutChange` (transient / high-frequency) vs `onLayoutCommit` (persistence / analytics). Persistence is application-owned.

Geometry: pointer-move resize must change DOM/CSS geometry **without** rerendering the whole React tree on every move. Heavy children observe their own viewport (`ResizeObserver` inside those children, not a required Core API here). Prefer CSS container queries for purely visual responsiveness.

Resize engine is an implementation detail (§53). Do not leak engine types.

Does **not** support: docking, tab drag between groups, floating windows, detach/popout, workspace layout tree.

### `Table` (§24)

Styled semantic HTML:

```html
<table><thead><tbody><tr><th><td>
```

Does **not** own: sorting engine, filtering engine, selection engine, virtualization, column state, realtime store.

Not DataGrid. No “advanced Table” props that grow into a grid.

## Out of scope

- `DataGrid` (Phase 9, other package)
- `@xui/workspace`, Workspace, WorkspaceTabs, DockManager, FloatingWindow, Popout
- Box / Stack / Flex / Spacer layout components (ARCH-012 — use Tailwind)
- Chart panes, order books, or any domain panel

## Definition of done

- A fixture page composes Tailwind layout + Toolbar + nested Resizable + Panel + Tabs + Table with one primary scroll owner per region.
- Resizable keyboard and pointer tests exist; layout callbacks distinguish change vs commit.
- `Table` markup is native table semantics; no virtualizer dependency in `@xui/react`.
- Public API has no Workspace types.
