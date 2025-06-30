/**
 * 插件商店相关类型定义
 */

/**
 * 插件商店插件信息
 */
export interface PluginStoreInfo {
  id: string;
  name: string;
  description: string | null;
  version: string;
  logo: string; // base64编码的图片数据
  rating: number;
  download: number;
  category?: string;
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
