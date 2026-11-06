import type { WpcBundle, WpcSession, WpcSettings } from './wpc_types'

/** 和常见月薪展示一致的初始参数：23000 / 21.5 天，朝九晚六，扣一小时午休 */
export const wpc_defaultSettings = (): WpcSettings => ({
  mode: 'monthly',
  monthlySalary: 23000,
  workDays: 21.5,
  dailySalary: 1000,
  startTime: '09:00',
  endTime: '18:00',
  countMode: 'schedule',
  deductLunch: true,
  lunchStart: '12:00',
  lunchEnd: '13:00',
  countOvertime: false,
  overtimeRate: 1.5,
  preset: 'standard',
})

/** 还没上班的空班次 */
export const wpc_idleSession = (): WpcSession => ({
  status: 'idle',
  startedAt: null,
  pauses: [],
  pausedAt: null,
  endedAt: null,
})

/** 第一次打开时的整包状态 */
export const wpc_defaultBundle = (): WpcBundle => ({
  settings: wpc_defaultSettings(),
  session: wpc_idleSession(),
  pinned: false,
  skin: 'ledger',
  veiled: false,
  calVeiled: false,
  marks: [],
  salaryMap: {},
})
