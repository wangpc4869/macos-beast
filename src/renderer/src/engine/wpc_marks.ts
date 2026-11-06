import {
  wpc_CAREER_START,
  wpc_clockOnDate,
  wpc_dayBase,
  wpc_dayBlessing,
  wpc_dayStartMs,
  wpc_isLegalHoliday,
  wpc_splitDate,
} from './wpc_calendar'
import { wpc_compute, wpc_dailyOf } from './wpc_money'
import type { WpcDayMark, WpcMarkKind, WpcSalaryMap, WpcSession, WpcSettings } from './wpc_types'

export interface WpcCalendarCell {
  date: string | null
  day: number | null
}

/** 本地日期，用来给打卡归档 */
export const wpc_dateKey = (timestamp: number): string => {
  const wpc_date = new Date(timestamp)
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  return `${wpc_date.getFullYear()}-${wpc_pad(wpc_date.getMonth() + 1)}-${wpc_pad(wpc_date.getDate())}`
}

/** 按月 → 年 → 工时设定，算出这一天该用的日薪 */
export const wpc_dailyForDate = (settings: WpcSettings, salaryMap: WpcSalaryMap, date: string): number => {
  const { year, month } = wpc_splitDate(date)
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  const wpc_monthKey = `${year}-${wpc_pad(month)}`
  const wpc_yearKey = String(year)
  const wpc_days = Math.max(1, settings.workDays || 1)
  if (typeof salaryMap[wpc_monthKey] === 'number' && Number.isFinite(salaryMap[wpc_monthKey])) {
    return Math.max(0, salaryMap[wpc_monthKey]) / wpc_days
  }
  if (typeof salaryMap[wpc_yearKey] === 'number' && Number.isFinite(salaryMap[wpc_yearKey])) {
    return Math.max(0, salaryMap[wpc_yearKey]) / wpc_days
  }
  return wpc_dailyOf(settings)
}

/** 当前查看的月/年有没有单独设过月薪 */
export const wpc_salaryOverride = (
  salaryMap: WpcSalaryMap,
  year: number,
  month: number,
): { month: number | null; year: number | null } => {
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  const wpc_monthKey = `${year}-${wpc_pad(month + 1)}`
  const wpc_yearKey = String(year)
  return {
    month: typeof salaryMap[wpc_monthKey] === 'number' ? salaryMap[wpc_monthKey] : null,
    year: typeof salaryMap[wpc_yearKey] === 'number' ? salaryMap[wpc_yearKey] : null,
  }
}

/** 写入或清掉某个月/年的月薪 */
export const wpc_patchSalaryMap = (
  salaryMap: WpcSalaryMap,
  key: string,
  value: number | null,
): WpcSalaryMap => {
  const wpc_next = { ...salaryMap }
  if (value === null || !Number.isFinite(value) || value < 0) {
    delete wpc_next[key]
    return wpc_next
  }
  wpc_next[key] = value
  return wpc_next
}

/** 把当前班次收成一天的打卡。还没上班就没有记录 */
export const wpc_markFromSession = (
  settings: WpcSettings,
  session: WpcSession,
  now: number,
  salaryMap: WpcSalaryMap = {},
): WpcDayMark | null => {
  if (session.status === 'idle' || session.startedAt === null) return null
  const wpc_at = session.status === 'off' && session.endedAt !== null ? session.endedAt : now
  const wpc_snap = wpc_compute(settings, session, wpc_at)
  const wpc_status = session.status === 'paused' ? 'paused' : session.status === 'off' ? 'off' : 'running'
  const wpc_date = wpc_dateKey(session.startedAt)
  const wpc_holiday = wpc_isLegalHoliday(wpc_date)
  return {
    date: wpc_date,
    kind: wpc_holiday ? 'holiday' : 'punch',
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    status: wpc_status,
    earned: wpc_holiday ? Math.max(wpc_snap.earned, wpc_dailyForDate(settings, salaryMap, wpc_date)) : wpc_snap.earned,
    effectiveMs: wpc_snap.effectiveMs,
    note: wpc_holiday ? '节假日加班' : '',
    tripBonus: 0,
    overtimePay: wpc_holiday ? wpc_snap.earned : 0,
  }
}

