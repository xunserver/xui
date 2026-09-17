# XUI Architecture v1

> Status: **Architecture Freeze**
>
> Scope: XUI v1
>
> Positioning: **General-purpose Desktop UI Foundation + Trading-first Default Design System + Data-intensive Architecture**

---

## 1. Project Positioning

XUI is a **Tailwind CSS native-friendly, Desktop First, high-information-density, deeply themeable React UI framework**.

Its default design language is Trading / Quant oriented, but its Core Components are **general-purpose** and must not embed trading business semantics.

The intended layering is:

```text
XUI Foundation
      ↓
XUI Components
      ↓
Company Design System
      ↓
Company Domain Components
      ↓
Application
```

Examples of domain components that should live **outside XUI Core**:

```text
BuyButton
SellButton
PriceInput
PnLCell
OrderBook
OrderEntry
PositionPanel
StrategyEditor
SymbolPicker
```

XUI should make these components easy to build without requiring a fork.

---

# 2. Architecture Constitution

The following rules are XUI v1 architecture invariants.

| ID | Rule |
|---|---|
| ARCH-001 | Core Components must not depend on trading business semantics. |
| ARCH-002 | Trading is the default Theme, not the Component API. |
| ARCH-003 | Tailwind is an Integration Layer, not a Core runtime/build dependency. |
| ARCH-004 | Component correctness must not depend on the host Tailwind compiler scanning XUI source or `node_modules`. |
| ARCH-005 | Semantic Tokens are the stable public Theme Contract. |
| ARCH-006 | Visual values use CSS Variables + CSS Cascade. |
| ARCH-007 | React Context must not carry visual token values. |
| ARCH-008 | Native elements should preserve native semantics and native React APIs whenever practical. |
| ARCH-009 | Complex interaction algorithms should use a mature Behavior Engine rather than custom reimplementation. |
| ARCH-010 | Third-party engine APIs/types must not leak into XUI Public API. |
| ARCH-011 | State vocabulary is semantic and consistent: `open`, `value`, `checked`, `pressed`, `invalid`, etc. |
| ARCH-012 | Generic CSS layout belongs to Tailwind; XUI should not create a parallel Box/Stack/Flex DSL. |
| ARCH-013 | Correct state boundaries are more important than blanket memoization. |
| ARCH-014 | Data fetching, persistence, routing, form state and domain state are application responsibilities. |
| ARCH-015 | Documented CSS classes, data attributes, CSS variables and behavioral defaults are SemVer-governed public contracts. |
| ARCH-016 | XUI v1 does not implement a Docking / IDE Workspace engine. |
| ARCH-017 | DataGrid is a separate high-performance subsystem, not an advanced `Table`. |
| ARCH-018 | XUI does not own the application's realtime / market-data store. |
| ARCH-019 | Accessibility is default behavior, not an optional feature flag. |
| ARCH-020 | After Architecture Freeze, implementation evidence takes priority over further speculative architecture expansion. |

---

# 3. High-Level Architecture

```text
┌─────────────────────────────────────────────┐
│              Application / Company          │
│                                             │
│ OrderEntry / PositionPanel / StrategyEditor │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│          Company Design / Domain UI         │
│                                             │
│ Brand Theme / PriceCell / SymbolPicker      │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                XUI Components               │
│                                             │
│ Button / Input / Select / Dialog / Tabs     │
│ Panel / Resizable / Table                   │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│             XUI Infrastructure              │
│                                             │
│ Composition / Focus / Portal / Overlay      │
│ Collection / Presence / Form / Scheduling  │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│                XUI Foundation               │
│                                             │
│ Tokens / Theme / Density / Motion / CSS     │
└─────────────────────────────────────────────┘
```

Advanced subsystems:

```text
@xui/data-grid      // v1 beta / independent subsystem
@xui/workspace      // future, not v1 Core
```

---

# 4. Design Token Architecture

XUI uses three token layers plus component-local variables.

```text
Reference Token
      ↓
Semantic Token
      ↓
Component Local Variable
      ↓
Component CSS
```

Example:

```text
gray-800
   ↓
--xui-border
   ↓
--button-border
   ↓
.xui-button
```

## 4.1 Reference Tokens

Raw design values:

```text
gray-*
blue-*
spacing-*
radius-*
font-size-*
```

Reference Tokens are mostly internal implementation inputs and should not become the primary application-facing theme API.

## 4.2 Semantic Tokens

Semantic Tokens are the stable public Theme Contract.

Typical categories:

```text
background
foreground

surface
surface-raised
surface-sunken

muted
muted-foreground

border
border-strong

primary
primary-foreground

danger
success
warning
info

focus-ring

shadow-floating
shadow-modal

radius-control
radius-surface
radius-overlay
```

Components must consume semantic roles rather than concrete colors.

## 4.3 Domain Tokens

