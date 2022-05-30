import React, { useMemo } from 'react'
import './index.less'
import ProposalItemStatus from '../ProposalItemStatus'
import { formatDate, Proposal } from '@soda/soda-core'
import ProposalResults from '../ProposalResults'
interface IProps {
  item: Proposal
  onSelect?: (item: Proposal) => void
}

export default (props: IProps) => {
  const { item, onSelect } = props

  const handleSelect = () => {
    onSelect?.(item)
  }

  return (
    <div className="proposal-item-container">
      <div className="proposal-left">
        <p className="proposal-title" onClick={handleSelect}>
          {item.title}
        </p>
        <p className="proposal-desc">{item.description}</p>
        <div className="proposal-item-footer">
          <ProposalItemStatus status={item.status} />
          <p className="start-date-time">
            #{item.snapshotBlock} (app. {formatDate(item.startTime)}) ~
            {formatDate(item.endTime)}
          </p>
        </div>
      </div>
      <ProposalResults items={item.items} results={item.results} />
    </div>
  )
}
