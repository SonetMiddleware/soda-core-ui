import React, { useState, useEffect, useMemo } from 'react'
import * as ReactDOM from 'react-dom'
import './index.less'
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
  CollectionItem,
  appInvoke,
  AppFunction,
  getTokenMarketplacePage,
  getCollectionByToken
} from '@soda/soda-core'
import { Popover, message, Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHamburger } from '@fortawesome/free-solid-svg-icons'
import ProposalModal from '../ProposalModal'
import { openExtensionPage } from '@/utils/chrome'
import { mintAndShare } from '@/utils/token'
import { saveLocal, StorageKeys } from '@/utils/storage'
import { newPostTrigger } from '@/utils/handleShare'
import IconExpand from '../../assets/images/icon-expand.png'
import IconShrink from '../../assets/images/icon-shrink.png'
import IconFav from '../../assets/images/icon-fav.png'
import IconMarket from '../../assets/images/icon-market.png'
import IconMinterRole from '../../assets/images/icon-minter-role.png'
import IconMinter from '../../assets/images/icon-minter.png'
import IconOwnerRole from '../../assets/images/icon-owner-role.png'
import IconOwner from '../../assets/images/icon-owner.png'
import IconShare from '../../assets/images/icon-share.png'
import IconSource from '../../assets/images/icon-source.png'
import IconDao from '../../assets/images/icon-dao.svg'
import IconProposal from '../../assets/images/icon-proposal.svg'

