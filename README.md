# Azure DevOps MCP Server

A Model Context Protocol (MCP) server for integrating with Azure DevOps, enabling AI agents to create, update, and query work items and iterations.

## Features

- **Work Item Management**: Create, update, and query work items
- **Iteration Management**: List and create iterations
- **Flexible Querying**: Support for WIQL queries and filter-based queries
- **Team Support**: Work with specific teams or project defaults

## Installation and Usage

You can set up and use this MCP server natively within AI agents (like Claude Desktop or Cursor) using any of the following methods:

### Option 1: Global NPM Install (Recommended)

Installing the package globally natively builds the project and links the `azure-devops-mcp` execution command directly to your system's `PATH`.

```bash
# In the azure_mcp directory:
npm install -g .
```

Add the server to your AI agent's configuration (like `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "azure-devops-mcp",
      "args": [],
      "env": {
        "AZDO_ORG_URL": "https://dev.azure.com/your-org",
        "AZDO_PAT": "your-personal-access-token"
      }
    }
  }
}
```

### Option 2: Run via npx

If you plan to open-source and publish this package to an NPM registry (using `npm publish`), anyone can easily run it directly:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "azure_mcp"],
      "env": {
        "AZDO_ORG_URL": "https://dev.azure.com/your-org",
        "AZDO_PAT": "your-personal-access-token"
      }
    }
  }
}
```

### Option 3: Direct Node Execution (Clone repo and run)

You can bypass npm and point your agent directly to the built file by pointing to its exact path:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "node",
      "args": ["[YOUR REPO PATH]/dist/index.js"],
      "env": {
        "AZDO_ORG_URL": "https://dev.azure.com/your-org",
        "AZDO_PAT": "your-personal-access-token"
      }
    }
  }
}
```

## Configuration

Create a `.env` file in the project root for standalone testing:

```env
# Azure DevOps Configuration
AZDO_ORG_URL=https://dev.azure.com/your-org
AZDO_PAT=your-personal-access-token

# Server Configuration (optional)
MCP_SERVER_NAME=azure-devops-server
MCP_SERVER_VERSION=1.0.0
```

### Getting a Personal Access Token

1. Go to [Azure DevOps](https://dev.azure.com)
2. Click on your profile → User Settings → Personal Access Tokens
3. Create a new token with the following scopes:
   - Work Items (Read & Write)
   - Project and Team (Read)

## Available Tools

### create_work_item
Create a new work item in Azure DevOps.
**Parameters:** `project` (required), `type` (required), `title` (required), `description`, `assignedTo`, `tags`

### update_work_item
Update an existing work item in Azure DevOps.
**Parameters:** `workItemId` (required), `title`, `description`, `assignedTo`, `state`, `tags`

### list_work_items
List work items using WIQL query or filters.
**Parameters:** `project` (required), `wiql`, `workItemType`, `assignedTo`, `state`

### list_iterations
List all iterations for a project or team.
**Parameters:** `project` (required), `team`

### create_iteration
Create a new iteration in Azure DevOps.
**Parameters:** `project` (required), `name` (required), `startDate` (required), `finishDate` (required), `team`

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## License

MIT
