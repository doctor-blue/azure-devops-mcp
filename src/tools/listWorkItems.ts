import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsService } from '../services/azureDevOpsService.js';
import { ListWorkItemsArgs } from '../types/index.js';

export const listWorkItemsTool: Tool = {
  name: 'list_work_items',
  description: 'List work items in Azure DevOps using WIQL query or filters',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'The project name or ID'
      },
      wiql: {
        type: 'string',
        description: 'Custom WIQL query (optional, overrides other filters)'
      },
      workItemType: {
        type: 'string',
        description: 'Filter by work item type (optional)'
      },
      assignedTo: {
        type: 'string',
        description: 'Filter by assigned user (optional)'
      },
      state: {
        type: 'string',
        description: 'Filter by state (optional)'
      }
    },
    required: ['project']
  }
};

export async function handler(args: ListWorkItemsArgs) {
  const service = AzureDevOpsService.getInstance();

  try {
    let wiql = args.wiql;

    if (!wiql) {
      // Build WIQL from filters
      const conditions: string[] = [
        `SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], [System.AssignedTo]`,
        `FROM WorkItems`,
        `WHERE [System.TeamProject] = '${args.project}'`
      ];

      if (args.workItemType) {
        conditions.push(`AND [System.WorkItemType] = '${args.workItemType}'`);
      }

      if (args.assignedTo) {
        conditions.push(`AND [System.AssignedTo] = '${args.assignedTo}'`);
      }

      if (args.state) {
        conditions.push(`AND [System.State] = '${args.state}'`);
      }

      wiql = conditions.join('\n');
    }

    const workItems = await service.queryWorkItems(args.project, wiql);

    if (workItems.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No work items found matching the criteria'
          }
        ]
      };
    }

    const workItemList = workItems
      .map((wi) => {
        return `- #${wi.id}: ${wi.fields?.['System.Title']} ` +
               `(${wi.fields?.['System.WorkItemType']}) - ` +
               `${wi.fields?.['System.State']} - ` +
               `Assigned to: ${wi.fields?.['System.AssignedTo'] || 'Unassigned'}`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${workItems.length} work item(s):\n\n${workItemList}`
        }
      ]
    };
  } catch (error) {
    throw new Error(
      `Failed to list work items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}