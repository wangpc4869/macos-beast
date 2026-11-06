import { wpc_defaultBundle, wpc_defaultSettings, wpc_idleSession } from './wpc_defaults'
import { wpc_matchPreset } from './wpc_presets'
import { wpc_skinIds } from './wpc_skins'
import type {
  WpcBundle,
  WpcCountMode,
  WpcDayMark,
  WpcMarkKind,
  WpcPause,
  WpcSalaryMap,
  WpcSalaryMode,
  WpcSession,
  WpcSessionStatus,
  WpcSettings,
} from './wpc_types'

const wpc_KEY = 'wpc-niuma-ledger-v2'
const wpc_LEGACY = 'wpc-niuma-ledger-v1'

/** 从几个候选里挑一个合法值 */
const wpc_oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T => {
  if (typeof value === 'string' && options.includes(value as T)) return value as T
  return fallback
}

/** 读一个有限数字，没有就用默认 */
const wpc_num = (value: unknown, fallback: number): number => {
  const wpc_value = typeof value === 'number' ? value : Number.NaN
  return Number.isFinite(wpc_value) ? wpc_value : fallback
}

/** 读布尔 */
const wpc_bool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

/** 读 HH:mm，不像时间就用默认 */
const wpc_clock = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  return /^\d{2}:\d{2}$/.test(value) ? value : fallback
}

/** 把磁盘里的参数洗成完整设置，缺的字段用默认值补上 */
export const wpc_sanitizeSettings = (value: unknown): WpcSettings => {
  const wpc_base = wpc_defaultSettings()
  if (!value || typeof value !== 'object') return wpc_base
  const wpc_raw = value as Partial<WpcSettings>
  const wpc_modes: readonly WpcSalaryMode[] = ['daily', 'monthly']
  const wpc_counts: readonly WpcCountMode[] = ['schedule', 'now']
  const wpc_start = wpc_clock(wpc_raw.startTime, wpc_base.startTime)
  const wpc_end = wpc_clock(wpc_raw.endTime, wpc_base.endTime)
  const wpc_daily = wpc_num(wpc_raw.dailySalary, wpc_base.dailySalary)
  return {
    mode: wpc_oneOf(wpc_raw.mode, wpc_modes, wpc_base.mode),
    monthlySalary: Math.max(0, wpc_num(wpc_raw.monthlySalary, wpc_base.monthlySalary)),
    workDays: wpc_num(wpc_raw.workDays, wpc_base.workDays),
    dailySalary: Math.max(0, wpc_daily === 400 ? wpc_base.dailySalary : wpc_daily),
    startTime: wpc_start,
    endTime: wpc_end,
    countMode: wpc_oneOf(wpc_raw.countMode, wpc_counts, wpc_base.countMode),
    deductLunch: wpc_bool(wpc_raw.deductLunch, wpc_base.deductLunch),
    lunchStart: wpc_clock(wpc_raw.lunchStart, wpc_base.lunchStart),
    lunchEnd: wpc_clock(wpc_raw.lunchEnd, wpc_base.lunchEnd),
    countOvertime: wpc_bool(wpc_raw.countOvertime, wpc_base.countOvertime),
    overtimeRate: wpc_num(wpc_raw.overtimeRate, wpc_base.overtimeRate),
    preset: wpc_matchPreset(wpc_start, wpc_end),
  }
}

/** 旧版 leave 迁成事假 */
const wpc_normalizeKind = (value: unknown): WpcMarkKind => {
  if (value === 'leave') return 'personal'
  const wpc_kinds: readonly WpcMarkKind[] = ['punch', 'makeup', 'personal', 'comp', 'trip', 'holiday']
  return wpc_oneOf(value, wpc_kinds, 'punch')
}

/** 把打卡记录洗干净，坏掉的天直接丢掉 */
const wpc_sanitizeMarks = (value: unknown): WpcDayMark[] => {
  if (!Array.isArray(value)) return []
  const wpc_list: WpcDayMark[] = []
  for (const wpc_item of value) {
    if (!wpc_item || typeof wpc_item !== 'object') continue
    const wpc_raw = wpc_item as Partial<WpcDayMark> & { kind?: string }
    if (typeof wpc_raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(wpc_raw.date)) continue
    if (typeof wpc_raw.startedAt !== 'number' || !Number.isFinite(wpc_raw.startedAt)) continue
    const wpc_status = wpc_raw.status === 'running' || wpc_raw.status === 'paused' || wpc_raw.status === 'off' ? wpc_raw.status : 'off'
    const wpc_ended = typeof wpc_raw.endedAt === 'number' && Number.isFinite(wpc_raw.endedAt) ? wpc_raw.endedAt : null
    const wpc_earned = wpc_num(wpc_raw.earned, 0)
    wpc_list.push({
      date: wpc_raw.date,
      kind: wpc_normalizeKind(wpc_raw.kind),
      startedAt: wpc_raw.startedAt,
      endedAt: wpc_ended,
      status: wpc_status,
      earned: Number.isFinite(wpc_earned) ? wpc_earned : 0,
      effectiveMs: Math.max(0, wpc_num(wpc_raw.effectiveMs, 0)),
      note: typeof wpc_raw.note === 'string' ? wpc_raw.note.slice(0, 80) : '',
      tripBonus: Math.max(0, wpc_num(wpc_raw.tripBonus, 0)),
      overtimePay: Math.max(0, wpc_num(wpc_raw.overtimePay, 0)),
    })
  }
  return wpc_list
}

