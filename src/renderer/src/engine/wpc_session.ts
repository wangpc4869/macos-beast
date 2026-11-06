import { wpc_idleSession } from './wpc_defaults'
import type { WpcSession } from './wpc_types'

/** 开始新的一班，旧账清掉 */
export const wpc_startSession = (now: number): WpcSession => ({
  status: 'running',
  startedAt: now,
  pauses: [],
  pausedAt: null,
  endedAt: null,
})

/** 摸鱼：状态切到暂停，工资仍继续算。重复点不会叠一段 */
export const wpc_pauseSession = (session: WpcSession, now: number): WpcSession => {
  if (session.status !== 'running') return session
  return { ...session, status: 'paused', pausedAt: now }
}

/** 继续牛马，把刚才那段摸鱼记下来（仅作展示，不算扣薪空洞） */
export const wpc_resumeSession = (session: WpcSession, now: number): WpcSession => {
  if (session.status !== 'paused' || session.pausedAt === null) return session
  return {
    ...session,
    status: 'running',
    pauses: [...session.pauses, { start: session.pausedAt, end: now }],
    pausedAt: null,
  }
}

/** 下班，金额停在这一刻 */
export const wpc_finishSession = (session: WpcSession, now: number): WpcSession => {
  if (session.status !== 'running' && session.status !== 'paused') return session
  const wpc_pauses =
    session.status === 'paused' && session.pausedAt !== null
      ? [...session.pauses, { start: session.pausedAt, end: now }]
      : session.pauses
  return {
    ...session,
    status: 'off',
    pauses: wpc_pauses,
    pausedAt: null,
    endedAt: now,
  }
}

/** 清空今天，回到没上班 */
export const wpc_clearSession = (): WpcSession => wpc_idleSession()

/** 今天已经暂停掉的毫秒，含正在暂停的这一段 */
export const wpc_pausedMs = (session: WpcSession, now: number): number => {
  let wpc_total = 0
  for (const wpc_item of session.pauses) {
    wpc_total += Math.max(0, wpc_item.end - wpc_item.start)
  }
  if (session.status === 'paused' && session.pausedAt !== null) {
    wpc_total += Math.max(0, now - session.pausedAt)
  }
  return wpc_total
}