Optional domain tokens may exist:

```text
market-up
market-down
profit
loss
buy
sell
bid
ask
```

However:

> No Core Component may depend on domain tokens.

Domain tokens belong to an optional trading theme/domain extension or company layer.

## 4.4 Component-Local Variables

Components map global semantic tokens into local variables:

```text
--button-bg
--button-fg
--button-border

--input-bg
--input-border

--dialog-bg
```

Avoid a giant global registry such as:

```text
--xui-button-primary-hover
--xui-button-primary-active
--xui-button-secondary-hover
...
```

Most component-local variables should remain internal unless there is a proven customization need.

---

# 5. Density and Size

Density and component size are separate concepts.

```text
Component Size:
xs / sm / md / lg

Application Density:
compact / default / comfortable
```

Example:

```text
Button size="sm"
     ↓
--xui-control-height-sm
     ↓
density determines the physical height
```

Default XUI trading theme:

```text
Theme   = trading-dark
Density = compact
```

Shared control-height tokens should align:

```text
Button
Input
Select.Trigger
```

---

# 6. Typography

XUI supports at least:

```text
sans
mono
```

Generic numeric display should prefer:

```css
font-variant-numeric: tabular-nums;
```

Do not make every trading-themed control monospace by default.

Trading domain components may opt into stronger numeric typography.

---

# 7. Theme Architecture

Theme implementation uses:

```text
CSS Variables
+
Scoped CSS Cascade
```

Example:

```html
<div data-xui-theme="trading-dark">
  ...
</div>
```

Density:

```html
<div data-xui-density="compact">
  ...
</div>
```

Nested scopes must work.

React Context must not be used to propagate visual token values.

React Context may be used for infrastructure such as:

```text
locale
direction
portal container
stable service/store references
```

---

# 8. CSS Architecture

## 8.1 Precompiled Component CSS

XUI ships complete component CSS.

Conceptually:

```css
@import "@xui/react/styles.css";
```

Component correctness must not require the host application to scan XUI utility strings.

## 8.2 Stable Structural Classes

Examples:

```text
.xui-button
.xui-input
.xui-select-trigger
.xui-select-content
.xui-dialog-content
.xui-tabs-trigger
.xui-panel
.xui-data-grid-cell
```

Use classes for stable component identity.

## 8.3 State via Data Attributes

Examples:

```text
data-state
data-disabled
data-invalid
data-loading
data-highlighted
data-orientation
data-side
data-align
```

Use data attributes for stable behavior state.

## 8.4 Cascade and Specificity

XUI component CSS should use low specificity and live in an appropriate component layer.

Application Tailwind utilities must naturally override XUI defaults.

Rules:

```text
No !important by default.
No high-specificity selector chains.
No global reset.
No global button/input/table/body styling.
```

## 8.5 Tailwind Bridge

`@xui/tailwind` maps XUI semantic variables into Tailwind v4 theme variables.

Default namespaced utilities:

```text
bg-xui-background
bg-xui-surface
text-xui-foreground
border-xui-border
```

XUI should not claim generic names such as:

```text
bg-primary
text-muted
```

unless the consuming application explicitly chooses that mapping.

---

# 9. Primitive / Behavior Architecture

Public layering:

```text
Application
    ↓
XUI Component
    ↓
XUI Behavior Adapter
    ↓
Behavior Engine
    ↓
Browser
```

Initial behavior engine choice may be Base UI or an equivalent mature headless engine.

The engine must remain replaceable.

## 9.1 Native First

Use native elements where practical:

```text
Button
Input
Textarea
Label
Separator
VisuallyHidden
```

## 9.2 Behavior Engine When Necessary

Use a mature engine for complex interaction:

```text
Dialog
Popover
Tooltip
Menu
Select
Combobox
Tabs
Accordion
Checkbox
RadioGroup
Switch
```

Do not reimplement:

```text
focus trap / restore
outside press
Escape dismissal
nested overlay behavior
modal scroll lock
roving focus
typeahead
menu keyboard navigation
select keyboard behavior
collision positioning
```

## 9.3 Third-Party Leakage Rule

Do not expose engine-specific:

```text
types
props
CSS variables
internal state
render APIs
middleware arrays
instance objects
```

XUI owns its own Public Contract.

---

# 10. Component Architecture

XUI components use two models.

## 10.1 Simple Components

Single primary element / responsibility.

Examples:

```text
Button
Input
Textarea
Checkbox
Switch
Badge
Spinner
```

Do not force `.Root/.Content` structure onto simple components.

## 10.2 Compound Components

Used when parts have independent semantic/behavioral responsibility.

Examples:

```text
Dialog.Root
Dialog.Trigger
Dialog.Content

Select.Root
Select.Trigger
Select.Content
Select.Item

Tabs.Root
Tabs.List
Tabs.Trigger
Tabs.Content
```

