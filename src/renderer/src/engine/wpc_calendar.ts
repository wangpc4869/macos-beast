/** 第一次上班：2017 年 8 月 */
export const wpc_CAREER_START = '2017-08-01'
export const wpc_MIN_YEAR = 2017

/** 一天在日历上的底色身份。weekend=普通周末休闲，holiday=法定假日 */
export type WpcDayBase = 'work' | 'weekend' | 'holiday' | 'study' | 'defend' | 'jobhunt' | 'future'

/** 常见法定节假日与调休补班。调休那天算班，假期算休 */
const wpc_holidayRest = new Set<string>([
  '2017-01-01',
  '2017-01-02',
  '2017-01-27',
  '2017-01-28',
  '2017-01-29',
  '2017-01-30',
  '2017-01-31',
  '2017-02-01',
  '2017-02-02',
  '2017-04-02',
  '2017-04-03',
  '2017-04-04',
  '2017-05-01',
  '2017-05-28',
  '2017-05-29',
  '2017-05-30',
  '2017-10-01',
  '2017-10-02',
  '2017-10-03',
  '2017-10-04',
  '2017-10-05',
  '2017-10-06',
  '2017-10-07',
  '2017-10-08',
  '2018-01-01',
  '2018-02-15',
  '2018-02-16',
  '2018-02-17',
  '2018-02-18',
  '2018-02-19',
  '2018-02-20',
  '2018-02-21',
  '2018-04-05',
  '2018-04-06',
  '2018-04-07',
  '2018-04-29',
  '2018-04-30',
  '2018-05-01',
  '2018-06-18',
  '2018-09-24',
  '2018-10-01',
  '2018-10-02',
  '2018-10-03',
  '2018-10-04',
  '2018-10-05',
  '2018-10-06',
  '2018-10-07',
  '2019-01-01',
  '2019-02-04',
  '2019-02-05',
  '2019-02-06',
  '2019-02-07',
  '2019-02-08',
  '2019-02-09',
  '2019-02-10',
  '2019-04-05',
  '2019-04-06',
  '2019-04-07',
  '2019-05-01',
  '2019-05-02',
  '2019-05-03',
  '2019-05-04',
  '2019-06-07',
  '2019-09-13',
  '2019-10-01',
  '2019-10-02',
  '2019-10-03',
  '2019-10-04',
  '2019-10-05',
  '2019-10-06',
  '2019-10-07',
  '2020-01-01',
  '2020-01-24',
  '2020-01-25',
  '2020-01-26',
  '2020-01-27',
  '2020-01-28',
  '2020-01-29',
  '2020-01-30',
  '2020-04-04',
  '2020-04-05',
  '2020-04-06',
  '2020-05-01',
  '2020-05-02',
  '2020-05-03',
  '2020-05-04',
  '2020-05-05',
  '2020-06-25',
  '2020-06-26',
  '2020-06-27',
  '2020-10-01',
  '2020-10-02',
  '2020-10-03',
  '2020-10-04',
  '2020-10-05',
  '2020-10-06',
  '2020-10-07',
  '2020-10-08',
  '2021-01-01',
  '2021-01-02',
  '2021-01-03',
  '2021-02-11',
  '2021-02-12',
  '2021-02-13',
  '2021-02-14',
  '2021-02-15',
  '2021-02-16',
  '2021-02-17',
  '2021-04-03',
  '2021-04-04',
  '2021-04-05',
  '2021-05-01',
  '2021-05-02',
  '2021-05-03',
  '2021-05-04',
  '2021-05-05',
  '2021-06-12',
  '2021-06-13',
  '2021-06-14',
  '2021-09-19',
  '2021-09-20',
  '2021-09-21',
  '2021-10-01',
  '2021-10-02',
  '2021-10-03',
  '2021-10-04',
  '2021-10-05',
  '2021-10-06',
  '2021-10-07',
  '2022-01-01',
  '2022-01-02',
  '2022-01-03',
  '2022-01-31',
  '2022-02-01',
  '2022-02-02',
  '2022-02-03',
  '2022-02-04',
  '2022-02-05',
  '2022-02-06',
  '2022-04-03',
  '2022-04-04',
  '2022-04-05',
  '2022-04-30',
  '2022-05-01',
  '2022-05-02',
  '2022-05-03',
  '2022-05-04',
  '2022-06-03',
  '2022-06-04',
  '2022-06-05',
  '2022-09-10',
  '2022-09-11',
  '2022-09-12',
  '2022-10-01',
  '2022-10-02',
  '2022-10-03',
  '2022-10-04',
  '2022-10-05',
  '2022-10-06',
  '2022-10-07',
  '2023-01-01',
  '2023-01-02',
  '2023-01-21',
  '2023-01-22',
  '2023-01-23',
  '2023-01-24',
  '2023-01-25',
  '2023-01-26',
  '2023-01-27',
  '2023-04-05',
  '2023-04-29',
  '2023-04-30',
  '2023-05-01',
  '2023-05-02',
  '2023-05-03',
  '2023-06-22',
  '2023-06-23',
  '2023-06-24',
  '2023-09-29',
  '2023-09-30',
  '2023-10-01',
  '2023-10-02',
  '2023-10-03',
  '2023-10-04',
  '2023-10-05',
  '2023-10-06',
  '2024-01-01',
  '2024-02-10',
  '2024-02-11',
  '2024-02-12',
  '2024-02-13',
  '2024-02-14',
  '2024-02-15',
  '2024-02-16',
  '2024-02-17',
  '2024-04-04',
  '2024-04-05',
  '2024-04-06',
  '2024-05-01',
  '2024-05-02',
  '2024-05-03',
  '2024-05-04',
  '2024-05-05',
  '2024-06-10',
  '2024-09-15',
  '2024-09-16',
  '2024-09-17',
  '2024-10-01',
  '2024-10-02',
  '2024-10-03',
  '2024-10-04',
  '2024-10-05',
  '2024-10-06',
  '2024-10-07',
  '2025-01-01',
  '2025-01-28',
  '2025-01-29',
  '2025-01-30',
  '2025-01-31',
  '2025-02-01',
  '2025-02-02',
  '2025-02-03',
  '2025-02-04',
  '2025-04-04',
  '2025-04-05',
  '2025-04-06',
  '2025-05-01',
  '2025-05-02',
  '2025-05-03',
  '2025-05-04',
  '2025-05-05',
  '2025-05-31',
  '2025-06-01',
  '2025-06-02',
  '2025-10-01',
  '2025-10-02',
  '2025-10-03',
  '2025-10-04',
  '2025-10-05',
  '2025-10-06',
  '2025-10-07',
  '2025-10-08',
  '2026-01-01',
  '2026-01-02',
  '2026-02-15',
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  '2026-02-19',
  '2026-02-20',
  '2026-02-21',
  '2026-02-22',
  '2026-02-23',
  '2026-04-04',
  '2026-04-05',
  '2026-04-06',
  '2026-05-01',
  '2026-05-02',
  '2026-05-03',
  '2026-05-04',
  '2026-05-05',
  '2026-06-19',
  '2026-06-20',
  '2026-06-21',
  '2026-09-25',
  '2026-09-26',
  '2026-09-27',
  '2026-10-01',
  '2026-10-02',
  '2026-10-03',
  '2026-10-04',
  '2026-10-05',
  '2026-10-06',
  '2026-10-07',
])

