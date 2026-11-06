import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'
import {
  wpc_baseBadge,
  wpc_CAREER_START,
  wpc_careerLabel,
  wpc_dayBase,
  wpc_festOf,
  wpc_holidayLabel,
  wpc_MIN_YEAR,
} from '../engine/wpc_calendar'
import {
  wpc_canEditDay,
  wpc_countMonth,
  wpc_dailyForDate,
  wpc_dateKey,
  wpc_dropMark,
  wpc_kindLabel,
  wpc_makeComp,
  wpc_makePersonal,
  wpc_makePunch,
  wpc_makeTrip,
  wpc_markBlessing,
  wpc_markFromSession,
  wpc_mergeMarks,
  wpc_monthCells,
  wpc_patchSalaryMap,
  wpc_salaryOverride,
  wpc_stampText,
  wpc_withOvertimePay,
  wpc_withTripBonus,
} from '../engine/wpc_marks'
import type { WpcDayMark, WpcSalaryMap, WpcSession, WpcSettings } from '../engine/wpc_types'
import { WpcFestIcon } from './wpc_FestIcon'
import { wpc_formatClock, wpc_formatDuration, wpc_formatFixed, wpc_readNumber } from './wpc_format'
import { wpc_moodOf, WpcMood } from './wpc_Mood'
import { WpcStamp } from './wpc_Stamp'

interface WpcCalendarProps {
  settings: WpcSettings
  session: WpcSession
  marks: readonly WpcDayMark[]
  salaryMap: WpcSalaryMap
  calVeiled: boolean
  wpc_onMarks: (next: WpcDayMark[]) => void
  wpc_onSalaryMap: (next: WpcSalaryMap) => void
  wpc_onCalVeiled: (next: boolean) => void
  wpc_onClose: () => void
}

const wpc_week = ['日', '一', '二', '三', '四', '五', '六'] as const

