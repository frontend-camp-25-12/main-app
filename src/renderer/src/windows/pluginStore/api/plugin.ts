import type { GetPluginInfoByPageResponse, GetPluginInfoByIdResponse, PluginStoreInfo } from '../types/plugin'

export async function getPluginInfoByPage(page: number): Promise<GetPluginInfoByPageResponse> {
  const res = await fetch(
    `http://localhost:8080/plugin-info/page=${page}`
  ).then((res) => res.json())
  return res
}

export async function getPluginInfoById(id: string): Promise<PluginStoreInfo> {
  const res: GetPluginInfoByIdResponse = await fetch(`http://localhost:8080/plugin-info/id=${id}`).then(
    (res) => res.json()
  )
  return res.data
}
