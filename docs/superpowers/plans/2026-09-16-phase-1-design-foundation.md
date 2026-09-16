# Phase 1 — Design Foundation (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** After Phase 0 lands, write a `writing-plans` TDD plan that cites this scope and `docs/architecture.md`.

**Goal:** Make the public theme contract real: semantic tokens, trading-dark / trading-light, density, typography, motion, CSS layers, and the optional Tailwind v4 bridge — with zero Core components.

**Depends on:** Phase 0.

**Unlocks:** Phase 2 (internals can assume CSS variables exist), Phase 3 (components consume semantic tokens only).

**Spec:** `docs/architecture.md` §§4–8, 50–51, plus ARCH-002, ARCH-003, ARCH-004, ARCH-005, ARCH-006, ARCH-007.

---

## In scope

- Reference tokens as **internal inputs** (`gray-*`, `blue-*`, `spacing-*`, `radius-*`, `font-size-*`). They are not the application-facing theme API.
- Semantic tokens as the **stable public theme contract**, at least:
  - `background`, `foreground`
  - `surface`, `surface-raised`, `surface-sunken`
  - `muted`, `muted-foreground`
  - `border`, `border-strong`
  - `primary`, `primary-foreground`
  - `danger`, `success`, `warning`, `info`
  - `focus-ring`
  - `shadow-floating`, `shadow-modal`
  - `radius-control`, `radius-surface`, `radius-overlay`
- Shared control-height tokens that later align Button / Input / Select.Trigger:
  - sizes `xs | sm | md | lg` × densities `compact | default | comfortable`
- Theme CSS files:
  - `@xui/theme/tokens.css`
  - `@xui/theme/trading-dark.css` (default theme)
  - `@xui/theme/trading-light.css`
- Scoping via CSS cascade, not React Context:
  - `data-xui-theme="trading-dark" | "trading-light"`
  - `data-xui-density="compact" | "default" | "comfortable"`
  - nested scopes must work
- Default trading theme: **Theme = trading-dark**, **Density = compact**
- Typography: `sans` and `mono`. Generic numeric display may set `font-variant-numeric: tabular-nums`. Do not make every control monospace.
- Motion tokens (duration / easing) as CSS variables. No animation library requirement.
- CSS layers so application Tailwind utilities override XUI defaults. No `!important` by default. No global reset. No global `button/input/table/body` styling.
- `@xui/react/styles.css` may declare layer order only. No component structural CSS yet except what is required to prove layers.
- `@xui/tailwind` Tailwind CSS v4 `@theme inline` bridge, **namespaced**:
  - `bg-xui-background`, `bg-xui-surface`, `text-xui-foreground`, `border-xui-border`, and the rest of the semantic set
  - must **not** claim `bg-primary` / `text-muted` unless the app opts in (this phase does not opt in)
- Optional **domain tokens** on the trading theme files only (`market-up`, `market-down`, `profit`, `loss`, `buy`, `sell`, `bid`, `ask`). No Core component may read them (there are no Core components yet; lock this with a contract test that `@xui/react` CSS/JS does not mention those names).
- Fixture updates:
  - `vite-react` uses trading-dark + compact + optional Tailwind bridge
  - `no-tailwind` still works with only theme + react CSS
  - `company-theme` supplies replacement semantic variables under `data-xui-theme="company"` and does not import trading-dark/light
  - `next-rsc` still imports CSS from a Server layout

## Out of scope

- Any public React component, including Button
- Component-local variables such as `--button-bg` (land with the component in Phase 3+)
- Behavior engine, portal, `render` composition
- `apps/docs`, visual regression suite (Phase 8)
- Inventing a Box / Stack / Flex layout DSL (ARCH-012)

## Open decision for the later TDD plan (not a reason to skip this phase)

Architecture freeze names token **roles**, not RGB values. The Phase 1 implementation plan must pick a concrete trading-dark / trading-light palette. Record the palette as a `DS-*` ADR if it should become normative. Do not block Phase 1 on more architecture writing.

## Definition of done

- Nested theme and density attributes change computed CSS variables without React Context.
- `fixtures/no-tailwind` renders using `@xui/theme` + `@xui/react/styles.css` with `tailwindcss` absent from that fixture’s dependencies.
- `fixtures/company-theme` does not import official trading CSS and still has a coherent semantic variable set.
- `@xui/tailwind` is optional: `@xui/react` package.json still has no dependency on it.
- Packed `@xui/theme` CSS is what fixtures would get from npm, not a private src path that publish omits.