Prefer namespaced Compound Components rather than many flat exports.

Keep nesting shallow.

---

# 11. Component Props Contract

Props conceptually fall into five categories:

```text
1. Behavior
2. State
3. Visual Semantic
4. Composition
5. Native
```

## 11.1 Allowed Visual Props

Only stable discrete design semantics belong in component props.

Examples:

```text
variant
size
orientation
activationMode
```

Do not turn React props into a parallel CSS system:

```text
width
margin
paddingX
radius
backgroundColor
shadow
```

Use:

```text
className
style
Tailwind
Theme
```

for general layout/custom styling.

---

# 12. Composition API

XUI standardizes on a single composition mechanism:

```tsx
render={<SomeElement />}
```

Examples:

```tsx
<Button render={<a href="/orders" />}>
  Orders
</Button>
```

```tsx
<DropdownMenu.Item
  render={<RouterLink to="/settings" />}
>
  Settings
</DropdownMenu.Item>
```

Do not simultaneously support:

```text
as
asChild
component
render
```

XUI owns:

```text
prop merging
ref merging
event composition
ARIA preservation
```

---

# 13. State Vocabulary

Use consistent state naming:

```text
open
defaultOpen
onOpenChange

value
defaultValue
onValueChange

checked
defaultChecked
onCheckedChange

pressed
defaultPressed
onPressedChange
```

Common states:

```text
disabled
readOnly
required
invalid
loading
```

Avoid redundant aliases:

```text
isDisabled
isInvalid
visible
opened
modelValue
```

unless a platform-native API requires otherwise.

---

# 14. Native API Rule

Native components keep native React event APIs.

Example:

```tsx
<Input onChange={event => ...} />
```

Composite widgets use semantic callbacks:

```tsx
<Select.Root
  value={value}
  onValueChange={setValue}
/>
```

Rule:

```text
Native Element
→ Native React API

Composite Widget
→ XUI Semantic State API
```

---

# 15. Button Architecture

Core components:

```text
Button
IconButton
ButtonGroup
```

Button variants:

```text
primary
secondary
outline
ghost
danger
```

Default:

```text
variant = secondary
size    = md
```

`danger` means destructive UI action, not `sell`.

Do not include business variants such as:

```text
buy
sell
long
short
```

Button does not provide:

```text
color
block
icon
iconPosition
rounded
elevation
```

Composition handles icons and layout.

Loading semantics:

```text
aria-busy=true
data-loading
activation blocked
focus preserved when practical
```

Loading is not identical to disabled.

Default native button type:

```text
type="button"
```

---

# 16. Form Architecture

Core structure:

```text
Field
   ↓
Control
```

`Field` owns:

```text
label
description
error
IDs
ARIA relationships
required/disabled/invalid propagation
```

`Field` does not own:

```text
value
dirty
touched
validation schema
submit state
```

Those belong to native forms or external form libraries.

## 16.1 Input

`Input` remains a native `<input>`.

It keeps:

```text
onChange(event)
name
form
required
min
max
step
pattern
inputMode
autocomplete
```

It should not include:

```text
label
error message
prefix
suffix
```

## 16.2 InputGroup

`InputGroup` is purely visual composition.

It handles:

```text
prefix
suffix
addon
action
shared border
focus-within surface
```

It does not manage input value.

## 16.3 Validation

Use:

```text
invalid
aria-invalid
data-invalid
```

Do not use browser `:invalid` as the application's validation timing mechanism.

---

# 17. Choice Controls

## Checkbox

State:

```text
checked
unchecked
indeterminate
```

Public state should cleanly represent tri-state behavior.

Checkbox remains semantically different from Switch and Toggle.

## RadioGroup

Radio state belongs to the group.

```text
value
defaultValue
onValueChange
```

Radio values should initially remain string/form-friendly.

## Switch

Switch represents persistent ON/OFF state.

```text
checked
defaultChecked
onCheckedChange
```

No indeterminate state.

## Toggle

Toggle uses:

```text
pressed
```

not `checked`.

Semantic boundary:

```text
Checkbox  → checked
Switch    → checked
Toggle    → pressed
Radio     → group value
```

---

# 18. Select Family

The family is explicitly split:

```text
NativeSelect
Select
Combobox
```

## 18.1 NativeSelect

Native `<select>`.

Use native React API.

No custom search/virtualization/popup behavior.

## 18.2 Select

Custom single-selection widget.

State:

```text
value
defaultValue
onValueChange

open
defaultOpen
onOpenChange
```

Item identity:

```text
value
textValue
children
```

Select may support typeahead, but it is not a search input.

## 18.3 Combobox

Combobox has separate:

```text
selected value
input value
open state
```

It is not implemented as:

```tsx
<Select searchable />
```

Async data fetching remains application-owned.

Virtualization is an integration concern, not a mandatory primitive behavior.

## 18.4 Deferred Features

