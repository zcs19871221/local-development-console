export interface StatusResponse {
  error?: boolean;
  id: number;
  name: string;
  matchers: string[];
  label: string;
  color: string;
}

export type StatusCreatedOrUpdated = StatusResponse & {
  id?: number;
};

export const statusApiBase = '/processStatus';
