import { PluginDefinition } from './type.zod.d.ts';

/**
 * 插件的元数据，包含插件定义和运行时信息
 */
export interface PluginMetadata extends PluginDefinition {
  dist: string;         // 插件的内容目录，用于装载内容
  internal?: {             // 内置插件相关
    hidden?: boolean;   // 是否在插件列表中隐藏
  }
}