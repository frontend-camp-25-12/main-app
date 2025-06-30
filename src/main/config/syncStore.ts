import Store from 'electron-store';

/**
 * TODO: SyncStore 类提供跨设备同步的配置项管理。
 */
export class SyncStore<T extends Record<string, any>> extends Store<T> {
  private static instances: Map<string, SyncStore<any>> = new Map();

  constructor({ name, defaults, cwd }: { name: string; defaults?: T; cwd?: string }) {
    super({
      name,
      defaults,
      cwd
    });
    SyncStore.instances.set(name, this);
  }
}