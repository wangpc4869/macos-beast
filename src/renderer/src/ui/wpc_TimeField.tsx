import { useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, ReactElement } from 'react'
import { wpc_joinClock, wpc_splitClock } from '../engine/wpc_time'

interface WpcTimeFieldProps {
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

/** 只留数字，最多两位 */
const wpc_digits = (raw: string): string => raw.replace(/\D/g, '').slice(0, 2)

/** 时分输入。不用系统时间框，避免蓝色选中块被圆角裁掉 */
const wpc_TimeField = (props: WpcTimeFieldProps): ReactElement => {
  const { label, value, disabled = false, onChange } = props
  const wpc_parts = wpc_splitClock(value)
  const [wpc_hour, wpc_setHour] = useState(wpc_parts.hour)
  const [wpc_minute, wpc_setMinute] = useState(wpc_parts.minute)
  const wpc_focused = useRef(false)

  /** 外部班次变了，而且人没在改，就把两位数字对齐过来 */
  const wpc_sync = (): void => {
    if (wpc_focused.current) return
    const wpc_next = wpc_splitClock(value)
    wpc_setHour(wpc_next.hour)
    wpc_setMinute(wpc_next.minute)
  }
  useEffect(wpc_sync, [value])

  /** 收成合法的 HH:mm 再交出去 */
  const wpc_commit = (hourText: string, minuteText: string): void => {
    const wpc_hourNum = hourText.trim() === '' ? 0 : Number(hourText)
    const wpc_minuteNum = minuteText.trim() === '' ? 0 : Number(minuteText)
    if (!Number.isFinite(wpc_hourNum) || !Number.isFinite(wpc_minuteNum)) return
    const wpc_next = wpc_joinClock(wpc_hourNum, wpc_minuteNum)
    const wpc_shown = wpc_splitClock(wpc_next)
    wpc_setHour(wpc_shown.hour)
    wpc_setMinute(wpc_shown.minute)
    if (wpc_next !== value) onChange(wpc_next)
  }

  /** 点进这一格时整段选中，高亮落在格子里面，不会被圆角裁掉 */
  const wpc_onPartFocus = (event: FocusEvent<HTMLInputElement>): void => {
    wpc_focused.current = true
    event.currentTarget.select()
  }

  /** 小时离焦后补齐两位 */
  const wpc_onHourBlur = (event: FocusEvent<HTMLInputElement>): void => {
    wpc_focused.current = false
    wpc_commit(event.currentTarget.value, wpc_minute)
  }

  /** 分钟离焦后补齐两位 */
  const wpc_onMinuteBlur = (event: FocusEvent<HTMLInputElement>): void => {
    wpc_focused.current = false
    wpc_commit(wpc_hour, event.currentTarget.value)
  }

  /** 上下键改小时，不靠系统那块蓝色选中 */
  const wpc_onHourKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const wpc_step = event.key === 'ArrowUp' ? 1 : -1
    const wpc_nextHour = (Number(wpc_hour) || 0) + wpc_step
    const wpc_wrapped = (wpc_nextHour + 24) % 24
    wpc_commit(String(wpc_wrapped), wpc_minute)
  }

  /** 上下键改分钟 */
  const wpc_onMinuteKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const wpc_step = event.key === 'ArrowUp' ? 1 : -1
    const wpc_base = Number(wpc_minute) || 0
    const wpc_nextMinute = event.shiftKey ? wpc_base + wpc_step * 5 : wpc_base + wpc_step
    const wpc_wrapped = (wpc_nextMinute + 60) % 60
    wpc_commit(wpc_hour, String(wpc_wrapped))
  }

  return (
    <label className={disabled ? 'field is-dim' : 'field'}>
      {label}
      <div className="clock">
        <input
          className="clock-part"
          inputMode="numeric"
          aria-label={`${label}小时`}
          disabled={disabled}
          value={wpc_hour}
          maxLength={2}
          spellCheck={false}
          autoComplete="off"
          onFocus={wpc_onPartFocus}
          onBlur={wpc_onHourBlur}
          onKeyDown={wpc_onHourKey}
          onChange={(event) => {
            wpc_setHour(wpc_digits(event.currentTarget.value))
          }}
        />
        <span className="clock-colon" aria-hidden="true">
          :
        </span>
        <input
          className="clock-part"
          inputMode="numeric"
          aria-label={`${label}分钟`}
          disabled={disabled}
          value={wpc_minute}
          maxLength={2}
          spellCheck={false}
          autoComplete="off"
          onFocus={wpc_onPartFocus}
          onBlur={wpc_onMinuteBlur}
          onKeyDown={wpc_onMinuteKey}
          onChange={(event) => {
            wpc_setMinute(wpc_digits(event.currentTarget.value))
          }}
        />
      </div>
    </label>
  )
}

export { wpc_TimeField }
export const WpcTimeField = wpc_TimeField