/** 用新的一天盖掉同一天的旧记录。没变化就原样返回 */
export const wpc_mergeMarks = (marks: readonly WpcDayMark[], live: WpcDayMark): WpcDayMark[] => {
  const wpc_prev = marks.find((item) => item.date === live.date)
  if (
    wpc_prev &&
    wpc_prev.kind === live.kind &&
    wpc_prev.startedAt === live.startedAt &&
    wpc_prev.endedAt === live.endedAt &&
    wpc_prev.status === live.status &&
    wpc_prev.effectiveMs === live.effectiveMs &&
    wpc_prev.note === live.note &&
    wpc_prev.tripBonus === live.tripBonus &&
    wpc_prev.overtimePay === live.overtimePay &&
    Math.abs(wpc_prev.earned - live.earned) < 0.01
  ) {
    return marks as WpcDayMark[]
  }
  const wpc_rest = marks.filter((item) => item.date !== live.date)
  return [...wpc_rest, live].sort((a, b) => (a.date < b.date ? -1 : 1))
}

/** 上班、下班或清空之后，整理打卡本 */
export const wpc_rememberMark = (
  marks: readonly WpcDayMark[],
  settings: WpcSettings,
  session: WpcSession,
  now: number,
  dropDate: string | null,
  salaryMap: WpcSalaryMap = {},
): WpcDayMark[] => {
  if (session.status === 'idle' || session.startedAt === null) {
    return dropDate ? marks.filter((item) => item.date !== dropDate) : (marks as WpcDayMark[])
  }
  const wpc_live = wpc_markFromSession(settings, session, now, salaryMap)
  return wpc_live ? wpc_mergeMarks(marks, wpc_live) : (marks as WpcDayMark[])
}

/** 某个月的格子，前面用空位补齐星期 */
export const wpc_monthCells = (year: number, month: number): WpcCalendarCell[] => {
  const wpc_first = new Date(year, month, 1).getDay()
  const wpc_count = new Date(year, month + 1, 0).getDate()
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  const wpc_prefix = `${year}-${wpc_pad(month + 1)}`
  const wpc_cells: WpcCalendarCell[] = []
  for (let wpc_index = 0; wpc_index < wpc_first; wpc_index += 1) wpc_cells.push({ date: null, day: null })
  for (let wpc_day = 1; wpc_day <= wpc_count; wpc_day += 1) {
    wpc_cells.push({ date: `${wpc_prefix}-${wpc_pad(wpc_day)}`, day: wpc_day })
  }
  return wpc_cells
}

/** 这个月记过几次 */
export const wpc_countMonth = (marks: readonly WpcDayMark[], year: number, month: number): number => {
  const wpc_prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  return marks.filter((item) => item.date.startsWith(wpc_prefix)).length
}

/** 这一天能不能改人工记录 */
export const wpc_canEditDay = (date: string, today: string): boolean => {
  if (date > today) return false
  if (date < wpc_CAREER_START) return false
  return true
}

/** 正常打卡 / 补卡。节假日自动变成加班 */
export const wpc_makePunch = (
  settings: WpcSettings,
  salaryMap: WpcSalaryMap,
  date: string,
  today: string,
  note = '',
): WpcDayMark => {
  const wpc_daily = wpc_dailyForDate(settings, salaryMap, date)
  const wpc_start = wpc_clockOnDate(date, settings.startTime)
  const wpc_end = wpc_clockOnDate(date, settings.endTime)
  const wpc_base = wpc_dayBase(date, today)
  const wpc_holiday = wpc_base === 'holiday'
  const wpc_idle = {
    status: 'off' as const,
    startedAt: wpc_start,
    pauses: [],
    pausedAt: null,
    endedAt: wpc_end,
  }
  const wpc_snap = wpc_compute(settings, wpc_idle, wpc_end)
  const wpc_ms = wpc_snap.effectiveMs > 0 ? wpc_snap.effectiveMs : wpc_snap.netShiftMs
  if (wpc_holiday) {
    return {
      date,
      kind: 'holiday',
      startedAt: wpc_start,
      endedAt: wpc_end,
      status: 'off',
      earned: wpc_daily,
      effectiveMs: wpc_ms,
      note: note || '节假日加班',
      tripBonus: 0,
      overtimePay: wpc_daily,
    }
  }
  const wpc_makeup = date < today
  return {
    date,
    kind: wpc_makeup ? 'makeup' : 'punch',
    startedAt: wpc_start,
    endedAt: wpc_end,
    status: 'off',
    earned: wpc_snap.earned > 0 ? wpc_snap.earned : wpc_daily,
    effectiveMs: wpc_ms,
    note: note || (wpc_makeup ? '补卡' : '正常打卡'),
    tripBonus: 0,
    overtimePay: 0,
  }
}

