import * as azureDevOps from 'azure-devops-node-api';
import {
  IWorkItemTrackingApi
} from 'azure-devops-node-api/WorkItemTrackingApi';
import {
  ICoreApi
} from 'azure-devops-node-api/CoreApi';
import {
  IWorkApi
} from 'azure-devops-node-api/WorkApi';
import {
  WorkItem,
  WorkItemExpand
} from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces.js';
import {
  JsonPatchOperation,
  Operation
} from 'azure-devops-node-api/interfaces/common/VSSInterfaces.js';
import {
  TeamContext
} from 'azure-devops-node-api/interfaces/CoreInterfaces.js';

export class AzureDevOpsService {
  private static instance: AzureDevOpsService;
  private orgUrl: string;
  private pat: string;
  private connection: azureDevOps.WebApi;
  private witApi: IWorkItemTrackingApi | null = null;
  private coreApi: ICoreApi | null = null;
  private workApi: IWorkApi | null = null;
  private teamsCache: Map<string, any[]> = new Map();

  private constructor() {
    this.orgUrl = process.env.AZDO_ORG_URL || '';
    this.pat = process.env.AZDO_PAT || '';

    if (!this.orgUrl || !this.pat) {
      throw new Error('AZDO_ORG_URL and AZDO_PAT must be set');
    }

    const authHandler = azureDevOps.getPersonalAccessTokenHandler(this.pat);
    this.connection = new azureDevOps.WebApi(this.orgUrl, authHandler);
  }

  public static getInstance(): AzureDevOpsService {
    if (!AzureDevOpsService.instance) {
      AzureDevOpsService.instance = new AzureDevOpsService();
    }
    return AzureDevOpsService.instance;
  }

  private async getTeamsCached(project: string): Promise<any[]> {
    if (this.teamsCache.has(project)) {
      return this.teamsCache.get(project)!;
    }
    const coreApi = await this.getCoreApi();
    const teams = await coreApi.getTeams(project);
    this.teamsCache.set(project, teams);
    return teams;
  }

  async getWorkItemTrackingApi(): Promise<IWorkItemTrackingApi> {
    if (!this.witApi) {
      this.witApi = await this.connection.getWorkItemTrackingApi();
    }
    return this.witApi;
  }

  async getCoreApi(): Promise<ICoreApi> {
    if (!this.coreApi) {
      this.coreApi = await this.connection.getCoreApi();
    }
    return this.coreApi;
  }

  async getWorkApi(): Promise<IWorkApi> {
    if (!this.workApi) {
      this.workApi = await this.connection.getWorkApi();
    }
    return this.workApi;
  }

  async createWorkItem(
    project: string,
    workItemType: string,
    title: string,
    description?: string,
    assignedTo?: string,
    tags?: string[]
  ): Promise<WorkItem> {
    const witApi = await this.getWorkItemTrackingApi();

    const patchDocument: JsonPatchOperation[] = [
      {
        op: Operation.Add,
        path: '/fields/System.Title',
        value: title
      }
    ];

    if (description) {
      patchDocument.push({
        op: Operation.Add,
        path: '/fields/System.Description',
        value: description
      });
    }

    if (assignedTo) {
      patchDocument.push({
        op: Operation.Add,
        path: '/fields/System.AssignedTo',
        value: assignedTo
      });
    }

    if (tags && tags.length > 0) {
      patchDocument.push({
        op: Operation.Add,
        path: '/fields/System.Tags',
        value: tags.join('; ')
      });
    }

    return await witApi.createWorkItem(
      {},
      patchDocument,
      project,
      workItemType
    );
  }

  async getWorkItem(
    workItemId: number,
    expand?: WorkItemExpand
  ): Promise<WorkItem> {
    const witApi = await this.getWorkItemTrackingApi();
    return await witApi.getWorkItem(workItemId, undefined, undefined, expand);
  }

  async updateWorkItem(
    workItemId: number,
    updates: JsonPatchOperation[]
  ): Promise<WorkItem> {
    const witApi = await this.getWorkItemTrackingApi();
    return await witApi.updateWorkItem(
      {},
      updates,
      workItemId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  async queryWorkItems(
    project: string,
    wiql: string
  ): Promise<WorkItem[]> {
    const witApi = await this.getWorkItemTrackingApi();

    const queryResult = await witApi.queryByWiql(
      {
        query: wiql
      },
      {
        project
      }
    );

    if (!queryResult.workItems || queryResult.workItems.length === 0) {
      return [];
    }

    const workItemIds = queryResult.workItems
      .map((wi) => wi.id)
      .filter((id): id is number => id !== undefined);

    if (workItemIds.length === 0) {
      return [];
    }

    return await witApi.getWorkItems(workItemIds);
  }

  async getIterations(
    project: string,
    team?: string
  ): Promise<any[]> {
    const workApi = await this.getWorkApi();

    const teams = await this.getTeamsCached(project);
    if (teams.length === 0) {
      return [];
    }

    const teamContext = team
      ? teams.find((t) => t.name === team)
      : teams[0];

    if (!teamContext) {
      throw new Error(`Team '${team || 'default'}' not found in project '${project}'`);
    }

    const context: TeamContext = {
      projectId: teamContext.projectId!,
      teamId: teamContext.id!
    };

    return await workApi.getTeamIterations(context);
  }

  async createIteration(
    project: string,
    name: string,
    startDate: string,
    finishDate: string,
    team?: string
  ): Promise<any> {
    const workApi = await this.getWorkApi();

    const iteration: any = {
      id: name,
      name,
      attributes: {
        startDate: new Date(startDate).toISOString(),
        finishDate: new Date(finishDate).toISOString()
      }
    };

    const teams = await this.getTeamsCached(project);
    if (teams.length === 0) {
      throw new Error(`No teams found in project '${project}'`);
    }

    const teamContext = team
      ? teams.find((t) => t.name === team)
      : teams[0];

    if (!teamContext) {
      throw new Error(`Team '${team || 'default'}' not found in project '${project}'`);
    }

    const context: TeamContext = {
      projectId: teamContext.projectId!,
      teamId: teamContext.id!
    };

    return await workApi.postTeamIteration(iteration, context);
  }
}