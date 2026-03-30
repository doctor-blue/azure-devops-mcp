#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import tools
import { createWorkItemTool, handler as createWorkItemHandler } from './tools/createWorkItem.js';
import { listIterationsTool, handler as listIterationsHandler } from './tools/listIterations.js';
import { createIterationTool, handler as createIterationHandler } from './tools/createIteration.js';
import { listWorkItemsTool, handler as listWorkItemsHandler } from './tools/listWorkItems.js';
import { updateWorkItemTool, handler as updateWorkItemHandler } from './tools/updateWorkItem.js';

// Create MCP Server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'azure-devops-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register available tools
const tools: Tool[] = [
  createWorkItemTool,
  listIterationsTool,
  createIterationTool,
  listWorkItemsTool,
  updateWorkItemTool
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools
  };
});

// Handle tool call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('No arguments provided');
  }

  try {
    switch (name) {
      case 'create_work_item':
        return await createWorkItemHandler(args as any);
      case 'list_iterations':
        return await listIterationsHandler(args as any);
      case 'create_iteration':
        return await createIterationHandler(args as any);
      case 'list_work_items':
        return await listWorkItemsHandler(args as any);
      case 'update_work_item':
        return await updateWorkItemHandler(args as any);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Azure DevOps MCP Server running...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});