Not in initial v1 core behavior:

```text
MultiSelect
TagInput
Creatable
Freeform
VirtualizedCombobox
```

---

# 19. Overlay Architecture

## Floating

```text
Tooltip
Popover
Select
Combobox
DropdownMenu
ContextMenu
```

## Modal

```text
Dialog
AlertDialog
Drawer
```

Shared infrastructure:

```text
Portal
Position
Focus
Dismiss
Presence
Layer
Scroll Lock
```

Public semantics stay separate.

Important boundaries:

```text
Tooltip ≠ interactive content
Popover ≠ Menu
Menu ≠ Select
AlertDialog ≠ red Dialog
Drawer ≠ DockPanel
```

---

# 20. Dialog Family

## Dialog

Modal task surface.

Public parts:

```text
Dialog.Root
Dialog.Trigger
Dialog.Content
Dialog.Header
Dialog.Body
Dialog.Footer
Dialog.Title
Dialog.Description
Dialog.Close
```

Title is part of the accessibility contract.

Dialog does not manage form submission.

## AlertDialog

Explicit high-risk decision surface.

Important properties:

```text
outside click must not silently dismiss
no default top-right close affordance
Action visual intent comes from composed Button
```

AlertDialog is not a notification component.

## Drawer

Edge-attached modal task surface.

It is not:

```text
Sidebar
DockPanel
persistent Inspector
```

Those belong to layout/workspace architecture.

---

# 21. Navigation / Disclosure

Core:

```text
Tabs
Accordion
Collapsible
```

## Tabs

Local view switching.

State:

```text
value
defaultValue
onValueChange
```

Identity is string-based, not index-based.

Supports:

```text
horizontal / vertical
automatic / manual activation
```

Tabs are not route navigation and are not WorkspaceTabs.

## Accordion

Grouped disclosure.

Supports:

```text
single
multiple
```

## Collapsible

Single independent disclosure primitive.

---

# 22. XUI v1 Core Component Scope

## Actions

```text
Button
IconButton
ButtonGroup
Toggle
ToggleGroup
```

## Forms

```text
Field
Input
Textarea
InputGroup
NumberField
NativeSelect
Select
Combobox
Checkbox
RadioGroup
Radio
Switch
```

## Overlay

```text
Tooltip
Popover
DropdownMenu
ContextMenu
Dialog
AlertDialog
Drawer
```

## Navigation

```text
Tabs
Accordion
Collapsible
Breadcrumb
Pagination
```

## Feedback

```text
Alert
Toast
Progress
Spinner
Skeleton
EmptyState
```

## Display

```text
Badge
Avatar
Card
Kbd
Separator
DescriptionList
```

## Desktop

```text
Toolbar
Panel
Resizable
```

## Data

```text
Table
```

---

# 23. Explicitly Out of XUI v1 Core

Deferred / separate:

```text
DatePicker
Calendar
TimePicker
Tree
TreeSelect
MultiSelect
TagInput
RichTextEditor
FileUploader
CommandPalette
ColorPicker
HoverCard
NavigationMenu
Menubar
Tour
Coachmark
```

Architecture-level exclusions:

```text
Docking Engine
Floating Window Manager
Popout Window Manager
Workspace Manager

Form State Manager
Router
Data Fetching Layer
Application State Manager
Realtime/Market Data Store

Chart Engine
Quant Computation Engine
Trading Business Logic
Order Management
Authentication
```

---

# 24. Table vs DataGrid

## Table

`Table` is a styled semantic HTML table.

It should use:

```html
<table>
<thead>
<tbody>
<tr>
<th>
<td>
```

It does not own:

```text
sorting engine
filtering engine
selection engine
virtualization
column state
realtime store
```

## DataGrid

`DataGrid` is a separate interactive high-performance subsystem.

Conceptually:

```text
@xui/data-grid
```

It is not implemented as a large set of `Table` props.

---

# 25. DataGrid Architecture

High-level:

```text
                DataGrid Public API
                       │
                       ▼
                XUI Grid Model
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
       Table Engine Virtualizer Interaction
           │           │           │
           └───────────┼───────────┘
                       ▼
                 XUI Renderer
                       │
                       ▼
                    DOM / ARIA
```

Realtime path:

```text
Realtime Store
      │
      ▼
Visible Cell Subscription
      │
      ▼
Cell Renderer
```

---

# 26. DataGrid Engine Boundary

Initial implementation may use:

```text
TanStack Table
TanStack Virtual
```

behind XUI adapters.

Never expose:

```text
TanStack ColumnDef
TanStack Table instance
TanStack-specific internal types
```

XUI owns:

```text
DataGridColumn<T>
DataGrid state
DataGridHandle
```

---

# 27. DataGrid Public Principles

## Stable Row Identity

DataGrid requires stable row identity.

Prefer:

