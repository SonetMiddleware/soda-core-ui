import React, { useMemo } from 'react'
import './index.less'
import { ProposalStatusEnum } from '@soda/soda-core'
import classNames from 'classnames'

export default (props: { status: ProposalStatusEnum }) => {
  const { status } = props

  const statusText = useMemo(() => {
    if (status === ProposalStatusEnum.SOON) {
      return 'Soon'
    } else if (status === ProposalStatusEnum.OPEN) {
      return 'Open'
    } else if (status === ProposalStatusEnum.VALID) {
      return 'Closed'
    } else if (status === ProposalStatusEnum.INVALID) {
      return 'Failed'
    }
  }, [status])

  return (
    <div
      className={classNames('status', {
        open: status === ProposalStatusEnum.OPEN,
        soon: status === ProposalStatusEnum.SOON,
        passed: status === ProposalStatusEnum.VALID,
        notPassed: status === ProposalStatusEnum.INVALID
      })}>
      <span className="dot"></span>
      <span className="text">{statusText}</span>
    </div>
  )
}
