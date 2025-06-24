import { PluginDefinition } from './type.zod.d.ts';

/**
 * 插件的元数据，包含插件定义和运行时信息
 */
export interface PluginMetadata extends PluginDefinition {
  dist: string;         // 插件的内容目录，用于装载内容
  logoPath?: string;
  internal?: {             // 内置插件相关
    hidden?: boolean;   // 是否在插件列表中隐藏
  }
}
export type MatchRange = [number, number][];  // 直接搜索插件名称或描述时，返回匹配的字符范围用来高亮
export interface SearchResult {
  id: PluginMetadata['id'];
  name?: MatchRange;
  description?: MatchRange;
  feature: {
    code: string;
    label: string;
  }[];
  score: number; // 匹配分数
}

export interface PluginEnterAction {
  code: string; // 功能代码
  payload: string // 用户输入
}