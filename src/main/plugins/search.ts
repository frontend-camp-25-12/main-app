import PinyinMatch from 'pinyin-match';
import { SearchResult, MatchRange } from '../../share/plugins/type.js';
import { pluginManager } from './loader.js';
import { rMerge } from "ranges-merge";
import i18next from 'i18next';

enum MatchTypeScore {
  REGEX = 200, // 正则匹配
  EXACT = 100, // 完全匹配
  KEYWORD = 80, // 部分匹配
  PINYIN = 60, // 拼音匹配
  ANY = 10 // 任意输入匹配
}

export class PluginSearch {
  constructor() { }

  /**
   * 搜索插件
   * @param query 搜索关键词
   * @returns 匹配的插件列表，按匹配优先级排序
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const plugins = await pluginManager.list();
    const results: SearchResult[] = [];

    for (const plugin of Object.values(plugins)) {
      if (plugin.internal?.hidden) {
        continue;
      }

      const matchedPlugin: SearchResult = {
        id: plugin.id,
        score: 0,
        feature: []
      };

      // 1. 匹配插件名称
      const nameMatch = this.matchText(query, plugin.i18n && plugin.i18n[i18next.language]?.name || plugin.name);
      if (nameMatch.score > 0) {
        matchedPlugin.name = nameMatch.range;
        matchedPlugin.score += nameMatch.score;
      }

      // 2. 匹配插件描述
      if (plugin.description) {
        const descriptionMatch = this.matchText(query, plugin.i18n && plugin.i18n[i18next.language]?.description || plugin.description);
        if (descriptionMatch.score > 0) {
          matchedPlugin.description = descriptionMatch.range;
          matchedPlugin.score += descriptionMatch.score;
        }
      }

      // 3. 匹配features.cmds
      if (plugin.features) {
        for (const feature of plugin.features) {
          if (feature.searchable === false) {
            continue; // 不允许搜索，跳过
          }
          const label = feature.i18n && feature.i18n[i18next.language]?.label || feature.label;
          const matchedPluginFeature: SearchResult['feature'][number] = {
            code: feature.code,
            label,
            score: 0
          };
          let match = false;
          const featureLabelMatch = this.matchText(query, label);
          if (featureLabelMatch.score > 0) {
            matchedPluginFeature.labelMatch = featureLabelMatch.range;
            matchedPluginFeature.score += featureLabelMatch.score;
            match = true;
          }
          for (const cmd of feature.cmds) {
            if (typeof cmd === 'string') {
              // 字符串命令匹配
              const cmdMatch = this.matchText(query, cmd);
              if (cmdMatch.score > 0) {
                matchedPluginFeature.score += cmdMatch.score;
                match = true;
              }
            } else if (cmd.type === 'regex') {
              // 正则匹配
              try {
                const regex = new RegExp(cmd.match, 'gi');
                if (regex.test(query)) {
                  matchedPluginFeature.score += MatchTypeScore.REGEX;
                  match = true;
                }
              } catch (e) {
                console.warn(`Invalid regex pattern in plugin ${plugin.id}:`, cmd.match);
              }
            } else if (cmd.type === 'any') {
              // 任意输入匹配
              matchedPluginFeature.score += MatchTypeScore.ANY;
              match = true;
            }
          }

          if (match) {
            matchedPlugin.feature.push(matchedPluginFeature);
          }
        }
        matchedPlugin.score += matchedPlugin.feature.reduce((sum, feat) => sum + feat.score, 0);
        matchedPlugin.feature.sort((a, b) => b.score - a.score);
      }

      if (matchedPlugin.score > 0) {
        results.push(matchedPlugin);
      }
    }

    // 按分数降序排序
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 匹配文本，返回匹配结果
   */
  private matchText(query: string, text: string): { score: number; range: MatchRange | undefined } {
    let score = 0;
    let ranges: MatchRange = [];
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // 1. 关键词匹配
    let idx = textLower.indexOf(queryLower);
    while (idx !== -1) {
      ranges.push([idx, idx + queryLower.length]);
      idx = textLower.indexOf(queryLower, idx + 1);
    }
    if (ranges.length > 0) {
      score += queryLower.length === textLower.length ? MatchTypeScore.EXACT : MatchTypeScore.KEYWORD;
    }

    // 2. 拼音匹配
    const pinyinMatch = PinyinMatch.match(text, query);
    if (pinyinMatch) {
      score += MatchTypeScore.PINYIN;
      ranges.push([pinyinMatch[0], pinyinMatch[1] + 1]); // 统一到左闭右开
    }

    return {
      score,
      range: rMerge(ranges) as MatchRange || undefined
    };
  }

}

export const pluginSearch = new PluginSearch();