# Phase 10 — Trading Terminal Reference (scope)

> **Kind:** Phase scope. **Not** an implementation plan.
> **Index:** [2026-09-16-xui-v1-phase-index.md](./2026-09-16-xui-v1-phase-index.md)
> **Do not code from this file.** Write a TDD plan after Phase 6 desktop primitives exist and Phase 8 fixtures are meaningful. DataGrid may be beta.

**Goal:** Build `examples/trading-terminal` as the v1 **architecture validation application**: prove a dense desktop trading UI can be built from generic XUI components **without forking Core** and without putting trading semantics into Core.

**Depends on:** Phase 6 (Panel / Resizable / Toolbar / Table). Phase 8 (theme/fixture truth). Phase 4–5 (forms/overlays). Phase 9 optional for the grid pane.

**Unlocks:** Phase 11 §61 bullet “Trading terminal reference app can be built without forking XUI.”

**Spec:** `docs/architecture.md` §60, §61 (terminal bullet), §35 (compose without docking), §1 (domain components stay **outside** Core); ARCH-001, ARCH-002, ARCH-016, ARCH-018.

---

## In scope

The example app must exercise:

```text
Trading theme
Company theme override
Toolbar
Panel
Resizable
Tabs
Overlay
Forms
Table
DataGrid          (beta allowed)
Realtime integration
```

Application-owned (not XUI packages):

- Realtime / market-data store (Zustand, Redux, RxJS, custom — XUI only needs `useSyncExternalStore` compatibility)
- Domain widgets **in the example**, not in Core: `BuyButton`, `SellButton`, `PriceInput`, `PnLCell`, `OrderBook`, `OrderEntry`, `PositionPanel`, `StrategyEditor`, `SymbolPicker` if the demo needs them
- Persistence of Resizable layout (`onLayoutCommit`)
- Routing / auth — only if the demo needs a stub; not XUI features

Layout must be composed from Tailwind + Panel + Resizable + Tabs + Toolbar (+ DataGrid). **No** Workspace / DockManager / FloatingWindow / Popout APIs (§35).

Two skins: official trading-dark and a company override, switching without rebuilding XUI.

## Out of scope

- Adding those domain widgets to `@xui/react`
- Implementing `@xui/workspace`
- Chart engine, OMS, quant libraries inside XUI
- Blocking Core 1.0 on DataGrid polish
- Marketing performance claims without §58 scenarios

## Definition of done

- The example lives in `examples/trading-terminal` and depends on public packages only (`workspace:*` / packed later).
- Grep/architecture tests: Core source still has no `buy`/`sell`/`pnl`/`order-book` component APIs.
- A user can run the example, switch theme, resize panes, open a dialog/popover, submit a generic form, see a Table and a DataGrid (beta), and see a live updating value from an **app** store.
- README states this validates architecture; it is not a brokerage product.
