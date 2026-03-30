import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsService } from '../services/azureDevOpsService.js';
import { CreateIterationArgs } from '../types/index.js';

export const createIterationTool: Tool = {
  name: 'create_iteration',
  description: 'Create a new iteration in Azure DevOps',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'The project name or ID'
      },
      name: {
        type: 'string',
        description: 'The name of the iteration'
      },
      startDate: {
        type: 'string',
        description: 'The start date (ISO 8601 format: YYYY-MM-DD)'
      },
      finishDate: {
        type: 'string',
        description: 'The finish date (ISO 8601 format: YYYY-MM-DD)'
      },
      team: {
        type: 'string',
        description: 'The team name (optional)'
      }
    },
    required: ['project', 'name', 'startDate', 'finishDate']
  }
};

export async function handler(args: CreateIterationArgs) {
  const service = AzureDevOpsService.getInstance();

  try {
    const iteration = await service.createIteration(
      args.project,
      args.name,
      args.startDate,
      args.finishDate,
      args.team
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created iteration: ${iteration.name}\n\n` +
                `Start Date: ${new Date(iteration.attributes.startDate).toLocaleDateString()}\n` +
                `Finish Date: ${new Date(iteration.attributes.finishDate).toLocaleDateString()}`
        }
      ]
    };
  } catch (error) {
    throw new Error(
      `Failed to create iteration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}