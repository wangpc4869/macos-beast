import { wpc_phaseHint, wpc_treatProgress } from './wpc_flavor'
import { wpc_localMidnight, wpc_overlapMs, wpc_parseMinutes } from './wpc_time'
import type { WpcPause, WpcPhase, WpcSession, WpcSettings, WpcSnapshot } from './wpc_types'

/** 把输入收成有限数字 */
const wpc_finite = (value: number): number => (Number.isFinite(value) ? value : 0)

/** 折合日薪。月薪按计薪天数均摊，日薪直接用填写的数 */
export const wpc_dailyOf = (settings: WpcSettings): number => {
  if (settings.mode === 'daily') return Math.max(0, wpc_finite(settings.dailySalary))
  const wpc_days = wpc_finite(settings.workDays)
  if (wpc_days <= 0) return 0
  return Math.max(0, wpc_finite(settings.monthlySalary)) / wpc_days
}

/** 加班倍率锁在 1 到 5 之间 */
const wpc_rateOf = (settings: WpcSettings): number => {
  const wpc_rate = wpc_finite(settings.overtimeRate)
  if (wpc_rate <= 0) return 1.5
  return Math.min(5, Math.max(1, wpc_rate))
}

/** 区间里真正走表的毫秒。摸鱼不算空洞，只用于历史兼容 */
const wpc_coveredMs = (from: number, to: number, holes: readonly WpcPause[]): number => {
  if (!(to > from)) return 0
  let wpc_hole = 0
  for (const wpc_item of holes) {
    wpc_hole += wpc_overlapMs(from, to, wpc_item.start, wpc_item.end)
  }
  return Math.max(0, to - from - wpc_hole)
}

/** 在班表附近找和午休重叠最多的那一段，跨夜班也能对上 */
const wpc_lunchClip = (
  midnight: number,
  shiftStart: number,
  shiftEnd: number,
  settings: WpcSettings,
): [number, number] => {
  if (!settings.deductLunch) return [0, 0]
  const wpc_startMin = wpc_parseMinutes(settings.lunchStart)
  const wpc_endMin = wpc_parseMinutes(settings.lunchEnd)
  let wpc_best: [number, number] = [0, 0]
  let wpc_bestHit = 0
  for (const wpc_day of [-1, 0, 1]) {
    const wpc_base = midnight + wpc_day * 86400000
    let wpc_start = wpc_base + wpc_startMin * 60000
    let wpc_end = wpc_base + wpc_endMin * 60000
    if (wpc_end <= wpc_start) wpc_end += 86400000
    const wpc_hit = wpc_overlapMs(shiftStart, shiftEnd, wpc_start, wpc_end)
    if (wpc_hit > wpc_bestHit) {
      wpc_bestHit = wpc_hit
      wpc_best = [Math.max(wpc_start, shiftStart), Math.min(wpc_end, shiftEnd)]
    }
  }
  return wpc_best
}

/** 班次起止。下班早于上班时，视为跨到第二天清晨 */
const wpc_shiftOf = (anchor: number, settings: WpcSettings): [number, number, number] => {
  const wpc_midnight = wpc_localMidnight(anchor)
  const wpc_start = wpc_midnight + wpc_parseMinutes(settings.startTime) * 60000
  let wpc_end = wpc_midnight + wpc_parseMinutes(settings.endTime) * 60000
  if (wpc_end <= wpc_start) wpc_end += 86400000
  return [wpc_midnight, wpc_start, wpc_end]
}

/** 这一刻人在班次的哪一段 */
const wpc_phaseOf = (
  session: WpcSession,
  now: number,
  shiftStart: number,
  shiftEnd: number,
  lunch: [number, number],
  countOvertime: boolean,
): WpcPhase => {
  if (session.status === 'idle' || session.startedAt === null) return 'idle'
  if (session.status === 'paused') return 'paused'
  if (session.status === 'off') return 'off'
  if (now < shiftStart) return 'before'
  if (lunch[1] > lunch[0] && now >= lunch[0] && now < lunch[1] && now < shiftEnd) return 'lunch'
  if (now >= shiftEnd && countOvertime) return 'overtime'
  if (now >= shiftEnd) return 'after'
  return 'working'
}

