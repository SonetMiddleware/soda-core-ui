import './index.less'
import React, { useEffect, useState, useMemo } from 'react'
import IconCopy from '../../../assets/images/icon-copy.svg'
import SodaButton from '../../Button'
import IconLogout from '../../../assets/images/icon-logout.svg'
import { Button, Modal, Popover } from 'antd'
import MyAccount from '../MyAccount'
import { fallbackCopyTextToClipboard } from '../../../utils'
interface IProps {
  address: string
  chainId?: number
  chainName?: string
  onSwitch: () => void
}

export const getChainNameDisplay = (chainId: number | string) => {
  const map = {
    1: 'ETH Mainnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai',
    flowmain: 'Flow Mainnet',
    flowtest: 'Flow Testnet'
  }
  if (chainId) {
    return map[chainId]
  }
  return ''
}

export default (props: IProps) => {
  const { address = '', chainId, chainName, onSwitch } = props

  const addresDisplay = useMemo(() => {
    return address.substr(0, 6) + '...' + address.substr(-6)
  }, [address])
  const chainNameDisplay = useMemo(() => {
    if (chainName) {
      return chainName
    }
    return getChainNameDisplay(chainId)
  }, [chainName, chainId])
  return (
    <div className="account-display">
      <Popover
        trigger="hover"
        placement="bottomLeft"
        content={
          <div className="account-display-content">
            <div className="soda-authed">
              <div className="soda-avatar-temp"></div>
              <div className="soda-account">
                <span>{addresDisplay}</span>
                <img
                  src={IconCopy}
                  alt=""
                  onClick={() => fallbackCopyTextToClipboard(address)}
                />
              </div>
              <p className="soda-chain">Connected with {chainNameDisplay}</p>
              <div className="horizon-line"></div>

              <Button className="btn-soda-logout" onClick={onSwitch}>
                <img src={IconLogout} alt="" />
                <span>Switch Chain</span>
              </Button>
            </div>
          </div>
        }>
        <Button>{addresDisplay}</Button>
      </Popover>
    </div>
  )
}
