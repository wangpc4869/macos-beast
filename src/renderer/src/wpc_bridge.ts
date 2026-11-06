/** 渲染进程能调用的桌面能力，由 preload 挂到 window 上 */
export interface WpcDesktopApi {
  wpc_setPinned: (on: boolean) => Promise<boolean>
  wpc_setMini: (on: boolean) => Promise<boolean>
  wpc_setTitle: (title: string) => Promise<void>
  wpc_copy: (text: string) => Promise<boolean>
}

declare global {
  interface Window {
    wpc?: WpcDesktopApi
  }
}

/** 复制文字。在客户端里走系统剪贴板，离开客户端时退回浏览器剪贴板 */
export const wpc_copyText = async (text: string): Promise<boolean> => {
  if (window.wpc) return window.wpc.wpc_copy(text)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
