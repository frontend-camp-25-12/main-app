import { z } from "zod";

/**
 * 插件的plugin.json文件定义，由插件开发者按需求编写
 */
export const PluginDefinitionSchema = z.object({
  id: z.string(),  // 插件的唯一标识符
  name: z.string(), // 插件的名称
  version: z.string(),
  window: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      disableTransition: z.boolean().optional(), // 是否禁用窗口进出时的过渡动画
      frame: z.boolean().optional().default(true), // 是否启用窗口边框，默认为true
      transparent: z.boolean().optional().default(false), // 是否启用透明窗口，默认为false，启用时需要同时设置frame为false
    })
    .optional(),
});

export type PluginDefinition = z.input<typeof PluginDefinitionSchema>;
