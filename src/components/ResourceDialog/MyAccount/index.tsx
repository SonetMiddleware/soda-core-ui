import React, { useEffect, useState, useMemo } from 'react'
import { Radio, message, Button, Pagination, Input, Spin } from 'antd'
import './index.less'
import SodaButton from '../../Button'
import IconCopy from '../../../assets/images/icon-copy.svg'
import IconLink from '../../../assets/images/icon-link.svg'
import IconLogout from '../../../assets/images/icon-logout.svg'
import { fallbackCopyTextToClipboard } from '../../../utils'
//@ts-ignore
import * as fcl from '@onflow/fcl'
import { getLocal, saveLocal, StorageKeys, removeLocal } from '@/utils/storage'
import { getChainNameDisplay } from '../MyAccountDisplay'
import { getAppConfig } from '@soda/soda-package-index'
import { getAddress, getChainId } from '@soda/soda-core'

const Chain_List = [
  {
    name: 'ETH Mainnet',
    chainId: 1
  },
  {
    name: 'Flow Mainnet',
    chainId: 'flowmain'
  },
  {
    name: 'Flow Testnet',
    chainId: 'flowtest'
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
const SODA_LINK = 'https://flow.sonet.one/'
const ConnectToInjected = async () => {
  let provider = null
  if (typeof window.ethereum !== 'undefined') {
    provider = window.ethereum
    try {
      await provider.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      throw new Error('User Rejected')
    }
  } else {
    throw new Error('No Web3 Provider found')
  }
  return provider
}

interface IProps {
  onLogin: (account: { addr: string; chain: string | number }) => void
  onLogout?: () => void
}

export default (props: IProps) => {
  const { onLogin, onLogout } = props
  const [hasAuth, setHasAuth] = useState(false)
  const [account, setAccount] = useState<any>({ addr: '', chain: '' })

  const addresDisplay = useMemo(() => {
    if (account && account.addr) {
      return account.addr.substring(0, 6) + '...' + account.addr.substr(-4)
    }
    return ''
  }, [account])

  const getLocalLoginedAccount = async () => {
    const chainId = await getChainId()
    const address = await getAddress()
    try {
      const config = getAppConfig(chainId)
      setHasAuth(true)
      setAccount({ addr: address, chain: chainId })
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    getLocalLoginedAccount()
  }, [])
  let currentUserRes
  const loginFLow = (chain: any) => {
    fcl
      .config()
      .put('challenge.scope', 'email') // request for Email
      .put(
        'accessNode.api',
        chain.chainId === 'flowmain'
          ? 'https://rest-mainnet.onflow.org'
          : 'https://rest-testnet.onflow.org'
      ) // Flow testnet
      .put(
        'discovery.wallet',
        chain.chainId === 'flowmain'
          ? 'https://flow-wallet.blocto.app/authn'
          : 'https://flow-wallet-testnet.blocto.app/authn'
      ) // Blocto testnet wallet
      // .put(
      //     'discovery.wallet',
      //     'https://fcl-discovery.onflow.org/testnet/authn',
      // )
      .put('service.OpenID.scopes', 'email!')
      .put('app.detail.icon', '')
      .put('app.detail.title', 'Soda')
      .put('app.detail.url', 'www.soda.com')
      .put('flow.network', chain.chainId === 'flowmain' ? 'mainnet' : 'testnet')
    fcl.currentUser().subscribe((userRes: any) => {
      console.log(userRes)
      currentUserRes = userRes
    }) // fires everytime account connection status updates
    fcl.authenticate().then((res: any) => {
      console.log(res)
      setHasAuth(true)
      const _account = { addr: res.addr, chain: chain.chainId }
      setAccount(_account)
      const resStr = JSON.stringify(_account)
      saveLocal(StorageKeys.LOGINED_ACCOUNT, resStr)
      onLogin(_account)
    })
  }

  const handleLogin = async (chain: any) => {
    if (typeof chain.chainId === 'number') {
      const res = await getAddress(chain.chainId)
      console.log('handleLogin: ', res)
      const _account = { addr: res, chain: chain.chainId }
      setAccount(_account)
      setHasAuth(true)
      const resStr = JSON.stringify(_account)
      saveLocal(StorageKeys.LOGINED_ACCOUNT, resStr)
      onLogin(_account)
    } else {
      loginFLow(chain)
    }
  }

  const handleLogout = () => {
    if (
      account.chain &&
      typeof account.chain === 'string' &&
      account.chain.includes('flow')
    ) {
      fcl.currentUser.unauthenticate()
      removeLocal(StorageKeys.LOGINED_ACCOUNT)
    }
    setHasAuth(false)
    setAccount({})
    onLogout?.()
  }
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
              onClick={() => fallbackCopyTextToClipboard(account.addr)}
            />
          </div>
          <p className="soda-chain">
            Connected with {getChainNameDisplay(account.chain)}
          </p>
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
