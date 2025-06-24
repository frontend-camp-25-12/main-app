import path from "path";
import { getRelativePathTsImport } from "../utils";
import { IpcGenerator } from "./base";
import { scanTypeFiles } from "../types-importers";
import { IpcGeneratorParams } from "../types";

export class PluginIpcGenerator extends IpcGenerator {
  get mainIpcCode(): string {
    throw new Error("Method not implemented.");
  }
  get preloadIpcCode(): string {
    throw new Error("Method not implemented.");
  }

  get hmrWatchFiles(): string[] {
    throw new Error("Method not implemented.");
  }
  constructor(params: IpcGeneratorParams) {
    super(params);
  }
}