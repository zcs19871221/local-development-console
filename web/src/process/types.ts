import { LogMonitor, LogStatus } from '../log_monitor/types.ts';

export interface Process {
  id: number;
  command: string;
  description?: string;
  path: string;
  logMonitor: LogMonitor;
}

export type ProcessesCreatedOrUpdated = Omit<Process, 'id' | 'logMonitor'> & {
  id?: number;
  logMonitorId: number;
};

export interface LogInfo {
  processId: number;
  running: boolean;
  logStatus: LogStatus;
}

export const processesApiBase = '/process';
