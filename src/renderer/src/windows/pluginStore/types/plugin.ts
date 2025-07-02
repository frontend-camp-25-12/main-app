
/**
 * 插件商店相关类型定义
 */
export interface PluginI18n {
  name: string;
  description?: string;
  i18n?: {
    [locale: string]: {
      name: string;
      description?: string;
    }
  };
}
/**
 * 插件商店插件信息
 */
export type PluginStoreInfo = PluginI18n & {
  id: string;
  name: string;
  description: string | null;
  version: string;
  logo: string; // base64编码的图片数据
  download: number;
  size: number; // 插件大小，单位为字节
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  curretPage: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
}

/**
 * 获取插件列表API响应
 */
export interface GetPluginInfoByPageResponse {
  data: PluginStoreInfo[];
  pagination: PaginationInfo;
}

/**
 * 获取单个插件详情API响应
 */
export interface GetPluginInfoByIdResponse {
  data: PluginStoreInfo;
}
