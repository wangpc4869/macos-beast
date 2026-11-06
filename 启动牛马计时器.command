#!/bin/bash
cd "$(dirname "$0")"
export electron_config_cache="$(pwd)/.cache/electron"
export ELECTRON_CACHE="$(pwd)/.cache/electron"
export ELECTRON_BUILDER_CACHE="$(pwd)/.cache/electron-builder"
export npm_config_cache="$(pwd)/.npm-cache"
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
if [ ! -x node_modules/.bin/electron-vite ]; then
  npm install --cache ./.npm-cache --no-audit --no-fund
fi
if [ -d "release/mac-arm64/牛马一生.app" ]; then
  open "release/mac-arm64/牛马一生.app"
  exit 0
fi
npm run dev
