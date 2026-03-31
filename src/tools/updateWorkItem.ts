import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsService } from '../services/azureDevOpsService.js';
import { UpdateWorkItemArgs } from '../types/index.js';
import { Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces.js';

export const updateWorkItemTool: Tool = {
  name: 'update_work_item',
  description: 'Update an existing work item in Azure DevOps',
  inputSchema: {
    type: 'object',
    properties: {
      workItemId: {
        type: 'number',
        description: 'The ID of the work item to update'
      },
      title: {
        type: 'string',
        description: 'New title (optional)'
      },
      description: {
        type: 'string',
        description: 'New description (optional)'
      },
      assignedTo: {
        type: 'string',
        description: 'New assigned user (optional)'
      },
      state: {
        type: 'string',
        description: 'New state (optional)'
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'New tags (optional)'
      },
      customFields: {
        type: 'object',
        description: 'Additional custom fields to update (e.g., {"Custom.ImpactsandDependencies": "None"})',
        additionalProperties: true
      }
    },
    required: ['workItemId']
  }
};

export async function handler(args: UpdateWorkItemArgs) {
  const service = AzureDevOpsService.getInstance();

  try {
    const updates: any[] = [];

    if (args.title) {
      updates.push({
        op: Operation.Replace,
        path: '/fields/System.Title',
        value: args.title
      });
    }

    if (args.description) {
      updates.push({
        op: Operation.Replace,
        path: '/fields/System.Description',
        value: args.description
      });
    }

    if (args.assignedTo) {
      const isUnassigned = args.assignedTo.toLowerCase() === 'unassigned';
      updates.push({
        op: Operation.Replace,
        path: '/fields/System.AssignedTo',
        value: isUnassigned ? '' : args.assignedTo
      });
    }

    if (args.state) {
      updates.push({
        op: Operation.Replace,
        path: '/fields/System.State',
        value: args.state
      });
    }

    if (args.tags) {
      updates.push({
        op: Operation.Replace,
        path: '/fields/System.Tags',
        value: args.tags.join('; ')
      });
    }

    if (args.customFields) {
      for (const [key, value] of Object.entries(args.customFields)) {
        updates.push({
          op: Operation.Replace, // Or Add depending on whether field exists, Replace usually works for both in ADO
          path: `/fields/${key}`,
          value: value
        });
      }
    }

    if (updates.length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    const workItem = await service.updateWorkItem(args.workItemId, updates);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated work item #${workItem.id}\n\n` +
                `Title: ${workItem.fields?.['System.Title']}\n` +
                `State: ${workItem.fields?.['System.State']}\n` +
                `URL: ${workItem.url}`
        }
      ]
    };
  } catch (error) {
    throw new Error(
      `Failed to update work item: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}