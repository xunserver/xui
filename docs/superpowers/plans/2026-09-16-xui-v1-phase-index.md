# XUI v1 Phase Division

> **Kind:** Phase index / scope freeze.
> **Do not implement from this file.** This document only splits `docs/architecture.md` into sequential phases. Coding starts only after a phase has its own writing-plans implementation plan, and only when that phase is unblocked.
>
> **For agentic workers:** Do not treat this index as an implementation plan. Do not merge later phases into Phase 0 work. When a phase is ready to build, write a dedicated plan with Superpowers `writing-plans`, then execute with `subagent-driven-development` or `executing-plans`.

**Spec:** `docs/architecture.md` (XUI Architecture v1, Architecture Freeze).

**Source of sequence:** `docs/architecture.md` §62 Implementation Order.

**Why this exists:** The freeze is one spec covering repository, theme, internals, the core catalog, DataGrid, the trading-terminal fixture, and 1.0 RC. Those are not one implementation plan. Each phase below must produce working, testable software on its own.

---

## How to read this division

| Document kind | Meaning |
| --- | --- |
| This index | Complete map of every phase, every Core component, every architecture section |
| `2026-09-16-phase-0-repository-foundation.md` | **Implementation plan** (TDD, file-by-file). Ready to execute after `docs/architecture.md` is on the branch |
| `2026-09-16-phase-N-*.md` for N ≥ 1 | **Phase scope** only. Not a TDD plan yet. Do not code from those files |

Rules:

1. Execute phases in order on the Core critical path: `0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 11`.
2. Phase 9 (DataGrid) is a separate package and **must not block Core 1.0**. It may start after Phases 0–2, in parallel with Phases 4–8. It still must not leak into `@xui/react`.
3. Phase 10 (trading terminal) starts after Phase 6 desktop primitives exist and Phase 8 fixtures are honest. DataGrid in the terminal may be beta.
4. Do not invent extra phases. Gaps in §62 (components listed in §22 but omitted from a phase bullet list) are assigned into an existing phase in the matrix below — not into a Phase 3.5.
5. Anything in §23 or the architecture-level exclusions is **never a phase**. If implementation wants it, that is an ADR, not a silent catalog expansion.

---

## Phase map

```text
Phase 0  Repository Foundation
   ↓
Phase 1  Design Foundation          tokens / theme / density / CSS layers / Tailwind bridge
   ↓
Phase 2  Internal Infrastructure    render / merge / adapter / portal / focus / overlay / presence
   ↓
Phase 3  First Validation Components
         Button · Input · Field · Popover · Dialog
   ↓
Phase 4  Form and Choice Controls   (+ Button family leftovers + Toggle)
   ↓
Phase 5  Overlay and Navigation
   ↓
Phase 6  Desktop Foundation         Toolbar · Panel · Resizable · Table
   ↓
Phase 7  Supporting Components
   ↓
Phase 8  Core Hardening             a11y / visual / RSC / fixtures / artifacts
   ↓
Phase 11 Core 1.0 RC                freeze contracts, first stable Core release

Parallel after 0–2 (does not gate 11):
Phase 9  DataGrid Beta              @xui/data-grid 0.x

After 6 and 8; may consume 9 beta:
Phase 10 Trading Terminal Reference examples/trading-terminal
```

