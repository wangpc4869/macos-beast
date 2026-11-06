import type { ReactElement } from 'react'
import { wpc_sealHint, wpc_sealText } from '../engine/wpc_flavor'
import type { WpcPhase } from '../engine/wpc_types'

interface WpcSealProps {
  phase: WpcPhase
  progress: number
}

const wpc_ringRadius = 42
const wpc_ring = 2 * Math.PI * wpc_ringRadius

/** 劳累的牛。牛马和拼命时用 */
const WpcOxFace = (): ReactElement => (
  <g className="mascot-ox">
    <ellipse cx="0" cy="2" rx="14" ry="11" />
    <path className="horn" d="M-10 -8c-4-8 4-10 4-2" />
    <path className="horn" d="M10 -8c4-8-4-10-4-2" />
    <circle className="eye" cx="-5" cy="0" r="1.6" />
    <circle className="eye" cx="5" cy="0" r="1.6" />
    <path className="mouth" d="M-4 6q4 3 8 0" />
    <ellipse className="sweat" cx="14" cy="-6" rx="2" ry="3" />
  </g>
)

/** 坏笑小猫。摸鱼时用 */
const WpcCatFace = (): ReactElement => (
  <g className="mascot-cat">
    <circle cx="0" cy="1" r="12" />
    <path className="ear" d="M-10 -6l-4-10 8 6z" />
    <path className="ear" d="M10 -6l4-10-8 6z" />
    <path className="eye" d="M-7 -1q3 4 6 0" />
    <path className="eye" d="M1 -1q3 4 6 0" />
    <path className="mouth" d="M-3 5q3 4 6 0" />
    <circle className="fish" cx="16" cy="4" r="3.5" />
  </g>
)

/** 打盹小云。休闲时用 */
const WpcCloudFace = (): ReactElement => (
  <g className="mascot-cloud">
    <ellipse cx="0" cy="2" rx="13" ry="9" />
    <circle cx="-7" cy="-1" r="6" />
    <circle cx="6" cy="-2" r="7" />
    <text className="zzz" x="12" y="-8">
      z
    </text>
  </g>
)

/** 收工笑脸。下班时用 */
const WpcDoneFace = (): ReactElement => (
  <g className="mascot-done">
    <circle cx="0" cy="0" r="12" />
    <path className="eye" d="M-6 -2q3 3 6 0" />
    <path className="eye" d="M0 -2q3 3 6 0" />
    <path className="mouth" d="M-5 4q5 6 10 0" />
    <path className="star" d="M14 -8l1.4 3.2 3.4.4-2.6 2.2.8 3.2-3-1.8-3 1.8.8-3.2-2.6-2.2 3.4-.4z" />
  </g>
)

/** 待命小点 */
const WpcIdleFace = (): ReactElement => (
  <g className="mascot-idle">
    <circle cx="0" cy="0" r="10" />
    <circle className="eye" cx="-4" cy="-1" r="1.5" />
    <circle className="eye" cx="4" cy="-1" r="1.5" />
    <path className="mouth" d="M-3 5h6" />
  </g>
)

/** 按班次挑一张脸 */
const wpc_face = (phase: WpcPhase): ReactElement => {
  if (phase === 'paused') return <WpcCatFace />
  if (phase === 'lunch') return <WpcCloudFace />
  if (phase === 'off') return <WpcDoneFace />
  if (phase === 'working' || phase === 'overtime') return <WpcOxFace />
  return <WpcIdleFace />
}

/** 炫酷印章：状态字 + 小吉祥物 + 进度环 */
const wpc_Seal = (props: WpcSealProps): ReactElement => {
  const { phase, progress } = props
  return (
    <div className="seal-wrap" data-phase={phase}>
      <svg viewBox="0 0 104 104" aria-hidden="true">
        <circle className="ring-orbit" cx="52" cy="52" r="49" />
        <circle className="ring-track" cx="52" cy="52" r={wpc_ringRadius} />
        <circle
          className="ring-value"
          cx="52"
          cy="52"
          r={wpc_ringRadius}
          strokeDasharray={wpc_ring}
          strokeDashoffset={wpc_ring * (1 - progress)}
        />
        <g className="ring-spark">
          <circle cx="52" cy="3" r="2.6" />
        </g>
      </svg>
      <div className="seal" key={phase}>
        <svg className="seal-mascot" viewBox="-22 -18 44 36" aria-hidden="true">
          {wpc_face(phase)}
        </svg>
        <span>{wpc_sealText(phase)}</span>
        <small>{wpc_sealHint(phase)}</small>
      </div>
    </div>
  )
}

export { wpc_Seal }
export const WpcSeal = wpc_Seal
