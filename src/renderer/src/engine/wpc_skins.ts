import type { WpcSkinId } from './wpc_types'

/** 一套心情：颜色由样式表接管，这里只放文案和色点 */
export interface WpcSkin {
  id: WpcSkinId
  name: string
  mood: string
  headline: string
  intro: string
  beats: readonly [string, string, string]
  swatch: string
}

export const wpc_skinIds: readonly WpcSkinId[] = ['ledger', 'night', 'blaze', 'slack', 'fortune', 'dawn']

export const wpc_skins: readonly WpcSkin[] = [
  {
    id: 'ledger',
    name: '金账',
    mood: '想把今天换成钱',
    headline: '今天，开张',
    intro: '坐下。从这一秒起，时间开始为你结账',
    beats: ['坐稳', '计价', '开干'],
    swatch: 'linear-gradient(135deg, #f6e2a8, #a56d2e)',
  },
  {
    id: 'night',
    name: '夜航',
    mood: '想安静地搞定',
    headline: '灯先亮给你',
    intro: '世界可以吵。这一班只听你的',
    beats: ['静心', '落子', '拿下'],
    swatch: 'linear-gradient(135deg, #e4ecff, #4454b8)',
  },
  {
    id: 'blaze',
    name: '热血',
    mood: '今天就想赢',
    headline: '这班我来拿',
    intro: '工位就是擂台。你一坐下，薪水就开打',
    beats: ['上阵', '咬住', '拿下'],
    swatch: 'linear-gradient(135deg, #ffd2b3, #ff4d2e)',
  },
  {
    id: 'slack',
    name: '松弛',
    mood: '想松一口气',
    headline: '缰绳松一寸',
    intro: '可以慢，但不能亏。该记的每一秒都还在',
    beats: ['喘气', '续上', '不亏'],
    swatch: 'linear-gradient(135deg, #e7fff7, #1f8f78)',
  },
  {
    id: 'fortune',
    name: '暴富',
    mood: '想看见钱进来',
    headline: '财气到工位了',
    intro: '账本打开。今天的薪水，提前向你报到',
    beats: ['进账', '加码', '落袋'],
    swatch: 'linear-gradient(135deg, #fff1cc, #c9843a)',
  },
  {
    id: 'dawn',
    name: '破晓',
    mood: '想从容地开始',
    headline: '你已就位',
    intro: '新的一天铺好了。你往前走，账本跟得上',
    beats: ['醒来', '迈步', '做成'],
    swatch: 'linear-gradient(135deg, #ffe4da, #c45b6a)',
  },
]

/** 按编号取出皮肤，不认识就回到金账 */
export const wpc_findSkin = (id: WpcSkinId): WpcSkin => {
  const wpc_found = wpc_skins.find((item) => item.id === id)
  return wpc_found ?? wpc_skins[0]
}
