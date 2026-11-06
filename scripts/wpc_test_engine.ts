import assert from 'node:assert/strict'
import { wpc_defaultSettings } from '../src/renderer/src/engine/wpc_defaults'
import { wpc_compute, wpc_dailyOf } from '../src/renderer/src/engine/wpc_money'
import { wpc_finishSession, wpc_pauseSession, wpc_resumeSession, wpc_startSession } from '../src/renderer/src/engine/wpc_session'
import { wpc_formatFixed } from '../src/renderer/src/ui/wpc_format'
import type { WpcSettings } from '../src/renderer/src/engine/wpc_types'

/** 本地时间，月份从 0 开始，10 月是 11 月 */
const wpc_at = (hour: number, minute: number): number => new Date(2026, 10, 4, hour, minute, 0, 0).getTime()

/** 默认月薪班次上再盖一层 */
const wpc_with = (partial: Partial<WpcSettings>): WpcSettings => ({ ...wpc_defaultSettings(), ...partial })

/** 默认参数要和常见工资条对得上：23000 / 19 天 / 扣午休后 8 小时 */
const wpc_testRates = (): void => {
  const wpc_settings = wpc_defaultSettings()
  const wpc_daily = wpc_dailyOf(wpc_settings)
  const wpc_snap = wpc_compute(wpc_settings, wpc_startSession(wpc_at(9, 0)), wpc_at(9, 0))
  assert.equal(wpc_formatFixed(wpc_daily, 2), '1210.53')
  assert.equal(wpc_formatFixed(wpc_snap.perHour, 2), '151.32')
  assert.equal(wpc_formatFixed(wpc_snap.perSecond, 4), '0.0420')
  assert.equal(wpc_snap.expectedLabel, '预计今日到手')
  assert.ok(Math.abs(wpc_snap.expected - wpc_daily) < 0.001)
}

/** 上满一天，扣掉午休，正好等于日薪 */
const wpc_testFullDay = (): void => {
  const wpc_settings = wpc_defaultSettings()
  const wpc_snap = wpc_compute(wpc_settings, wpc_startSession(wpc_at(9, 0)), wpc_at(18, 0))
  assert.ok(Math.abs(wpc_snap.earned - wpc_snap.daily) < 0.001)
  assert.equal(wpc_snap.overtimeEarned, 0)
  assert.ok(Math.abs(wpc_snap.progress - 1) < 0.0001)
}

/** 午休中间不算钱 */
const wpc_testLunch = (): void => {
  const wpc_settings = wpc_defaultSettings()
  const wpc_snap = wpc_compute(wpc_settings, wpc_startSession(wpc_at(9, 0)), wpc_at(12, 30))
  const wpc_expected = wpc_snap.daily * (3 / 8)
  assert.equal(wpc_snap.phase, 'lunch')
  assert.ok(Math.abs(wpc_snap.earned - wpc_expected) < 0.001)
}

/** 摸鱼半小时，工资照样加，和没摸鱼一样 */
const wpc_testPause = (): void => {
  const wpc_settings = wpc_defaultSettings()
  let wpc_session = wpc_startSession(wpc_at(9, 0))
  wpc_session = wpc_pauseSession(wpc_session, wpc_at(10, 0))
  wpc_session = wpc_resumeSession(wpc_session, wpc_at(10, 30))
  const wpc_snap = wpc_compute(wpc_settings, wpc_session, wpc_at(11, 0))
  const wpc_expected = wpc_snap.daily * (2 / 8)
  assert.ok(Math.abs(wpc_snap.earned - wpc_expected) < 0.001)
  const wpc_whilePaused = wpc_compute(wpc_settings, wpc_pauseSession(wpc_startSession(wpc_at(9, 0)), wpc_at(10, 0)), wpc_at(11, 0))
  assert.ok(Math.abs(wpc_whilePaused.earned - wpc_expected) < 0.001)
  assert.equal(wpc_whilePaused.phase, 'paused')
}

