import { useRef, useState } from 'react'
import type { FocusEvent, ReactElement, WheelEvent } from 'react'
import { wpc_compute, wpc_dailyOf } from '../engine/wpc_money'
import { wpc_countMonth } from '../engine/wpc_marks'
import { wpc_idleSession } from '../engine/wpc_defaults'
import { wpc_matchPreset, wpc_presetChoices } from '../engine/wpc_presets'
import type { WpcPresetChoice } from '../engine/wpc_presets'
import { wpc_clearSession, wpc_finishSession, wpc_pauseSession, wpc_resumeSession, wpc_startSession } from '../engine/wpc_session'
import type { WpcDayMark, WpcSalaryMap, WpcSession, WpcSettings } from '../engine/wpc_types'
import { wpc_clampNumber, wpc_formatFixed, wpc_readNumber, wpc_veilMoney } from './wpc_format'
import { WpcCalendar } from './wpc_Calendar'
import { WpcTimeField } from './wpc_TimeField'

const wpc_rateChoices = [1.5, 2, 3] as const

/** 滚轮不改数字，避免账本被误触 */
const wpc_stopWheel = (event: WheelEvent<HTMLInputElement>): void => {
  event.currentTarget.blur()
}

interface WpcDeskProps {
  settings: WpcSettings
  session: WpcSession
  advancedOpen: boolean
  veiled: boolean
  marks: readonly WpcDayMark[]
  salaryMap: WpcSalaryMap
  calVeiled: boolean
  wpc_onSettings: (next: WpcSettings) => void
  wpc_onSession: (next: WpcSession) => void
  wpc_onMarks: (next: WpcDayMark[]) => void
  wpc_onSalaryMap: (next: WpcSalaryMap) => void
  wpc_onCalVeiled: (next: boolean) => void
  wpc_onAdvanced: (open: boolean) => void
}

