import React, { useState, useEffect, useCallback } from 'react'
import './index.less'
import { Spin, Pagination, message, Radio } from 'antd'
import MediaCacheDisplay from '../../MediaCacheDisplay'
import CommonButton from '../../Button'
import { getOwnedTokens, NFT } from '@soda/soda-core'
import { shareByCacheInfo } from '@/utils/token'

interface IProps {
  address: string
  app: string
  publishFunc?: (str: string, img?: Blob) => void
}
const PAGE_SIZE = 9
export default (props: IProps) => {
  const { address, app, publishFunc } = props
  const [ownedTokens, setOwnedTokens] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImg, setSelectedImg] = useState<number>()
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const fetchOwnedList = useCallback(
    async (page: number) => {
      if (address) {
        try {
          setLoading(true)
          const _tokens = await getOwnedTokens({
            address,
            offset: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE
          })
          console.debug('[core-ui] fetchOwnedList: ', _tokens)
          setOwnedTokens([])
          setOwnedTokens(_tokens.data)
          setTotal(_tokens.total)
          setPage(page)
          setLoading(false)
        } catch (err) {
          setLoading(false)
        }
      }
    },
    [address]
  )

  const handleChangePage = (page: number) => {
    fetchOwnedList(page)
  }

  const handleFinish = async () => {
    if (selectedImg !== undefined) {
      try {
        setSubmitting(true)
        const selectedObj = ownedTokens[selectedImg]
        const res = await shareByCacheInfo({
          chainId: selectedObj.chainId,
          tokenId: '' + selectedObj.tokenId,
          contract: selectedObj.contract
        })
        message.success(
          'Your NFT is minted and copied. Please paste into the new post dialog',
          5
        )
        setSubmitting(false)
        // await pasteShareTextToEditor(app);
        publishFunc && publishFunc('', res.blob)
      } catch (err) {
        console.error('[core-ui] OwnedTokenList handleFinish: ', err)
        setSubmitting(false)
      }
    } else {
      message.warning('Please select one NFT')
      return
    }
  }

  useEffect(() => {
    fetchOwnedList(1)
  }, [])

  return (
    <div className="owned-list-container">
      <Spin spinning={loading}>
        <p className="title">Select one of your NFTs to share</p>
        <Radio.Group
          className="list-container"
          onChange={(e) => {
            setSelectedImg(e.target.value)
          }}
          value={selectedImg}>
          {ownedTokens.map((item, index) => (
            <Radio value={index} key={item.source} className="custom-radio">
              <div className="item-detail">
                <MediaCacheDisplay className="img-item" token={item} />
                <p className="item-name">#{item.tokenId}</p>
              </div>
            </Radio>
          ))}
        </Radio.Group>
        <div className="list-pagination">
          <Pagination
            total={total}
            pageSize={PAGE_SIZE}
            onChange={handleChangePage}
            current={page}
          />
        </div>
        <div className="list-footer">
          <CommonButton
            type="secondary"
            onClick={handleFinish}
            className="btn-finish"
            loading={submitting}>
            Attach
          </CommonButton>
        </div>
      </Spin>
    </div>
  )
}
