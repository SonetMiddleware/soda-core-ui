import React, { useEffect, useRef, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import './index.less'
import { renderToken, NFT } from '@soda/soda-core'

export default (props: {
  token: NFT
  flex?: boolean
  iconSize?: number
  [key: string]: any
  extraTypes?: []
}) => {
  const [loading, setLoading] = useState(true)
  const { token, extraTypes, flex, iconSize = 14, ...rest } = props
  const [dom, setDom] = useState<HTMLDivElement>(null)
  useEffect(() => {
    ;(async () => {
      if (dom) {
        setLoading(true)
        dom.innerHTML = ''
        try {
          await renderToken(token, {
            dom,
            config: { extra: extraTypes }
          })
          // setSrc(source)
        } catch (e) {
          console.error('[core-ui] MediaDisplay get media source: ' + e)
        }
        setLoading(false)
      }
    })()
  }, [token, dom])

  return (
    <div
      className={flex ? 'img-container-flex' : 'img-container'}
      style={{
        alignItems: rest.align || 'center'
      }}>
      {loading && <LoadingOutlined style={{ fontSize: iconSize + 'px' }} />}

      <div
        ref={setDom}
        style={{ display: loading ? 'none' : 'flex' }}
        {...rest}></div>
    </div>
  )
}
