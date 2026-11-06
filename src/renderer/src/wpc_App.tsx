import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { wpc_dateKey, wpc_rememberMark } from './engine/wpc_marks'
import { wpc_findSkin } from './engine/wpc_skins'
import { wpc_loadBundle, wpc_saveBundle } from './engine/wpc_storage'
import type { WpcDayMark, WpcSalaryMap, WpcSession, WpcSettings, WpcSkinId } from './engine/wpc_types'
import { WpcDesk } from './ui/wpc_Desk'
import { WpcHero } from './ui/wpc_Hero'
import { WpcIntro } from './ui/wpc_Intro'
import { WpcSkinBar } from './ui/wpc_SkinBar'

const wpc_boot = wpc_loadBundle()
document.documentElement.dataset.skin = wpc_boot.skin

/** 把常亮状态交给系统窗口 */
const wpc_pushPinned = (on: boolean): void => {
  void window.wpc?.wpc_setPinned(on)
}

/** 牛马计时器主界面 */
const wpc_App = (): ReactElement => {
  const [wpc_settings, wpc_setSettings] = useState<WpcSettings>(wpc_boot.settings)
  const [wpc_session, wpc_setSession] = useState<WpcSession>(wpc_boot.session)
  const [wpc_pinned, wpc_setPinned] = useState(wpc_boot.pinned)
  const [wpc_skin, wpc_setSkin] = useState<WpcSkinId>(wpc_boot.skin)
  const [wpc_veiled, wpc_setVeiled] = useState(wpc_boot.veiled)
  const [wpc_calVeiled, wpc_setCalVeiled] = useState(wpc_boot.calVeiled)
  const [wpc_marks, wpc_setMarks] = useState<WpcDayMark[]>(wpc_boot.marks)
  const [wpc_salaryMap, wpc_setSalaryMap] = useState<WpcSalaryMap>(wpc_boot.salaryMap)
  const [wpc_mini, wpc_setMini] = useState(false)
  const [wpc_advancedOpen, wpc_setAdvancedOpen] = useState(true)
  const [wpc_toast, wpc_setToast] = useState<string | null>(null)
  const [wpc_introOn, wpc_setIntroOn] = useState(true)
  const [wpc_reskin, wpc_setReskin] = useState(false)

  /** 参数、班次、常亮、心情、金额显隐、打卡、月年薪一变就写进本地 */
  const wpc_persist = (): void => {
    wpc_saveBundle({
      settings: wpc_settings,
      session: wpc_session,
      pinned: wpc_pinned,
      skin: wpc_skin,
      veiled: wpc_veiled,
      calVeiled: wpc_calVeiled,
      marks: wpc_marks,
      salaryMap: wpc_salaryMap,
    })
  }
  useEffect(wpc_persist, [
    wpc_settings,
    wpc_session,
    wpc_pinned,
    wpc_skin,
    wpc_veiled,
    wpc_calVeiled,
    wpc_marks,
    wpc_salaryMap,
  ])

  /** 班还在走的时候，隔几秒把今天的打卡金额补上 */
  const wpc_refreshMark = (): (() => void) | void => {
    if (wpc_session.status !== 'running' && wpc_session.status !== 'paused') return
    const wpc_timer = window.setInterval(() => {
      wpc_setMarks((current) => wpc_rememberMark(current, wpc_settings, wpc_session, Date.now(), null, wpc_salaryMap))
    }, 5000)
    /** 停掉补记 */
    const wpc_stop = (): void => {
      window.clearInterval(wpc_timer)
    }
    return wpc_stop
  }
  useEffect(wpc_refreshMark, [wpc_settings, wpc_session, wpc_salaryMap])

  /** 启动和切换时同步窗口常亮 */
  const wpc_syncPinned = (): void => {
    wpc_pushPinned(wpc_pinned)
  }
  useEffect(wpc_syncPinned, [wpc_pinned])

  /** 弹出一条短提示，过一会儿自己收起 */
  const wpc_showToast = (text: string): void => {
    wpc_setToast(text)
    window.setTimeout(() => {
      wpc_setToast((current) => (current === text ? null : current))
    }, 2600)
  }

  /** 切换迷你浮窗 */
  const wpc_toggleMini = (): void => {
    const wpc_next = !wpc_mini
    wpc_setMini(wpc_next)
    void window.wpc?.wpc_setMini(wpc_next)
  }

  /** 切换常亮 */
  const wpc_togglePinned = (): void => {
    wpc_setPinned((current) => !current)
  }

  /** 把月薪、日薪和时薪藏起来，累计工资始终可见 */
  const wpc_toggleVeil = (): void => {
    wpc_setVeiled((current) => !current)
  }

  /** 换班次时顺手记进打卡本。清空则抹掉这一天 */
  const wpc_takeSession = (next: WpcSession): void => {
    const wpc_drop = next.status === 'idle' && wpc_session.startedAt ? wpc_dateKey(wpc_session.startedAt) : null
    wpc_setMarks((current) => wpc_rememberMark(current, wpc_settings, next, Date.now(), wpc_drop, wpc_salaryMap))
    wpc_setSession(next)
  }

  /** 小确幸跨过一档时轻声说一声 */
  const wpc_onTreat = (name: string): void => {
    wpc_showToast(`小确幸解锁 · ${name}`)
  }

  /** 复制成功或失败的反馈 */
  const wpc_onCopied = (ok: boolean): void => {
    wpc_showToast(ok ? '账已经抄进剪贴板' : '没抄上，再试一次')
  }

  /** 换成今天想要的心情 */
  const wpc_pickSkin = (id: WpcSkinId): void => {
    if (id === wpc_skin) return
    document.documentElement.dataset.skin = id
    wpc_setSkin(id)
    wpc_setReskin(true)
    window.setTimeout(() => {
      wpc_setReskin(false)
    }, 700)
    const wpc_next = wpc_findSkin(id)
    wpc_showToast(`${wpc_next.name} · ${wpc_next.mood}`)
  }

  /** 开场结束，露出账本 */
  const wpc_closeIntro = (): void => {
    wpc_setIntroOn(false)
  }

  const wpc_class = [wpc_mini ? 'app is-mini' : 'app', wpc_reskin ? 'is-reskin' : ''].filter(Boolean).join(' ')

  return (
    <div className={wpc_class}>
      <div className="aurora" />
      <div className="aurora-b" />
      <div className="grain" />
      <header className="titlebar">
        <WpcSkinBar skin={wpc_skin} wpc_onSkin={wpc_pickSkin} />
        {wpc_mini ? null : (
          <button
            type="button"
            className={wpc_veiled ? 'chip is-on' : 'chip'}
            aria-pressed={wpc_veiled}
            onClick={wpc_toggleVeil}
          >
            金额：{wpc_veiled ? '藏' : '显'}
          </button>
        )}
        <button type="button" className="chip" onClick={wpc_toggleMini}>
          {wpc_mini ? '展开' : '迷你'}
        </button>
      </header>
      <main className="stage">
        <WpcHero
          settings={wpc_settings}
          session={wpc_session}
          skin={wpc_skin}
          veiled={wpc_veiled}
          pinned={wpc_pinned}
          wpc_onPinned={wpc_togglePinned}
          wpc_onTreat={wpc_onTreat}
          wpc_onCopied={wpc_onCopied}
        />
        {wpc_mini ? null : (
          <WpcDesk
            settings={wpc_settings}
            session={wpc_session}
            advancedOpen={wpc_advancedOpen}
            veiled={wpc_veiled}
            marks={wpc_marks}
            salaryMap={wpc_salaryMap}
            calVeiled={wpc_calVeiled}
            wpc_onSettings={wpc_setSettings}
            wpc_onSession={wpc_takeSession}
            wpc_onMarks={wpc_setMarks}
            wpc_onSalaryMap={wpc_setSalaryMap}
            wpc_onCalVeiled={wpc_setCalVeiled}
            wpc_onAdvanced={wpc_setAdvancedOpen}
          />
        )}
      </main>
      {wpc_toast ? (
        <div className="toast" role="status">
          {wpc_toast}
        </div>
      ) : null}
      {wpc_introOn ? <WpcIntro skin={wpc_findSkin(wpc_skin)} wpc_onDone={wpc_closeIntro} /> : null}
    </div>
  )
}

export { wpc_App }
export const WpcApp = wpc_App