/** 右侧工时和薪水设置 */
const wpc_Desk = (props: WpcDeskProps): ReactElement => {
  const {
    settings,
    session,
    advancedOpen,
    veiled,
    marks,
    salaryMap,
    calVeiled,
    wpc_onSettings,
    wpc_onSession,
    wpc_onMarks,
    wpc_onSalaryMap,
    wpc_onCalVeiled,
    wpc_onAdvanced,
  } = props
  const [wpc_armClear, wpc_setArmClear] = useState(false)
  const [wpc_calOpen, wpc_setCalOpen] = useState(false)
  const wpc_armTimer = useRef(0)

  /** 改一部分参数，其余保持 */
  const wpc_patch = (partial: Partial<WpcSettings>): void => {
    wpc_onSettings({ ...settings, ...partial })
  }

  /** 选一个预设班次 */
  const wpc_onPreset = (choice: WpcPresetChoice): void => {
    wpc_patch({ preset: choice.id, startTime: choice.start, endTime: choice.end })
  }

  /** 改上班时间 */
  const wpc_onStartTime = (value: string): void => {
    wpc_patch({ startTime: value, preset: wpc_matchPreset(value, settings.endTime) })
  }

  /** 改下班时间 */
  const wpc_onEndTime = (value: string): void => {
    wpc_patch({ endTime: value, preset: wpc_matchPreset(settings.startTime, value) })
  }

  /** 计薪天数离焦时收成 1 到 31，保留一位小数 */
  const wpc_onDaysBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const wpc_days = Math.round(wpc_clampNumber(Number(event.currentTarget.value), 1, 31) * 10) / 10
    wpc_patch({ workDays: wpc_days })
  }

  /** 加班倍率离焦时收成 1 到 5 */
  const wpc_onRateBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const wpc_rate = wpc_clampNumber(Number(event.currentTarget.value), 1, 5)
    wpc_patch({ overtimeRate: Math.round(wpc_rate * 10) / 10 })
  }

  /** 开始、继续，看现在停在哪 */
  const wpc_onPrimary = (): void => {
    const wpc_now = Date.now()
    if (session.status === 'paused') {
      wpc_onSession(wpc_resumeSession(session, wpc_now))
      return
    }
    if (session.status === 'running') return
    wpc_onSession(wpc_startSession(wpc_now))
  }

  /** 暂停 */
  const wpc_onPause = (): void => {
    wpc_onSession(wpc_pauseSession(session, Date.now()))
  }

  /** 下班 */
  const wpc_onFinish = (): void => {
    wpc_onSession(wpc_finishSession(session, Date.now()))
  }

  /** 清空前先让人再点一次 */
  const wpc_onClear = (): void => {
    if (!wpc_armClear) {
      wpc_setArmClear(true)
      window.clearTimeout(wpc_armTimer.current)
      wpc_armTimer.current = window.setTimeout(() => {
        wpc_setArmClear(false)
      }, 2400)
      return
    }
    window.clearTimeout(wpc_armTimer.current)
    wpc_setArmClear(false)
    wpc_onSession(wpc_clearSession())
  }

  /** 展开或收起午休和加班 */
  const wpc_toggleAdvanced = (): void => {
    wpc_onAdvanced(!advancedOpen)
  }

  const wpc_now = new Date()
  const wpc_monthCount = wpc_countMonth(marks, wpc_now.getFullYear(), wpc_now.getMonth())
  const wpc_daily = wpc_dailyOf(settings)
  const wpc_netHours = wpc_compute(settings, wpc_idleSession(), Date.now()).netShiftMs / 3600000
  const wpc_primaryLabel =
    session.status === 'paused' ? '继续牛马' : session.status === 'running' ? '牛马中' : '开始牛马'
  const wpc_running = session.status === 'running'
  const wpc_canPause = session.status === 'running'
  const wpc_canFinish = session.status === 'running' || session.status === 'paused'

  return (
    <section className="card desk">
      <div className="section-title">
        <span>工时设定</span>
        <button type="button" className={wpc_armClear ? 'link danger' : 'link'} onClick={wpc_onClear}>
          {wpc_armClear ? '再点确认清空' : '清空今日'}
        </button>
      </div>
      <div className="desk-scroll wpc-scroll">
        <div className="presets">
          {wpc_presetChoices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className={settings.preset === choice.id ? 'is-on' : undefined}
              aria-pressed={settings.preset === choice.id}
              onClick={() => {
                wpc_onPreset(choice)
              }}
            >
              <b>{choice.name}</b>
              <small>{choice.range}</small>
            </button>
          ))}
          <button
            type="button"
            className="preset-cal"
            onClick={() => {
              wpc_setCalOpen(true)
            }}
          >
            <b>打卡</b>
            <small>本月 {wpc_monthCount} 天</small>
          </button>
        </div>
        <p className="block-label">薪资模式</p>
        <div className="segment" role="group" aria-label="薪资模式">
          <button
            type="button"
            className={settings.mode === 'daily' ? 'is-on' : undefined}
            onClick={() => {
              wpc_patch({ mode: 'daily' })
            }}
          >
            日薪
          </button>
          <button
            type="button"
            className={settings.mode === 'monthly' ? 'is-on' : undefined}
            onClick={() => {
              wpc_patch({ mode: 'monthly' })
            }}
          >
            月薪
          </button>
        </div>
        {settings.mode === 'monthly' ? (
          <div className="grid-2">
            <label className="field">
              月薪（元）
              <input
                className={veiled ? 'num is-secret' : 'num'}
                inputMode="decimal"
                readOnly={veiled}
                placeholder={veiled ? '••••' : undefined}
                value={veiled ? '' : String(settings.monthlySalary)}
                onWheel={wpc_stopWheel}
                onChange={(event) => {
                  wpc_patch({ monthlySalary: Math.max(0, wpc_readNumber(event.currentTarget.value, settings.monthlySalary)) })
                }}
              />
            </label>
            <label className="field">
              每月计薪天数
              <input
                className="num"
                inputMode="decimal"
                value={String(settings.workDays)}
                onWheel={wpc_stopWheel}
                onChange={(event) => {
                  wpc_patch({ workDays: Math.max(0, wpc_readNumber(event.currentTarget.value, settings.workDays)) })
                }}
                onBlur={wpc_onDaysBlur}
              />
            </label>
          </div>
        ) : (
          <label className="field">
            日薪（元）
            <input
              className={veiled ? 'num is-secret' : 'num'}
              inputMode="decimal"
              readOnly={veiled}
              placeholder={veiled ? '••••' : undefined}
              value={veiled ? '' : String(settings.dailySalary)}
              onWheel={wpc_stopWheel}
              onChange={(event) => {
                wpc_patch({ dailySalary: Math.max(0, wpc_readNumber(event.currentTarget.value, settings.dailySalary)) })
              }}
            />
          </label>
        )}
        {settings.mode === 'monthly' ? (
          <div className="derived">
            <span>折合日薪</span>
            <strong>{wpc_veilMoney(`${wpc_formatFixed(wpc_daily, 2)} 元`, veiled)}</strong>
          </div>
        ) : null}
        <div className="grid-2">
          <WpcTimeField label="上班时间" value={settings.startTime} onChange={wpc_onStartTime} />
          <WpcTimeField label="下班时间" value={settings.endTime} onChange={wpc_onEndTime} />
        </div>
        <p className="note">应上 {wpc_formatFixed(wpc_netHours, 1)} 小时。上下键改时分，按住 Shift 分钟一次跳 5。</p>
        <p className="block-label">起算方式</p>
        <div className="segment" role="group" aria-label="起算方式">
          <button
            type="button"
            className={settings.countMode === 'schedule' ? 'is-on' : undefined}
            onClick={() => {
              wpc_patch({ countMode: 'schedule' })
            }}
          >
            按上班时间
          </button>
          <button
            type="button"
            className={settings.countMode === 'now' ? 'is-on' : undefined}
            onClick={() => {
              wpc_patch({ countMode: 'now' })
            }}
          >
            从现在起算
          </button>
        </div>
        <p className="note">改完立刻重算。按上班时间会把迟到补进账里。</p>
        <div className={advancedOpen ? 'advanced is-open' : 'advanced'}>
          <div className="section-title sub">
            <span>高级选项</span>
            <button type="button" className="link" onClick={wpc_toggleAdvanced}>
              {advancedOpen ? '收起' : '午休 / 加班'}
            </button>
          </div>
          <div className="advanced-body">
            <div className="advanced-inner">
              <button
                type="button"
                role="switch"
                aria-checked={settings.deductLunch}
                className={settings.deductLunch ? 'switch is-on' : 'switch'}
                onClick={() => {
                  wpc_patch({ deductLunch: !settings.deductLunch })
                }}
              >
                <span>扣除午休</span>
                <i />
              </button>
              <div className="grid-2">
                <WpcTimeField
                  label="午休开始"
                  value={settings.lunchStart}
                  disabled={!settings.deductLunch}
                  onChange={(next) => {
                    wpc_patch({ lunchStart: next })
                  }}
                />
                <WpcTimeField
                  label="午休结束"
                  value={settings.lunchEnd}
                  disabled={!settings.deductLunch}
                  onChange={(next) => {
                    wpc_patch({ lunchEnd: next })
                  }}
                />
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.countOvertime}
                className={settings.countOvertime ? 'switch is-on' : 'switch'}
                onClick={() => {
                  wpc_patch({ countOvertime: !settings.countOvertime })
                }}
              >
                <span>下班后继续统计加班</span>
                <i />
              </button>
              {settings.countOvertime ? (
                <div className="rates">
                  {wpc_rateChoices.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      className={settings.overtimeRate === rate ? 'is-on' : undefined}
                      onClick={() => {
                        wpc_patch({ overtimeRate: rate })
                      }}
                    >
                      {rate} 倍
                    </button>
                  ))}
                  <label className="field">
                    自定义
                    <input
                      className="num"
                      inputMode="decimal"
                      value={String(settings.overtimeRate)}
                      onWheel={wpc_stopWheel}
                      onChange={(event) => {
                        wpc_patch({
                          overtimeRate: Math.max(0, wpc_readNumber(event.currentTarget.value, settings.overtimeRate)),
                        })
                      }}
                      onBlur={wpc_onRateBlur}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <p className="fine">数据不离开这台 Mac。合上窗口也没关系，下次打开按时间把账补齐。</p>
      </div>
      <div className="actions">
        <button type="button" className="btn btn-primary" data-testid="start" disabled={wpc_running} onClick={wpc_onPrimary}>
          {wpc_primaryLabel}
        </button>
        <button type="button" className="btn btn-ghost" data-testid="pause" disabled={!wpc_canPause} onClick={wpc_onPause}>
          摸鱼
        </button>
        <button type="button" className="btn btn-danger" data-testid="finish" disabled={!wpc_canFinish} onClick={wpc_onFinish}>
          下班
        </button>
      </div>
      {wpc_calOpen ? (
        <WpcCalendar
          settings={settings}
          session={session}
          marks={marks}
          salaryMap={salaryMap}
          calVeiled={calVeiled}
          wpc_onMarks={wpc_onMarks}
          wpc_onSalaryMap={wpc_onSalaryMap}
          wpc_onCalVeiled={wpc_onCalVeiled}
          wpc_onClose={() => {
            wpc_setCalOpen(false)
          }}
        />
      ) : null}
    </section>
  )
}

export { wpc_Desk }
export const WpcDesk = wpc_Desk
