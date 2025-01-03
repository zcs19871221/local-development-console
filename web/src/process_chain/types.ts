import { MakeTypeOptionalRecursively } from '../common/types.ts';

export interface IdAndVersion {
  id: number;
  version: number;
}

export interface ProcessChainConfigResponse extends IdAndVersion {
  processId: number;
  delayInMilliseconds?: number;
  waitForPreviousCompletion?: boolean;
  childProcessChainConfigs?: ProcessChainConfigResponse[];
}

export interface ProcessChainResponse extends IdAndVersion {
  name: string;
  processChainConfigs?: ProcessChainConfigResponse[];
  processIds?: number[];
}

export type ProcessChainCreateOrUpdateRequest = MakeTypeOptionalRecursively<
  ProcessChainResponse,
  IdAndVersion
>;

export const processChainApiBase = '/processChain';