| Phase | Title | Package focus | Implementation plan | Scope file |
| --- | --- | --- | --- | --- |
| 0 | Repository Foundation | all four public packages (empty) | [phase-0](./2026-09-16-phase-0-repository-foundation.md) | (same file) |
| 1 | Design Foundation | `@xui/theme`, `@xui/tailwind`, react `styles.css` layers | not written | [phase-1](./2026-09-16-phase-1-design-foundation.md) |
| 2 | Internal Infrastructure | `@xui/react` `src/internal/*` (unpublished) | not written | [phase-2](./2026-09-16-phase-2-internal-infrastructure.md) |
| 3 | First Validation Components | `@xui/react` button / input / field / popover / dialog | not written | [phase-3](./2026-09-16-phase-3-first-validation-components.md) |
| 4 | Form and Choice Controls | `@xui/react` forms, choice, select family, leftover actions | not written | [phase-4](./2026-09-16-phase-4-form-and-choice-controls.md) |
| 5 | Overlay and Navigation | `@xui/react` menus, remaining modal, tabs/disclosure | not written | [phase-5](./2026-09-16-phase-5-overlay-and-navigation.md) |
| 6 | Desktop Foundation | `@xui/react` toolbar / panel / resizable / table | not written | [phase-6](./2026-09-16-phase-6-desktop-foundation.md) |
| 7 | Supporting Components | `@xui/react` feedback / display / leftover navigation | not written | [phase-7](./2026-09-16-phase-7-supporting-components.md) |
| 8 | Core Hardening | tests, fixtures, visual, a11y, packing — no new components | not written | [phase-8](./2026-09-16-phase-8-core-hardening.md) |
| 9 | DataGrid Beta | `@xui/data-grid` | not written | [phase-9](./2026-09-16-phase-9-data-grid-beta.md) |
| 10 | Trading Terminal Reference | `examples/trading-terminal` | not written | [phase-10](./2026-09-16-phase-10-trading-terminal-reference.md) |
| 11 | Core 1.0 RC | versioning / changelog / contract freeze | not written | [phase-11](./2026-09-16-phase-11-core-10-rc.md) |

---

## Core component → phase

Every name in `docs/architecture.md` §22, plus the native primitives in §9.1 that later phases need.

### Actions (§22)

| Public component | Phase | Notes |
| --- | --- | --- |
| `Button` | **3** | §15. `variant` default `secondary`, `size` default `md`, `type="button"`. No buy/sell variants |
| `IconButton` | **4** | §15 lists it with Button, but §62 Phase 3 says implement **only** five components. Assigned here so Phase 3 stays the validation slice |
| `ButtonGroup` | **4** | same as IconButton |
| `Toggle` | **4** | §17. State is `pressed`, not `checked` |
| `ToggleGroup` | **4** | §22 Actions; omitted from §62 lists. Assigned with Toggle |

### Forms (§22)

| Public component | Phase | Notes |
| --- | --- | --- |
| `Field` | **3** | §16. Owns label/description/error/IDs/ARIA. Does **not** own value/dirty/touched/schema/submit |
| `Input` | **3** | Native `<input>`. Native React `onChange`. No label/prefix/suffix on Input itself |
| `Textarea` | **4** | Native first (§9.1) |
| `InputGroup` | **4** | Visual prefix/suffix/addon only. No value ownership |
| `NumberField` | **4** | Generic numeric control. No trading `PriceInput` semantics |
| `NativeSelect` | **4** | Native `<select>`. Native React API |
| `Select` | **4** | Custom single-select. Not searchable Select |
| `Combobox` | **4** | Separate selected / input / open state. Async fetch is app-owned |
| `Checkbox` | **4** | Tri-state. Not Switch, not Toggle |
| `RadioGroup` | **4** | Group owns `value` |
| `Radio` | **4** | §22 lists Radio separately from RadioGroup |
| `Switch` | **4** | Persistent ON/OFF. No indeterminate |

### Overlay (§22)

| Public component | Phase | Notes |
| --- | --- | --- |
| `Popover` | **3** | First floating overlay. Validates portal / position / dismiss / presence |
| `Dialog` | **3** | First modal. Validates focus trap, scroll lock, Title a11y contract |
| `Tooltip` | **5** | Tooltip ≠ interactive content |
| `DropdownMenu` | **5** | Menu ≠ Select, Popover ≠ Menu |
| `ContextMenu` | **5** | |
| `AlertDialog` | **5** | Not a red Dialog. No silent outside dismiss, no default corner close |
| `Drawer` | **5** | Edge modal. Not Sidebar / DockPanel / Inspector |

### Navigation (§22)