```tsx
getRowId={row => row.id}
```

Do not make row index the semantic identity.

## DOM Model

`Table` uses native `<table>`.

`DataGrid` may use:

```text
div + ARIA grid semantics
```

to support:

```text
virtualization
pinned columns
cell navigation
resizing
interaction
```

## Scroll Ownership

DataGrid owns its scroll viewport.

Do not wrap its core scrolling behavior in a generic `ScrollArea`.

---

# 28. DataGrid v1 Beta Scope

Included:

```text
row virtualization
fixed row height
sorting
row selection
column resizing
column visibility
column reorder
column pinning
sticky header
keyboard grid navigation
controlled state
manual/server operation integration
```

Deferred:

```text
cell editing
range selection
clipboard
grouping / aggregation
TreeGrid
dynamic row height
column virtualization
```

DataGrid may remain beta independently of Core 1.0.

---

# 29. Layout Architecture

Three layers:

```text
Level 1 — CSS Layout
flex / grid / gap / spacing
→ Tailwind

Level 2 — UI Layout Components
Panel / Resizable / Tabs / Toolbar
→ XUI Core

Level 3 — Workspace Manager
Docking / WorkspaceTabs / FloatingWindow / Popout
→ future @xui/workspace
```

---

# 30. Panel

Panel is a UI surface, not a layout engine.

Public structure:

```text
Panel.Root
Panel.Header
Panel.Body
```

Panel owns:

```text
surface
border
background
header/body structure
min-size safety
theme integration
```

Panel does not own:

```text
resize
collapse
dock
drag
tabs
loading
data fetching
```

---

# 31. Resizable

Public API:

```text
Resizable.Root
Resizable.Panel
Resizable.Handle
```

Important distinction:

```text
Panel.Root
→ visual surface

Resizable.Panel
→ geometric region
```

Resizable supports:

```text
horizontal split
vertical split
nested split
min/max constraints
default size
collapse
keyboard resize
layout callbacks
```

It does not support:

```text
docking
tab drag between groups
floating windows
detach / popout
workspace layout tree
```

---

# 32. Resizable Size Contract

Prefer explicit units:

```text
"30%"
"240px"
"20rem"
```

Avoid ambiguous:

```tsx
minSize={240}
```

Persistence should be application-owned.

Recommended event distinction:

```text
onLayoutChange
→ transient/high-frequency

onLayoutCommit
→ persistence/analytics
```

---

# 33. Geometry and Resize Rule

Resizable should change DOM/CSS geometry without forcing the whole React tree to rerender on every pointer movement.

Heavy children such as:

```text
DataGrid
Chart
```

observe their own viewport using:

```text
ResizeObserver
```

Pure visual responsiveness should prefer:

```text
CSS Container Queries
```

rather than React resize state.

---

# 34. Scroll Ownership Rule

A region should have one clear primary Scroll Owner.

Examples:

```text
DataGrid
→ owns scroll

Combobox Content
→ owns collection scroll

Dialog Body
→ may own task/form scroll

Panel
→ does not steal scroll ownership by default
```

Avoid accidental nested scroll containers.

---

# 35. Workspace Boundary

XUI v1 Core does not expose:

```text
Workspace
WorkspaceTabs
DockManager
FloatingWindow
Popout
```

A full trading terminal can be composed from:

```text
Tailwind
Panel
Resizable
Tabs
Toolbar
DataGrid
```

without an IDE-grade docking system.

Future workspace system should be considered a separate package:

```text
@xui/workspace
```

---

# 36. Realtime / Performance Architecture

State is divided into:

```text
Semantic UI State
Structural Data
Volatile Data
```

## Semantic UI State

Examples:

```text
Dialog open
Select value
Tabs value
Grid sorting
Column visibility
Form input
```

Use normal React/declarative state.

## Structural Data

Examples:

```text
rows added/removed
columns
row identity
collection structure
```

Use React/application state plus appropriate model engines.

## Volatile Data

Examples:

```text
live metric
price-like value
latency
progress
status
```

Use an External Store when update frequency justifies it.

---

# 37. Realtime Store Boundary

XUI does not provide a proprietary realtime state manager.

Applications may use:

```text
Zustand
Redux
RxJS
custom store
other external stores
```

XUI should be compatible with the `useSyncExternalStore` model.

React Context may carry a stable store handle.

React Context must not broadcast the entire high-frequency value set.

Correct:

```text
Context
→ stable Store reference
→ precise subscription
```

Incorrect:

```text
Context
→ all live values
→ every update changes context value
```

---

# 38. Subscription Granularity

Principle:

```text
Subscription Granularity
≈
Rendering Granularity
```

A cell that only displays one volatile field should subscribe as narrowly as practical.

Avoid:

```text
Cell
→ subscribe entire rows[]
```

Prefer:

```text
Cell
→ subscribe(rowId, field)
```

---

