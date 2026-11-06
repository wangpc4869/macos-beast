/** 日薪或月薪 */
export type WpcSalaryMode = 'daily' | 'monthly'

/** 从班表起算，或从点击开始上班起算 */
export type WpcCountMode = 'schedule' | 'now'

/** 一次上下班的状态 */
export type WpcSessionStatus = 'idle' | 'running' | 'paused' | 'off'

/** 当前这一刻落在班次的哪一段 */
export type WpcPhase =
  | 'idle'
  | 'before'
  | 'working'
  | 'lunch'
  | 'overtime'
  | 'after'
  | 'paused'
  | 'off'

/** 内置班次，手改时间后变成 custom */
export type WpcPresetId = 'standard' | 'flex' | 'early' | 'custom'

/**
 * 这一天怎么记进日历
 * punch/makeup = 正常打卡
 * personal = 事假（扣日薪）
 * comp = 调休（正常日薪）
 * trip = 出差（日薪 + 补贴）
 * holiday = 节假日加班（自定义加班费）
 */
export type WpcMarkKind = 'punch' | 'makeup' | 'personal' | 'comp' | 'trip' | 'holiday'

/** 某一天的打卡。earned 可为负，表示事假扣钱 */
export interface WpcDayMark {
  date: string
  kind: WpcMarkKind
  startedAt: number
  endedAt: number | null
  status: 'running' | 'paused' | 'off'
  earned: number
  effectiveMs: number
  note: string
  tripBonus: number
  overtimePay: number
}

/** 月薪覆盖。键是 2026 或 2026-11，值为当月/当年月薪 */
export type WpcSalaryMap = Record<string, number>

/** 今日心情皮肤 */
export type WpcSkinId = 'ledger' | 'night' | 'blaze' | 'slack' | 'fortune' | 'dawn'

/** 一段已经结束的暂停 */
export interface WpcPause {
  start: number
  end: number
}

/** 用户可改的全部参数 */
export interface WpcSettings {
  mode: WpcSalaryMode
  monthlySalary: number
  workDays: number
  dailySalary: number
  startTime: string
  endTime: string
  countMode: WpcCountMode
  deductLunch: boolean
  lunchStart: string
  lunchEnd: string
  countOvertime: boolean
  overtimeRate: number
  preset: WpcPresetId
}

/** 今天这班的过程，金额不存在这里，打开时按时间重算 */
export interface WpcSession {
  status: WpcSessionStatus
  startedAt: number | null
  pauses: WpcPause[]
  pausedAt: number | null
  endedAt: number | null
}

/** 写进本地的一整包状态 */
export interface WpcBundle {
  settings: WpcSettings
  session: WpcSession
  pinned: boolean
  skin: WpcSkinId
  veiled: boolean
  calVeiled: boolean
  marks: WpcDayMark[]
  salaryMap: WpcSalaryMap
}

/** 一个小确幸价位 */
export interface WpcTreat {
  id: string
  name: string
  price: number
}

/** 薪水走到哪一档小确幸 */
export interface WpcTreatView {
  current: WpcTreat | null
  next: WpcTreat | null
  ratio: number
  remain: number
}

/** 某一刻算出来的账 */
export interface WpcSnapshot {
  now: number
  earned: number
  overtimeEarned: number
  regularMs: number
  overtimeMs: number
  effectiveMs: number
  netShiftMs: number
  progress: number
  perSecond: number
  perHour: number
  displayPerSecond: number
  displayPerHour: number
  daily: number
  expected: number
  expectedLabel: string
  remainMs: number
  remainLabel: string
  phase: WpcPhase
  warning: string
  treat: WpcTreatView
}
