export interface ProcessChainConfigResponse {
  id: number;
  delayInMilliseconds?: number;
  processId: number;
  waitForPreviousCompletion?: boolean;
  childProcessChainConfigs?: ProcessChainConfigResponse[];
  version: number;
}

export interface ProcessChainResponse {
  id: number;
  name: string;
  processChainConfigs?: ProcessChainConfigResponse[];
  version: number;
}
type OmitIdAndVersion<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? OmitIdAndVersion<U>[]
    : P extends 'id' | 'version'
      ? T[P] | undefined
      : T[P];
};

export type ProcessChainConfigRequest =
  OmitIdAndVersion<ProcessChainConfigResponse>;

export const x: ProcessChainConfigRequest = {
  childProcessChainConfigs: [
    {
      id: 3,
      processId: 2,
      version: 1,
    },
  ],
};
export const apiBase = '/api/processChain';
