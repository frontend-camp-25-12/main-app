import { match } from "assert";
import { features } from "process";
import { z } from "zod";

/**
 * 插件的plugin.json文件定义，由插件开发者按需求编写
 */
export const PluginDefinitionSchema = z.object({
  id: z.string(),  // 插件的唯一标识符
  name: z.string(), // 插件的名称
  description: z.string().optional(), // 插件的描述信息
  version: z.string(),
  window: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      disableTransition: z.boolean().optional(), // 是否禁用窗口进出时的过渡动画
      frame: z.boolean().optional().default(true), // 是否启用窗口边框，默认为true
      transparent: z.boolean().optional().default(false), // 是否启用透明窗口，默认为false，启用时需要同时设置frame为false
    }).optional(),
  features: z.array(z.object({
    code: z.string(), // 功能代码，用于通过命令输入进入插件时，识别用户通过哪个feature进入。无code表明用户是通过“点击”进入插件的
    cmds: z.array(z.union([z.string(), z.object({ // 定义命令列表，用于命令匹配方式地进入插件
      type: z.literal('regex'),
      label: z.string(), // 命令的显示名称
      match: z.string() // 正则匹配字符串，如match: "\d+"，默认flag为gi，不要添加包围反斜杠和flag
    })])), 
  })).optional().default([]),
});

export type PluginDefinition = z.input<typeof PluginDefinitionSchema>;
