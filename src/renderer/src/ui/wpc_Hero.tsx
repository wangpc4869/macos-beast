import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { wpc_nextQuote, wpc_oxLine, wpc_phaseHint, wpc_rankTitle, wpc_statusText, wpc_workQuotes } from '../engine/wpc_flavor'
import { wpc_pausedMs } from '../engine/wpc_session'
import { wpc_compute, wpc_shareText } from '../engine/wpc_money'
import type { WpcSession, WpcSettings, WpcSkinId, WpcSnapshot } from '../engine/wpc_types'
import { wpc_copyText } from '../wpc_bridge'
import { wpc_formatClock, wpc_formatDay, wpc_formatDuration, wpc_formatFixed, wpc_veilMoney } from './wpc_format'
import { WpcOx } from './wpc_Ox'
import { WpcSeal } from './wpc_Seal'

const wpc_grassBlades = [0, 1, 2, 3, 4, 5, 6, 7] as const

interface WpcHeroProps {
  settings: WpcSettings
  session: WpcSession
  skin: WpcSkinId
  veiled: boolean
  pinned: boolean
  wpc_onPinned: () => void
  wpc_onTreat: (name: string) => void
  wpc_onCopied: (ok: boolean) => void
}

/** 账本卡片：金额按时间重算，只有这块在刷新 */
const wpc_Hero = (props: WpcHeroProps): ReactElement => {
  const { settings, session, skin, veiled, pinned, wpc_onPinned, wpc_onCopied } = props
  const wpc_propsRef = useRef(props)
  wpc_propsRef.current = props
  const wpc_treatReady = useRef(false)
  const wpc_treatId = useRef('')
  const wpc_titleRef = useRef('')
  const wpc_startedRef = useRef(session.startedAt)
  if (wpc_startedRef.current !== session.startedAt) {
    wpc_startedRef.current = session.startedAt
    wpc_treatReady.current = false
  }
  const [wpc_quoteIndex, wpc_setQuoteIndex] = useState(0)
  const [wpc_snap, wpc_setSnap] = useState<WpcSnapshot>(() => wpc_compute(settings, session, Date.now()))

  /** 每跳一次重算账本。窗口藏到后面时放慢，省一点电 */
  const wpc_watch = (): (() => void) => {
    let wpc_timer = 0
    /** 算一帧并排进界面 */
    const wpc_tick = (): void => {
      const wpc_live = wpc_propsRef.current
      const wpc_next = wpc_compute(wpc_live.settings, wpc_live.session, Date.now())
      wpc_setSnap(wpc_next)
      const wpc_title = `¥${wpc_formatFixed(wpc_next.earned, 2)} · 牛马一生`
      if (wpc_title !== wpc_titleRef.current) {
        wpc_titleRef.current = wpc_title
        document.title = wpc_title
        void window.wpc?.wpc_setTitle(wpc_title)
      }
      const wpc_id = wpc_next.treat.current?.id ?? ''
      if (!wpc_treatReady.current) {
        wpc_treatReady.current = true
        wpc_treatId.current = wpc_id
      } else if (wpc_id && wpc_id !== wpc_treatId.current) {
        wpc_treatId.current = wpc_id
        if (wpc_next.treat.current) wpc_propsRef.current.wpc_onTreat(wpc_next.treat.current.name)
      }
    }
    /** 按是否可见决定下一跳的间隔 */
    const wpc_loop = (): void => {
      wpc_tick()
      wpc_timer = window.setTimeout(wpc_loop, document.hidden ? 1000 : 120)
    }
    /** 回到前台立刻补一帧 */
    const wpc_onVisible = (): void => {
      if (!document.hidden) wpc_tick()
    }
    wpc_loop()
    document.addEventListener('visibilitychange', wpc_onVisible)
    /** 卸掉计时 */
    const wpc_stop = (): void => {
      window.clearTimeout(wpc_timer)
      document.removeEventListener('visibilitychange', wpc_onVisible)
    }
    return wpc_stop
  }
  useEffect(wpc_watch, [])

  /** 在班时慢慢换一句碎碎念 */
  const wpc_rotateQuote = (): (() => void) => {
    const wpc_timer = window.setInterval(() => {
      wpc_setQuoteIndex(wpc_nextQuote)
    }, 9000)
    /** 停止轮换 */
    const wpc_stop = (): void => {
      window.clearInterval(wpc_timer)
    }
    return wpc_stop
  }
  useEffect(wpc_rotateQuote, [])

  /** 把这一刻的账抄下来 */
  const wpc_onCopy = (): void => {
    void wpc_copyText(wpc_shareText(wpc_snap)).then(wpc_onCopied)
  }

  const wpc_line = wpc_snap.phase === 'working' ? wpc_workQuotes[wpc_quoteIndex] : wpc_phaseHint(wpc_snap.phase)
  const wpc_treatName = wpc_snap.treat.next?.name ?? '小确幸已集齐'
  const wpc_treatDetail = veiled ? '' : wpc_snap.treat.next ? `还差 ¥${wpc_formatFixed(wpc_snap.treat.remain, 2)}` : '余下的都是盈余'
  const wpc_live = wpc_snap.phase === 'working' || wpc_snap.phase === 'overtime'
  const wpc_shiftHours = wpc_snap.netShiftMs / 3600000
  const wpc_slack = wpc_formatDuration(wpc_pausedMs(session, wpc_snap.now))
  const wpc_perMinute = wpc_snap.displayPerSecond * 60

  return (
    <article className="card ledger wpc-scroll" data-phase={wpc_snap.phase}>
      <header className="ledger-top">
        <div>
          <p className="eyebrow">NIUMA LEDGER · {wpc_formatDay(wpc_snap.now)}</p>
          <h1>累计工资</h1>
        </div>
        <div className="ledger-tools">
          <button type="button" className="chip" onClick={wpc_onCopy}>
            复制结果
          </button>
          <button
            type="button"
            className={pinned ? 'chip is-on' : 'chip'}
            aria-pressed={pinned}
            title="打开后，这个窗口会一直盖在别的软件上面，方便边干活边看累计工资"
            onClick={wpc_onPinned}
          >
            {pinned ? '已置顶 · 浮在最前' : '窗口置顶'}
          </button>
        </div>
      </header>
      <div className="money-row">
        <div>
          <div className="money">
            <span className="currency">¥</span>
            <span className="amount" data-testid="earned">
              {wpc_formatFixed(wpc_snap.earned, 2)}
            </span>
          </div>
          <p className="status">
            <i />
            {wpc_statusText(wpc_snap.phase)}
          </p>
        </div>
        <WpcSeal phase={wpc_snap.phase} progress={wpc_snap.progress} />
      </div>
      <p className="quote">{wpc_line}</p>
      <div className={wpc_live ? 'pasture is-live' : 'pasture'} data-phase={wpc_snap.phase}>
        <span className="ox-say" key={wpc_snap.phase}>
          {wpc_oxLine(wpc_snap.phase)}
        </span>
        <span className="pasture-rate">每分钟 {wpc_veilMoney(`¥${wpc_formatFixed(wpc_perMinute, 2)}`, veiled)}</span>
        <span className="coin a" />
        <span className="coin b" />
        <span className="coin c" />
        <span className="dust a" />
        <span className="dust b" />
        <div className="grass" aria-hidden="true">
          {wpc_grassBlades.map((blade) => (
            <i key={blade} />
          ))}
        </div>
        <div className="pasture-ox" style={{ transform: `translateX(${wpc_snap.progress * 42}%)` }}>
          <WpcOx phase={wpc_snap.phase} skin={skin} />
        </div>
      </div>
      <p className="rank">
        <b>{wpc_rankTitle(wpc_snap.phase, wpc_snap.progress)}</b>
        <span>应上 {wpc_formatFixed(wpc_shiftHours, 1)} 小时</span>
        <span>摸鱼 {wpc_slack}</span>
      </p>
      <section className={`pulse-board is-${wpc_snap.phase}`} aria-label="班次仪表">
        <div className="pulse-duo">
          <div className="pulse-duo-head">
            <div className="pulse-duo-day">
              <em>今日进度</em>
              <b>{wpc_formatFixed(wpc_snap.progress * 100, 1)}%</b>
            </div>
            <div className="pulse-duo-treat">
              <em>
                小确幸 · <strong>{wpc_treatName}</strong>
              </em>
              <span>{wpc_treatDetail || '继续冲'}</span>
            </div>
          </div>
          <div className="pulse-duo-rails" aria-hidden="true">
            <div className="pulse-rail is-day">
              <i style={{ width: `${Math.min(100, wpc_snap.progress * 100)}%` }} />
              <span className="pulse-ticks">
                <em />
                <em />
                <em />
                <em />
              </span>
            </div>
            <div className="pulse-rail is-treat">
              <i style={{ width: `${Math.min(100, wpc_snap.treat.ratio * 100)}%` }} />
            </div>
          </div>
          <p className="pulse-duo-foot">
            {wpc_snap.phase === 'lunch'
              ? '午休停表 · 回来再继续结账'
              : wpc_snap.phase === 'paused'
                ? '摸鱼中 · 工资与进度照样在涨'
                : wpc_snap.phase === 'overtime'
                  ? '加班加成已打开 · 小确幸一并狂奔'
                  : '上轨今日班表 · 下轨下一笔小确幸'}
          </p>
        </div>

        <div className="pulse-grid">
          <div className="pulse-cell tone-time">
            <span className="pulse-ico" aria-hidden>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 7.6v5l3.2 2" />
              </svg>
            </span>
            <div>
              <em>当前时间</em>
              <strong>{wpc_formatClock(wpc_snap.now)}</strong>
            </div>
          </div>
          <div className="pulse-cell tone-work">
            <span className="pulse-ico" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  d="M4.5 17.5c2.2-5 4.4-7.8 7.5-7.8s5.3 2.8 7.5 7.8"
                />
                <circle cx="12" cy="8" r="2.4" fill="currentColor" />
              </svg>
            </span>
            <div>
              <em>有效工时</em>
              <strong>{wpc_formatDuration(wpc_snap.effectiveMs)}</strong>
            </div>
          </div>
          <div className="pulse-cell tone-rate">
            <span className="pulse-ico" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M5 16 10 8l4 5 5-9" />
                <circle cx="19" cy="4.8" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <div>
              <em>每秒 / 每小时</em>
              <strong>
                {wpc_veilMoney(
                  `${wpc_formatFixed(wpc_snap.displayPerSecond, 4)} / ${wpc_formatFixed(wpc_snap.displayPerHour, 2)}`,
                  veiled,
                )}
              </strong>
            </div>
          </div>
          <div className="pulse-cell tone-remain is-hot">
            <span className="pulse-ico" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  d="M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2"
                />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <div>
              <em>{wpc_snap.remainLabel}</em>
              <strong>{wpc_snap.remainLabel === '已到点' ? '--' : wpc_formatDuration(wpc_snap.remainMs)}</strong>
            </div>
          </div>
          <div className="pulse-cell tone-expect">
            <span className="pulse-ico" aria-hidden>
              <svg viewBox="0 0 24 24">
                <rect x="5" y="7" width="14" height="11" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 7V5.8A2.2 2.2 0 0 1 10.2 3.6h3.6A2.2 2.2 0 0 1 16 5.8V7" />
                <circle cx="12" cy="12.5" r="1.6" fill="currentColor" />
              </svg>
            </span>
            <div>
              <em>{wpc_snap.expectedLabel}</em>
              <strong>{wpc_veilMoney(`¥${wpc_formatFixed(wpc_snap.expected, 2)}`, veiled)}</strong>
            </div>
          </div>
          <div className={wpc_snap.overtimeEarned > 0 ? 'pulse-cell tone-ot is-lit' : 'pulse-cell tone-ot'}>
            <span className="pulse-ico" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 3.2 13.4 8.8l5.8.4-4.5 3.6 1.6 5.6L12 15.4 7.7 18.4l1.6-5.6L4.8 9.2l5.8-.4Z"
                />
              </svg>
            </span>
            <div>
              <em>加班收入</em>
              <strong>{wpc_veilMoney(`¥${wpc_formatFixed(wpc_snap.overtimeEarned, 2)}`, veiled)}</strong>
            </div>
          </div>
        </div>
      </section>
      {wpc_snap.warning ? <p className="warning">{wpc_snap.warning}</p> : null}
      <p className="mini-line">
        {wpc_veilMoney(`${wpc_formatFixed(wpc_snap.displayPerHour, 2)} 元/时`, veiled)} · {wpc_snap.remainLabel}{' '}
        {wpc_snap.remainLabel === '已到点' ? '--' : wpc_formatDuration(wpc_snap.remainMs)}
      </p>
    </article>
  )
}

export { wpc_Hero }
export const WpcHero = wpc_Hero
