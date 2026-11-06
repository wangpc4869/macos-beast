import type { ReactElement } from 'react'
import type { WpcDayBase } from '../engine/wpc_calendar'
import type { WpcDayMark } from '../engine/wpc_types'

export type WpcMoodId =
  | 'shock'
  | 'cry'
  | 'relief'
  | 'grind'
  | 'slack'
  | 'sad'
  | 'chill'
  | 'trip'
  | 'fest'
  | 'idle'

interface WpcMoodProps {
  mood: WpcMoodId
  label: string
}

interface WpcMoodPalette {
  hair: string
  deep: string
  ink: string
}

/** 根据这天的底色和打卡，挑一个情绪小人 */
export const wpc_moodOf = (
  mark: WpcDayMark | null,
  base: WpcDayBase,
  today: string,
  date: string,
): {
  mood: WpcMoodId
  label: string
} => {
  if (date > today) return { mood: 'idle', label: '还没到' }
  if (mark) {
    if (mark.kind === 'holiday') return { mood: 'cry', label: '假日还在卷' }
    if (mark.kind === 'personal') return { mood: 'sad', label: '事假扣钱了' }
    if (mark.kind === 'comp') return { mood: 'chill', label: '调休喘口气' }
    if (mark.kind === 'trip') return { mood: 'trip', label: '出差在路上' }
    if (mark.status === 'running') return { mood: 'grind', label: '正在牛马' }
    if (mark.status === 'paused') return { mood: 'slack', label: '摸鱼中' }
    return { mood: 'relief', label: '下班松口气' }
  }
  if (base === 'work') return { mood: 'shock', label: '工作日未打卡' }
  if (base === 'holiday') return { mood: 'fest', label: '法定假日好好歇' }
  if (base === 'weekend') return { mood: 'chill', label: '周末休闲' }
  return { mood: 'idle', label: '这一天还空着' }
}

/** 涂鸦配色 */
const wpc_paletteOf = (mood: WpcMoodId): WpcMoodPalette => {
  if (mood === 'cry' || mood === 'sad') return { hair: '#7ea0ff', deep: '#3f5fd0', ink: '#243056' }
  if (mood === 'fest') return { hair: '#ff7eb6', deep: '#d4458a', ink: '#5a2140' }
  if (mood === 'grind') return { hair: '#f0b24a', deep: '#c07a18', ink: '#5a3a12' }
  if (mood === 'slack') return { hair: '#b39bff', deep: '#6f52d8', ink: '#35285a' }
  if (mood === 'trip') return { hair: '#ff9a62', deep: '#d8682e', ink: '#5a2e14' }
  if (mood === 'shock') return { hair: '#ffb24a', deep: '#e08920', ink: '#5a3a12' }
  if (mood === 'idle') return { hair: '#c0b8aa', deep: '#8a8478', ink: '#4a4640' }
  return { hair: '#62d2a6', deep: '#2f9b6a', ink: '#1d4030' }
}

