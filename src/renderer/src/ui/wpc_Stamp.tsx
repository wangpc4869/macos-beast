import type { ReactElement } from 'react'

interface WpcStampProps {
  text: string
  kind: string
}

/** 涂鸦签章：歪扭双圈 + 手写字感 */
const wpc_Stamp = (props: WpcStampProps): ReactElement => {
  const { text, kind } = props
  return (
    <span className={`cal-stamp stamp-${kind}`} aria-hidden>
      <svg className="cal-stamp-svg" viewBox="0 0 44 44">
        <path
          className="cal-stamp-ring"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.2 3.6c7.8-.9 16.4 3.4 18.2 11.2 2.1 9.1-3.2 18.6-12.1 20.8-8.6 2.1-18.4-2.8-20.3-11.6C5.2 15.2 11.8 5.2 21.2 3.6Z"
        />
        <path
          className="cal-stamp-ring"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          opacity="0.72"
          d="M21.6 7.4c5.9-.6 12.2 2.8 13.4 8.5 1.5 7-2.6 14.2-9.4 15.8-6.6 1.5-14.1-2.4-15.4-9C9 15.4 14.2 8.4 21.6 7.4Z"
        />
        <path
          className="cal-stamp-scribble"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
          d="M10 14c2-3 6-5 10-4M33 18c1 4-1 9-5 12M14 31c4 2 9 1 12-1"
        />
        <text
          x="22"
          y="25.5"
          textAnchor="middle"
          className="cal-stamp-text"
          fill="currentColor"
        >
          {text}
        </text>
      </svg>
    </span>
  )
}

export { wpc_Stamp }
export const WpcStamp = wpc_Stamp
