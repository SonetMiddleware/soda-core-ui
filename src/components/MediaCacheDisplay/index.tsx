import React, { useEffect, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import './index.less'
import { getCacheMedia, NFT } from '@soda/soda-core'

export default (props: { token: NFT; [key: string]: any }) => {
  const [loading, setLoading] = useState(true)
  const { token, ...rest } = props
  const [src, setSrc] = useState(token.source)
  useEffect(() => {
    const sourceHandle = async () => {
      const source = await getCacheMedia({
        token,
        storageConfig: {
          uri: true
        }
      })
      setSrc(source)
    }
    sourceHandle()
  }, [])

  return (
    <>
      <div
        className="loading-container"
        style={{ display: loading ? 'flex' : 'none' }}>
        <LoadingOutlined />
      </div>
      <div
        className="img-container"
        style={{ display: loading ? 'none' : 'flex' }}>
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
