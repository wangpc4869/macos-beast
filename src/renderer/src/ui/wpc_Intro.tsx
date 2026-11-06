import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { WpcSkin } from '../engine/wpc_skins'
import { WpcOx } from './wpc_Ox'

interface WpcIntroProps {
  skin: WpcSkin
  wpc_onDone: () => void
}

/** 打开程序时的开场。点一下或按 Esc 可以直接上工 */
const wpc_Intro = (props: WpcIntroProps): ReactElement => {
  const { skin, wpc_onDone } = props
  const [wpc_leaving, wpc_setLeaving] = useState(false)
  const wpc_onDoneRef = useRef(wpc_onDone)
  const wpc_skipRef = useRef<() => void>(() => {})
  wpc_onDoneRef.current = wpc_onDone

  /** 播完或被人跳过，先淡出再把主界面交出来 */
  const wpc_arm = (): (() => void) => {
    let wpc_closed = false
    let wpc_leaveTimer = 0
    let wpc_hold = 0
    /** 收起开场，只收一次 */
    const wpc_finish = (): void => {
      if (wpc_closed) return
      wpc_closed = true
      window.clearTimeout(wpc_hold)
      wpc_setLeaving(true)
      wpc_leaveTimer = window.setTimeout(() => {
        wpc_onDoneRef.current()
      }, 560)
    }
    wpc_skipRef.current = wpc_finish
    const wpc_reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    wpc_hold = window.setTimeout(wpc_finish, wpc_reduced ? 1500 : 3400)
    /** 键盘也能跳过 */
    const wpc_onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' && event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      wpc_finish()
    }
    window.addEventListener('keydown', wpc_onKey)
    /** 卸掉计时和按键 */
    const wpc_stop = (): void => {
      window.clearTimeout(wpc_hold)
      window.clearTimeout(wpc_leaveTimer)
      window.removeEventListener('keydown', wpc_onKey)
    }
    return wpc_stop
  }
  useEffect(wpc_arm, [])

  /** 点击开场任意处，直接进入账本 */
  const wpc_onSkip = (): void => {
    wpc_skipRef.current()
  }

  return (
    <div className={wpc_leaving ? 'intro is-leave' : 'intro'} onClick={wpc_onSkip}>
      <div className="intro-burst" />
      <div className="intro-burst b" />
      <div className="intro-stage">
        <div className="intro-ox">
          <WpcOx phase="working" skin={skin.id} />
        </div>
        <p className="intro-kicker">
          {skin.name} · {skin.mood}
        </p>
        <h2 className="intro-title">{skin.headline}</h2>
        <p className="intro-line">{skin.intro}</p>
        <div className="intro-words">
          {skin.beats.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      </div>
      <div className="intro-bar" aria-hidden="true">
        <i />
      </div>
      <p className="intro-skip">点击任意处，直接上工</p>
    </div>
  )
}

export { wpc_Intro }
export const WpcIntro = wpc_Intro
