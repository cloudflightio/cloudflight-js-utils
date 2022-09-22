export type ExternalLibDocsMappings = Record<string, string>;

export interface BuildExecutorSchema {
  entryPoint: string;
  tsConfig: string;
  output: string;
  externalSymbolLinkMappings?: Record<string, ExternalLibDocsMappings>;
}
