export interface CreateWorkItemArgs {
  project: string;
  type: 'Task' | 'Bug' | 'Feature' | 'User Story' | 'Epic';
  title: string;
  description?: string;
  assignedTo?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ListIterationsArgs {
  project: string;
  team?: string;
}

export interface CreateIterationArgs {
  project: string;
  name: string;
  startDate: string;
  finishDate: string;
  team?: string;
}

export interface ListWorkItemsArgs {
  project: string;
  wiql?: string;
  workItemType?: string;
  assignedTo?: string;
  state?: string;
}

export interface UpdateWorkItemArgs {
  workItemId: number;
  title?: string;
  description?: string;
  assignedTo?: string;
  state?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}