/** 按当前参数和班次过程，算出这一刻的账 */
export const wpc_compute = (settings: WpcSettings, session: WpcSession, now: number): WpcSnapshot => {
  const wpc_anchor = session.startedAt ?? now
  const [, wpc_shiftStart, wpc_shiftEnd] = wpc_shiftOf(wpc_anchor, settings)
  const wpc_lunch = wpc_lunchClip(wpc_localMidnight(wpc_anchor), wpc_shiftStart, wpc_shiftEnd, settings)
  const wpc_lunchMs = Math.max(0, wpc_lunch[1] - wpc_lunch[0])
  const wpc_netMs = Math.max(0, wpc_shiftEnd - wpc_shiftStart - wpc_lunchMs)
  const wpc_daily = wpc_dailyOf(settings)
  const wpc_perSecond = wpc_netMs > 0 ? wpc_daily / (wpc_netMs / 1000) : 0
  const wpc_perHour = wpc_perSecond * 3600
  const wpc_rate = wpc_rateOf(settings)
  const wpc_active = session.status !== 'idle' && session.startedAt !== null
  const wpc_regularFrom =
    settings.countMode === 'schedule' ? wpc_shiftStart : (session.startedAt ?? wpc_shiftStart)
  const wpc_otFrom = Math.max(wpc_shiftEnd, session.startedAt ?? wpc_shiftEnd)

  /** 量出到某个时刻为止的正班和加班毫秒 */
  const wpc_measure = (
    payTo: number,
    holes: readonly WpcPause[],
  ): { regularMs: number; overtimeMs: number } => {
    const wpc_raw = wpc_coveredMs(
      Math.max(wpc_regularFrom, wpc_shiftStart),
      Math.min(payTo, wpc_shiftEnd),
      holes,
    )
    const wpc_lunchHit = settings.deductLunch
      ? wpc_coveredMs(Math.max(wpc_regularFrom, wpc_lunch[0]), Math.min(payTo, wpc_lunch[1]), holes)
      : 0
    const wpc_overtimeMs = settings.countOvertime
      ? wpc_coveredMs(Math.max(wpc_otFrom, wpc_shiftEnd), payTo, holes)
      : 0
    return { regularMs: Math.max(0, wpc_raw - wpc_lunchHit), overtimeMs: wpc_overtimeMs }
  }

  // 摸鱼仍算工作中，工资继续加；只有下班才停表。午休靠 lunch 扣，不走暂停空洞
  let wpc_payTo = now
  if (session.status === 'off' && session.endedAt !== null) wpc_payTo = session.endedAt

  const wpc_holes: readonly WpcPause[] = []
  const wpc_current = wpc_active ? wpc_measure(wpc_payTo, wpc_holes) : { regularMs: 0, overtimeMs: 0 }
  const wpc_regularEarned = (wpc_current.regularMs / 1000) * wpc_perSecond
  const wpc_overtimeEarned = (wpc_current.overtimeMs / 1000) * wpc_perSecond * wpc_rate
  const wpc_earned = Math.max(0, wpc_regularEarned + wpc_overtimeEarned)

  const wpc_projected = wpc_active
    ? wpc_measure(Math.max(now, wpc_shiftEnd), wpc_holes)
    : { regularMs: wpc_netMs, overtimeMs: 0 }
  const wpc_projectedEarned =
    (wpc_projected.regularMs / 1000) * wpc_perSecond +
    (wpc_projected.overtimeMs / 1000) * wpc_perSecond * wpc_rate

  let wpc_expected = wpc_active ? Math.max(0, wpc_projectedEarned) : wpc_daily
  let wpc_expectedLabel = '预计今日到手'
  if (session.status === 'off') {
    wpc_expected = wpc_earned
    wpc_expectedLabel = '今日结算'
  } else if (wpc_active && now >= wpc_shiftEnd) {
    wpc_expectedLabel = '今日已到手'
  }

  let wpc_remainLabel = '距下班'
  let wpc_remainMs = 0
  if (now < wpc_shiftStart) {
    wpc_remainLabel = '距上班'
    wpc_remainMs = wpc_shiftStart - now
  } else if (now < wpc_shiftEnd) {
    wpc_remainLabel = '距下班'
    wpc_remainMs = wpc_shiftEnd - now
  } else if (settings.countOvertime && (session.status === 'running' || session.status === 'paused')) {
    wpc_remainLabel = '已加班'
    wpc_remainMs = now - wpc_shiftEnd
  } else {
    wpc_remainLabel = '已到点'
    wpc_remainMs = 0
  }

  const wpc_phase = wpc_phaseOf(session, now, wpc_shiftStart, wpc_shiftEnd, wpc_lunch, settings.countOvertime)
  const wpc_inOvertime =
    settings.countOvertime &&
    session.status !== 'off' &&
    session.status !== 'idle' &&
    now >= wpc_shiftEnd
  const wpc_boost = wpc_inOvertime ? wpc_rate : 1

  let wpc_warning = ''
  if (settings.mode === 'monthly' && wpc_finite(settings.workDays) <= 0) {
    wpc_warning = '每月计薪天数要大于 0'
  } else if (wpc_netMs <= 0) {
    wpc_warning = '有效班次为 0，看看上下班和午休是不是重叠过头了'
  } else if (wpc_netMs < 30 * 60 * 1000) {
    wpc_warning = '有效工时不到半小时，确认一下午休时间'
  }

  return {
    now,
    earned: wpc_earned,
    overtimeEarned: Math.max(0, wpc_overtimeEarned),
    regularMs: wpc_current.regularMs,
    overtimeMs: wpc_current.overtimeMs,
    effectiveMs: wpc_current.regularMs + wpc_current.overtimeMs,
    netShiftMs: wpc_netMs,
    progress: wpc_netMs > 0 ? Math.min(1, wpc_current.regularMs / wpc_netMs) : 0,
    perSecond: wpc_perSecond,
    perHour: wpc_perHour,
    displayPerSecond: wpc_perSecond * wpc_boost,
    displayPerHour: wpc_perHour * wpc_boost,
    daily: wpc_daily,
    expected: wpc_expected,
    expectedLabel: wpc_expectedLabel,
    remainMs: wpc_remainMs,
    remainLabel: wpc_remainLabel,
    phase: wpc_phase,
    warning: wpc_warning,
    treat: wpc_treatProgress(wpc_earned),
  }
}

