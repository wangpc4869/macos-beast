import type { ReactElement } from 'react'
import type { WpcFestKind } from '../engine/wpc_calendar'

interface WpcFestIconProps {
  kind: WpcFestKind
  className?: string
}

/** 涂鸦粽子：端午 */
const wpc_Zongzi = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#3db87a"
      stroke="#1d4030"
      strokeWidth="1.4"
      strokeLinejoin="round"
      d="M12.2 3.4 5.1 17.8c-.5 1 .4 2.1 1.5 2h10.8c1.1.1 2-.9 1.5-2L12.2 3.4Z"
    />
    <path fill="#7fe0a8" opacity="0.55" d="M12 6.2 8.2 16.6h7.4L12 6.2Z" />
    <path fill="none" stroke="#c9891a" strokeWidth="1.8" strokeLinecap="round" d="M12 2.6v17.4" />
    <path fill="none" stroke="#f0c35a" strokeWidth="2.2" strokeLinecap="round" d="M8.6 3.2c1.2-.8 5.4-.8 6.8 0" />
    <circle cx="12" cy="2.9" r="1.15" fill="#ffe08a" stroke="#c9891a" strokeWidth="0.8" />
  </svg>
)

/** 涂鸦元旦烟花 */
const wpc_FireworkSoft = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="2.4" fill="#fff3b0" stroke="#d9b24a" strokeWidth="1" />
    <g fill="none" stroke="#7ebfff" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 3.2v3.4M12 17.4v3.2M3.4 12h3.2M17.4 12h3.2" />
      <path d="M6.2 6.2 8.4 8.4M15.6 15.6l2.2 2.2M17.8 6.2 15.6 8.4M8.4 15.6 6.2 17.8" />
    </g>
    <g fill="#ffe08a">
      <circle cx="12" cy="4.2" r="1" />
      <circle cx="19.2" cy="8.4" r="0.9" />
      <circle cx="18.6" cy="16" r="0.85" />
      <circle cx="5.4" cy="15.4" r="0.9" />
      <circle cx="5" cy="8" r="0.85" />
    </g>
  </svg>
)

/** 涂鸦国旗：国庆 */
const wpc_ChinaFlag = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="2.4" y="4.2" width="19.2" height="15.6" rx="2.2" fill="#de2910" stroke="#8f1608" strokeWidth="1.2" />
    <path
      fill="#ffde00"
      stroke="#c9a400"
      strokeWidth="0.4"
      d="M7.2 7.1 7.9 9.2l2.2.1-1.7 1.4.6 2.1-1.8-1.2-1.8 1.2.6-2.1-1.7-1.4 2.2-.1Z"
    />
    <g fill="#ffde00">
      <circle cx="12.2" cy="7.2" r="0.55" />
      <circle cx="13.6" cy="8.6" r="0.55" />
      <circle cx="13.6" cy="10.6" r="0.55" />
      <circle cx="12.2" cy="12" r="0.55" />
    </g>
  </svg>
)

/** 涂鸦饺子：除夕 */
const wpc_Dumpling = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#f0d9a8"
      stroke="#b8924e"
      strokeWidth="1.3"
      strokeLinejoin="round"
      d="M4.2 13.2c1.2-4.8 5-8.2 7.8-8.2s6.6 3.4 7.8 8.2c.4 1.6-.8 3.2-2.4 3.4H6.6c-1.6-.2-2.8-1.8-2.4-3.4Z"
    />
    <path
      fill="#ffe9c2"
      stroke="#d4b06a"
      strokeWidth="1"
      d="M6.4 12.4c1.4-2.8 3.8-4.6 5.6-4.6s4.2 1.8 5.6 4.6c.2.5-.2 1-.8 1H7.2c-.6 0-1-.5-.8-1Z"
    />
    <path fill="none" stroke="#c9891a" strokeWidth="1.2" strokeLinecap="round" d="M8 10.8c1.2-.8 2.6-1.2 4-1.2s2.8.4 4 1.2" />
    <path fill="none" stroke="#e23b3b" strokeWidth="1.4" strokeLinecap="round" d="M9.2 14.8h5.6" />
  </svg>
)

/** 涂鸦灯笼：春节 */
const wpc_Lantern = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path fill="none" stroke="#f0c35a" strokeWidth="1.8" strokeLinecap="round" d="M12 2.4v2.2" />
    <path
      fill="#e23b3b"
      stroke="#8f1d1d"
      strokeWidth="1.3"
      strokeLinejoin="round"
      d="M7.2 6.4c-.4 2.2-.2 7.8 1.4 10.6 1.2 2 5.6 2.2 6.8.2 1.8-3 2.2-8.4 1.6-10.8-2.2-1-5.2-1.2-9.8 0Z"
    />
    <path fill="none" stroke="#f0c35a" strokeWidth="1.6" strokeLinecap="round" d="M7.4 9.4h9.2M7.6 13.6h8.8" />
    <path fill="none" stroke="#e23b3b" strokeWidth="1.6" strokeLinecap="round" d="M12 17.4v3.6" />
    <circle cx="12" cy="21.2" r="0.9" fill="#e23b3b" />
  </svg>
)

