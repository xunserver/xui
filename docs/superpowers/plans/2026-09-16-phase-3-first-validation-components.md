# Phase 3 — First Validation Components (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 2 has landed.

**Goal:** Implement **only** Button, Input, Field, Popover, and Dialog so they validate tokens, theme, CSS override, native API, compound API, portal, behavior engine, form semantics, composition, and RSC/client boundaries.

**Depends on:** Phase 2.

**Unlocks:** Phase 4 (rest of forms). Honest evidence that the freeze is implementable before expanding the catalog.

**Spec:** `docs/architecture.md` §62 Phase 3; §§10–16, 19–20 (Dialog + Popover only); ARCH-001, ARCH-008, ARCH-011, ARCH-014, ARCH-019.

---

## In scope — exactly these public components

### `Button` (simple, §15)

- Variants: `primary | secondary | outline | ghost | danger`. Default `secondary`.
- Sizes: `xs | sm | md | lg`. Default `md`.
- `danger` means destructive UI, **not** sell.
- Loading: `aria-busy="true"`, `data-loading`, activation blocked, focus preserved when practical. Loading is not `disabled`.
- Default native `type="button"`.
- Composition via `render` (example: render as `<a href>`).
- Class `.xui-button`. No `color`, `block`, `icon`, `iconPosition`, `rounded`, `elevation` props.
- **Not in this phase:** `IconButton`, `ButtonGroup`, buy/sell/long/short variants.

### `Input` (simple, native, §16.1)

- Remains native `<input>`.
- Keeps native React API: `onChange(event)`, `name`, `form`, `required`, `min`, `max`, `step`, `pattern`, `inputMode`, `autocomplete`.
- Must **not** include label, error message, prefix, or suffix.
- Class `.xui-input`.

### `Field` (compound, §16)

- Owns: label, description, error, IDs, ARIA relationships, required/disabled/invalid propagation.
- Does **not** own: value, dirty, touched, validation schema, submit state.
- Validation timing uses `invalid` / `aria-invalid` / `data-invalid`. Do not use browser `:invalid` as app validation timing.
- May export or compose `Label` (native `<label>`, §9.1).

### `Popover` (compound floating overlay, §19)

- First floating overlay. Uses Phase 2 portal / position / dismiss / presence / focus.
- Public semantics stay **Popover**, not Menu and not Tooltip.
- Parts stay shallow and namespaced (Root / Trigger / Content at minimum).

### `Dialog` (compound modal, §20)

- Parts: `Root`, `Trigger`, `Content`, `Header`, `Body`, `Footer`, `Title`, `Description`, `Close`.
- Title is part of the accessibility contract.
- Dialog does **not** manage form submission.
- Modal: focus trap, restore, Escape, scroll lock, nested overlay behavior via the engine.
- Class `.xui-dialog-content` on content. Dialog Body may own task/form scroll (§34). It must not steal scroll from an inner future DataGrid (not in this phase).

Also in scope:

- `'use client'` on interactive leaves (Dialog, Popover). Consumers must not add `'use client'` just to repair packaging.
- Server-safe re-exports from `@xui/react` root: importing `Button` / `Input` / `Field` from a Server Component must not explode at module eval. If a leaf is client-only, the leaf module carries the directive.
- Subpath exports when the component exists: `import { Button } from '@xui/react/button'` and from `@xui/react`.
- Component-local CSS variables (`--button-bg`, `--input-border`, `--dialog-bg`) mapped from semantic tokens. Do not create a giant global `--xui-button-primary-hover` registry.
- Structural classes + `data-*` state attributes (§8.2–8.3).
- Tests: unit (merge/controlled), browser (focus/keyboard/pointer), a11y assertions beyond an automated scanner, all four fixtures, packed artifact still installs.

## Out of scope

- IconButton, ButtonGroup, Toggle, InputGroup, Textarea, Checkbox, Select, Combobox, Tooltip, Menu, AlertDialog, Drawer, Tabs
- Form libraries, routing, data fetching
- Visual regression CI (Phase 8 may start snapshotting these five, but Phase 3’s bar is behavioral + a11y + fixture boot)
- `apps/docs` full site (optional local stories are allowed; a docs app is not required to close this phase)

## Definition of done

Architecture §62 list of assumptions this slice must validate:

```text
tokens
theme
CSS override (Tailwind utilities win; no-tailwind still correct)
native API (Input onChange event)
compound API (Field, Popover, Dialog)
portal
behavior engine (no leak)
form semantics (Field, not a form framework)
composition (Button render)
RSC / client boundaries
```

All five components work in `fixtures/vite-react`, `no-tailwind`, `company-theme`, and `next-rsc` (SSR/hydration without adding `'use client'` in the fixture page except where the fixture itself is a client demo).
