import React, { useEffect, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import './index.less'
import { getCacheMedia, NFT } from '@soda/soda-core'

export default (props: {
  token: NFT
  flex?: boolean
  iconSize?: number
  [key: string]: any
}) => {
  const [loading, setLoading] = useState(true)
  const { token, flex, iconSize = 14, ...rest } = props
  const [src, setSrc] = useState(token.source)
  useEffect(() => {
    ;(async () => {
      try {
        const source = await getCacheMedia({
          token,
          storageConfig: {
            uri: true
          }
        })
        setSrc(source)
        setLoading(true)
      } catch (e) {
        console.error(
          '[core-ui] MediaCacheDisplay get cache media source: ' + e
        )
      }
    })()
  }, [token])

  return (
    <>
      {/* <div
        className="loading-container"
        style={{ display: loading ? 'flex' : 'none' }}>
        <LoadingOutlined style={{ fontSize: iconSize + 'px' }} />
      </div> */}
      <div
        className={flex ? 'img-container-flex' : 'img-container'}
        style={{
          alignItems: rest.align || 'center'
        }}>
        {loading && <LoadingOutlined style={{ fontSize: iconSize + 'px' }} />}

        <div style={{ display: loading ? 'none' : 'flex' }}>
          <img
            src={src}
            {...rest}
            onLoad={() => {
              setLoading(false)
            }}
          />
        </div>
      </div>
    </>
  )
}