/** 涂鸦月饼：中秋 */
const wpc_Mooncake = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#e0a84a"
      stroke="#9a6a1e"
      strokeWidth="1.4"
      d="M12 3.2c5.2.2 8.8 4.2 8.6 9-.2 4.8-4.4 8.4-9 8.2S3 16.4 3.2 11.6C3.4 6.8 7 3 12 3.2Z"
    />
    <circle cx="12" cy="12" r="4.6" fill="none" stroke="#c98424" strokeWidth="1.3" />
    <circle cx="12" cy="12" r="1.7" fill="#ffe08a" stroke="#c98424" strokeWidth="1" />
    <g fill="#c98424">
      <circle cx="12" cy="6.6" r="0.7" />
      <circle cx="17.2" cy="12" r="0.7" />
      <circle cx="12" cy="17.4" r="0.7" />
      <circle cx="6.8" cy="12" r="0.7" />
    </g>
  </svg>
)

/** 涂鸦海岛度假：五一 */
const wpc_Island = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="18" cy="5.8" r="2.8" fill="#ffd36a" stroke="#d9a428" strokeWidth="1.1" />
    <path
      fill="#3ecf8e"
      stroke="#1f8a58"
      strokeWidth="1.1"
      strokeLinejoin="round"
      d="M11.2 13.2c2.4-4.8 5.6-7.2 5.6-7.2s.4 4.2-2 8.4c1.8.2 3.4 1 4.4 2.2-3.2.2-5.8-.6-8-3.4Z"
    />
    <path fill="none" stroke="#8b5a2b" strokeWidth="1.7" strokeLinecap="round" d="M12.4 8.2v9.4" />
    <path
      fill="#f0c35a"
      stroke="#c9891a"
      strokeWidth="1.1"
      d="M3.2 18.2c2.4-1.4 5.2-2 8.4-1.8 3.4.2 6.2 1.2 9.2 2.4v2.4H3.2z"
    />
    <path fill="none" stroke="#4ec3ff" strokeWidth="1.4" strokeLinecap="round" d="M2.6 20.4c3-.8 6.2-.4 9.2.2 3 .6 6.2 1.2 9.6.4" />
  </svg>
)

/** 涂鸦柳叶：清明 */
const wpc_Willow = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path fill="none" stroke="#5fbf72" strokeWidth="1.8" strokeLinecap="round" d="M12.4 3.2c4.2 2 7.2 6.8 6.4 12.2" />
    <path fill="none" stroke="#8fd89a" strokeWidth="1.6" strokeLinecap="round" d="M12.2 4.8c-3.8 2.2-7 6.2-8.2 10.4" />
    <path fill="none" stroke="#5fbf72" strokeWidth="1.5" strokeLinecap="round" d="M12.4 5.2c1.6 3.4 2.2 7.4 1.8 11.6" />
    <path
      fill="#8fd89a"
      stroke="#3f8f52"
      strokeWidth="1"
      d="M10.8 8.4c1.6-.8 3.4-.2 4.2 1.2-1.4.8-2.8.6-4.2.2-.4-.4-.4-1 0-1.4Z"
    />
  </svg>
)

/** 涂鸦星光：其他假日 */
const wpc_Spark = (): ReactElement => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#ff9ec8"
      stroke="#c45a88"
      strokeWidth="1.2"
      strokeLinejoin="round"
      d="M12 2.8 13.6 9l6.2.4-4.8 3.8 1.8 6.2L12 16.2 7.2 19.4l1.8-6.2L4.2 9.4 10.4 9Z"
    />
    <circle cx="19.2" cy="5.2" r="1.1" fill="#ffe08a" stroke="#d9b24a" strokeWidth="0.8" />
    <circle cx="4.8" cy="6.4" r="0.9" fill="#ffe08a" stroke="#d9b24a" strokeWidth="0.8" />
  </svg>
)

/** 节日图标：统一涂鸦 SVG，避免 emoji 与嵌套样式叠崩 */
const wpc_FestIcon = (props: WpcFestIconProps): ReactElement => {
  const { kind, className } = props
  let wpc_inner: ReactElement = wpc_Spark()
  if (kind === 'dragon') wpc_inner = wpc_Zongzi()
  else if (kind === 'newyear') wpc_inner = wpc_FireworkSoft()
  else if (kind === 'national') wpc_inner = wpc_ChinaFlag()
  else if (kind === 'chuxi') wpc_inner = wpc_Dumpling()
  else if (kind === 'spring') wpc_inner = wpc_Lantern()
  else if (kind === 'midautumn') wpc_inner = wpc_Mooncake()
  else if (kind === 'labor') wpc_inner = wpc_Island()
  else if (kind === 'qingming') wpc_inner = wpc_Willow()
  return <span className={['cal-fest-ico', className].filter(Boolean).join(' ')}>{wpc_inner}</span>
}

export { wpc_FestIcon }
export const WpcFestIcon = wpc_FestIcon
