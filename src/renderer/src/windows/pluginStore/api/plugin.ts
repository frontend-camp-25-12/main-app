import type { GetPluginInfoByPageResponse, GetPluginInfoByIdResponse, PluginStoreInfo } from '../types/plugin'

export const HOST = await window.ipcApi.getServerHost()

export async function getPluginInfoByPage(page: number): Promise<GetPluginInfoByPageResponse> {
  const res = await fetch(
    `http://${HOST}/plugin-info/page=${page}`
  ).then((res) => res.json())
  return res
}

export async function getPluginInfoById(id: string): Promise<PluginStoreInfo> {
  const res: GetPluginInfoByIdResponse = await fetch(`http://${HOST}/plugin-info/id=${id}`).then(
    (res) => res.json()
  )
  return res.data
}