# 39. Frame Batching

High-frequency data updates should distinguish:

```text
Data Update Frequency
≠
Visual Refresh Frequency
```

Recommended pipeline:

```text
External Data Source
        ↓
Domain Store
        ↓
update truth immediately
        ↓
Dirty Keys
        ↓
requestAnimationFrame
        ↓
Visible Subscribers
        ↓
small UI commits
```

Do not use a fixed 16ms timer as a fake display scheduler.

Use animation-frame scheduling for visual publication.

---

# 40. Update Coalescing Models

Not all data uses the same coalescing rule.

```text
Snapshot
→ latest wins

Accumulator
→ aggregate

Event Stream
→ preserve ordered events, batch delivery
```

Example:

```text
10 → 11 → 12 → 13
```

A snapshot UI may render `13` once per frame.

But event streams must not silently drop intermediate events.

---

# 41. Scheduling Lanes

Conceptually:

```text
Immediate
Frame
Deferred
```

## Immediate

```text
click
keyboard
focus
selection
form typing
dialog close
```

## Frame

```text
live values
resize-derived heavy work
scroll-derived visual work
```

## Deferred

```text
expensive filtering
non-critical derived views
analytics
```

User interaction must not wait behind realtime painting.

---

# 42. Hidden / Inactive Heavy Views

Distinguish:

```text
Mounted
Active
Visible
```

Inactive Tabs or collapsed Panels may remain mounted to preserve state.

However XUI heavy components may pause:

```text
visual notification
measurement
virtualizer recalculation
expensive decoration
```

while inactive.

XUI must not automatically unsubscribe application WebSockets or domain data sources.

On reactivation:

```text
read latest snapshot
→ catch up once
```

rather than replaying historical renders.

---

# 43. Performance Rules

Priority order:

```text
1. Do not subscribe to unnecessary data.
2. Do not mount unnecessary DOM.
3. Do not compute unnecessary models.
4. Frame-batch high-frequency visual updates.
5. Memoize only where evidence shows value.
```

Do not use deep equality over large row/column structures as a default optimization.

Stable references should improve performance, but unstable references should not make the API semantically incorrect.

---

# 44. CSS Performance

Use CSS for visual-only responsiveness when possible.

Prefer:

```text
Container Queries
Transform
Opacity
```

over React state for purely visual layout decisions.

CSS containment may be used selectively after benchmarking.

Do not globally apply aggressive containment to all panels/components.

CSS variables may be used for high-frequency visual-only values, but should not be used as an excuse to bypass React ownership of semantic text/ARIA state.

---

# 45. Package Architecture

Published packages:

```text
@xui/react
@xui/theme
@xui/tailwind
@xui/data-grid
```

Do not initially publish:

```text
@xui/primitives
@xui/internal
@xui/utils
@xui/overlay
@xui/collection
```

Internal implementation remains inside package source until real cross-package reuse justifies extraction.

---

# 46. Repository Layout

Recommended structure:

```text
xui/
│
├─ packages/
│  ├─ react/
│  │  ├─ src/
│  │  │  ├─ button/
│  │  │  ├─ input/
│  │  │  ├─ select/
│  │  │  ├─ dialog/
│  │  │  ├─ tabs/
│  │  │  ├─ panel/
│  │  │  ├─ resizable/
│  │  │  └─ internal/
│  │  └─ package.json
│  │
│  ├─ theme/
│  │  ├─ src/
│  │  │  ├─ tokens.css
│  │  │  ├─ trading-dark.css
│  │  │  └─ trading-light.css
│  │  └─ package.json
│  │
│  ├─ tailwind/
│  │  ├─ src/
│  │  │  └─ index.css
│  │  └─ package.json
│  │
│  └─ data-grid/
│     ├─ src/
│     └─ package.json
│
├─ apps/
│  ├─ docs/
│  └─ benchmarks/
│
├─ fixtures/
│  ├─ vite-react/
│  ├─ next-rsc/
│  ├─ no-tailwind/
│  └─ company-theme/
│
├─ examples/
│  └─ trading-terminal/
│
└─ .changeset/
```

---

# 47. Dependency Direction

Desired direction:

```text
@xui/theme

@xui/react
   │
   ├─ Behavior Engine
   └─ Resize Engine

@xui/data-grid
   │
   ├─ @xui/react
   ├─ Table Engine
   └─ Virtual Engine

@xui/tailwind
   │
   └─ XUI token → Tailwind bridge
```

Forbidden:

```text
@xui/react → @xui/data-grid
@xui/react → @xui/tailwind
```

Third-party engine names must remain implementation details.

---

# 48. Build Architecture

Recommended:

```text
pnpm monorepo

TypeScript / TSX
      ↓
library build
      ↓
unbundled ESM
+ .d.ts
+ source maps
+ explicit package exports
```

Baseline:

