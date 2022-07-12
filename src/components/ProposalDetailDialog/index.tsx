import React, { useMemo, useState, useEffect } from 'react'
import './index.less'
import { Button, Modal, Radio, Space, message, Tooltip } from 'antd'
import IconClose from '../../assets/images/icon-close.png'
import ProposalStatus from '../ProposalItemStatus'
import ProposalResults from '../ProposalResults'
import {
  formatDateTime,
  vote as voteProposal,
  getUserVoteInfo,
  CollectionDao,
  ProposalStatusEnum,
  Proposal,
  sha3,
  sign
} from '@soda/soda-core'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface IProps {
  show: boolean
  detail: Proposal
  collectionDao: CollectionDao
  onClose: (updatedProposalId?: string) => void
  address: string
  inDao: boolean
}

export default (props: IProps) => {
  const { show, detail, onClose, collectionDao, address, inDao } = props
  const [vote, setVote] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [voted, setVoted] = useState(false)
  const totalSupporters = useMemo(() => {
    const totalVotersNum = detail.results.reduce((a, b) => a + b)
    if (totalVotersNum >= detail.ballotThreshold) {
      return totalVotersNum
    } else {
      return `${totalVotersNum}/${detail.ballotThreshold}`
    }
  }, [detail])

  const handleVoteChange = (e: any) => {
    setVote(e.target.value)
  }

  const handleVoteSubmit = async () => {
    if (!vote) {
      message.warn('Please set one option to vote.')
      return
    }
    if (!address) {
      message.warn('No metamask installed.')
      return
    }
    try {
      setSubmitting(true)
      const str = sha3(detail.id, vote)

      const res: any = await sign({
        message: str,
        address
      })
      const result = await voteProposal({
        voter: address,
        collectionId: collectionDao!.collection.id,
        proposalId: detail.id,
        item: vote,
        sig: res.result
      })
      if (result) {
        message.success('Vote successful.')
        setSubmitting(false)
        onClose(String(detail.id))
      } else {
        message.error('Vote failed.')
        setSubmitting(false)
      }
    } catch (e) {
      setSubmitting(false)
      console.error(e)
      message.warn('Vote failed.')
    }
  }

  useEffect(() => {
    ;(async () => {
      if (show && detail) {
        const res = await getUserVoteInfo({
          proposalId: detail.id,
          daoId: collectionDao.collection.id,
          address
        })
        if (res) {
          setVoted(true)
          setVote(res.item)
        }
        setIsOpen(detail.status === ProposalStatusEnum.OPEN)
      }
    })()
  }, [show])

  return (
    <Modal
      footer={null}
      className="common-modal"
      visible={show}
      closable={false}
      width={720}
      mask={false}
      transitionName=""
      maskTransitionName="">
      <div className="proposal-detail-container">
        <div className="header">
          <div className="header-left">
            <p className="end-time">End at {formatDateTime(detail.endTime)}</p>
            <p className="title">{detail.title}</p>
            <p className="total-supporter">Votes - {totalSupporters}</p>
          </div>
          <div className="header-right">
            <img src={IconClose} alt="" onClick={() => onClose()} />
            <ProposalStatus status={detail.status} />
          </div>
        </div>

        <div className="divide-line"></div>
        <div className="desc">
          <p>{detail.description}</p>
        </div>
        <div className="vote-submit-results-container">
          {isOpen && inDao && (
            <div className="vote-container">
              <p className="vote-title">Cast your vote</p>
              <Radio.Group
                onChange={handleVoteChange}
                value={vote}
                className="custom-radio">
                <Space direction="vertical">
                  {detail.items.map((option, index) => (
                    <Radio
                      value={option}
                      key={index}
                      disabled={voted && vote !== option}
                      className="custom-radio-item">
                      {option}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
              {!voted && (
                <div>
                  <Button
                    type="primary"
                    onClick={handleVoteSubmit}
                    className="vote-btn"
                    loading={submitting}>
                    Vote now
                  </Button>
                  <Tooltip title="Your vote can not be changed.">
                    <ExclamationCircleOutlined />
                  </Tooltip>
                </div>
              )}
            </div>
          )}
          <ProposalResults items={detail.items} results={detail.results} />
        </div>
      </div>
    </Modal>
  )
}
