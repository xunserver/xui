# xui

Desktop-first React UI foundation. Architecture is frozen in [`docs/architecture.md`](docs/architecture.md).

## Agent tooling

This repository is set up so Cursor and Codex both use the same Superpowers checkout and the same Codebase Memory MCP server.

After clone:

```bash
git submodule update --init --recursive
```

Then restart the coding agent.

| Tool | Cursor | Codex |
| --- | --- | --- |
| [Codebase Memory MCP](https://github.com/DeusData/codebase-memory-mcp) | `.cursor/mcp.json` | `.codex/config.toml` |
| [Superpowers](https://github.com/obra/superpowers) v6.3.0 | project skills + `sessionStart` hook | repo marketplace plugin `superpowers@xui` |

The Superpowers sources live in `vendor/superpowers`. Cursor also discovers them through `.agents/skills/superpowers`. Codex enables the vendored plugin from `.agents/plugins/marketplace.json`.

If you already installed Superpowers from the Cursor or Codex marketplace, you can keep the marketplace copy disabled in this repo to avoid duplicate skills.
