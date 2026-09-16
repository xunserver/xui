# Phase 4 — Form and Choice Controls (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan only after Phase 3 has landed.

**Goal:** Complete v1 forms, choice controls, and the select family, plus the Button-family leftovers that Phase 3 deliberately skipped.

**Depends on:** Phase 3 (Field/Input/Button patterns, engine adapter, tokens).

**Unlocks:** Phase 5 overlays that compose items/triggers; Phase 10 forms in the terminal.

**Spec:** `docs/architecture.md` §62 Phase 4; §§15 (IconButton / ButtonGroup only), 16.2–16.3, 17–18; ARCH-001, ARCH-008, ARCH-011, ARCH-014.

---

## In scope

### Leftover actions (from §15 / §22, omitted by §62 Phase 3)

- `IconButton`
- `ButtonGroup`
- `Toggle` — `pressed` / `defaultPressed` / `onPressedChange`. Not `checked`.
- `ToggleGroup`

### Forms (§62 Phase 4 + §22 Radio)

- `InputGroup` — visual prefix / suffix / addon / action / shared border / `:focus-within` surface. Does **not** manage input value.
- `Textarea` — native first, native React API.
- `NumberField` — generic numeric field. **Not** `PriceInput`. Tabular-nums allowed; no trading domain tokens.
- `Checkbox` — `checked | unchecked | indeterminate`. Public tri-state. Semantically ≠ Switch ≠ Toggle.
- `Switch` — persistent ON/OFF, `checked` / `defaultChecked` / `onCheckedChange`. No indeterminate.
- `RadioGroup` — group owns `value` / `defaultValue` / `onValueChange`. Values string/form-friendly.
- `Radio` — listed separately in §22.

### Select family (§18) — split is mandatory

- `NativeSelect` — native `<select>`, native React API, no custom popup/search/virtualization.
- `Select` — custom single-select. State: `value` + `open` pairs. Item identity: `value`, `textValue`, `children`. Typeahead allowed. **Not** a search input. **Not** `<Select searchable />`.
- `Combobox` — **separate** selected value, input value, and open state. Async fetching is application-owned. Virtualization is optional integration, not mandatory primitive behavior. Combobox content owns collection scroll (§34).

Compound widgets use XUI semantic callbacks (`onValueChange`). Native widgets keep native events (§14).

Engine-backed (do not reimplement): Checkbox, RadioGroup, Switch, Select, Combobox (§9.2).

## Out of scope

§18.4 and §23 must not appear:

```text
MultiSelect  TagInput  Creatable  Freeform  VirtualizedCombobox
```

Also out of scope: form state managers, schema validation libraries inside XUI, `PriceInput` / `SymbolPicker`, Tooltip/Menu/Dialog expansions.

## Definition of done

- Field + InputGroup + Input/Textarea/NumberField compose without XUI owning form state.
- Checkbox / Switch / Toggle / Radio public state names match §17 exactly (`pressed` vs `checked` vs group `value`).
- Select and Combobox are different components with different state shapes; no `searchable` flag on Select.
- NativeSelect still works without the behavior engine popup path.
- No engine types leak. No-tailwind and company-theme fixtures still pass with at least one control from this phase on the page.
