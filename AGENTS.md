# XUI Agent Instructions

This repository is an XUI v1 workspace. Architecture is frozen in `docs/architecture.md`. Implementation has not started yet.

## Superpowers

This project vendors [obra/superpowers](https://github.com/obra/superpowers) v6.3.0.

- Cursor loads the skills from `.agents/skills/superpowers` and injects `using-superpowers` on `sessionStart`.
- Codex enables the same checkout through the repo marketplace plugin `superpowers@xui`.

Before creative work — including new XUI components, APIs, tokens, or behavior — use `brainstorming`, then `writing-plans`, then `subagent-driven-development` or `executing-plans`. Use `test-driven-development` during implementation. Do not skip those skills because the task looks small.

User instructions in this file take precedence over skills. The architecture freeze in `docs/architecture.md` takes precedence over local component convenience.

## Codebase Memory MCP

The project MCP server is `codebase-memory-mcp` (`codebase-memory-mcp@0.11.0`).

Once XUI source exists:

1. `list_projects` / `index_status`
2. `index_repository` if this repo is not indexed
3. Prefer `search_graph`, `trace_path`, `get_architecture`, and `get_code_snippet` over broad grep for structural questions

Until packages exist, treat `docs/architecture.md` as the source of truth.

## Implementation Guardrails

- Core components must not embed trading business semantics.
- Semantic tokens are the public theme contract.
- Do not leak third-party engine types into the public API.
- DataGrid is not an advanced Table.
- Follow the Phase 0 → Phase 3 sequence in the architecture doc: repository foundation, theme, then Button / Input / Field / Popover / Dialog.
