import React, { useEffect, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import './index.less'
import { getCacheMedia, NFT } from '@soda/soda-core'

export default (props: { token: NFT; flex?: boolean; [key: string]: any }) => {
  const [loading, setLoading] = useState(true)
  const { token, flex, ...rest } = props
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
      } catch (e) {
        console.error(
          '[core-ui] MediaCacheDisplay get cache media source: ' + e
        )
      }
    })()
  }, [token])

  return (
    <>
      <div
        className="loading-container"
        style={{ display: loading ? 'flex' : 'none' }}>
        <LoadingOutlined />
      </div>
      <div
        className={flex ? 'img-container-flex' : 'img-container'}
        style={{
          display: loading ? 'none' : 'flex',
          alignItems: rest.align || 'center'
        }}>
        <img
          src={src}
          {...rest}
          onLoad={() => {
            setLoading(false)
          }}
        />
      </div>
    </>
  )
}
