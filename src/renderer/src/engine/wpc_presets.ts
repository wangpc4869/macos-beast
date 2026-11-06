import type { WpcPresetId } from './wpc_types'

export interface WpcPresetChoice {
  id: Exclude<WpcPresetId, 'custom'>
  name: string
  range: string
  start: string
  end: string
}

export const wpc_presetChoices: readonly WpcPresetChoice[] = [
  { id: 'standard', name: '标准', range: '09:00–18:00', start: '09:00', end: '18:00' },
  { id: 'flex', name: '弹性', range: '09:30–18:30', start: '09:30', end: '18:30' },
  { id: 'early', name: '早班', range: '08:30–17:30', start: '08:30', end: '17:30' },
]

/** 手改上下班时间后，还能对上就保持预设，对不上就标成自定义 */
export const wpc_matchPreset = (start: string, end: string): WpcPresetId => {
  const wpc_found = wpc_presetChoices.find((item) => item.start === start && item.end === end)
  return wpc_found ? wpc_found.id : 'custom'
}
