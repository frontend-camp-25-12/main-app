import PinyinMatch from 'pinyin-match';
import { PluginMetadata } from '../../share/plugins/type.js';
import { pluginManager } from './loader.js';
import { app, ipcMain } from 'electron';

interface SearchResult {
  plugin: PluginMetadata;
  feature?: {
    code: string;
    matchedCmd: string | { type: 'regex'; label: string; match: string };
  };
  score: number; // 匹配分数，按照 regex > 关键词匹配 > 拼音 的优先级排序
}

enum MatchTypeScore {
  REGEX = 200, // 正则匹配
  EXACT = 100, // 完全匹配
  KEYWORD = 80, // 部分匹配
  PINYIN = 60, // 拼音匹配
}

export class PluginSearch {
  constructor() { }

  /**
   * 搜索插件
   * @param query 搜索关键词
   * @returns 匹配的插件列表，按匹配优先级排序
   */
  async search(query: string): Promise<PluginMetadata[]> {
    if (!query.trim()) {
      return [];
    }

    const plugins = await pluginManager.list();
    const results: SearchResult[] = [];

    for (const plugin of Object.values(plugins)) {
      if (plugin.internal?.hidden) {
        continue;
      }

      // 1. 匹配插件名称
      const nameMatchScore = this.matchText(query, plugin.name);
      if (nameMatchScore > 0) {
        results.push({
          plugin,
          score: nameMatchScore
        });
      }

      // 2. 匹配features.cmds
      if (plugin.features) {
        for (const feature of plugin.features) {
          for (const cmd of feature.cmds) {
            if (typeof cmd === 'string') {
              // 字符串命令匹配
              const cmdMatchScore = this.matchText(query, cmd);
              if (cmdMatchScore > 0) {
                results.push({
                  plugin,
                  feature: {
                    code: feature.code,
                    matchedCmd: cmd
                  },
                  score: cmdMatchScore
                });
              }
            } else if (cmd.type === 'regex') {
              // 正则匹配
              try {
                const regex = new RegExp(cmd.match, 'gi');
                if (regex.test(query)) {
                  results.push({
                    plugin,
                    feature: {
                      code: feature.code,
                      matchedCmd: cmd
                    },
                    score: MatchTypeScore.REGEX
                  });
                }
              } catch (e) {
                console.warn(`Invalid regex pattern in plugin ${plugin.id}:`, cmd.match);
              }
            }
          }
        }
      }
    }

    // 按分数降序排序，去重
    const uniqueResults = this.deduplicateResults(results);
    uniqueResults.sort((a, b) => b.score - a.score);

    return uniqueResults.map(result => result.plugin);
  }

  /**
   * 匹配文本，返回匹配结果
   */
  private matchText(query: string, text: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // 1. 关键词匹配
    if (textLower.includes(queryLower)) {
      score += queryLower.length === textLower.length ? MatchTypeScore.EXACT : MatchTypeScore.KEYWORD;
    }

    // 2. 拼音匹配
    const pinyinMatch = PinyinMatch.match(text, query);
    if (pinyinMatch) {
      score += MatchTypeScore.PINYIN;
    }

    return score;
  }

  /**
   * 去除重复的插件
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const pluginMap = new Map<string, SearchResult>();

    for (const result of results) {
      const existing = pluginMap.get(result.plugin.id);
      if (!existing || result.score > existing.score) {
        pluginMap.set(result.plugin.id, result);
      }
    }

    return Array.from(pluginMap.values());
  }
}

export const pluginSearch = new PluginSearch();

app.on('ready', () => {
  ipcMain.handle('plugin-search', async (event, query: string) => {
    return pluginSearch.search(query);
  });
});