/** 复制到剪贴板的一段账 */
export const wpc_shareText = (snap: WpcSnapshot): string => {
  const wpc_money = (value: number, digits: number): string =>
    (Number.isFinite(value) ? value : 0).toFixed(digits)
  const wpc_total = Math.floor(Math.max(0, snap.effectiveMs) / 1000)
  const wpc_hour = Math.floor(wpc_total / 3600)
  const wpc_minute = Math.floor((wpc_total % 3600) / 60)
  const wpc_second = wpc_total % 60
  const wpc_pad = (value: number): string => String(value).padStart(2, '0')
  const wpc_hint = wpc_phaseHint(snap.phase)
  return [
    '【牛马一生】',
    `累计工资  ¥${wpc_money(snap.earned, 2)}`,
    `有效工时  ${wpc_hour}:${wpc_pad(wpc_minute)}:${wpc_pad(wpc_second)}`,
    `每秒/时薪  ${wpc_money(snap.displayPerSecond, 4)} / ${wpc_money(snap.displayPerHour, 2)}`,
    `${snap.expectedLabel}  ¥${wpc_money(snap.expected, 2)}`,
    `加班收入  ¥${wpc_money(snap.overtimeEarned, 2)}`,
    `今日进度  ${wpc_money(snap.progress * 100, 1)}%`,
    wpc_hint,
  ].join('\n')
}
