import type { WpcPhase, WpcTreat, WpcTreatView } from './wpc_types'

/** 用薪水能换到的小确幸，按价格从低到高 */
export const wpc_treatLadder: readonly WpcTreat[] = [
  { id: 'water', name: '矿泉水', price: 2 },
  { id: 'coffee', name: '美式咖啡', price: 15 },
  { id: 'tea', name: '一杯奶茶', price: 18 },
  { id: 'lunch', name: '一顿工作餐', price: 35 },
  { id: 'movie', name: '一张电影票', price: 49 },
  { id: 'hotpot', name: '一人火锅', price: 128 },
  { id: 'shirt', name: '一件 T 恤', price: 199 },
  { id: 'trip', name: '周末短途', price: 500 },
  { id: 'day', name: '一天房租感', price: 1200 },
]

/** 在班时轮换的碎碎念 */
export const wpc_workQuotes: readonly string[] = [
  '工位是牧场，光标是缰绳',
  '每一秒都在把工时换成饭钱',
  '薪水不语，只是一味地涨',
  '今日份灵魂已按时上架',
  '认真上班，悄悄把小确幸攒出来',
  '距离生活只差一个下班键',
  '你负责把事做完，账本负责给你记功',
  '这不是煎熬，这是薪水的加时赛',
  '牛马也有账本，而且精确到秒',
  '再撑一会儿，火锅正在路上',
  '时间会过去，到账的数字会留下',
  '摸鱼的时候，记得看一眼自己值多少',
]

/** 非在班时段的固定一句 */
export const wpc_phaseHint = (phase: WpcPhase): string => {
  if (phase === 'lunch') return '胃在加班，工资在午休'
  if (phase === 'overtime') return '加时赛开始，这一段按倍率结'
  if (phase === 'paused') return '摸鱼也是班，这一秒照样结账'
  if (phase === 'before') return '还没到点，班表到了再开始长钱'
  if (phase === 'after') return '到点了。想继续长钱，就打开加班'
  if (phase === 'off') return '今日身价已落袋，早点去生活'
  if (phase === 'idle') return '点一下开始上班，让每一秒开始计价'
  return '薪水正在按秒结账'
}

/** 印章上的两个字。和开始上班 / 摸鱼 / 下班按钮对得上 */
export const wpc_sealText = (phase: WpcPhase): string => {
  if (phase === 'working') return '牛马'
  if (phase === 'lunch') return '休闲'
  if (phase === 'overtime') return '拼命'
  if (phase === 'paused') return '摸鱼'
  if (phase === 'off') return '下班'
  if (phase === 'before') return '待命'
  if (phase === 'after') return '到点'
  return '待命'
}

/** 印章下面那句短说明 */
export const wpc_sealHint = (phase: WpcPhase): string => {
  if (phase === 'working') return '在干活'
  if (phase === 'lunch') return '在午休'
  if (phase === 'overtime') return '在加班'
  if (phase === 'paused') return '在偷懒'
  if (phase === 'off') return '今日收工'
  if (phase === 'before') return '还没到点'
  if (phase === 'after') return '班表已到'
  return '等你发令'
}

/** 按今天走到哪，给这头牛一个段位 */
export const wpc_rankTitle = (phase: WpcPhase, progress: number): string => {
  if (phase === 'off') return '收工牛'
  if (phase === 'overtime') return '加时老黄牛'
  if (phase === 'lunch') return '干饭牛'
  if (phase === 'paused') return '趴窝牛'
  if (phase === 'before' || phase === 'idle') return '待套缰绳'
  if (phase === 'after') return '到点牛'
  if (progress < 0.2) return '刚出栏'
  if (progress < 0.45) return '上午牛'
  if (progress < 0.75) return '巡航牛'
  if (progress < 1) return '冲刺牛'
  return '满勤牛'
}

/** 牛对着你说的一句，跟着班次变 */
export const wpc_oxLine = (phase: WpcPhase): string => {
  if (phase === 'working') return '牛马本马，这一秒算你的'
  if (phase === 'lunch') return '休闲一下，胃先加班'
  if (phase === 'overtime') return '拼命模式已打开'
  if (phase === 'paused') return '小猫坏笑中，钱还在涨'
  if (phase === 'before') return '到点我就开跑'
  if (phase === 'after') return '到点了，去生活'
  if (phase === 'off') return '下班快乐，今天你赢了'
  return '我在等你发令'
}

/** 状态行短句 */
export const wpc_statusText = (phase: WpcPhase): string => {
  if (phase === 'working') return '牛马模式 · 正在结账'
  if (phase === 'lunch') return '休闲模式 · 午休停表'
  if (phase === 'overtime') return '拼命模式 · 加班加成'
  if (phase === 'paused') return '摸鱼模式 · 工资照加'
  if (phase === 'off') return '下班了 · 今日收工'
  if (phase === 'before') return '还没到上班时间'
  if (phase === 'after') return '班表已到点'
  return '待命 · 等你开始牛马'
}

/** 轮换到下一句碎碎念 */
export const wpc_nextQuote = (current: number): number => (current + 1) % wpc_workQuotes.length

/** 看看已经解锁到哪一档，下一档还差多少 */
export const wpc_treatProgress = (earned: number): WpcTreatView => {
  const wpc_safe = Number.isFinite(earned) ? Math.max(0, earned) : 0
  let wpc_current: WpcTreat | null = null
  let wpc_next: WpcTreat | null = null
  for (const wpc_item of wpc_treatLadder) {
    if (wpc_safe + 1e-6 >= wpc_item.price) {
      wpc_current = wpc_item
    } else {
      wpc_next = wpc_item
      break
    }
  }
  const wpc_base = wpc_current?.price ?? 0
  const wpc_goal = wpc_next?.price ?? wpc_base
  const wpc_span = Math.max(1, wpc_goal - wpc_base)
  const wpc_ratio = wpc_next ? Math.min(1, Math.max(0, (wpc_safe - wpc_base) / wpc_span)) : 1
  const wpc_remain = wpc_next ? Math.max(0, wpc_next.price - wpc_safe) : 0
  return { current: wpc_current, next: wpc_next, ratio: wpc_ratio, remain: wpc_remain }
}
