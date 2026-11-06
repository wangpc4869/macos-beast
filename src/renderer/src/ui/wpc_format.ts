/** 同事在旁边时用固定掩码。长度不随金额变，页面里也不留真数字 */
export const wpc_veilMoney = (text: string, veiled: boolean): string => (veiled ? '••••' : text)

/** 固定小数位，遇到坏数字就显示 0 */
export const wpc_formatFixed = (value: number, digits: number): string => {
  if (!Number.isFinite(value)) return (0).toFixed(digits)
  return value.toFixed(digits)
}

/** 毫秒收成 H:MM:SS */
export const wpc_formatDuration = (ms: number): string => {
  const wpc_sign = ms < 0 ? '-' : ''
  const wpc_total = Math.floor(Math.abs(ms) / 1000)
  const wpc_hour = Math.floor(wpc_total / 3600)
  const wpc_minute = Math.floor((wpc_total % 3600) / 60)
  const wpc_second = wpc_total % 60
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  return `${wpc_sign}${wpc_hour}:${wpc_pad(wpc_minute)}:${wpc_pad(wpc_second)}`
}

/** 本地时钟 HH:mm:ss */
export const wpc_formatClock = (timestamp: number): string => {
  const wpc_date = new Date(timestamp)
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  return `${wpc_pad(wpc_date.getHours())}:${wpc_pad(wpc_date.getMinutes())}:${wpc_pad(wpc_date.getSeconds())}`
}

/** 标题栏和菜单里用的日期 */
export const wpc_formatDay = (timestamp: number): string => {
  const wpc_date = new Date(timestamp)
  const wpc_week = ['日', '一', '二', '三', '四', '五', '六']
  return `${wpc_date.getMonth() + 1}月${wpc_date.getDate()}日 周${wpc_week[wpc_date.getDay()]}`
}

/** 数字输入读成有限数，空着当 0，读失败就保持原值 */
export const wpc_readNumber = (raw: string, previous: number): number => {
  if (raw.trim() === '') return 0
  const wpc_value = Number(raw)
  if (!Number.isFinite(wpc_value)) return previous
  return wpc_value
}

/** 把数字夹进区间 */
export const wpc_clampNumber = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}