| Public component | Phase | Notes |
| --- | --- | --- |
| `Tabs` | **5** | String identity, not index. Not routing, not WorkspaceTabs |
| `Accordion` | **5** | single / multiple |
| `Collapsible` | **5** | Single disclosure |
| `Breadcrumb` | **7** | In §22 Navigation, but §62 Phase 5 list omits it. Assigned to supporting |
| `Pagination` | **7** | same |

### Feedback / Display / Desktop / Data (§22)

| Public component | Phase | Notes |
| --- | --- | --- |
| `Alert` | **7** | Not AlertDialog |
| `Toast` | **7** | |
| `Progress` | **7** | |
| `Spinner` | **7** | |
| `Skeleton` | **7** | |
| `EmptyState` | **7** | |
| `Badge` | **7** | |
| `Avatar` | **7** | |
| `Card` | **7** | |
| `Kbd` | **7** | |
| `Separator` | **7** | Native first (§9.1) |
| `DescriptionList` | **7** | |
| `Toolbar` | **6** | |
| `Panel` | **6** | Visual surface. Does not resize/dock/drag |
| `Resizable` | **6** | Geometric region. Not docking |
| `Table` | **6** | Semantic HTML table. No sort/filter/virtual engine |
| `DataGrid` | **9** | `@xui/data-grid` only. Not an advanced Table |

### Supporting primitives (not in §22 catalog, required by later components)

| Primitive | Phase | Notes |
| --- | --- | --- |
| `VisuallyHidden` | **2** | §9.1. Needed before Dialog Title/Description patterns |
| `Label` | **3** | §9.1. Field composition; keep native `<label>` semantics |

**Count check:** §22 names are all assigned. §62 Phase 3 remains exactly five validation components. Leftovers from §15 / §17 / §22 are in Phase 4 or Phase 7, never in a new phase number.

---

## Never in any v1 phase

From `docs/architecture.md` §23 and architecture-level exclusions. Do not schedule these under Phases 0–11.

**Deferred / separate products:**

```text
DatePicker  Calendar  TimePicker
Tree  TreeSelect
MultiSelect  TagInput
RichTextEditor  FileUploader
CommandPalette  ColorPicker
HoverCard  NavigationMenu  Menubar
Tour  Coachmark
```

**Select-family deferred (§18.4):**

```text
MultiSelect  TagInput  Creatable  Freeform  VirtualizedCombobox
```

**DataGrid deferred (§28) — not even in Phase 9 beta:**

```text
cell editing  range selection  clipboard
grouping / aggregation  TreeGrid
dynamic row height  column virtualization
```

**Architecture-level exclusions (not XUI Core, not DataGrid):**

```text
Docking Engine / Floating Window / Popout / Workspace Manager
Form State Manager / Router / Data Fetching / Application State Manager
Realtime / Market Data Store
Chart Engine / Quant Computation Engine
Trading Business Logic / Order Management / Authentication
BuyButton SellButton PriceInput PnLCell OrderBook OrderEntry
PositionPanel StrategyEditor SymbolPicker
```

**Do not publish in v1:**

```text
@xui/primitives  @xui/internal  @xui/utils  @xui/overlay  @xui/collection
@xui/workspace
```

---

## Architecture section → phase

Every numbered section in `docs/architecture.md` must have a home. “All” means it constrains every later implementation plan.