/** 卡通涂鸦小人：粗线、歪脸、马克笔色块 */
const wpc_DoodleFace = (mood: WpcMoodId): ReactElement => {
  const wpc_tone = wpc_paletteOf(mood)
  return (
    <svg className="cal-mood-svg" viewBox="0 0 100 118" aria-hidden>
      <ellipse cx="50" cy="58" rx="42" ry="44" fill={wpc_tone.hair} opacity="0.18" />

      {/* 后发乱草 */}
      <path
        fill={wpc_tone.hair}
        stroke={wpc_tone.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
        d="M22 52c-1-20 12-36 29-37 16-1 30 12 32 31 1 7-2 14-6 18-1-14-8-24-24-24S28 52 26 66c-3-3-5-8-4-14Z"
      />

      {/* 衣服领 */}
      <path
        fill={wpc_tone.deep}
        stroke={wpc_tone.ink}
        strokeWidth="2"
        strokeLinejoin="round"
        d="M31 98c6 9 13 13 19 13s13-4 19-13c-6 3-12 5-19 5s-13-2-19-5Z"
      />
      <path fill={wpc_tone.hair} stroke={wpc_tone.ink} strokeWidth="1.6" d="M36 96c4 6 9 9 14 9s10-3 14-9c-4 2-9 3-14 3s-10-1-14-3Z" />

      {/* 脸：故意不圆 */}
      <path
        fill="#ffe6d6"
        stroke={wpc_tone.ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M27 54c-1 16 6 32 23 33 17 1 26-14 26-30 0-14-8-26-23-27-16-1-25 9-26 24Z"
      />

      {/* 刘海乱笔画 */}
      <path
        fill={wpc_tone.hair}
        stroke={wpc_tone.ink}
        strokeWidth="2"
        strokeLinejoin="round"
        d="M26 50c2-14 12-24 26-24 13 0 23 9 25 23-5-7-12-11-18-11-3 8-8 13-14 15-5-2-10-6-14-12-1 2-3 5-5 9Z"
      />
      <path fill="none" stroke={wpc_tone.ink} strokeWidth="1.6" strokeLinecap="round" d="M34 34c3 5 7 8 12 9M54 32c2 5 5 9 9 11" />

      {/* 侧发 */}
      <path fill={wpc_tone.deep} stroke={wpc_tone.ink} strokeWidth="1.8" d="M24 52c-2 10 0 24 3 33 2-9 3-18 5-26-2-2-5-4-8-7Z" />
      <path fill={wpc_tone.deep} stroke={wpc_tone.ink} strokeWidth="1.8" d="M76 50c2 11 0 25-3 34-2-9-3-18-5-26 2-2 5-4 8-8Z" />

      {/* 腮红涂鸦点 */}
      {mood !== 'idle' ? (
        <g fill="#ff8aa8" opacity="0.55">
          <circle cx="33" cy="70" r="3.2" />
          <circle cx="67" cy="70" r="3.2" />
          <circle cx="30.5" cy="68" r="1.1" />
          <circle cx="69.5" cy="68" r="1.1" />
        </g>
      ) : null}

      {mood === 'shock' ? (
        <g stroke={wpc_tone.ink} strokeWidth="2.2" strokeLinecap="round" fill={wpc_tone.ink}>
          <ellipse cx="38" cy="60" rx="5.4" ry="6.6" />
          <ellipse cx="62" cy="60" rx="5.4" ry="6.6" />
          <circle cx="40" cy="57.5" r="1.7" fill="#fff" stroke="none" />
          <circle cx="64" cy="57.5" r="1.7" fill="#fff" stroke="none" />
          <ellipse cx="50" cy="78" rx="4" ry="4.8" />
          <path fill="none" d="M74 36l2 4M78 40l4 1M18 42l-3 3M22 38l-4-1" />
        </g>
      ) : null}

      {mood === 'cry' ? (
        <g>
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="2.4" strokeLinecap="round" d="M32 58c3-3 10-3 13 1" />
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="2.4" strokeLinecap="round" d="M55 56c3-2 10-1 13 2" />
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="2.3" strokeLinecap="round" d="M43 78c2 4 12 4 14 0" />
          <path fill="#7ec9ff" stroke="#3f88c0" strokeWidth="1.1" d="M35 64c-.4 5-1.4 11-2.2 15h2.8c.8-4 1.6-9 1.8-15z">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
          </path>
          <path fill="#7ec9ff" stroke="#3f88c0" strokeWidth="1.1" d="M65 64c.4 5 1.4 11 2.2 15h-2.8c-.8-4-1.6-9-1.8-15z">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" begin="0.3s" repeatCount="indefinite" />
          </path>
        </g>
      ) : null}

      {mood === 'relief' ? (
        <g fill="none" stroke={wpc_tone.ink} strokeWidth="2.5" strokeLinecap="round">
          <path d="M32 60c4-5 12-5 15 0" />
          <path d="M53 60c4-5 12-5 15 0" />
          <path d="M40 76c4 6 16 6 20 0" />
          <path d="M70 34c4 1 7 5 8 8" opacity="0.7" />
        </g>
      ) : null}

      {mood === 'grind' ? (
        <g>
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="2.6" strokeLinecap="round" d="M31 59h14M55 59h14" />
          <path fill={wpc_tone.ink} d="M46 76h8c0 3-2 5-4 5s-4-2-4-5Z" />
          <path fill="none" stroke="#7ec9ff" strokeWidth="2" strokeLinecap="round" d="M74 42c2 4 1 9-1 12" />
        </g>
      ) : null}

      {mood === 'slack' ? (
        <g fill="none" stroke={wpc_tone.ink} strokeWidth="2.4" strokeLinecap="round">
          <path d="M32 62c4 3 12 3 15-1" />
          <path d="M53 61c4 4 12 4 15 0" />
          <path d="M44 78h12" />
          <circle cx="76" cy="48" r="2.6" fill="#ffd36a" stroke={wpc_tone.ink} />
        </g>
      ) : null}

      {mood === 'sad' ? (
        <g fill="none" stroke={wpc_tone.ink} strokeWidth="2.4" strokeLinecap="round">
          <path d="M32 58c4 3 12 3 15 0" />
          <path d="M53 58c4 3 12 3 15 0" />
          <path d="M40 82c4-5 16-5 20 0" />
        </g>
      ) : null}

      {mood === 'chill' ? (
        <g>
          <ellipse cx="38" cy="60" rx="5" ry="5.8" fill={wpc_tone.ink} />
          <ellipse cx="62" cy="60" rx="5" ry="5.8" fill={wpc_tone.ink} />
          <circle cx="40" cy="57.8" r="1.6" fill="#fff" />
          <circle cx="64" cy="57.8" r="1.6" fill="#fff" />
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="2.4" strokeLinecap="round" d="M40 76c4 5 16 5 20 0" />
        </g>
      ) : null}

      {mood === 'trip' ? (
        <g>
          <ellipse cx="38" cy="60" rx="4.8" ry="5.6" fill={wpc_tone.ink} />
          <ellipse cx="62" cy="60" rx="4.8" ry="5.6" fill={wpc_tone.ink} />
          <circle cx="39.6" cy="57.8" r="1.5" fill="#fff" />
          <circle cx="63.6" cy="57.8" r="1.5" fill="#fff" />
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="2.2" strokeLinecap="round" d="M42 77c3 3 12 3 15 0" />
          <path
            fill="#8b5a2b"
            stroke={wpc_tone.ink}
            strokeWidth="1.6"
            strokeLinejoin="round"
            d="M70 86h18v13c0 1-.8 1.8-1.8 1.8H71.8c-1 0-1.8-.8-1.8-1.8z"
          />
          <path fill="none" stroke={wpc_tone.ink} strokeWidth="1.8" strokeLinecap="round" d="M74 86v-4c0-1.4 1.2-2.4 2.6-2.4h4.8c1.4 0 2.6 1 2.6 2.4v4" />
          <rect x="77" y="91" width="4" height="3" rx="0.6" fill="#f0c35a" stroke={wpc_tone.ink} strokeWidth="1" />
        </g>
      ) : null}

      {mood === 'fest' ? (
        <g>
          <ellipse cx="38" cy="60" rx="5.2" ry="6" fill={wpc_tone.ink} />
          <ellipse cx="62" cy="60" rx="5.2" ry="6" fill={wpc_tone.ink} />
          <circle cx="40" cy="57.6" r="1.8" fill="#fff" />
          <circle cx="64" cy="57.6" r="1.8" fill="#fff" />
          <path fill={wpc_tone.ink} d="M40 76c3 6 17 6 20 0-4 2-8 3-10 3s-6-1-10-3Z" />
          <path fill="none" stroke="#ffe08a" strokeWidth="1.8" strokeLinecap="round" d="M18 34l2 3M80 30l-2 3M74 44l3 1" />
          <circle cx="20" cy="36" r="1.6" fill="#ff9ec8" />
          <circle cx="78" cy="32" r="1.4" fill="#ffe08a" />
        </g>
      ) : null}

      {mood === 'idle' ? (
        <g fill="none" stroke={wpc_tone.ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M33 60h12M55 60h12M44 78h12" />
        </g>
      ) : null}

      {/* 马克笔乱线装饰 */}
      <path fill="none" stroke={wpc_tone.ink} strokeWidth="1.2" strokeLinecap="round" opacity="0.35" d="M16 70c2 6 3 12 2 18M84 66c-1 7-1 13 1 20" />
    </svg>
  )
}

/** 详情区涂鸦情绪小人 */
const wpc_Mood = (props: WpcMoodProps): ReactElement => {
  const { mood, label } = props
  return (
    <div className={`cal-mood mood-${mood}`} aria-hidden>
      <div className="cal-mood-stage">{wpc_DoodleFace(mood)}</div>
      <em>{label}</em>
    </div>
  )
}

export { wpc_Mood }
export const WpcMood = wpc_Mood
