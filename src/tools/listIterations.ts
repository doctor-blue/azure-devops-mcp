import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsService } from '../services/azureDevOpsService.js';
import { ListIterationsArgs } from '../types/index.js';

export const listIterationsTool: Tool = {
  name: 'list_iterations',
  description: 'List all iterations for a project or team',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'The project name or ID'
      },
      team: {
        type: 'string',
        description: 'The team name (optional, defaults to project iterations)'
      }
    },
    required: ['project']
  }
};

export async function handler(args: ListIterationsArgs) {
  const service = AzureDevOpsService.getInstance();

  try {
    const iterations = await service.getIterations(args.project, args.team);

    if (iterations.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No iterations found for ${args.team ? `team ${args.team} in ` : ''}project ${args.project}`
          }
        ]
      };
    }

    const iterationList = iterations
      .map((iter) => {
        const startDate = iter.attributes?.startDate
          ? new Date(iter.attributes.startDate).toLocaleDateString()
          : 'N/A';
        const finishDate = iter.attributes?.finishDate
          ? new Date(iter.attributes.finishDate).toLocaleDateString()
          : 'N/A';

        return `- ${iter.name} (${startDate} - ${finishDate})`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${iterations.length} iteration(s):\n\n${iterationList}`
        }
      ]
    };
  } catch (error) {
    throw new Error(
      `Failed to list iterations: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}