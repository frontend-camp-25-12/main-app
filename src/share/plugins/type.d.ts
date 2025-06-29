import { PluginDefinition } from './type.zod.d.ts';

export type * from './api.type.d.ts';
/**
 * 插件的元数据，包含插件定义和运行时信息
 */
export interface PluginMetadata extends PluginDefinition {
  dist: string;         // 插件的内容目录，用于装载内容
  logoPath?: string;
  internal?: {             // 内置插件相关
    hidden?: boolean;   // 是否在插件列表中隐藏
  },
  lastEnterAction?: PluginEnterAction; // 上一次enter事件的action
}
export type MatchRange = [number, number][];  // 直接搜索插件名称或描述时，返回匹配的字符范围用来高亮
export interface SearchResult {
  id: PluginMetadata['id'];
  name?: MatchRange;
  description?: MatchRange;
  feature: {
    code: string;
    label: string;
    labelMatch?: MatchRange;
    score: number;
  }[];
  score: number;
}

export interface AppConfigSchema {
  colorMode: "light" | "dark" | "system";
  locale: "en" | "zh-CN";
  entrance_viewMode: "list" | "grid";
}