/** 本月打卡日历。签章、节日色、情绪小人、折叠操作都在这里 */
const wpc_Calendar = (props: WpcCalendarProps): ReactElement => {
  const {
    settings,
    session,
    marks,
    salaryMap,
    calVeiled,
    wpc_onMarks,
    wpc_onSalaryMap,
    wpc_onCalVeiled,
    wpc_onClose,
  } = props
  const wpc_todayDate = new Date()
  const [wpc_year, wpc_setYear] = useState(wpc_todayDate.getFullYear())
  const [wpc_month, wpc_setMonth] = useState(wpc_todayDate.getMonth())
  const [wpc_mode, wpc_setMode] = useState<'month' | 'year'>('month')
  const [wpc_now, wpc_setNow] = useState(() => Date.now())
  const [wpc_picked, wpc_setPicked] = useState(wpc_dateKey(Date.now()))
  const [wpc_tripDraft, wpc_setTripDraft] = useState('0')
  const [wpc_otDraft, wpc_setOtDraft] = useState('0')
  const [wpc_monthDraft, wpc_setMonthDraft] = useState('')
  const [wpc_yearDraft, wpc_setYearDraft] = useState('')
  const [wpc_salaryOpen, wpc_setSalaryOpen] = useState(false)
  const [wpc_editOpen, wpc_setEditOpen] = useState(false)
  const [wpc_scrolling, wpc_setScrolling] = useState(false)
  const wpc_scrollTimer = useRef(0)
  const wpc_panelRef = useRef<HTMLElement | null>(null)

  /** 开着的时候，今天这班的金额跟着走 */
  const wpc_tick = (): (() => void) => {
    const wpc_timer = window.setInterval(() => {
      wpc_setNow(Date.now())
    }, 1000)
    /** 关掉刷新 */
    const wpc_stop = (): void => {
      window.clearInterval(wpc_timer)
    }
    return wpc_stop
  }
  useEffect(wpc_tick, [])

  /** 按 Esc 收起日历 */
  const wpc_listen = (): (() => void) => {
    /** 只认退出键 */
    const wpc_onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      wpc_onClose()
    }
    window.addEventListener('keydown', wpc_onKey)
    /** 卸掉按键 */
    const wpc_stop = (): void => {
      window.removeEventListener('keydown', wpc_onKey)
    }
    return wpc_stop
  }
  useEffect(wpc_listen, [wpc_onClose])

  /** 换月/年时，把月薪输入框对齐 */
  const wpc_syncSalaryDraft = (): void => {
    const wpc_over = wpc_salaryOverride(salaryMap, wpc_year, wpc_month)
    wpc_setMonthDraft(wpc_over.month === null ? '' : String(wpc_over.month))
    wpc_setYearDraft(wpc_over.year === null ? '' : String(wpc_over.year))
  }
  useEffect(wpc_syncSalaryDraft, [salaryMap, wpc_year, wpc_month])

  /** 卸掉滚动提示计时 */
  const wpc_clearScrollTimer = (): void => {
    window.clearTimeout(wpc_scrollTimer.current)
  }
  useEffect(() => wpc_clearScrollTimer, [])

  /** 滚动时短暂露出滚动条 */
  const wpc_onPanelScroll = (): void => {
    wpc_setScrolling(true)
    wpc_clearScrollTimer()
    wpc_scrollTimer.current = window.setTimeout(() => {
      wpc_setScrolling(false)
    }, 700)
  }

  /** 点选一天时，把补贴/加班费草稿带上，编辑条先收起 */
  const wpc_pickDay = (date: string): void => {
    wpc_setPicked(date)
    wpc_setEditOpen(false)
    const wpc_mark = marks.find((item) => item.date === date)
    wpc_setTripDraft(String(wpc_mark?.tripBonus ?? 0))
    const wpc_ot = wpc_mark?.overtimePay || wpc_dailyForDate(settings, salaryMap, date)
    wpc_setOtDraft(wpc_formatFixed(wpc_ot, 2))
  }

  const wpc_live = wpc_markFromSession(settings, session, wpc_now, salaryMap)
  const wpc_shown = wpc_live ? wpc_mergeMarks(marks, wpc_live) : marks
  const wpc_cells = wpc_monthCells(wpc_year, wpc_month)
  const wpc_today = wpc_dateKey(wpc_now)
  const wpc_pickedMark = wpc_shown.find((item) => item.date === wpc_picked) ?? null
  const wpc_pickedBase = wpc_dayBase(wpc_picked, wpc_today)
  const wpc_pickedFest = wpc_festOf(wpc_picked)
  const wpc_dayPay = wpc_dailyForDate(settings, salaryMap, wpc_picked)
  const wpc_monthCount = wpc_countMonth(wpc_shown, wpc_year, wpc_month)
  const wpc_monthEarn = wpc_shown
    .filter((item) => item.date.startsWith(`${wpc_year}-${String(wpc_month + 1).padStart(2, '0')}`))
    .reduce((sum, item) => sum + item.earned, 0)
  const wpc_monthMs = wpc_shown
    .filter((item) => item.date.startsWith(`${wpc_year}-${String(wpc_month + 1).padStart(2, '0')}`))
    .reduce((sum, item) => sum + item.effectiveMs, 0)
  const wpc_atMinMonth = wpc_year === wpc_MIN_YEAR && wpc_month === 0
  const wpc_atMaxMonth =
    wpc_year > wpc_todayDate.getFullYear() ||
    (wpc_year === wpc_todayDate.getFullYear() && wpc_month >= wpc_todayDate.getMonth())
  const wpc_editable = wpc_canEditDay(wpc_picked, wpc_today) && !(wpc_live && wpc_live.date === wpc_picked)
  const wpc_moneyTone = !wpc_pickedMark ? 'idle' : wpc_pickedMark.earned < 0 ? 'loss' : 'gain'
  const wpc_mood = wpc_moodOf(wpc_pickedMark, wpc_pickedBase, wpc_today, wpc_picked)
  const wpc_salaryHint = wpc_salaryOverride(salaryMap, wpc_year, wpc_month)
  const wpc_years = Array.from(
    { length: wpc_todayDate.getFullYear() - wpc_MIN_YEAR + 1 },
    (_, index) => wpc_MIN_YEAR + index,
  )
  const wpc_baseName =
    wpc_pickedBase === 'holiday' ? wpc_holidayLabel(wpc_picked) : wpc_careerLabel(wpc_pickedBase)

  /** 金额显隐文案 */
  const wpc_money = (value: number): string => {
    if (calVeiled) return '••••'
    const wpc_sign = value > 0 ? '+' : ''
    return `${wpc_sign}¥${wpc_formatFixed(value, 2)}`
  }

  /** 上一段 */
  const wpc_prev = (): void => {
    if (wpc_mode === 'year') {
      if (wpc_year <= wpc_MIN_YEAR) return
      wpc_setYear((value) => value - 1)
      return
    }
    if (wpc_atMinMonth) return
    if (wpc_month === 0) {
      wpc_setYear((value) => value - 1)
      wpc_setMonth(11)
      return
    }
    wpc_setMonth((value) => value - 1)
  }

  /** 下一段 */
  const wpc_next = (): void => {
    if (wpc_mode === 'year') {
      if (wpc_year >= wpc_todayDate.getFullYear()) return
      wpc_setYear((value) => value + 1)
      return
    }
    if (wpc_atMaxMonth) return
    if (wpc_month === 11) {
      wpc_setYear((value) => value + 1)
      wpc_setMonth(0)
      return
    }
    wpc_setMonth((value) => value + 1)
  }

  /** 直接跳到某一年 */
  const wpc_jumpYear = (event: ChangeEvent<HTMLSelectElement>): void => {
    wpc_setYear(Number(event.currentTarget.value))
  }

  /** 直接跳到某月 */
  const wpc_jumpMonth = (event: ChangeEvent<HTMLSelectElement>): void => {
    wpc_setMonth(Number(event.currentTarget.value))
    wpc_setMode('month')
  }

  /** 记成正常打卡 / 补卡 */
  const wpc_onPunch = (): void => {
    if (!wpc_editable) return
    wpc_onMarks(wpc_mergeMarks(marks, wpc_makePunch(settings, salaryMap, wpc_picked, wpc_today)))
    wpc_setEditOpen(false)
  }

  /** 事假 */
  const wpc_onPersonal = (): void => {
    if (!wpc_editable) return
    wpc_onMarks(wpc_mergeMarks(marks, wpc_makePersonal(settings, salaryMap, wpc_picked)))
    wpc_setEditOpen(false)
  }

  /** 调休 */
  const wpc_onComp = (): void => {
    if (!wpc_editable) return
    wpc_onMarks(wpc_mergeMarks(marks, wpc_makeComp(settings, salaryMap, wpc_picked)))
    wpc_setEditOpen(false)
  }

  /** 出差 */
  const wpc_onTrip = (): void => {
    if (!wpc_editable) return
    const wpc_bonus = Math.max(0, wpc_readNumber(wpc_tripDraft, 0))
    wpc_onMarks(wpc_mergeMarks(marks, wpc_makeTrip(settings, salaryMap, wpc_picked, wpc_bonus)))
  }

  /** 保存出差补贴 */
  const wpc_saveTripBonus = (): void => {
    if (!wpc_pickedMark || wpc_pickedMark.kind !== 'trip') return
    const wpc_bonus = Math.max(0, wpc_readNumber(wpc_tripDraft, wpc_pickedMark.tripBonus))
    wpc_onMarks(wpc_mergeMarks(marks, wpc_withTripBonus(wpc_pickedMark, settings, salaryMap, wpc_bonus)))
  }

  /** 保存节假日加班费 */
  const wpc_saveOt = (): void => {
    if (!wpc_pickedMark || wpc_pickedMark.kind !== 'holiday') return
    const wpc_pay = Math.max(0, wpc_readNumber(wpc_otDraft, wpc_pickedMark.overtimePay))
    wpc_onMarks(wpc_mergeMarks(marks, wpc_withOvertimePay(wpc_pickedMark, wpc_pay)))
  }

  /** 清除这天 */
  const wpc_onClearDay = (): void => {
    if (!wpc_editable) return
    wpc_onMarks(wpc_dropMark(marks, wpc_picked))
    wpc_setEditOpen(false)
  }

  /** 保存本月月薪覆盖 */
  const wpc_saveMonthSalary = (): void => {
    const wpc_key = `${wpc_year}-${String(wpc_month + 1).padStart(2, '0')}`
    if (wpc_monthDraft.trim() === '') {
      wpc_onSalaryMap(wpc_patchSalaryMap(salaryMap, wpc_key, null))
      return
    }
    wpc_onSalaryMap(wpc_patchSalaryMap(salaryMap, wpc_key, Math.max(0, wpc_readNumber(wpc_monthDraft, 0))))
  }

  /** 保存本年月薪覆盖 */
  const wpc_saveYearSalary = (): void => {
    const wpc_key = String(wpc_year)
    if (wpc_yearDraft.trim() === '') {
      wpc_onSalaryMap(wpc_patchSalaryMap(salaryMap, wpc_key, null))
      return
    }
    wpc_onSalaryMap(wpc_patchSalaryMap(salaryMap, wpc_key, Math.max(0, wpc_readNumber(wpc_yearDraft, 0))))
  }

  /** 年视图里的一个月 */
  const wpc_yearMonth = (month: number): ReactElement => {
    const wpc_mini = wpc_monthCells(wpc_year, month)
    const wpc_count = wpc_countMonth(wpc_shown, wpc_year, month)
    return (
      <button
        key={month}
        type="button"
        className="cal-year-card"
        onClick={() => {
          wpc_setMonth(month)
          wpc_setMode('month')
        }}
      >
        <header>
          <b>{month + 1}月</b>
          <span>{wpc_count} 天</span>
        </header>
        <div className="cal-year-grid">
          {wpc_mini.map((cell, index) => {
            if (!cell.date) return <i key={`e-${month}-${index}`} />
            const wpc_mark = wpc_shown.find((item) => item.date === cell.date)
            const wpc_base = wpc_dayBase(cell.date, wpc_today)
            const wpc_fest = wpc_festOf(cell.date)
            return (
              <i
                key={cell.date}
                className={[wpc_mark ? 'has' : '', `b-${wpc_base}`, wpc_fest ? `fest-${wpc_fest.kind}` : '']
                  .filter(Boolean)
                  .join(' ')}
              />
            )
          })}
        </div>
      </button>
    )
  }

  return (
    <div className="cal-back" onClick={wpc_onClose}>
      <section
        ref={wpc_panelRef}
        className={['cal', 'wpc-scroll', wpc_scrolling ? 'is-scrolling' : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-label="打卡日历"
        onScroll={wpc_onPanelScroll}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <header className="cal-top">
          <button type="button" className="cal-nav" onClick={wpc_prev} aria-label="上一段">
            ‹
          </button>
          <div className="cal-title">
            <p className="cal-kicker">打卡日历 · 从 {wpc_CAREER_START.slice(0, 7)} 起跑</p>
            <div className="cal-jump">
              <select aria-label="选择年份" value={wpc_year} onChange={wpc_jumpYear}>
                {wpc_years.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
              {wpc_mode === 'month' ? (
                <select aria-label="选择月份" value={wpc_month} onChange={wpc_jumpMonth}>
                  {Array.from({ length: 12 }, (_, month) => (
                    <option key={month} value={month}>
                      {month + 1}月
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>
          <button type="button" className="cal-nav" onClick={wpc_next} aria-label="下一段">
            ›
          </button>
          <div className="cal-modes">
            <button type="button" className={wpc_mode === 'month' ? 'is-on' : undefined} onClick={() => wpc_setMode('month')}>
              月
            </button>
            <button type="button" className={wpc_mode === 'year' ? 'is-on' : undefined} onClick={() => wpc_setMode('year')}>
              年
            </button>
          </div>
          <button
            type="button"
            className={calVeiled ? 'cal-veil is-on' : 'cal-veil'}
            aria-pressed={calVeiled}
            onClick={() => {
              wpc_onCalVeiled(!calVeiled)
            }}
          >
            金额：{calVeiled ? '藏' : '显'}
          </button>
          <button type="button" className="cal-close" onClick={wpc_onClose}>
            关闭
          </button>
        </header>

        {wpc_mode === 'year' ? (
          <div className="cal-year">{Array.from({ length: 12 }, (_, month) => wpc_yearMonth(month))}</div>
        ) : (
          <>
            <div className="cal-sum-row">
              <p className="cal-sum">
                本月 <b>{wpc_monthCount}</b> 天 · 有效 <b>{wpc_formatDuration(wpc_monthMs)}</b> · 净收益{' '}
                <b className={wpc_monthEarn < 0 ? 'is-loss' : 'is-gain'}>
                  {calVeiled ? '••••' : `${wpc_monthEarn >= 0 ? '+' : ''}¥${wpc_formatFixed(wpc_monthEarn, 2)}`}
                </b>
              </p>
              <button
                type="button"
                className={wpc_salaryOpen ? 'cal-chip is-on' : 'cal-chip'}
                aria-expanded={wpc_salaryOpen}
                onClick={() => {
                  wpc_setSalaryOpen((value) => !value)
                }}
              >
                月薪设置
                {wpc_salaryHint.month !== null || wpc_salaryHint.year !== null ? ' · 已覆盖' : ''}
              </button>
            </div>

            {wpc_salaryOpen ? (
              <div className="cal-salary-bar">
                <label>
                  本月月薪
                  <input
                    inputMode="decimal"
                    placeholder="未设置"
                    value={wpc_monthDraft}
                    onChange={(event) => {
                      wpc_setMonthDraft(event.currentTarget.value)
                    }}
                    onBlur={wpc_saveMonthSalary}
                  />
                </label>
                <label>
                  本年月薪
                  <input
                    inputMode="decimal"
                    placeholder="未设置"
                    value={wpc_yearDraft}
                    onChange={(event) => {
                      wpc_setYearDraft(event.currentTarget.value)
                    }}
                    onBlur={wpc_saveYearSalary}
                  />
                </label>
                <span>
                  今日折合日薪 <b>{calVeiled ? '••••' : `¥${wpc_formatFixed(wpc_dayPay, 2)}`}</b>
                </span>
              </div>
            ) : null}

            <div className="cal-legend">
              <span>
                <i className="lg-work" />班
              </span>
              <span>
                <i className="lg-weekend" />休
              </span>
              <span>
                <i className="lg-fest-spring" />春节
              </span>
              <span>
                <i className="lg-fest-chuxi" />除夕
              </span>
              <span>
                <i className="lg-fest-national" />国庆
              </span>
              <span>
                <i className="lg-fest-labor" />五一
              </span>
              <span>
                <i className="lg-fest-dragon" />端午
              </span>
              <span>
                <i className="lg-fest-midautumn" />中秋
              </span>
              <span>
                <i className="lg-done" />已打
              </span>
              <span>
                <i className="lg-miss" />未打
              </span>
            </div>
            <div className="cal-week">
              {wpc_week.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            <div className="cal-grid">
              {wpc_cells.map((cell, index) => {
                if (!cell.date || cell.day === null) return <span key={`empty-${index}`} className="cal-empty" />
                const wpc_mark = wpc_shown.find((item) => item.date === cell.date)
                const wpc_base = wpc_dayBase(cell.date, wpc_today)
                const wpc_fest = wpc_festOf(cell.date)
                const wpc_stamp = wpc_stampText(wpc_mark, wpc_base, wpc_today, cell.date)
                const wpc_class = [
                  'cal-day',
                  `is-${wpc_base}`,
                  wpc_fest ? `fest-${wpc_fest.kind}` : '',
                  cell.date === wpc_today ? 'is-today' : '',
                  cell.date === wpc_picked ? 'is-picked' : '',
                  wpc_mark ? `kind-${wpc_mark.kind}` : wpc_stamp === '未打' ? 'kind-miss' : '',
                  wpc_mark && wpc_mark.earned < 0 ? 'is-loss' : '',
                  wpc_mark && (wpc_mark.status === 'running' || wpc_mark.status === 'paused') ? 'is-live' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={cell.date}
                    type="button"
                    className={wpc_class}
                    title={wpc_fest ? wpc_fest.label : undefined}
                    onClick={() => {
                      wpc_pickDay(cell.date as string)
                    }}
                  >
                    <em className={wpc_fest ? 'has-icon' : undefined}>
                      {wpc_fest ? <WpcFestIcon kind={wpc_fest.kind} /> : null}
                      {wpc_baseBadge(wpc_base, cell.date)}
                    </em>
                    <b>{cell.day}</b>
                    {wpc_stamp ? (
                      <WpcStamp
                        text={wpc_stamp}
                        kind={wpc_mark?.kind ?? (wpc_stamp === '未打' ? 'miss' : 'punch')}
                      />
                    ) : null}
                    {wpc_mark && !calVeiled ? (
                      <span className={wpc_mark.earned < 0 ? 'cal-earn is-loss' : 'cal-earn is-gain'}>
                        {wpc_mark.earned < 0 ? '' : '+'}
                        {wpc_formatFixed(wpc_mark.earned, 0)}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            <div className={`cal-detail tone-${wpc_moneyTone}`} key={wpc_picked}>
              <WpcMood mood={wpc_mood.mood} label={wpc_mood.label} />
              <div className="cal-detail-main">
                <div className="cal-detail-meta">
                  <span>{wpc_picked}</span>
                  <span className={wpc_pickedFest ? 'cal-meta-fest' : undefined}>
                    {wpc_pickedFest ? <WpcFestIcon kind={wpc_pickedFest.kind} /> : null}
                    {wpc_pickedFest ? wpc_pickedFest.label : wpc_baseName}
                  </span>
                  <span>{wpc_pickedMark ? wpc_kindLabel(wpc_pickedMark.kind) : wpc_pickedBase === 'work' ? '未打卡' : '—'}</span>
                </div>
                <p className="cal-bless">{wpc_markBlessing(wpc_picked)}</p>
                <strong className={wpc_moneyTone === 'loss' ? 'is-loss' : wpc_moneyTone === 'gain' ? 'is-gain' : undefined}>
                  {wpc_pickedMark ? wpc_money(wpc_pickedMark.earned) : '这一天还空着'}
                </strong>
                <div className="cal-detail-facts">
                  {wpc_pickedMark ? (
                    <>
                      {wpc_pickedMark.kind === 'trip' ? (
                        <span>
                          日薪 {calVeiled ? '••••' : `¥${wpc_formatFixed(wpc_dayPay, 2)}`} · 补贴{' '}
                          {calVeiled ? '••••' : `¥${wpc_formatFixed(wpc_pickedMark.tripBonus, 2)}`}
                        </span>
                      ) : null}
                      {wpc_pickedMark.kind === 'holiday' ? (
                        <span>加班费 {calVeiled ? '••••' : `¥${wpc_formatFixed(wpc_pickedMark.overtimePay, 2)}`}</span>
                      ) : null}
                      {wpc_pickedMark.kind === 'personal' ? <span>事假按日薪扣回</span> : null}
                      {wpc_pickedMark.kind === 'comp' ? <span>调休按正常日薪入账</span> : null}
                      {wpc_pickedMark.kind === 'punch' || wpc_pickedMark.kind === 'makeup' || wpc_pickedMark.status !== 'off' ? (
                        <span>
                          上班 {wpc_formatClock(wpc_pickedMark.startedAt)}
                          {wpc_pickedMark.endedAt ? ` · 下班 ${wpc_formatClock(wpc_pickedMark.endedAt)}` : ' · 还没下班'}
                          {' · '}
                          有效 {wpc_formatDuration(wpc_pickedMark.effectiveMs)}
                        </span>
                      ) : null}
                      {wpc_pickedMark.note ? <span>{wpc_pickedMark.note}</span> : null}
                    </>
                  ) : (
                    <span>
                      {wpc_picked < wpc_CAREER_START
                        ? '入职前的日子，用来回看你怎么走到工位。'
                        : wpc_pickedBase === 'holiday'
                          ? `${wpc_holidayLabel(wpc_picked)}。打卡会记成加班，可自定义加班费。`
                          : wpc_pickedBase === 'weekend'
                            ? '普通周末，默认休闲。也可以补记状态。'
                            : '工作日还空着。点右侧记一笔即可。'}
                    </span>
                  )}
                </div>
              </div>

              {wpc_editable ? (
                <div className="cal-detail-side">
                  <div className="cal-detail-tools">
                    <button
                      type="button"
                      className={wpc_editOpen ? 'cal-chip is-on' : 'cal-chip'}
                      aria-expanded={wpc_editOpen}
                      onClick={() => {
                        wpc_setEditOpen((value) => !value)
                      }}
                    >
                      {wpc_editOpen ? '收起' : '记一笔'}
                    </button>
                    {wpc_pickedMark ? (
                      <button type="button" className="cal-chip danger" onClick={wpc_onClearDay}>
                        清除
                      </button>
                    ) : null}
                  </div>
                  {wpc_editOpen ? (
                    <div className="cal-edit-strip">
                      <button type="button" onClick={wpc_onPunch}>
                        打卡
                      </button>
                      <button type="button" onClick={wpc_onPersonal}>
                        事假
                      </button>
                      <button type="button" onClick={wpc_onComp}>
                        调休
                      </button>
                      <button type="button" onClick={wpc_onTrip}>
                        出差
                      </button>
                      <label className="cal-mini-field">
                        出差补贴
                        <input
                          inputMode="decimal"
                          value={wpc_tripDraft}
                          onChange={(event) => {
                            wpc_setTripDraft(event.currentTarget.value)
                          }}
                          onBlur={() => {
                            if (wpc_pickedMark?.kind === 'trip') wpc_saveTripBonus()
                          }}
                        />
                      </label>
                      {wpc_pickedMark?.kind === 'holiday' || wpc_pickedBase === 'holiday' ? (
                        <label className="cal-mini-field">
                          加班费
                          <input
                            inputMode="decimal"
                            value={wpc_otDraft}
                            onChange={(event) => {
                              wpc_setOtDraft(event.currentTarget.value)
                            }}
                            onBlur={() => {
                              if (wpc_pickedMark?.kind === 'holiday') wpc_saveOt()
                              else {
                                const wpc_pay = Math.max(0, wpc_readNumber(wpc_otDraft, wpc_dayPay))
                                const wpc_base = wpc_makePunch(settings, salaryMap, wpc_picked, wpc_today, '节假日加班')
                                wpc_onMarks(wpc_mergeMarks(marks, wpc_withOvertimePay(wpc_base, wpc_pay)))
                              }
                            }}
                          />
                        </label>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export { wpc_Calendar }
export const WpcCalendar = wpc_Calendar
