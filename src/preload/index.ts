import { clipboard, contextBridge, ipcRenderer } from 'electron'

/** 让渲染进程把常亮开关交给主进程 */
const wpc_setPinned = (on: boolean): Promise<boolean> => ipcRenderer.invoke('wpc:pinned', on)

/** 让渲染进程切换迷你窗 */
const wpc_setMini = (on: boolean): Promise<boolean> => ipcRenderer.invoke('wpc:mini', on)

/** 让渲染进程改窗口标题 */
const wpc_setTitle = (title: string): Promise<void> => ipcRenderer.invoke('wpc:title', title)

/** 写入系统剪贴板。这里不经过网页权限 */
const wpc_copy = (text: string): boolean => {
  if (typeof text !== 'string' || text.length > 4000) return false
  clipboard.writeText(text)
  return true
}

contextBridge.exposeInMainWorld('wpc', {
  wpc_setPinned,
  wpc_setMini,
  wpc_setTitle,
  wpc_copy,
})