const wpc_holidayWork = new Set<string>([
  '2017-01-22',
  '2017-02-04',
  '2017-04-01',
  '2017-05-27',
  '2017-09-30',
  '2018-02-11',
  '2018-02-24',
  '2018-04-08',
  '2018-04-28',
  '2018-09-29',
  '2018-09-30',
  '2019-02-02',
  '2019-02-03',
  '2019-04-28',
  '2019-05-05',
  '2019-09-29',
  '2019-10-12',
  '2020-01-19',
  '2020-04-26',
  '2020-05-09',
  '2020-06-28',
  '2020-09-27',
  '2020-10-10',
  '2021-02-07',
  '2021-02-20',
  '2021-04-25',
  '2021-05-08',
  '2021-09-18',
  '2021-09-26',
  '2021-10-09',
  '2022-01-29',
  '2022-01-30',
  '2022-04-02',
  '2022-04-24',
  '2022-05-07',
  '2022-10-08',
  '2022-10-09',
  '2023-01-28',
  '2023-01-29',
  '2023-04-23',
  '2023-05-06',
  '2023-06-25',
  '2023-10-07',
  '2023-10-08',
  '2024-02-04',
  '2024-02-18',
  '2024-04-07',
  '2024-04-28',
  '2024-05-11',
  '2024-09-14',
  '2024-09-29',
  '2024-10-12',
  '2025-01-26',
  '2025-02-08',
  '2025-04-27',
  '2025-09-28',
  '2025-10-11',
  '2026-01-04',
  '2026-02-14',
  '2026-02-28',
  '2026-05-09',
  '2026-09-20',
  '2026-10-10',
])

