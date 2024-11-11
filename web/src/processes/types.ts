import { StatusResponse } from '../logStatus/types.ts';

export interface Process {
  id: number;
  command: string;
  description?: string;
  path: string;
  appProcessStatuses: StatusResponse[];
}

export type ProcessesCreatedOrUpdated = Omit<
  Process,
  'id' | 'appProcessStatuses'
> & {
  id?: number;
  appProcessStatusIds: number[];
};

export interface LogInfo {
  label: string;
  color: string;
  id: number;
  running: boolean;
}

export const processesApiBase = '/processes';
