# Phase 5 — Overlay and Navigation (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 4 has landed.

**Goal:** Finish the overlay family and local disclosure/navigation primitives, using Phase 2 infrastructure and the boundaries in §§19–21.

**Depends on:** Phase 4 (menus compose items/buttons; triggers exist).

**Unlocks:** Phase 6 desktop shells that embed Tabs; Phase 7 Toast can follow overlay presence.

**Spec:** `docs/architecture.md` §62 Phase 5; §§19–21; ARCH-009, ARCH-010, ARCH-016.

---

## In scope

### Overlay remaining after Phase 3

- `Tooltip` — **not** interactive content. Tooltip ≠ Popover.
- `DropdownMenu` — Menu ≠ Select, Popover ≠ Menu. Item composition via `render` (e.g. router link) was specified in §12.
- `ContextMenu`
- `AlertDialog` — high-risk decision. Outside click must **not** silently dismiss. No default top-right close. Action intent comes from composed Button. **Not** a notification. **Not** a red Dialog.
- `Drawer` — edge-attached **modal** task surface. **Not** Sidebar, DockPanel, or persistent Inspector.

Shared floating vs modal split stays as §19. Public semantics stay separate even if internals share portal/focus/dismiss.

### Navigation / disclosure (§21) — the three in the Phase 5 list

- `Tabs` — `value` / `defaultValue` / `onValueChange`. Identity is **string**, not index. Horizontal/vertical. Automatic/manual activation. **Not** route navigation. **Not** WorkspaceTabs.
- `Accordion` — grouped disclosure, `single` and `multiple`.
- `Collapsible` — one independent disclosure primitive.

Engine-backed: Tooltip, Menu, Tabs, Accordion, plus remaining modal pieces (§9.2). Do not reimplement roving focus, typeahead, menu keyboard, or collision positioning.

Inactive Tabs may remain mounted to preserve state (§42). Heavy children pausing is a DataGrid concern (Phase 9); Tabs must not unsubscribe application sockets.

## Out of scope

- `Breadcrumb`, `Pagination` — §22 Navigation but Phase 7.
- `HoverCard`, `NavigationMenu`, `Menubar`, `Tour`, `Coachmark` — §23.
- Workspace / docking / floating windows — ARCH-016, §35.
- Toast (Phase 7). AlertDialog is not Toast.

## Definition of done

- Browser tests cover focus, keyboard, pointer, nested overlay, Escape, and modal scroll lock for AlertDialog and Drawer.
- Tooltip cannot host interactive controls as a supported pattern.
- Tabs do not take a numeric index as the public identity.
- Drawer docs/tests state it is not a dock panel.
- No Workspace APIs exist.