const wpc_blessings: readonly string[] = [
  '今天也值得被认真对待',
  '薪水在涨，人也要开心一点',
  '你已经比昨天更稳了',
  '慢慢来，但别停',
  '这一天的光，会记在账本里',
  '辛苦是真的，收获也会是真的',
  '给自己留一口热乎的晚饭',
  '牛马也要有体面的休息',
  '把难的事情拆成一小格',
  '你负责出发，账本负责记账',
  '今天的进度，就是明天的底气',
  '别急着完美，先把事情做完',
  '世界很大，先把这一班走好',
  '你值得一份按时到账的温柔',
  '今天也可以给自己一个小确幸',
]

/** 把日期拆成年月日 */
export const wpc_splitDate = (date: string): { year: number; month: number; day: number } => {
  const [wpc_year, wpc_month, wpc_day] = date.split('-').map(Number)
  return { year: wpc_year, month: wpc_month, day: wpc_day }
}

/** 拼成 YYYY-MM-DD */
export const wpc_joinDate = (year: number, month: number, day: number): string => {
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  return `${year}-${wpc_pad(month)}-${wpc_pad(day)}`
}

/** 2017 年入职前的人生阶段 */
export const wpc_careerPhase = (date: string): WpcDayBase | null => {
  if (date >= wpc_CAREER_START) return null
  if (date < '2017-01-01') return null
  const { month } = wpc_splitDate(date)
  if (month <= 5) return 'study'
  if (month === 6) return 'defend'
  if (month === 7) return 'jobhunt'
  return null
}

/** 阶段文案 */
export const wpc_careerLabel = (base: WpcDayBase): string => {
  if (base === 'study') return '在校准备答辩'
  if (base === 'defend') return '在校答辩'
  if (base === 'jobhunt') return '找工作中'
  if (base === 'weekend') return '周末休闲'
  if (base === 'holiday') return '法定假日'
  if (base === 'work') return '工作日'
  return '还没到这一天'
}

/** 是不是法定放假日（不含普通周末） */
export const wpc_isLegalHoliday = (date: string): boolean => wpc_holidayRest.has(date)

/** 判断这一天默认是班、周末还是法定假 */
export const wpc_dayBase = (date: string, today: string): WpcDayBase => {
  if (date > today) return 'future'
  const wpc_phase = wpc_careerPhase(date)
  if (wpc_phase) return wpc_phase
  if (date < wpc_CAREER_START) return 'future'
  if (wpc_chuxiDays.has(date) || wpc_holidayRest.has(date)) return 'holiday'
  if (wpc_holidayWork.has(date)) return 'work'
  const { year, month, day } = wpc_splitDate(date)
  const wpc_week = new Date(year, month - 1, day).getDay()
  return wpc_week === 0 || wpc_week === 6 ? 'weekend' : 'work'
}

