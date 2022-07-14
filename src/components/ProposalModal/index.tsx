import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
import * as ReactDOM from 'react-dom'
import './index.less'
import ProposalItem from '../ProposalItem'
import {
  formatDate,
  getProposalList,
  getAddress,
  CollectionDao,
  Proposal,
  getDaoList
} from '@soda/soda-core'
import ProposalDetailDialog from '../ProposalDetailDialog'
import CommonBtn from '../Button'
import { openExtensionPage } from '@/utils/chrome'
import IconFB from '../../assets/images/icon-facebook-gray.svg'
import IconTwitter from '../../assets/images/icon-twitter-gray.svg'
interface IProps {
  show: boolean
  onClose: () => void
  collectionDao: CollectionDao
}

export default (props: IProps) => {
  const { show, onClose, collectionDao } = props
  const { dao: currentDao } = collectionDao || {}
  const [list, setList] = useState<Proposal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [address, setAddress] = useState('')
  const [inDao, setInDao] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal>()
  let divNode: HTMLDivElement = null
  divNode = document.createElement('div')
  document.body.append(divNode)

  const fetchProposalList = async (daoId: string) => {
    const listResp = await getProposalList({ dao: daoId })
    const list = listResp.data
    setList(list)
  }
  const handleDetailDialogClose = () => {
    setShowModal(false)
    fetchProposalList(collectionDao.collection.id)
  }

  const fetchUserInfo = async () => {
    const addr = await getAddress()
    setAddress(addr)
    const res = await getDaoList({ address: addr })
    const myDaos = res.data
    for (const item of myDaos) {
      if (item.id === currentDao?.id) {
        setInDao(true)
        return
      }
    }
  }

  useEffect(() => {
    if (show && collectionDao && collectionDao.collection.id) {
      fetchProposalList(collectionDao.collection.id)
      fetchUserInfo()
    }
  }, [collectionDao, show])

  const handleNew = () => {
    openExtensionPage(`daoNewProposal?dao=${collectionDao.collection.id}`)
  }

  return ReactDOM.createPortal(
    <Modal
      visible={show}
      footer={null}
      onCancel={onClose}
      width={944}
      transitionName=""
      maskTransitionName=""
      className="proposal-modal">
      <div className="proposal-container">
        <div className="header">
          <p className="title">Proposal</p>
          <CommonBtn
            type="primary"
            className="btn-new-proposal"
            disabled={!inDao}
            onClick={handleNew}>
            New Proposal
          </CommonBtn>
        </div>
        <div className="proposal-modal-content">
          <div className="left-content">
            <div className="dao-img">
              <img src={collectionDao?.collection.image} alt="" />
              <p className="dao-name">{currentDao?.name}</p>
            </div>
            <div className="dao-detail-info">
              <p className="dao-info-item">
                <span className="label">Date Created</span>
                <span className="value">
                  {formatDate(currentDao?.startDate)}
                </span>
              </p>
              {/* <p className="dao-info-item">
                <span className="label">Total members</span>
                <span className="value">{currentDao?.totalMember}</span>
              </p> */}
              <p className="dao-info-item">
                <img src={IconTwitter} alt="" />
                <a
                  className="value"
                  href={`https://twitter.com/${currentDao?.accounts.twitter}`}
                  target="_blank"
                  rel="noreferrer">
                  {currentDao?.accounts.twitter}
                </a>
              </p>
              {currentDao?.accounts.facebook && (
                <p className="dao-info-item">
                  <img src={IconFB} alt="" />
                  <a
                    className="value"
                    href={`https://facebook.com/${currentDao?.accounts.facebook}`}
                    target="_blank"
                    rel="noreferrer">
                    {currentDao?.accounts.facebook}
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="proposal-list-container">
            <div className="proposal-list">
              {list.map((item) => (
                <ProposalItem
                  item={item}
                  onSelect={() => {
                    setShowModal(true)
                    setSelectedProposal(item)
                  }}
                />
              ))}
            </div>
          </div>
          {selectedProposal && (
            <ProposalDetailDialog
              collectionDao={collectionDao}
              show={showModal}
              detail={selectedProposal!}
              onClose={handleDetailDialogClose}
              address={address}
              inDao={inDao}
            />
          )}
        </div>
      </div>
    </Modal>,
    divNode
  )
}
