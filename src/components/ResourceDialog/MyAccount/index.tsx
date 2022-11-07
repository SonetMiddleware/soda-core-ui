import React, { useEffect, useState, useMemo } from 'react'
import { Radio, message, Button, Pagination, Input, Spin } from 'antd'
import './index.less'
import SodaButton from '../../Button'
import IconCopy from '../../../assets/images/icon-copy.svg'
import IconLink from '../../../assets/images/icon-link.svg'
import IconLogout from '../../../assets/images/icon-logout.svg'
import { fallbackCopyTextToClipboard } from '../../../utils'
const Chain_List = [
  {
    name: 'ETH Mainnet',
    chainId: 1
  },
  {
    name: 'Flow Mainnet'
  },
  {
    name: 'Polygon Mainnet',
    chainId: 137
  },
  {
    name: 'Mumbai',
    chainId: 80001
  }
]
const SODA_LINK = ''
export default () => {
  const [hasAuth, setHasAuth] = useState(true)
  const [account, setAccount] = useState(
    '0x1B94fb7625e13408393B5Ac17D0265E0d61349f2'
  )
  const addresDisplay = useMemo(() => {
    return account.substring(0, 6) + '...' + account.substr(-4)
  }, [account])
  useEffect(() => {}, [])
  const handleLogin = (chain: any) => {}
  const handleLogout = () => {}
  return (
    <div className="soda-my-account">
      {!hasAuth && (
        <ul className="chain-list">
          {Chain_List.map((item) => (
            <li>
              <SodaButton type="primary" onClick={() => handleLogin(item)}>
                {item.name}
              </SodaButton>
            </li>
          ))}
        </ul>
      )}
      {hasAuth && (
        <div className="soda-authed">
          <div className="soda-avatar-temp"></div>
          <div className="soda-account">
            <span>{addresDisplay}</span>
            <img
              src={IconCopy}
              alt=""
              onClick={() => fallbackCopyTextToClipboard(account)}
            />
          </div>
          <p className="soda-chain">Connected with ETH Mainnet</p>
          <div className="horizon-line"></div>
          <SodaButton
            type="primary"
            className="btn-explore"
            onClick={() => window.open(SODA_LINK, '_blank')}>
            <img src={IconLink} alt="" />
            <span>Explore Soda</span>
          </SodaButton>
          <Button className="btn-soda-logout" onClick={handleLogout}>
            <img src={IconLogout} alt="" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  )
}
