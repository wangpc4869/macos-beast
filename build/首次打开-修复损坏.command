#!/bin/bash
# 微信等渠道传来的 App 会带隔离标记，macOS 会误报「已损坏」
set -euo pipefail

wpc_APP_NAME="牛马一生"
wpc_HERE="$(cd "$(dirname "$0")" && pwd)"

wpc_candidates=(
  "$wpc_HERE/${wpc_APP_NAME}.app"
  "/Applications/${wpc_APP_NAME}.app"
  "$HOME/Applications/${wpc_APP_NAME}.app"
  "$HOME/Desktop/${wpc_APP_NAME}.app"
  "$HOME/Downloads/${wpc_APP_NAME}.app"
)

wpc_APP=""
for wpc_path in "${wpc_candidates[@]}"; do
  if [ -d "$wpc_path" ]; then
    wpc_APP="$wpc_path"
    break
  fi
done

if [ -z "$wpc_APP" ]; then
  wpc_picked="$(osascript -e "POSIX path of (choose file with prompt \"请选择「${wpc_APP_NAME}.app」\" of type {\"app\"})" 2>/dev/null || true)"
  wpc_APP="${wpc_picked%/}"
fi

if [ -z "${wpc_APP:-}" ] || [ ! -d "$wpc_APP" ]; then
  osascript -e "display dialog \"找不到「${wpc_APP_NAME}.app」。请先从 DMG 拖到「应用程序」，再运行本脚本。\" buttons {\"好\"} default button 1 with icon caution"
  exit 1
fi

# 去掉隔离属性 + 本地 ad-hoc 签名
xattr -cr "$wpc_APP" || true
codesign --force --deep --sign - "$wpc_APP" 2>/dev/null || true

open "$wpc_APP"
osascript -e "display notification \"已清除隔离标记并打开\" with title \"${wpc_APP_NAME}\""
