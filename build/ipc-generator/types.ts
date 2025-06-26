export enum IpcTarget {
  Host = 'host',
  Plugin = 'plugin'
}

export interface IpcGeneratorParams {
  serviceClassPath: string;
  mainOutputPath: string;
  preloadOutputPath: string;
  rootPath: string;
}
export type IpcGeneratorOptions = Record<IpcTarget, Pick<IpcGeneratorParams, 'serviceClassPath' | 'mainOutputPath' | 'preloadOutputPath'>>;

export enum IpcType {
  On = 'on',
  Emit = 'emit'
}

export interface IpcMethod {
  type: IpcType;
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  channelName: string;
  tsdoc: string;
}