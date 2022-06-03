import React, { useEffect, useState } from 'react'
import { Radio, message, Button, Pagination, Input, Spin } from 'antd'
import './index.less'
import { removeTokenFromFav, getFavTokens, getRole, NFT } from '@soda/soda-core'
import CommonButton from '../../Button'
import MediaCacheDisplay from '../../MediaCacheDisplay'
import { shareByCacheInfo } from '@/utils/token'
interface IProps {
  address: string
  app: string
  publishFunc?: () => void
}
const PAGE_SIZE = 9
export default (props: IProps) => {
  const { address, app, publishFunc } = props
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [favTokens, setFavTokens] = useState<NFT[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedImg, setSelectedImg] = useState<number>()

  const fetchFavList = async (currentPage: number) => {
    if (address) {
      setLoading(true)
      const nfts = await getFavTokens({
        address,
        offset: (currentPage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE
      })
      setTotal(nfts.total)
      const _tokens = []
      for (const item of nfts.data) {
        try {
          const token = await getRole({ token: item })
          const { minter, owner } = token
          item.minter = minter
          item.owner = owner
        } catch (e) {}
        _tokens.push({ ...item })
      }
      console.debug('[core-ui] FavTokenList getFavTokens: ', _tokens)
      setLoading(false)
      setFavTokens([])
      setFavTokens(_tokens)
      setPage(currentPage)
    }
  }

  const handleChangePage = (newPage: number, pageSize: number | undefined) => {
    fetchFavList(newPage)
  }

  const handleFinish = async () => {
    if (selectedImg !== undefined) {
      try {
        setSubmitting(true)
        const selectedObj = favTokens[selectedImg]
        await shareByCacheInfo({
          chainId: selectedObj.chainId,
          tokenId: '' + selectedObj.tokenId,
          contract: selectedObj.contract
        })
        setSubmitting(false)
        // setShow(false);
        publishFunc()
        // await pasteShareTextToEditor(app)
      } catch (err) {
        console.error('[core-ui] FavTokenList handleFinish: ', err)
        setSubmitting(false)
      }
    } else {
      message.warning('Please select one NFT')
      return
    }
  }

  const handleRemoveFav = async (item: NFT, index: number) => {
    const res = await removeTokenFromFav({ address, token: item })
    if (res) message.success('Remove favorite successful!')
    if (index > -1) {
      fetchFavList(page)
    }
  }

  useEffect(() => {
    fetchFavList(1)
  }, [])

  return (
    <div className="fav-list-container">
      <p className="title">Select one of your favorite NFTs to share</p>
      <div className="search-header">
        <Input
          type="text"
          placeholder="Input search text"
          className="input-search"
        />
        <img
          className="icon-view"
          src={chrome.extension.getURL('images/icon-view.png')}
          alt=""
        />
        <img
          className="icon-filter"
          src={chrome.extension.getURL('images/icon-filter.png')}
          alt=""
        />
      </div>
      <Spin spinning={loading}>
        <Radio.Group
          className="list-container"
          onChange={(e) => {
            setSelectedImg(e.target.value)
          }}
          value={selectedImg}>
          {favTokens.map((item, index) => (
            <Radio value={index} key={item.source} className="custom-radio">
              <div className="item-detail">
                <MediaCacheDisplay className="img-item" token={item} />

                <div className="item-name-tags">
                  <p className="item-name">#{item.tokenId}</p>
                  <p className="item-tags">
                    {item.minter == address && <span className="item-minted" />}
                    {item.owner == address && <span className="item-owned" />}
                  </p>
                </div>
                {item.owner != address && item.minter != address && (
                  <div className="item-btns">
                    <Button
                      size="small"
                      className="btn-remove"
                      onClick={() => handleRemoveFav(item, index)}>
                      Remove
                    </Button>
                  </div>
                )}
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
          <div className="tags-tips">
            <p>
              <span className="item-minted" />
              <span>Created</span>
            </p>
            <p>
              <span className="item-owned" />
              <span>Owned</span>
            </p>
          </div>
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
