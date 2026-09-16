# Phase 8 — Core Hardening (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 7 has landed.
> **No new Core components.** If a gap appears, file an ADR or return to the phase that owns that component.

**Goal:** Make Core release-quality without DataGrid: API consistency, accessibility, visual regression, RSC/SSR, company theme, no-Tailwind, and packed-artifact proof.

**Depends on:** Phase 7 (catalog complete except DataGrid).

**Unlocks:** Phase 11 Core 1.0 RC. Phase 10 may start in parallel once Phase 6+8 fixtures are trustworthy.

**Spec:** `docs/architecture.md` §62 Phase 8; §§56–57, 52, 61 (Core evidence except the terminal app); ARCH-015, ARCH-019, ARCH-020.

---

## In scope

From §62 Phase 8:

```text
API consistency
accessibility
visual regression
RSC
SSR
company theme
no-Tailwind fixture
package artifact validation
```

Concretely:

- **API consistency:** state vocabulary (§13), `render` only (§12), native vs semantic events (§14), class/`data-*` naming (§8), no leaked engine types (§9.3, §54). Fix drift; do not add aliases like `isDisabled`.
- **Accessibility:** automated checks **plus** explicit keyboard/ARIA tests for critical patterns (Dialog, AlertDialog, Menu, Select, Combobox, Tabs, Resizable). Scanner-only is not enough (§56).
- **Visual regression:** at least themes `trading-dark` / `trading-light`, densities `compact` / `default` / `comfortable`, and states `hover` / `focus` / `disabled` / `invalid` / `open` / `checked` / `loading` (§56).
- **RSC / SSR / hydration / portal:** `fixtures/next-rsc` covers client boundaries, package exports, CSS, portal behavior (§57).
- **company-theme** fixture: official trading theme replaced, components remain correct (§57).
- **no-tailwind** fixture: Tailwind not installed, Core still correct (§57, ARCH-003, ARCH-004).
- **Package artifact:** tests install packed tarballs, not only workspace source (§56). Types, CSS, and JS from the tarball.
- **Interaction vs frame lanes:** user interaction (click, keyboard, dialog close) must not be queued behind any demo realtime painting if such demos exist. No requirement to ship a realtime demo in Core.
- Optional: start `apps/docs` as a catalog. Not a substitute for fixtures.

## Out of scope

- New components
- DataGrid feature work (Phase 9)
- Trading terminal (Phase 10)
- Declaring 1.0.0 (Phase 11)
- Workspace engine

## Definition of done

Core half of §61, except “Trading terminal reference app” and DataGrid independence (those are Phase 10 / 9 / 11):

```text
Dark/light/company themes all work.
Semantic token contract is stable.
Tailwind utilities naturally override XUI defaults.
Core works without Tailwind.
Primitive engine details do not leak publicly.
Forms are compositionally complete.
Overlay focus/keyboard behavior is reliable.
Desktop layouts compose into complex applications.
RSC/SSR packaging is valid.
Package exports/types/CSS work from the real published artifact.
Accessibility-critical patterns have real browser tests.
```

CI gates on `pnpm verify`, Playwright a11y/interaction, visual snapshots, and artifact install.
