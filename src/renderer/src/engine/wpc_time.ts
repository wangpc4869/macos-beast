/** 把小时和分钟收成始终两位的 HH:mm */
export const wpc_joinClock = (hour: number, minute: number): string => {
  const wpc_hour = Math.min(23, Math.max(0, Math.trunc(hour)))
  const wpc_minute = Math.min(59, Math.max(0, Math.trunc(minute)))
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  return `${wpc_pad(wpc_hour)}:${wpc_pad(wpc_minute)}`
}

/** 拆开 HH:mm，缺一段就补 00，界面上永远是两位 */
export const wpc_splitClock = (value: string): { hour: string; minute: string } => {
  const wpc_match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!wpc_match) return { hour: '00', minute: '00' }
  return {
    hour: wpc_match[1].padStart(2, '0'),
    minute: wpc_match[2],
  }
}

/** 把 HH:mm 收成当天的分钟数，不合法时回到 0 点 */
export const wpc_parseMinutes = (value: string): number => {
  const wpc_match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!wpc_match) return 0
  const wpc_hour = Number(wpc_match[1])
  const wpc_minute = Number(wpc_match[2])
  if (wpc_hour > 23 || wpc_minute > 59) return 0
  return wpc_hour * 60 + wpc_minute
}

/** 本地当天 0 点的时间戳 */
export const wpc_localMidnight = (timestamp: number): number => {
  const wpc_date = new Date(timestamp)
  wpc_date.setHours(0, 0, 0, 0)
  return wpc_date.getTime()
}

/** 两个区间重叠的毫秒，不重叠就是 0 */
export const wpc_overlapMs = (from: number, to: number, start: number, end: number): number => {
  const wpc_left = Math.max(from, start)
  const wpc_right = Math.min(to, end)
  return Math.max(0, wpc_right - wpc_left)
}