function InlineTokenToolbar(props: {
  token?: NFT
  originImgSrc: string
  app?: string
  username?: string
}) {
  const [isInFav, setIsInFav] = useState(false)
  const [mintLoading, setMintLoading] = useState(false)
  const [showMenuMore, setShowMenuMore] = useState(false)
  const [minterAccount, setMinterAccount] = useState<BindInfo[]>([])
  const [ownerAccount, setOwnerAccount] = useState<BindInfo[]>([])
  const [address, setAddress] = useState('')
  const [collection, setCollection] = useState<CollectionItem>()
  const [proposalModalShow, setProposalModalShow] = useState(false)
  const { token, app, username } = props

  const isOwner = useMemo(() => {
    if (
      username &&
      app &&
      ownerAccount.find(
        (item) => item.appid === username && item.application === app
      )
    ) {
      return true
    } else {
      return false
    }
  }, [username, ownerAccount])

  const isMinter = useMemo(() => {
    if (
      username &&
      app &&
      minterAccount.find(
        (item) => item.appid === username && item.application === app
      )
    ) {
      return true
    } else {
      return false
    }
  }, [minterAccount, username])

  const isBothMinterOwner = useMemo(() => {
    return isOwner && isMinter
  }, [isOwner, isMinter])

  const fetchInfo = async () => {
    let role: { owner?: string; minter?: string }
    if (!token.owner) {
      role = await getRole({ token })
      token.owner = role.owner
      token.minter = role.minter
    }

    const ownerBindResult =
      (await getBindResult({
        address: role.owner
      })) || []
    const bindings = ownerBindResult.filter((item) => item.contentId)
    setOwnerAccount(bindings)

    const minterBindResult =
      (await getBindResult({
        address: role.minter
      })) || []
    const minterBindings = minterBindResult.filter((item) => item.contentId)
    setMinterAccount(minterBindings)
  }

  useEffect(() => {
    ;(async () => {
      const address = await getAddress()
      setAddress(address)
      if (props.token) {
        fetchInfo()
        const favTokens = await getFavTokens({
          address,
          chainId: token.chainId,
          contract: token.contract
        })
        if (
          favTokens.data.some((item) => '' + item.tokenId === token.tokenId)
        ) {
          setIsInFav(true)
        }
        fetchCollectionInfo()
      }
    })()
  }, [props.token])

  const getWeb2UserHomepage = async (data: BindInfo[]) => {
    let uri = ''
    for (const item of data) {
      let u: any
      try {
        u = await appInvoke(app, AppFunction.getUserPage, {
          appid: item.appid
        })
      } catch (e) {
        u = null
      }
      if (u) uri = u
      // hook, twitter by default
      if (item.application === 'Twitter') break
    }
    return uri
  }
  const handleToMinterWeb2 = async (e) => {
    e.stopPropagation()
    if (minterAccount.length > 0) {
      const uri = await getWeb2UserHomepage(minterAccount)
      window.open(uri, '_blank')
    }
  }
  const handleToOwnerWeb2 = async (e) => {
    e.stopPropagation()
    if (ownerAccount.length > 0) {
      const uri = await getWeb2UserHomepage(ownerAccount)
      window.open(uri, '_blank')
    }
  }
  const handleToSource = async (e) => {
    e.stopPropagation()
    const source = await getTokenSource(token)
    window.open(source, '_blank')
  }
  const handleToMarket = async (e) => {
    e.stopPropagation()
    const uri = await getTokenMarketplacePage(token)
    window.open(uri)
  }
  const handleMint = async () => {
    if (!address) {
      message.warning('Wallet not found. Please install metamask.')
      return
    }
    setMintLoading(true)
    const response = await mintAndShare(props.originImgSrc)
    setMintLoading(false)
    if (response.error) {
      return
    }
    newPostTrigger(app)
    // await pasteShareTextToEditor(app)
  }

  const handleShare = async () => {
    //TODO, temp save
    const mask = generateTokenMask(token)
    await saveLocal(StorageKeys.SHARING_NFT_META, mask)
    // FIXME: hardcode for now
    const targetUrl = window.location.href.includes('twitter')
      ? 'https://www.facebook.com'
      : 'https://www.twitter.com'
    window.open(targetUrl, '_blank')
  }

  const shareContent = () => (
    <div className="img-mask-share">
      <ul>
        <li>
          <Button
            type="link"
            target="_blank"
            disabled={window.location.href.includes('twitter')}
            onClick={handleShare}>
            Share to Twitter <ArrowRightOutlined />{' '}
          </Button>
        </li>
        <li>
          <Button
            type="link"
            target="_blank"
            disabled={window.location.href.includes('facebook')}
            onClick={handleShare}>
            Share to Facebook <ArrowRightOutlined />{' '}
          </Button>
        </li>
        {/* <li>
                    <a href="" target="_blank" >Share to Instagram <ArrowRightOutlined /> </a>
                </li> */}
      </ul>
    </div>
  )
  const handleAddToFav = async (e) => {
    e.stopPropagation()
    try {
      const address = await getAddress()
      await addTokenToFav({ address, token })
      setIsInFav(true)
      message.success('Add to favorite successful!')
    } catch (err) {
      console.error(err)
      message.error('Add to favorite failed.')
    }
  }

  const fetchCollectionInfo = async () => {
    const collection = await getCollectionByToken(token) // TODO:get contract from meta
    setCollection(collection)
  }

  const handleToDaoPage = async (e: any) => {
    e.stopPropagation()
    openExtensionPage(`daoDetail?dao=${collection.id}`)
  }

  const onCloseProposalModal = () => {
    setProposalModalShow(false)
  }

  const handleToProposal = (e: any) => {
    e.stopPropagation()
    setProposalModalShow(true)
  }

  return (
    <div className="img-mask-container">
      <div className="img-mask-icon">
        {/* {!token && (
          <Popover content="Mint">
            <FontAwesomeIcon
              style={{ cursor: 'pointer' }}
              icon={faHamburger}
              onClick={(e) => {
                e.stopPropagation()
                handleMint()
              }}
            />
          </Popover>
        )} */}

        {token && !showMenuMore && (
          <Popover content="Expand toolbar">
            <div
              className="toolbar-icon"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenuMore(true)
              }}>
              <img src={IconExpand} alt="" />
            </div>
          </Popover>
        )}

        {showMenuMore && (
          <div className="img-mask-icon-list" style={{ display: 'flex' }}>
            {token && (
              <Popover content="Shrink toolbar">
                <div
                  className="toolbar-icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenuMore(false)
                  }}>
                  <img src={IconShrink} alt="" />
                </div>
              </Popover>
            )}
            {token && (
              <Popover content="View source">
                <div className="toolbar-icon" onClick={handleToSource}>
                  <img src={IconSource} alt="" />
                </div>
              </Popover>
            )}
            {token && (
              <Popover
                placement="bottom"
                title={'Share'}
                content={shareContent}
                trigger="hover">
                <div className="toolbar-icon">
                  <img src={IconShare} alt="" />
                </div>
              </Popover>
            )}

            {
              <Popover content={'To market'}>
                <div className="toolbar-icon" onClick={handleToMarket}>
                  <img src={IconMarket} alt="" />
                </div>
              </Popover>
            }

            {address && token && !isInFav && (
              <Popover content="Add to fav">
                <div className="toolbar-icon" onClick={handleAddToFav}>
                  <img src={IconFav} alt="" />
                </div>
              </Popover>
            )}

            {!isBothMinterOwner && !isOwner && ownerAccount.length > 0 && (
              <Popover content="View owner">
                <div className="toolbar-icon" onClick={handleToOwnerWeb2}>
                  <img src={IconOwner} alt="" />
                </div>
              </Popover>
            )}
            {!isBothMinterOwner && !isMinter && minterAccount.length > 0 && (
              <Popover content="View minter">
                <div className="toolbar-icon" onClick={handleToMinterWeb2}>
                  <img src={IconMinter} alt="" />
                </div>
              </Popover>
            )}
            {collection && (
              <Popover content="DAO">
                <div className="toolbar-icon" onClick={handleToDaoPage}>
                  <img src={IconDao} alt="" />
                </div>
              </Popover>
            )}
            {collection && (
              <Popover content="Proposal">
                <div className="toolbar-icon" onClick={handleToProposal}>
                  <img src={IconProposal} alt="" />
                </div>
              </Popover>
            )}
          </div>
        )}
        {!isBothMinterOwner && isOwner && (
          <Popover content="This is the owner">
            <div className="toolbar-icon" onClick={handleToOwnerWeb2}>
              <img src={IconOwnerRole} alt="" />
            </div>
          </Popover>
        )}
        {!isBothMinterOwner && isMinter && (
          <Popover content="This is the minter">
            <div className="toolbar-icon" onClick={handleToMinterWeb2}>
              <img src={IconMinterRole} alt="" />
            </div>
          </Popover>
        )}
        {isBothMinterOwner && (
          <Popover content="This is the minter & owner">
            <div className="toolbar-icon" onClick={handleToMinterWeb2}>
              <svg
                width="17"
                height="18"
                viewBox="0 0 17 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.2514 10.6147V17.1467H0C0 15.4143 0.763985 13.7529 2.12389 12.5279C3.48379 11.3029 5.32821 10.6147 7.2514 10.6147V10.6147ZM12.69 16.7385L10.026 18L10.5345 15.3284L8.3799 13.4357L11.3584 13.0454L12.69 10.6147L14.0224 13.0454L17 13.4357L14.8454 15.3284L15.353 18L12.69 16.7385ZM7.2514 9.79814C4.2466 9.79814 1.81285 7.60581 1.81285 4.89907C1.81285 2.19233 4.2466 0 7.2514 0C10.2562 0 12.69 2.19233 12.69 4.89907C12.69 7.60581 10.2562 9.79814 7.2514 9.79814Z"
                  fill="url(#paint0_linear_64:366)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_64:366"
                    x1="8.5"
                    y1="0"
                    x2="8.5"
                    y2="18"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FF9A46" />
                    <stop offset="0.489583" stop-color="#FF67C1" />
                    <stop offset="0.973958" stop-color="#9D5FE9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </Popover>
        )}
      </div>
      <ProposalModal
        show={proposalModalShow}
        onClose={onCloseProposalModal}
        collection={collection}
      />
    </div>
  )
}

export default InlineTokenToolbar