/** 把月/年薪覆盖洗干净 */
const wpc_sanitizeSalaryMap = (value: unknown): WpcSalaryMap => {
  if (!value || typeof value !== 'object') return {}
  const wpc_map: WpcSalaryMap = {}
  for (const [wpc_key, wpc_val] of Object.entries(value as Record<string, unknown>)) {
    if (!/^\d{4}(-\d{2})?$/.test(wpc_key)) continue
    const wpc_numVal = typeof wpc_val === 'number' ? wpc_val : Number(wpc_val)
    if (!Number.isFinite(wpc_numVal) || wpc_numVal < 0) continue
    wpc_map[wpc_key] = wpc_numVal
  }
  return wpc_map
}

/** 把暂停记录洗干净，坏数据直接丢掉 */
const wpc_sanitizePauses = (value: unknown): WpcPause[] => {
  if (!Array.isArray(value)) return []
  const wpc_list: WpcPause[] = []
  for (const wpc_item of value) {
    if (!wpc_item || typeof wpc_item !== 'object') continue
    const wpc_raw = wpc_item as Partial<WpcPause>
    if (typeof wpc_raw.start !== 'number' || typeof wpc_raw.end !== 'number') continue
    if (!Number.isFinite(wpc_raw.start) || !Number.isFinite(wpc_raw.end)) continue
    if (wpc_raw.end <= wpc_raw.start) continue
    wpc_list.push({ start: wpc_raw.start, end: wpc_raw.end })
  }
  return wpc_list
}

/** 把磁盘里的班次洗成可用过程 */
export const wpc_sanitizeSession = (value: unknown): WpcSession => {
  const wpc_base = wpc_idleSession()
  if (!value || typeof value !== 'object') return wpc_base
  const wpc_raw = value as Partial<WpcSession>
  const wpc_states: readonly WpcSessionStatus[] = ['idle', 'running', 'paused', 'off']
  const wpc_status = wpc_oneOf(wpc_raw.status, wpc_states, 'idle')
  const wpc_started = typeof wpc_raw.startedAt === 'number' && Number.isFinite(wpc_raw.startedAt) ? wpc_raw.startedAt : null
  if (wpc_status !== 'idle' && wpc_started === null) return wpc_base
  const wpc_paused = typeof wpc_raw.pausedAt === 'number' && Number.isFinite(wpc_raw.pausedAt) ? wpc_raw.pausedAt : null
  const wpc_ended = typeof wpc_raw.endedAt === 'number' && Number.isFinite(wpc_raw.endedAt) ? wpc_raw.endedAt : null
  return {
    status: wpc_status,
    startedAt: wpc_status === 'idle' ? null : wpc_started,
    pauses: wpc_sanitizePauses(wpc_raw.pauses),
    pausedAt: wpc_status === 'paused' ? wpc_paused : null,
    endedAt: wpc_status === 'off' ? wpc_ended : null,
  }
}

/** 读本地账本。先读新钥匙，没有就迁旧钥匙，坏了才回默认 */
export const wpc_loadBundle = (): WpcBundle => {
  try {
    const wpc_raw = localStorage.getItem(wpc_KEY) ?? localStorage.getItem(wpc_LEGACY)
    if (!wpc_raw) return wpc_defaultBundle()
    const wpc_parsed = JSON.parse(wpc_raw) as Partial<WpcBundle>
    const wpc_bundle = {
      settings: wpc_sanitizeSettings(wpc_parsed.settings),
      session: wpc_sanitizeSession(wpc_parsed.session),
      pinned: wpc_parsed.pinned === true,
      skin: wpc_oneOf(wpc_parsed.skin, wpc_skinIds, 'ledger'),
      veiled: wpc_parsed.veiled === true,
      calVeiled: wpc_parsed.calVeiled === true,
      marks: wpc_sanitizeMarks(wpc_parsed.marks),
      salaryMap: wpc_sanitizeSalaryMap(wpc_parsed.salaryMap),
    }
    if (!localStorage.getItem(wpc_KEY)) wpc_saveBundle(wpc_bundle)
    return wpc_bundle
  } catch {
    return wpc_defaultBundle()
  }
}

/** 把账本写进本地。关掉应用再打开，班次和日历都还在 */
export const wpc_saveBundle = (bundle: WpcBundle): void => {
  try {
    const wpc_payload = JSON.stringify({ version: 3, ...bundle })
    localStorage.setItem(wpc_KEY, wpc_payload)
    localStorage.setItem(wpc_LEGACY, wpc_payload)
  } catch {
    /* 磁盘写失败时继续跑，这一次只是不记住 */
  }
}
