import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 生成 CRC 表 */
const wpc_makeCrcTable = (): Uint32Array => {
  const wpc_table = new Uint32Array(256)
  for (let wpc_n = 0; wpc_n < 256; wpc_n += 1) {
    let wpc_c = wpc_n
    for (let wpc_k = 0; wpc_k < 8; wpc_k += 1) {
      wpc_c = (wpc_c & 1) ? 0xedb88320 ^ (wpc_c >>> 1) : wpc_c >>> 1
    }
    wpc_table[wpc_n] = wpc_c >>> 0
  }
  return wpc_table
}

const wpc_crcTable = wpc_makeCrcTable()

/** 计算 PNG 用的 CRC32 */
const wpc_crc32 = (buffer: Buffer): number => {
  let wpc_c = 0xffffffff
  for (let wpc_i = 0; wpc_i < buffer.length; wpc_i += 1) {
    wpc_c = wpc_crcTable[(wpc_c ^ buffer[wpc_i]) & 0xff] ^ (wpc_c >>> 8)
  }
  return (wpc_c ^ 0xffffffff) >>> 0
}

/** 拼一个 PNG 块 */
const wpc_chunk = (type: string, data: Buffer): Buffer => {
  const wpc_length = Buffer.alloc(4)
  wpc_length.writeUInt32BE(data.length, 0)
  const wpc_body = Buffer.concat([Buffer.from(type), data])
  const wpc_crc = Buffer.alloc(4)
  wpc_crc.writeUInt32BE(wpc_crc32(wpc_body), 0)
  return Buffer.concat([wpc_length, wpc_body, wpc_crc])
}

/** 圆角矩形的有向距离，负值在内部 */
const wpc_roundRectDistance = (
  px: number,
  py: number,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  radius: number,
): number => {
  const wpc_dx = Math.abs(px - cx) - (halfW - radius)
  const wpc_dy = Math.abs(py - cy) - (halfH - radius)
  const wpc_outside = Math.hypot(Math.max(wpc_dx, 0), Math.max(wpc_dy, 0))
  const wpc_inside = Math.min(Math.max(wpc_dx, wpc_dy), 0)
  return wpc_outside + wpc_inside - radius
}

/** 覆盖率，0 到 1 */
const wpc_coverage = (distance: number): number => Math.min(1, Math.max(0, 0.5 - distance))

/** 两种颜色按覆盖率叠到像素上 */
const wpc_blend = (
  pixels: Buffer,
  size: number,
  x: number,
  y: number,
  red: number,
  green: number,
  blue: number,
  alpha: number,
): void => {
  if (x < 0 || y < 0 || x >= size || y >= size || alpha <= 0) return
  const wpc_index = (y * size + x) * 4
  const wpc_srcA = alpha
  const wpc_dstA = pixels[wpc_index + 3] / 255
  const wpc_outA = wpc_srcA + wpc_dstA * (1 - wpc_srcA)
  if (wpc_outA <= 0) return
  const wpc_mix = (src: number, dst: number): number => (src * wpc_srcA + dst * wpc_dstA * (1 - wpc_srcA)) / wpc_outA
  pixels[wpc_index] = wpc_mix(red, pixels[wpc_index])
  pixels[wpc_index + 1] = wpc_mix(green, pixels[wpc_index + 1])
  pixels[wpc_index + 2] = wpc_mix(blue, pixels[wpc_index + 2])
  pixels[wpc_index + 3] = wpc_outA * 255
}

/** 按纵向位置混出漆黑到墨绿 */
const wpc_bgColor = (unit: number): [number, number, number] => {
  const wpc_t = Math.min(1, Math.max(0, unit))
  return [
    11 + (22 - 11) * (1 - wpc_t),
    20 + (48 - 20) * (1 - wpc_t),
    17 + (40 - 17) * (1 - wpc_t),
  ]
}

/** 金币从上到下的金属色 */
const wpc_goldColor = (unit: number): [number, number, number] => {
  const wpc_t = Math.min(1, Math.max(0, unit))
  return [246 - (246 - 176) * wpc_t, 226 - (226 - 137) * wpc_t, 168 - (168 - 58) * wpc_t]
}

/** 画一枚方孔铜钱，给 Dock 和安装包当图标 */
const wpc_drawIcon = (size: number): Buffer => {
  const wpc_pixels = Buffer.alloc(size * size * 4)
  const wpc_center = (size - 1) / 2
  for (let wpc_y = 0; wpc_y < size; wpc_y += 1) {
    for (let wpc_x = 0; wpc_x < size; wpc_x += 1) {
      const wpc_px = wpc_x + 0.5
      const wpc_py = wpc_y + 0.5
      const wpc_plate = wpc_roundRectDistance(wpc_px, wpc_py, wpc_center, wpc_center, size * 0.46, size * 0.46, size * 0.22)
      const wpc_plateCover = wpc_coverage(wpc_plate)
      if (wpc_plateCover > 0) {
        const [wpc_r, wpc_g, wpc_b] = wpc_bgColor(wpc_py / size)
        wpc_blend(wpc_pixels, size, wpc_x, wpc_y, wpc_r, wpc_g, wpc_b, wpc_plateCover)
      }
      const wpc_coin = Math.hypot(wpc_px - wpc_center, wpc_py - wpc_center) - size * 0.31
      const wpc_coinCover = wpc_coverage(wpc_coin)
      if (wpc_coinCover > 0) {
        const [wpc_r, wpc_g, wpc_b] = wpc_goldColor(wpc_py / size)
        wpc_blend(wpc_pixels, size, wpc_x, wpc_y, wpc_r, wpc_g, wpc_b, wpc_coinCover)
      }
      const wpc_hole = wpc_roundRectDistance(wpc_px, wpc_py, wpc_center, wpc_center, size * 0.075, size * 0.075, size * 0.02)
      const wpc_holeCover = wpc_coverage(wpc_hole)
      if (wpc_holeCover > 0) {
        const [wpc_r, wpc_g, wpc_b] = wpc_bgColor(wpc_py / size)
        wpc_blend(wpc_pixels, size, wpc_x, wpc_y, wpc_r, wpc_g, wpc_b, wpc_holeCover)
      }
    }
  }
  const wpc_raw = Buffer.alloc((size * 4 + 1) * size)
  for (let wpc_y = 0; wpc_y < size; wpc_y += 1) {
    const wpc_row = wpc_y * (size * 4 + 1)
    wpc_raw[wpc_row] = 0
    wpc_pixels.copy(wpc_raw, wpc_row + 1, wpc_y * size * 4, (wpc_y + 1) * size * 4)
  }
  const wpc_ihdr = Buffer.alloc(13)
  wpc_ihdr.writeUInt32BE(size, 0)
  wpc_ihdr.writeUInt32BE(size, 4)
  wpc_ihdr[8] = 8
  wpc_ihdr[9] = 6
  const wpc_sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    wpc_sig,
    wpc_chunk('IHDR', wpc_ihdr),
    wpc_chunk('IDAT', deflateSync(wpc_raw)),
    wpc_chunk('IEND', Buffer.alloc(0)),
  ])
}

/** 把图标写到 build/icon.png */
const wpc_main = (): void => {
  const wpc_here = dirname(fileURLToPath(import.meta.url))
  const wpc_file = join(wpc_here, '..', 'build', 'icon.png')
  mkdirSync(dirname(wpc_file), { recursive: true })
  writeFileSync(wpc_file, wpc_drawIcon(512))
}

wpc_main()
