import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { wpc_App } from './wpc_App'
import './wpc_styles.css'

/** 挂上牛马计时器 */
const wpc_mount = (): void => {
  const wpc_rootEl = document.getElementById('root')
  if (!wpc_rootEl) return
  createRoot(wpc_rootEl).render(createElement(wpc_App))
}

wpc_mount()
