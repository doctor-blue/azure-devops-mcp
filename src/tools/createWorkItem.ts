import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsService } from '../services/azureDevOpsService.js';
import { CreateWorkItemArgs } from '../types/index.js';
import { Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces.js';

export const createWorkItemTool: Tool = {
  name: 'create_work_item',
  description: 'Create a new work item in Azure DevOps',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'The project name or ID'
      },
      type: {
        type: 'string',
        enum: ['Task', 'Bug', 'Feature', 'User Story', 'Epic'],
        description: 'The type of work item to create'
      },
      title: {
        type: 'string',
        description: 'The title of the work item'
      },
      description: {
        type: 'string',
        description: 'The description of the work item (optional)'
      },
      assignedTo: {
        type: 'string',
        description: 'The user to assign the work item to (optional)'
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Tags to add to the work item (optional)'
      },
      customFields: {
        type: 'object',
        description: 'Additional custom fields to set (e.g., {"Custom.ImpactsandDependencies": "None"})',
        additionalProperties: true
      }
    },
    required: ['project', 'type', 'title']
  }
};

export async function handler(args: CreateWorkItemArgs) {
  const service = AzureDevOpsService.getInstance();

  try {
    const workItem = await service.createWorkItem(
      args.project,
      args.type,
      args.title,
      args.description,
      args.assignedTo,
      args.tags,
      args.customFields
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created work item #${workItem.id}\n\n` +
                `Title: ${workItem.fields?.['System.Title']}\n` +
                `Type: ${workItem.fields?.['System.WorkItemType']}\n` +
                `State: ${workItem.fields?.['System.State']}\n` +
                `URL: ${workItem.url}`
        }
      ]
    };
  } catch (error) {
    throw new Error(
      `Failed to create work item: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}