```text
Modern browser
ES2022-class output
React 19 baseline
```

Do not initially carry:

```text
CommonJS
UMD
legacy browser polyfills
React 18 compatibility layer
```

unless real consumer requirements prove necessary.

---

# 49. Public Package Exports

Use explicit export maps.

Support:

```ts
import { Button } from '@xui/react'
```

and:

```ts
import { Button } from '@xui/react/button'
```

Do not publish wildcard internal subpaths.

Do not allow users to depend on paths such as:

```text
@xui/react/dist/internal/*
```

---

# 50. CSS Distribution

Explicit application imports:

```css
@import "@xui/theme/trading-dark.css";
@import "@xui/react/styles.css";
```

Optional:

```css
@import "@xui/data-grid/styles.css";
@import "@xui/tailwind";
```

Component JS should not silently inject global CSS.

Core CSS is precompiled and does not depend on the consuming application's Tailwind compilation.

Official theme and component CSS are separate concerns:

```text
Theme CSS
→ token values

Component CSS
→ structural/default styles
```

---

# 51. Tailwind Package

`@xui/tailwind` targets Tailwind CSS v4.

It should mostly be a CSS bridge.

Conceptually:

```css
@theme inline {
  --color-xui-background: var(--xui-background);
  --color-xui-surface: var(--xui-surface);
  --color-xui-foreground: var(--xui-foreground);
  --color-xui-border: var(--xui-border);
}
```

Core React components must work without this package.

---

# 52. React / RSC Boundary

Interactive leaf modules should carry the correct client boundary themselves.

Examples:

```text
Dialog
Select
Checkbox
Tabs
Resizable
```

Do not require consumers to add `'use client'` just to repair XUI packaging.

Pure presentational modules should remain server-compatible where practical.

Top-level module evaluation must not access browser-only globals.

Forbidden at module top level:

```text
window
document
localStorage
ResizeObserver
global event registration
```

---

# 53. Third-Party Dependency Policy

Behavior engines such as Base UI are XUI dependencies, not user-facing peer APIs.

Resize engines are implementation details.

DataGrid table/virtualization engines are implementation details.

Users should not need to install, understand or version-match these libraries in order to consume normal XUI APIs.

---

# 54. TypeScript Contract

Public TypeScript is part of the product.

Examples:

```text
ButtonProps
DialogRootProps
SelectRootProps
DataGridColumn<T>
```

Do not leak internal/engine types through public declarations.

Changes to public unions and interfaces are SemVer changes.

Example:

```text
Removing a Button variant
→ breaking change
```

---

# 55. Public Contract and SemVer

SemVer applies to:

```text
JavaScript exports
React props
TypeScript types
Semantic token names
documented CSS variables
documented .xui-* classes
documented data-* states
behavior defaults
keyboard behavior
```

Undocumented internal DOM wrappers are not stable API.

---

# 56. Testing Architecture

Testing layers:

```text
Unit
Component
Browser Interaction
Accessibility
Visual
Performance
Package Artifact
```

## Unit

Pure logic:

```text
controlled-state helpers
prop merge
column adapters
layout normalization
frame scheduler
```

## Browser Interaction

Real browser tests for:

```text
focus
keyboard
pointer
overlay
resize
grid navigation
```

## Accessibility

Use automated checks plus explicit keyboard/ARIA behavior assertions.

Passing an automated scanner alone does not prove component accessibility.

## Visual

Cover at least:

```text
trading-dark
trading-light

compact
default
comfortable
```

and critical states:

```text
hover
focus
disabled
invalid
open
checked
loading
```

## Performance

Independent benchmarks for:

```text
DataGrid
Realtime values
Resizable
Large Combobox
```

## Package Artifact

Release tests must install the actual packed artifact, not only workspace source.

---

# 57. Consumer Fixtures

Required fixtures:

```text
fixtures/vite-react
fixtures/next-rsc
fixtures/no-tailwind
fixtures/company-theme
```

## no-tailwind

Must verify core XUI works without Tailwind installed.

## company-theme

Must verify the official trading theme can be replaced by a company theme while components remain correct.

## next-rsc

Must verify:

```text
client boundaries
SSR
hydration
portal behavior
package exports
CSS
```

---

# 58. Performance Benchmark Principles

Do not market vague claims such as:

```text
"supports 100k rows"
```

without a fixed benchmark scenario.

Benchmarks should define:

```text
logical row count
column count
row height
cell complexity
update rate
visible viewport
sorting/filtering mode
browser/hardware baseline
```

Performance CI should primarily detect regressions relative to a stable baseline.

Measure:

```text
interaction latency
long tasks
frame drops
React commit cost
layout / paint cost
mounted DOM count
memory growth
subscription count
inactive-view CPU usage
```

---

# 59. Versioning

Use independent SemVer for public packages.

Example:

```text
@xui/react       1.3.0
@xui/theme       1.1.2
@xui/tailwind    1.0.4
@xui/data-grid   0.x / beta
```

Core 1.0 must not be blocked by DataGrid stability.

Use a changeset-based release process.

Experimental APIs must be explicitly marked experimental.

---

# 60. Reference Application

`examples/trading-terminal` is the v1 architecture validation application.

Its purpose is to prove that XUI can build a complete dense desktop trading UI using generic components.

It should exercise:

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
DataGrid
Realtime integration
```

It must not introduce trading business semantics into XUI Core.

---

# 61. XUI v1 Definition of Done

Core 1.0 is not defined by a component-count target.

The architecture is considered validated when:

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

Trading terminal reference app can be built without forking XUI.

Core 1.0 can release independently of DataGrid beta.
```

---

# 62. Implementation Order

Architecture Freeze ends design-first work.

Recommended implementation sequence:

## Phase 0 — Repository Foundation

```text
pnpm workspace
package structure
TypeScript
library build
Vitest
Playwright
Changesets
package exports
fixtures
CI
```

## Phase 1 — Design Foundation

```text
Semantic Tokens
Themes
Density
Typography
Motion
CSS layers
Tailwind bridge
```

## Phase 2 — Internal Infrastructure

```text
composition
mergeProps
mergeRefs
controlled state
primitive adapter
portal
focus
overlay
presence
```

## Phase 3 — First Validation Components

Implement only:

```text
Button
Input
Field
Popover
Dialog
```

These validate most architectural assumptions:

```text
tokens
theme
CSS override
native API
compound API
portal
behavior engine
form semantics
composition
RSC/client boundaries
```

## Phase 4 — Form and Choice Controls

```text
InputGroup
Textarea
Checkbox
RadioGroup
Switch
NativeSelect
Select
Combobox
NumberField
```

## Phase 5 — Overlay and Navigation

```text
Tooltip
DropdownMenu
ContextMenu
AlertDialog
Drawer
Tabs
Accordion
Collapsible
```

## Phase 6 — Desktop Foundation

```text
Toolbar
Panel
Resizable
Table
```

## Phase 7 — Supporting Components

```text
Alert
Toast
Progress
Spinner
Skeleton
EmptyState
Badge
Avatar
Card
Kbd
Separator
DescriptionList
Breadcrumb
Pagination
```

## Phase 8 — Core Hardening

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

## Phase 9 — DataGrid Beta

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

## Phase 10 — Trading Terminal Reference

Build the full reference application.

## Phase 11 — Core 1.0 RC

Freeze public contracts and prepare the first stable release.

---

# 63. Architecture Change Process

Architecture Freeze does not mean architecture can never change.

Required process:

```text
Implementation finding
        ↓
Isolated implementation issue?
        │
        ├─ Yes → fix implementation
        │
        └─ No
             ↓
      Architecture conflict
             ↓
      Add / amend ADR
             ↓
       Impact analysis
             ↓
       Architecture update
```

Do not allow each component to create local architectural exceptions.

---

# 64. ADR Categories

Recommended ADR namespaces:

```text
ARCH-*      Architecture invariants
DS-*        Design System / Tokens
CSS-*       CSS / Tailwind
PRIM-*      Primitive / Behavior
COMP-*      Component API
FORM-*      Forms
CHOICE-*    Checkbox / Radio / Switch / Toggle
SELECT-*    Select / Combobox
OVERLAY-*   Floating / Menu
MODAL-*     Dialog / AlertDialog / Drawer
NAV-*       Tabs / Accordion / Collapsible
DATA-*      Table / DataGrid
LAYOUT-*    Panel / Resizable / Workspace boundary
PERF-*      Realtime / Performance
ENG-*       Packages / Build / Testing / Release
```

Architecture-level ADRs take precedence over component-local design convenience.

---

# 65. Final Architecture Summary

XUI v1 is intentionally **not**:

```text
a trading business component library
a form framework
a data-fetching framework
a realtime market-data framework
an IDE docking framework
an application framework
```

XUI v1 **is**:

```text
a general-purpose React UI foundation

with:
- Desktop First interaction
- high information density
- a Trading/Quant default visual system
- Tailwind-friendly customization
- accessible behavior primitives
- strong form/overlay/navigation foundations
- desktop panel and resize support
- a high-performance DataGrid subsystem boundary
- an architecture compatible with granular realtime data rendering
```

The central design goal is:

> A company should be able to build its own Design System and domain-specific trading UI on top of XUI without forking XUI Core.

---

# 66. Architecture Freeze Status

```text
Architecture            100%
Component Implementation  0%
```

The next phase is implementation, not additional speculative architecture.

Start with:

```text
Repository
→ Theme
→ Button
→ Input
→ Field
→ Popover
→ Dialog
```

Use the first real components to validate the frozen architecture before expanding the component catalog.