/** 按上班时间会补迟到，从现在起算则不补 */
const wpc_testCountMode = (): void => {
  const wpc_schedule = wpc_compute(wpc_defaultSettings(), wpc_startSession(wpc_at(10, 0)), wpc_at(11, 0))
  const wpc_now = wpc_compute(wpc_with({ countMode: 'now' }), wpc_startSession(wpc_at(10, 0)), wpc_at(11, 0))
  assert.ok(Math.abs(wpc_schedule.earned - wpc_schedule.daily * (2 / 8)) < 0.001)
  assert.ok(Math.abs(wpc_now.earned - wpc_now.daily * (1 / 8)) < 0.001)
}

/** 加班按倍率另算，不回头把正班再乘一遍 */
const wpc_testOvertime = (): void => {
  const wpc_settings = wpc_with({ countOvertime: true, overtimeRate: 1.5 })
  const wpc_snap = wpc_compute(wpc_settings, wpc_startSession(wpc_at(9, 0)), wpc_at(19, 0))
  const wpc_expected = wpc_snap.daily + 1.5 * (wpc_snap.daily / 8)
  assert.equal(wpc_snap.phase, 'overtime')
  assert.ok(Math.abs(wpc_snap.earned - wpc_expected) < 0.001)
  assert.ok(Math.abs(wpc_snap.overtimeEarned - 1.5 * (wpc_snap.daily / 8)) < 0.001)
}

/** 没开加班，到点就停 */
const wpc_testStopAtEnd = (): void => {
  const wpc_snap = wpc_compute(wpc_defaultSettings(), wpc_startSession(wpc_at(9, 0)), wpc_at(20, 0))
  assert.equal(wpc_snap.phase, 'after')
  assert.ok(Math.abs(wpc_snap.earned - wpc_snap.daily) < 0.001)
}

/** 提前下班按实际结算，不再显示满勤预计 */
const wpc_testEarlyOff = (): void => {
  const wpc_session = wpc_finishSession(wpc_startSession(wpc_at(9, 0)), wpc_at(12, 0))
  const wpc_snap = wpc_compute(wpc_defaultSettings(), wpc_session, wpc_at(18, 0))
  assert.equal(wpc_snap.phase, 'off')
  assert.equal(wpc_snap.expectedLabel, '今日结算')
  assert.ok(Math.abs(wpc_snap.expected - wpc_snap.daily * (3 / 8)) < 0.001)
  assert.ok(Math.abs(wpc_snap.earned - wpc_snap.expected) < 0.001)
}

/** 从现在起算而且下午才到，预计到手只算剩下的正班 */
const wpc_testLateProjection = (): void => {
  const wpc_settings = wpc_with({ countMode: 'now' })
  const wpc_snap = wpc_compute(wpc_settings, wpc_startSession(wpc_at(17, 0)), wpc_at(17, 0))
  assert.ok(Math.abs(wpc_snap.expected - wpc_snap.daily / 8) < 0.001)
}

/** 跨夜班能把后半夜算进去 */
const wpc_testOvernight = (): void => {
  const wpc_settings = wpc_with({
    startTime: '22:00',
    endTime: '06:00',
    deductLunch: false,
    preset: 'custom',
  })
  const wpc_start = new Date(2026, 10, 4, 22, 0, 0, 0).getTime()
  const wpc_now = new Date(2026, 10, 5, 0, 0, 0, 0).getTime()
  const wpc_snap = wpc_compute(wpc_settings, wpc_startSession(wpc_start), wpc_now)
  assert.ok(Math.abs(wpc_snap.progress - 2 / 8) < 0.001)
}

const wpc_tests = [
  wpc_testRates,
  wpc_testFullDay,
  wpc_testLunch,
  wpc_testPause,
  wpc_testCountMode,
  wpc_testOvertime,
  wpc_testStopAtEnd,
  wpc_testEarlyOff,
  wpc_testLateProjection,
  wpc_testOvernight,
]

for (const wpc_test of wpc_tests) {
  wpc_test()
}

console.log(`账本测试通过 ${wpc_tests.length} 项`)