/** 事假：当日金额为负日薪 */
export const wpc_makePersonal = (settings: WpcSettings, salaryMap: WpcSalaryMap, date: string): WpcDayMark => {
  const wpc_daily = wpc_dailyForDate(settings, salaryMap, date)
  const wpc_start = wpc_dayStartMs(date) + 9 * 3600000
  return {
    date,
    kind: 'personal',
    startedAt: wpc_start,
    endedAt: wpc_start + 8 * 3600000,
    status: 'off',
    earned: -wpc_daily,
    effectiveMs: 0,
    note: '事假一天',
    tripBonus: 0,
    overtimePay: 0,
  }
}

/** 调休：正常日薪 */
export const wpc_makeComp = (settings: WpcSettings, salaryMap: WpcSalaryMap, date: string): WpcDayMark => {
  const wpc_daily = wpc_dailyForDate(settings, salaryMap, date)
  const wpc_start = wpc_dayStartMs(date) + 9 * 3600000
  return {
    date,
    kind: 'comp',
    startedAt: wpc_start,
    endedAt: wpc_start + 8 * 3600000,
    status: 'off',
    earned: wpc_daily,
    effectiveMs: 8 * 3600000,
    note: '调休一天',
    tripBonus: 0,
    overtimePay: 0,
  }
}

/** 出差：日薪 + 补贴 */
export const wpc_makeTrip = (
  settings: WpcSettings,
  salaryMap: WpcSalaryMap,
  date: string,
  tripBonus = 0,
): WpcDayMark => {
  const wpc_daily = wpc_dailyForDate(settings, salaryMap, date)
  const wpc_bonus = Math.max(0, tripBonus)
  const wpc_start = wpc_dayStartMs(date) + 9 * 3600000
  return {
    date,
    kind: 'trip',
    startedAt: wpc_start,
    endedAt: wpc_start + 8 * 3600000,
    status: 'off',
    earned: wpc_daily + wpc_bonus,
    effectiveMs: 8 * 3600000,
    note: '出差一天',
    tripBonus: wpc_bonus,
    overtimePay: 0,
  }
}

/** 改出差补贴，重新算当日金额 */
export const wpc_withTripBonus = (
  mark: WpcDayMark,
  settings: WpcSettings,
  salaryMap: WpcSalaryMap,
  tripBonus: number,
): WpcDayMark => {
  const wpc_daily = wpc_dailyForDate(settings, salaryMap, mark.date)
  const wpc_bonus = Math.max(0, tripBonus)
  return { ...mark, kind: 'trip', tripBonus: wpc_bonus, earned: wpc_daily + wpc_bonus, note: mark.note || '出差一天' }
}

/** 改节假日加班费 */
export const wpc_withOvertimePay = (mark: WpcDayMark, overtimePay: number): WpcDayMark => {
  const wpc_pay = Math.max(0, overtimePay)
  return {
    ...mark,
    kind: 'holiday',
    overtimePay: wpc_pay,
    earned: wpc_pay,
    note: mark.note || '节假日加班',
  }
}

/** 去掉某一天的人工记录 */
export const wpc_dropMark = (marks: readonly WpcDayMark[], date: string): WpcDayMark[] =>
  marks.filter((item) => item.date !== date)

/** 这一天的祝福语 */
export const wpc_markBlessing = (date: string): string => wpc_dayBlessing(date)

/** 种类文案 */
export const wpc_kindLabel = (kind: WpcMarkKind): string => {
  if (kind === 'personal') return '事假'
  if (kind === 'comp') return '调休'
  if (kind === 'trip') return '出差'
  if (kind === 'holiday') return '假日加班'
  if (kind === 'makeup') return '已打卡'
  return '已打卡'
}

/** 签章上的两个字 */
export const wpc_stampText = (mark: WpcDayMark | undefined, base: string, today: string, date: string): string => {
  if (mark) {
    if (mark.kind === 'personal') return '事假'
    if (mark.kind === 'comp') return '调休'
    if (mark.kind === 'trip') return '出差'
    if (mark.kind === 'holiday') return '加班'
    if (mark.status === 'running') return '在班'
    if (mark.status === 'paused') return '摸鱼'
    return '已打'
  }
  if (date > today) return ''
  if (base === 'work') return '未打'
  return ''
}

/** @deprecated 用 wpc_makePunch */
export const wpc_makeMakeup = wpc_makePunch

/** @deprecated */
export const wpc_makeSpecial = (
  settings: WpcSettings,
  salaryMap: WpcSalaryMap,
  date: string,
  kind: 'personal' | 'comp' | 'trip',
): WpcDayMark => {
  if (kind === 'personal') return wpc_makePersonal(settings, salaryMap, date)
  if (kind === 'comp') return wpc_makeComp(settings, salaryMap, date)
  return wpc_makeTrip(settings, salaryMap, date, 0)
}
