import type { ReactElement } from 'react'
import type { WpcPhase, WpcSkinId } from '../engine/wpc_types'

interface WpcOxProps {
  phase: WpcPhase
  skin: WpcSkinId
}

/** 会换表情的金牌牛。颜色跟皮肤走，动作跟班次走 */
const wpc_Ox = (props: WpcOxProps): ReactElement => {
  const { phase, skin } = props
  return (
    <svg className="ox" data-phase={phase} data-skin={skin} viewBox="0 0 240 156" aria-hidden="true">
      <ellipse className="shadow" cx="118" cy="146" rx="54" ry="6" />
      <g className="aura">
        <circle cx="128" cy="78" r="62" />
        <circle cx="128" cy="78" r="50" />
      </g>
      <g className="spark">
        <path d="M36 42 l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
        <path d="M214 34 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        <path d="M24 78 l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" />
      </g>
      <g className="ox-bob">
        <g className="tail">
          <path d="M58 96 C26 88 22 118 46 122" />
          <circle className="tuft" cx="40" cy="126" r="10" />
        </g>
        <path className="cape" d="M78 86 C44 96 40 124 88 118 C66 112 64 98 96 90 Z" />
        <g className="leg a">
          <rect x="70" y="108" width="13" height="30" rx="6" />
          <ellipse className="hoof" cx="76.5" cy="140" rx="9" ry="4" />
        </g>
        <g className="leg b">
          <rect x="90" y="108" width="13" height="30" rx="6" />
          <ellipse className="hoof" cx="96.5" cy="140" rx="9" ry="4" />
        </g>
        <ellipse className="body" cx="104" cy="98" rx="56" ry="30" />
        <ellipse className="belly" cx="108" cy="108" rx="26" ry="12" />
        <ellipse className="spot" cx="90" cy="88" rx="13" ry="8" />
        <g className="medal">
          <path d="M118 76l7 16h-14z" />
          <circle cx="118" cy="98" r="8" />
          <text x="118" y="102">
            ¥
          </text>
        </g>
        <g className="head">
          <path className="ear" d="M150 72c-16-8-12-28 10-16z" />
          <path className="horn" d="M152 58C136 28 166 22 166 52z" />
          <path className="horn" d="M172 50c-2-32 40-30 24 0z" />
          <ellipse className="head-shape" cx="178" cy="80" rx="32" ry="26" />
          <ellipse className="snout" cx="204" cy="92" rx="18" ry="13" />
          <circle className="nose" cx="198" cy="90" r="1.8" />
          <circle className="nose" cx="208" cy="93" r="1.8" />
          <circle className="blush a" cx="166" cy="94" r="4.2" />
          <circle className="blush b" cx="188" cy="92" r="4.2" />
          <g className="brow">
            <path d="M154 64q8-6 16 1" />
            <path d="M178 62q8-6 16 1" />
          </g>
          <g className="eyes open">
            <ellipse className="white" cx="166" cy="76" rx="8" ry="6.4" />
            <ellipse className="pupil" cx="168" cy="77" rx="3.3" ry="3.6" />
            <circle className="glint" cx="170" cy="75" r="1.4" />
            <ellipse className="white" cx="188" cy="74" rx="8" ry="6.4" />
            <ellipse className="pupil" cx="190" cy="75" rx="3.3" ry="3.6" />
            <circle className="glint" cx="192" cy="73" r="1.4" />
          </g>
          <g className="eyes shut">
            <path d="M158 76q8 7 16 0" />
            <path d="M180 74q8 7 16 0" />
          </g>
          <g className="eyes star">
            <path d="M166 70l1.6 4 4 .4-3.2 2.4 1.2 4-3.6-2.2-3.6 2.2 1.2-4-3.2-2.4 4-.4z" />
            <path d="M188 68l1.6 4 4 .4-3.2 2.4 1.2 4-3.6-2.2-3.6 2.2 1.2-4-3.2-2.4 4-.4z" />
          </g>
          <g className="shades">
            <rect x="154" y="68" width="22" height="13" rx="5" />
            <rect x="180" y="66" width="22" height="13" rx="5" />
            <rect x="174" y="72" width="8" height="3" rx="1" />
          </g>
          <path className="mouth smile" d="M190 102q10 8 20 0" />
          <path className="mouth flat" d="M192 104h18" />
          <path className="mouth yum" d="M190 102q8 8 18 0" />
          <ellipse className="tongue" cx="200" cy="106" rx="4" ry="2.4" />
        </g>
        <g className="crown">
          <path d="M156 42l8-14 8 10 8-12 8 12 8-10 8 14v8h-48z" />
        </g>
        <g className="leg c">
          <rect x="128" y="108" width="13" height="30" rx="6" />
          <ellipse className="hoof" cx="134.5" cy="140" rx="9" ry="4" />
        </g>
        <g className="leg d">
          <rect x="150" y="108" width="13" height="30" rx="6" />
          <ellipse className="hoof" cx="156.5" cy="140" rx="9" ry="4" />
        </g>
        <g className="bowl">
          <path d="M214 112h22c0 8-5 13-11 13s-11-5-11-13z" />
          <path className="steam" d="M222 104c1-6 6-6 6 0" />
          <path className="steam b" d="M230 102c1-7 6-6 5 1" />
        </g>
      </g>
      <g className="heart">
        <path d="M196 30c0-7 10-7 10 0 0-7 10-7 10 0 0 9-10 14-10 14s-10-5-10-14z" />
      </g>
      <g className="zzz">
        <text x="208" y="28">
          z
        </text>
        <text x="218" y="18">
          Z
        </text>
      </g>
    </svg>
  )
}

export { wpc_Ox }
export const WpcOx = wpc_Ox
