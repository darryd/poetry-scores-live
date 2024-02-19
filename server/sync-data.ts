import { getParents } from "./family"

export interface SyncData {
  channelName: string,
  rows: any[], 
  parents?: string[]
}

export function createSyncData(channelName: string, rows: any[], modelName?: string) {
  var syncData = <SyncData> {}

  syncData.channelName = channelName
  syncData.rows = rows

  if (modelName) {
    syncData.parents = getParents(modelName)
  }

  return syncData
}