/** 法定假日细分，用来上色和图标 */
export type WpcFestKind =
  | 'newyear'
  | 'chuxi'
  | 'spring'
  | 'qingming'
  | 'labor'
  | 'dragon'
  | 'midautumn'
  | 'national'
  | 'other'

/** 某一天的节日信息。角标用完整名称，不写单字简写 */
export interface WpcFestInfo {
  kind: WpcFestKind
  label: string
}

/** 除夕（农历十二月三十 / 廿九）。优先于春节整段判断 */
const wpc_chuxiDays = new Set<string>([
  '2017-01-27',
  '2018-02-15',
  '2019-02-04',
  '2020-01-24',
  '2021-02-11',
  '2022-01-31',
  '2023-01-21',
  '2024-02-09',
  '2025-01-28',
  '2026-02-16',
])

/** 拼一条完整节日信息 */
const wpc_fest = (kind: WpcFestKind, label: string): WpcFestInfo => ({ kind, label })

/** 按日期猜是哪一个法定假。角标文字与 label 一致 */
export const wpc_festOf = (date: string): WpcFestInfo | null => {
  if (wpc_chuxiDays.has(date)) return wpc_fest('chuxi', '除夕')
  if (!wpc_holidayRest.has(date)) return null
  const { month, day } = wpc_splitDate(date)
  if (month === 1 && day <= 3) return wpc_fest('newyear', '元旦')
  if (month === 10 && day <= 8) return wpc_fest('national', '国庆')
  if (month === 5 && day <= 5) return wpc_fest('labor', '五一')
  if (month === 4 && day <= 7) return wpc_fest('qingming', '清明')
  if ((month === 5 && day >= 25) || (month === 6 && day <= 25)) return wpc_fest('dragon', '端午')
  if (month === 9 && day >= 10 && day <= 30) return wpc_fest('midautumn', '中秋')
  if ((month === 1 && day >= 15) || (month === 2 && day <= 28)) return wpc_fest('spring', '春节')
  return wpc_fest('other', '法定假')
}

/** 班 / 休 / 假 等角标。法定假用完整节日名 */
export const wpc_baseBadge = (base: WpcDayBase, date?: string): string => {
  if (date) {
    const wpc_info = wpc_festOf(date)
    if (wpc_info) return wpc_info.label
  }
  if (base === 'work') return '班'
  if (base === 'weekend') return '休'
  if (base === 'holiday') return '假'
  if (base === 'study') return '学'
  if (base === 'defend') return '辩'
  if (base === 'jobhunt') return '求'
  return ''
}

/** 法定假日展示名，带节日 */
export const wpc_holidayLabel = (date: string): string => {
  const wpc_fest = wpc_festOf(date)
  return wpc_fest ? wpc_fest.label : '法定假日'
}

/** 按日期挑一句祝福，同一天固定 */
export const wpc_dayBlessing = (date: string): string => {
  const { year, month, day } = wpc_splitDate(date)
  const wpc_index = (year * 37 + month * 17 + day * 7) % wpc_blessings.length
  return wpc_blessings[wpc_index]
}

/** 某天 0 点的时间戳 */
export const wpc_dayStartMs = (date: string): number => {
  const { year, month, day } = wpc_splitDate(date)
  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime()
}

/** HH:mm 落到某一天 */
export const wpc_clockOnDate = (date: string, clock: string): number => {
  const { year, month, day } = wpc_splitDate(date)
  const [wpc_hour, wpc_minute] = clock.split(':').map(Number)
  return new Date(year, month - 1, day, wpc_hour, wpc_minute, 0, 0).getTime()
}
