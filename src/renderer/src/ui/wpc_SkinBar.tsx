import type { ReactElement } from 'react'
import { wpc_skins } from '../engine/wpc_skins'
import type { WpcSkinId } from '../engine/wpc_types'

interface WpcSkinBarProps {
  skin: WpcSkinId
  wpc_onSkin: (id: WpcSkinId) => void
}

/** 今日心情。点一颗色点就换一整套皮肤 */
const wpc_SkinBar = (props: WpcSkinBarProps): ReactElement => {
  const { skin, wpc_onSkin } = props
  return (
    <div className="skins" role="listbox" aria-label="今日心情">
      {wpc_skins.map((item) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={item.id === skin}
          className={item.id === skin ? 'is-on' : undefined}
          title={item.mood}
          onClick={() => {
            wpc_onSkin(item.id)
          }}
        >
          <i style={{ background: item.swatch }} />
          {item.name}
        </button>
      ))}
    </div>
  )
}

export { wpc_SkinBar }
export const WpcSkinBar = wpc_SkinBar
