export interface StatusResponse {
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
