const { execFileSync } = require('node:child_process')
const { join } = require('node:path')

/**
 * 打包后对 .app 做 ad-hoc 签名，减轻「已损坏」误报
 * @param {import('electron-builder').AfterPackContext} context
 */
module.exports = async (context) => {
  if (context.electronPlatformName !== 'darwin') return
  const wpc_app = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', wpc_app], { stdio: 'inherit' })
}
