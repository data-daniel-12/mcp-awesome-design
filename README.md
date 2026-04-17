# 🎨 Awesome Design MD - MCP

[![npm version](https://img.shields.io/npm/v/mcp-awesome-design)](https://www.npmjs.com/package/mcp-awesome-design)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An unofficial Model Context Protocol (MCP) server that seamlessly bridges any AI Agent (like Claude, Cursor, and Antigravity) with the brilliant [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) repository created by **VoltAgent**.

This MCP automates the process of fetching, injecting, and persisting the context of popular Design Systems into your AI Assistant. Say goodbye to manual prompting for design guidelines!

## ✨ Features

- ☁️ **Cloud Native**: Zero local dependencies needed. It fetches design rules dynamically using the GitHub API.
- 📦 **Zero-Friction**: Fully automates UI parameterization for your AI.
- 💾 **Project Persistence**: Saves an invisible `.design-mcp/config.json` in your projects. Your AI will always know which design system your project is using across sessions.

---

## 🚀 Easy Installation via npx (Recommended)

You don't need to download or compile anything! Just configure your MCP Client to run it directly from the npm registry using `npx`.

### Setup in Cursor, Claude Desktop, or Antigravity

Add the following inside your MCP configuration JSON:

```json
{
  "mcpServers": {
    "awesome-design": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-awesome-design"
      ]
    }
  }
}
```

---

## 🛠️ Tools Provided

The server exposes 3 standard tools to your AI agent:

1. `list_available_designs` - Retrieves the live directory of all available design systems hosted by VoltAgent on GitHub.
2. `set_active_design(projectPath, designName)` - Configures your local workspace with a persistent `.design-mcp` configuration file so the AI remembers your aesthetic choice.
3. `get_active_design(projectPath)` - Dynamically fetches the exact `README.md` or live markdown rules from the cloud and injects it into the AI's context.

## 🤝 Credits & Source of Truth

- **Content & Design Systems**: All credit for the massive library of design system instructions goes to [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
- **MCP Bridge Layer**: Created by Danless to allow seamless integration over the Model Context Protocol.

## 📜 License

This wrapper is provided under the [MIT License](LICENSE). 