| Section | Title | Phase home |
| --- | --- | --- |
| 1 | Project Positioning | All (especially 10: no domain components in Core) |
| 2 | Architecture Constitution ARCH-001–020 | All |
| 3 | High-Level Architecture | 0 (packages), 2 (infrastructure layer), 9 (`@xui/data-grid`) |
| 4 | Design Token Architecture | **1**; component-local variables land with the component that owns them (3+) |
| 5 | Density and Size | **1** |
| 6 | Typography | **1** |
| 7 | Theme Architecture | **1** |
| 8 | CSS Architecture | **1** (layers, bridge); structural classes/state attrs with each component |
| 9 | Primitive / Behavior Architecture | **2** (adapter + engine choice); used by 3+ |
| 10 | Component Architecture | **3+** (simple vs compound) |
| 11 | Component Props Contract | **3+** |
| 12 | Composition API `render` | **2** |
| 13 | State Vocabulary | **2** helpers; enforced **3+** |
| 14 | Native API Rule | **3+** |
| 15 | Button Architecture | **3** Button; **4** IconButton / ButtonGroup |
| 16 | Form Architecture | **3** Field + Input; **4** InputGroup + remaining |
| 17 | Choice Controls | **4** |
| 18 | Select Family | **4** |
| 19 | Overlay Architecture | **2** shared infra; **3** Popover + Dialog; **5** remaining |
| 20 | Dialog Family | **3** Dialog; **5** AlertDialog + Drawer |
| 21 | Navigation / Disclosure | **5** Tabs / Accordion / Collapsible; **7** Breadcrumb / Pagination |
| 22 | Core Component Scope | this matrix |
| 23 | Explicitly Out of XUI v1 Core | never |
| 24 | Table vs DataGrid | **6** Table; **9** DataGrid |
| 25–28 | DataGrid architecture, engine, principles, beta scope | **9** |
| 29 | Layout Architecture | **6** (level 2); level 3 workspace is never |
| 30 | Panel | **6** |
| 31–33 | Resizable + size contract + geometry | **6** |
| 34 | Scroll Ownership Rule | **3** Dialog body; **4** Combobox; **6** Panel; **9** DataGrid |
| 35 | Workspace Boundary | never in v1; Phase **10** must compose without docking |
| 36–41 | Realtime / store / subscription / rAF / coalescing / lanes | **9** primarily; **6** resize geometry; **8** must not regress interaction lanes |
| 42 | Hidden / Inactive Heavy Views | **5** Tabs; **6** Panel; **9** DataGrid pause-when-inactive |
| 43–44 | Performance / CSS performance | **6**, **8**, **9** |
| 45–51 | Packages, layout, deps, build, exports, CSS, Tailwind | **0** create; **1** fill theme/tailwind; **11** freeze |
| 52 | React / RSC Boundary | **0** scan; **3** first `'use client'` leaves; **8** fixture proof |
| 53 | Third-Party Dependency Policy | **2** engine; **6** resize engine; **9** table/virtual engines |
| 54–55 | TypeScript + SemVer contracts | **3+** public types; **11** freeze |
| 56 | Testing Architecture | **0** harness; **3+** component tests; **8** visual/a11y/RSC; **9** perf; **11** artifact |
| 57 | Consumer Fixtures | **0** shells; **1** real tokens; **3+** components; **8** acceptance |
| 58 | Performance Benchmark Principles | **9**; Resizable in **6**/**8** |
| 59 | Versioning | **0** changesets; **9** data-grid 0.x; **11** Core 1.0.0 |
| 60 | Reference Application | **10** |
| 61 | XUI v1 Definition of Done | **11** (evidence collected across 8–10) |
| 62 | Implementation Order | this index |
| 63–64 | Architecture change process + ADR categories | all phases |
| 65 | Final Architecture Summary | all |
| 66 | Architecture Freeze Status | current; implementation evidence over speculative expansion |

---

## Shared constraints (every later plan copies these)

Taken verbatim in spirit from `docs/architecture.md` §2 and package chapters. Implementation plans must paste the exact ARCH lines into their Global Constraints header.

- ARCH-001 Core Components must not depend on trading business semantics.
- ARCH-002 Trading is the default Theme, not the Component API.
- ARCH-003 Tailwind is an Integration Layer, not a Core runtime/build dependency.
- ARCH-004 Component correctness must not depend on the host Tailwind compiler scanning XUI source or `node_modules`.
- ARCH-005 Semantic Tokens are the stable public Theme Contract.
- ARCH-006 Visual values use CSS Variables + CSS Cascade.
- ARCH-007 React Context must not carry visual token values.
- ARCH-008 Native elements should preserve native semantics and native React APIs whenever practical.
- ARCH-009 Complex interaction algorithms should use a mature Behavior Engine rather than custom reimplementation.
- ARCH-010 Third-party engine APIs/types must not leak into XUI Public API.
- ARCH-011 State vocabulary is semantic and consistent: `open`, `value`, `checked`, `pressed`, `invalid`, etc.
- ARCH-012 Generic CSS layout belongs to Tailwind; XUI should not create a parallel Box/Stack/Flex DSL.
- ARCH-013 Correct state boundaries are more important than blanket memoization.
- ARCH-014 Data fetching, persistence, routing, form state and domain state are application responsibilities.
- ARCH-015 Documented CSS classes, data attributes, CSS variables and behavioral defaults are SemVer-governed public contracts.
- ARCH-016 XUI v1 does not implement a Docking / IDE Workspace engine.
- ARCH-017 DataGrid is a separate high-performance subsystem, not an advanced `Table`.
- ARCH-018 XUI does not own the application's realtime / market-data store.
- ARCH-019 Accessibility is default behavior, not an optional feature flag.
- ARCH-020 After Architecture Freeze, implementation evidence takes priority over further speculative architecture expansion.

Package invariants:

- Publish only `@xui/react`, `@xui/theme`, `@xui/tailwind`, `@xui/data-grid`.
- `@xui/react` must not depend on `@xui/data-grid` or `@xui/tailwind`.
- `@xui/data-grid` may depend on `@xui/react`.
- React 19 baseline. No CJS/UMD. No React 18 compatibility layer.
- Composition API is only `render={...}`. Never also ship `as` / `asChild` / `component`.
- Default theme `trading-dark`, default density `compact`.

---

## What each phase must leave behind

Short contracts so a later writing-plans author does not reopen earlier phases.

| After phase | Must be true |
| --- | --- |
| 0 | Four packages install from workspace and from packed tarballs. Four fixtures boot. CI green. No tokens, no components |
| 1 | Nested `data-xui-theme` / `data-xui-density` change visuals via CSS only. `no-tailwind` still works. `company-theme` can replace trading CSS. `@xui/tailwind` maps namespaced `bg-xui-*` utilities |
| 2 | `render` merges props/refs/events/ARIA. Portal/focus/dismiss/presence exist as **internal** adapters. Engine types do not appear in public `.d.ts` |
| 3 | Button/Input/Field/Popover/Dialog work in all four fixtures, with keyboard/ARIA tests, without Tailwind, with company theme, from Next server entry where the module is a server-safe re-export or a leaf `'use client'` |
| 4 | Forms are compositionally complete per §16–18. No form framework. No MultiSelect |
| 5 | Overlay boundaries in §19 hold. Tabs are not a router |
| 6 | A dense desktop shell can be composed from Tailwind + Panel + Resizable + Tabs + Toolbar + Table. No Workspace APIs |
| 7 | Remaining §22 components exist. Catalog complete except DataGrid |
| 8 | §61 evidence for Core minus the reference app: themes, tokens, Tailwind override, no-Tailwind, no engine leakage, overlay a11y, RSC/SSR, packed artifacts |
| 9 | `@xui/data-grid` 0.x beta matches §28 included list. Core can release without it |
| 10 | `examples/trading-terminal` uses only public XUI APIs + app-owned store. No Core fork. No domain components added to Core |
| 11 | Core packages at 1.0.0 RC. Public unions/classes/tokens/data-attrs frozen. DataGrid may remain 0.x |

---

## Next action (not this change)

1. Keep this division. Do not start product code.
2. When ready to build, execute **Phase 0** from [2026-09-16-phase-0-repository-foundation.md](./2026-09-16-phase-0-repository-foundation.md) only.
3. After Phase 0 lands, write the Phase 1 **implementation plan** (TDD) from [phase-1 scope](./2026-09-16-phase-1-design-foundation.md). Token **values** are not in the architecture freeze; Phase 1's writing-plans step must pick a concrete trading-dark / trading-light palette and record it as a DS-* ADR if it needs to become normative.
