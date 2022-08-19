import React, { useEffect, useState } from 'react'
import { Modal, Button, Pagination } from 'antd'
import * as ReactDOM from 'react-dom'
import './index.less'
import IconFB from '../../assets/images/icon-facebook-gray.svg'
import IconTwitter from '../../assets/images/icon-twitter-gray.svg'
import {
  NFT,
  getAddress,
  getBindResult,
  addTokenToFav,
  getFavTokens,
  getRole,
  getTokenSource,
  generateTokenMask,
  BindInfo,
  CollectionDao,
  appInvoke,
  AppFunction,
  getCollectionDaoByToken,
  getInlineMarketplace,
  getChainId,
  getProposalList,
  Proposal
} from '@soda/soda-core'
interface IProps {
  show: boolean
  onClose: () => void
  token: NFT
}
export default (props: IProps) => {
  const { token, show, onClose } = props
  const [collectionDao, setCollectionDao] = useState<CollectionDao>()
  const [list, setList] = useState<Proposal[]>([])
  const [totalProposals, setTotalProposals] = useState(0)
  let divNode: HTMLDivElement = null
  divNode = document.createElement('div')
  document.body.append(divNode)
  const fetchCollectionInfo = async () => {
    const collection = await getCollectionDaoByToken(token) // TODO:get contract from meta
    setCollectionDao(collection)
  }

  const fetchProposalList = async (daoId: string) => {
    const listResp = await getProposalList({ dao: daoId, page: 1, gap: 10 })
    const list = listResp.data
    setList(list)
    setTotalProposals(listResp.total)
  }

  useEffect(() => {
    fetchCollectionInfo()
  }, [token])

  useEffect(() => {
    if (show && collectionDao && collectionDao.collection.id) {
      fetchProposalList(collectionDao.collection.id)
    }
  }, [collectionDao, show])

  return ReactDOM.createPortal(
    <Modal
      visible={show}
      footer={null}
      onCancel={onClose}
      width={944}
      transitionName=""
      maskTransitionName=""
      className="nft-info-modal">
      <div className="nft-info-container">
        <div className="nft-info-header">
          <p className="nft-dao-name">{collectionDao?.dao?.name}</p>
          <p className="dao-info-item">
            <img src={IconTwitter} alt="" />
            <a
              className="value"
              href={`https://twitter.com/${collectionDao?.dao?.accounts.twitter}`}
              target="_blank"
              rel="noreferrer">
              {collectionDao?.dao.accounts.twitter}
            </a>
          </p>
          {collectionDao?.dao.accounts.facebook && (
            <p className="dao-info-item">
              <img src={IconFB} alt="" />
              <a
                className="value"
                href={`https://facebook.com/${collectionDao?.dao?.accounts.facebook}`}
                target="_blank"
                rel="noreferrer">
                {collectionDao?.dao?.accounts.facebook}
              </a>
            </p>
          )}
        </div>
        <div className="nft-info-item">
          <span>Total proposals: </span>
          <span>{totalProposals}</span>
        </div>
        <div className="nft-info-item">
          <span>Active members: </span>
          <span>1000</span>
        </div>
        <div className="nft-info-item">
          <span>Top 3 proposals </span>
        </div>
      </div>
    </Modal>,
    divNode
  )
}
