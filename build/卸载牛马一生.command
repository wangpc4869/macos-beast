#!/bin/bash
# 卸载牛马一生：删掉 App + 本地账本数据
set -euo pipefail

wpc_APP_NAME="牛马一生"

wpc_confirm() {
  osascript <<EOF
display dialog "将删除「${wpc_APP_NAME}」应用，以及本机上的全部计时/打卡数据。此操作不可恢复。" buttons {"取消", "确认卸载"} default button "确认卸载" with icon caution with title "卸载 ${wpc_APP_NAME}"
EOF
}

if ! wpc_confirm >/dev/null 2>&1; then
  exit 0
fi

pkill -f "${wpc_APP_NAME}" 2>/dev/null || true
pkill -f "NiumaTimer" 2>/dev/null || true
pkill -f "NiumaLife" 2>/dev/null || true
sleep 0.5

for wpc_path in \
  "/Applications/${wpc_APP_NAME}.app" \
  "/Applications/NiumaTimer.app" \
  "/Applications/牛马计时器.app" \
  "$HOME/Applications/${wpc_APP_NAME}.app" \
  "$HOME/Desktop/${wpc_APP_NAME}.app"
do
  if [ -d "$wpc_path" ]; then
    rm -rf "$wpc_path"
  fi
done

# Electron 本地数据（含旧名目录）
rm -rf "$HOME/Library/Application Support/${wpc_APP_NAME}"
rm -rf "$HOME/Library/Application Support/牛马计时器"
rm -rf "$HOME/Library/Application Support/niuma-timer"
rm -rf "$HOME/Library/Caches/${wpc_APP_NAME}"
rm -rf "$HOME/Library/Caches/牛马计时器"
rm -rf "$HOME/Library/Caches/niuma-timer"
rm -rf "$HOME/Library/Preferences/app.wpc.niuma-timer.plist"
rm -rf "$HOME/Library/Saved Application State/app.wpc.niuma-timer.savedState"
rm -rf "$HOME/Library/Logs/${wpc_APP_NAME}"
rm -rf "$HOME/Library/Logs/牛马计时器"

osascript -e "display notification \"应用与本地数据已清除\" with title \"${wpc_APP_NAME}\""
echo "卸载完成。"
read -r -p "按回车关闭…" _
