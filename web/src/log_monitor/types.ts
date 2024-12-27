export interface LogStatus {
  label: string; // Label to display for the status

  labelColor: string; // Color for the status label

  logMatchPatterns: string[]; // Regex pattern to match in the log

  isErrorStatus?: boolean; // Indicates if this status is an error status
}

export interface LogMonitor {
  id: number;

  name: string; // Name of the log monitor

  statusConfigurations: LogStatus[]; // Collection of log status configurations
}

export type LogMonitorCreatedOrUpdated = LogMonitor & {
  id?: number;
};

export const logMonitorBaseUrl = '/logMonitor';
