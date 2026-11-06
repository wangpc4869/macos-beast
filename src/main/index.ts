import { app, BrowserWindow, ipcMain, Menu, nativeTheme, type IpcMainInvokeEvent, type MenuItemConstructorOptions, type Rectangle } from 'electron'
import { cpSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

app.setName('牛马一生')
nativeTheme.themeSource = 'dark'

/**
 * 旧版「牛马计时器」用户目录迁到「牛马一生」，避免改名后账本丢失
 */
const wpc_migrateUserData = (): void => {
  const wpc_next = app.getPath('userData')
  const wpc_old = join(app.getPath('appData'), '牛马计时器')
  if (!existsSync(wpc_old) || wpc_old === wpc_next) return
  let wpc_nextEmpty = true
  try {
    wpc_nextEmpty = !existsSync(wpc_next) || readdirSync(wpc_next).length === 0
  } catch {
    wpc_nextEmpty = true
  }
  if (!wpc_nextEmpty) return
  try {
    cpSync(wpc_old, wpc_next, { recursive: true })
  } catch {
    /* 迁移失败不挡启动 */
  }
}

let wpc_win: BrowserWindow | null = null
let wpc_pinned = false
let wpc_mini = false
let wpc_restore: Rectangle | null = null

/** 开发时给 Dock 换上项目里的图标 */
const wpc_applyDockIcon = (): void => {
  if (process.platform !== 'darwin' || !app.dock) return
  const wpc_icon = join(process.cwd(), 'build', 'icon.png')
  if (!existsSync(wpc_icon)) return
  app.dock.setIcon(wpc_icon)
}

/** 创建主窗口。关闭后进程退出，账靠时间戳下次补上 */
const wpc_createWindow = (): void => {
  wpc_win = new BrowserWindow({
    width: 1120,
    height: 900,
    minWidth: 1020,
    minHeight: 820,
    show: false,
    title: '牛马一生',
    backgroundColor: '#0b1411',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  })

  wpc_win.once('ready-to-show', () => {
    wpc_win?.show()
  })

  wpc_win.on('closed', () => {
    wpc_win = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void wpc_win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void wpc_win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/** 常亮。迷你窗期间保持浮在上面，退出迷你后再听从这个开关 */
const wpc_applyPinned = (on: boolean): boolean => {
  wpc_pinned = on
  if (!wpc_win) return wpc_pinned
  wpc_win.setAlwaysOnTop(wpc_mini || wpc_pinned, 'floating')
  return wpc_pinned
}

/** 收成迷你浮窗，或恢复刚才的大小 */
const wpc_applyMini = (on: boolean): boolean => {
  if (!wpc_win) return wpc_mini
  if (on && !wpc_mini) {
    wpc_restore = wpc_win.getBounds()
    wpc_win.setMinimumSize(360, 340)
    wpc_win.setSize(400, 380, true)
    wpc_win.setAlwaysOnTop(true, 'floating')
    wpc_mini = true
    return true
  }
  if (!on && wpc_mini) {
    wpc_win.setMinimumSize(1020, 820)
    if (wpc_restore) wpc_win.setBounds(wpc_restore, true)
    wpc_win.setAlwaysOnTop(wpc_pinned, 'floating')
    wpc_mini = false
    return false
  }
  return wpc_mini
}

/** 改原生窗口标题，任务控制里能看见当前身价 */
const wpc_applyTitle = (title: unknown): void => {
  if (!wpc_win || typeof title !== 'string') return
  const wpc_clean = title.replace(/[\r\n]/g, ' ').slice(0, 48)
  wpc_win.setTitle(wpc_clean)
}

/** 注册渲染进程要用的几个窗口能力 */
const wpc_bindIpc = (): void => {
  ipcMain.handle('wpc:pinned', (_event: IpcMainInvokeEvent, on: unknown) => wpc_applyPinned(on === true))
  ipcMain.handle('wpc:mini', (_event: IpcMainInvokeEvent, on: unknown) => wpc_applyMini(on === true))
  ipcMain.handle('wpc:title', (_event: IpcMainInvokeEvent, title: unknown) => {
    wpc_applyTitle(title)
  })
}

/** 中文菜单，编辑菜单留给输入框复制粘贴 */
const wpc_installMenu = (): void => {
  const wpc_template: MenuItemConstructorOptions[] = [
    {
      label: '牛马一生',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: '退出牛马一生' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'zoom', label: '缩放' },
        { role: 'close', label: '关闭' },
        { type: 'separator' },
        { role: 'front', label: '全部置于前面' },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(wpc_template))
  app.setAboutPanelOptions({
    applicationName: '牛马一生',
    applicationVersion: app.getVersion(),
    version: '',
    copyright: '账本只留在这台 Mac',
    credits: '苦中作乐，精确到秒',
  })
}

/** 等应用就绪后打开窗口 */
const wpc_bootstrap = (): void => {
  wpc_migrateUserData()
  wpc_applyDockIcon()
  wpc_installMenu()
  wpc_bindIpc()
  wpc_createWindow()
}

const wpc_gotLock = app.requestSingleInstanceLock()
if (!wpc_gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!wpc_win) return
    if (wpc_win.isMinimized()) wpc_win.restore()
    wpc_win.show()
    wpc_win.focus()
  })
  app.on('window-all-closed', () => {
    app.quit()
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) wpc_createWindow()
  })
  void app.whenReady().then(wpc_bootstrap)
}
