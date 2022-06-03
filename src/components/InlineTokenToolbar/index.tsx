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
  CollectionDao,
  appInvoke,
  AppFunction,
  getCollectionDaoByToken,
  getInlineMarketplace,
  getChainId
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
import IconMinterOwner from '../../assets/images/icon-minter-owner.png'
import IconShare from '../../assets/images/icon-share.png'
import IconSource from '../../assets/images/icon-source.png'
import IconDao from '../../assets/images/icon-dao.svg'
import IconProposal from '../../assets/images/icon-proposal.svg'
import { IconShareFB, IconShareTwitter } from './icon'

function InlineTokenToolbar(props: {
  token?: NFT
  originMediaSrc?: string
  app?: string
  username?: string
  relatedAddress?: string
  expand?: boolean
  cancelDao?: boolean
}) {
  const {
    token,
    originMediaSrc,
    app,
    username,
    relatedAddress,
    expand,
    cancelDao
  } = props
  const [isInFav, setIsInFav] = useState(false)
  const [mintLoading, setMintLoading] = useState(false)
  const [showMenuMore, setShowMenuMore] = useState(false)
  const [minterAccount, setMinterAccount] = useState<BindInfo[]>([])
  const [ownerAccount, setOwnerAccount] = useState<BindInfo[]>([])
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState(1)
  const [collectionDao, setCollectionDao] = useState<CollectionDao>()
  const [proposalModalShow, setProposalModalShow] = useState(false)

  const isOwner = useMemo(() => {
    if (
      (username &&
        app &&
        ownerAccount.find(
          (item) => item.appid === username && item.application === app
        )) ||
      (relatedAddress &&
        ownerAccount.find((item) => item.address === relatedAddress))
    ) {
      return true
    } else {
      return false
    }
  }, [username, ownerAccount, relatedAddress])

  const isMinter = useMemo(() => {
    if (
      (username &&
        app &&
        minterAccount.find(
          (item) => item.appid === username && item.application === app
        )) ||
      (relatedAddress &&
        minterAccount.find((item) => item.address === relatedAddress))
    ) {
      return true
    } else {
      return false
    }
  }, [minterAccount, username, relatedAddress])

  const fetchInfo = async () => {
    let role: { owner?: string; minter?: string }
    setOwnerAccount([])
    setMinterAccount([])

    // if (!token.owner || !token.minter) {
    role = await getRole({ token })
    token.owner = role.owner
    token.minter = role.minter
    // }

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
      const chainId = await getChainId()
      setChainId(chainId)
      if (token) {
        fetchInfo()
        const favTokens = await getFavTokens({
          address,
          chainId: token.chainId,
          contract: token.contract
        })
        if (
          favTokens.data.some(
            (item) => (item.tokenId as string) == (token.tokenId as string)
          )
        ) {
          setIsInFav(true)
        } else {
          setIsInFav(false)
        }
        if (!cancelDao) fetchCollectionInfo()
        if (expand) setShowMenuMore(true)
      }
    })()
  }, [token])

  const getWeb2UserHomepage = async (data: BindInfo[]) => {
    let uri = ''
    for (const item of data) {
      let u: any
      try {
        u = await appInvoke(item.application, AppFunction.getUserPage, {
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
    try {
      const source = await getTokenSource({ token })
      window.open(source, '_blank')
    } catch (e) {
      console.error('[core-ui] InlineTokenToolbar handleToSource: ', e)
    }
  }
  const handleToMarket = async (e) => {
    e.stopPropagation()
    const { url } = await getInlineMarketplace(token)
    window.open(url)
  }
  const handleMint = async () => {
    if (!address) {
      message.warning('Wallet not found. Please install metamask.')
      return
    }
    if (!originMediaSrc) {
      message.warning(
        'No media source found. Please verify the source is available.'
      )
      return
    }
    setMintLoading(true)
    const response = await mintAndShare(originMediaSrc)
    setMintLoading(false)
    if (response.error) {
      return
    }
    try {
      newPostTrigger(app)
      // await pasteShareTextToEditor(app)
    } catch (e) {
      console.error(
        '[core-ui] InlineTokenToolbar handleMint newPostTrigger: ' + e
      )
    }
  }

  const handleShare = async (app: string) => {
    //TODO, temp save
    const mask = generateTokenMask(token)
    await saveLocal(StorageKeys.SHARING_NFT_META, mask)
    // FIXME: hardcode for now
    switch (app) {
      case 'Twitter':
        window.open('https://twitter.com', '__twitter__')
        break
      case 'Facebook':
        window.open('https://www.facebook.com', '__facebook__')
        break
    }
  }

  const shareContent = () => (
    <div className="img-mask-share">
      <ul>
        <li>
          <IconShareTwitter
            onClick={() => handleShare('Twitter')}
            disabled={window.location.href.includes('twitter')}
          />
        </li>
        <li>
          <IconShareFB
            onClick={() => handleShare('Facebook')}
            disabled={window.location.href.includes('facebook')}
          />
        </li>
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
    const collection = await getCollectionDaoByToken(token) // TODO:get contract from meta
    setCollectionDao(collection)
  }

  const handleToDaoPage = async (e: any) => {
    e.stopPropagation()
    openExtensionPage(`daoDetail?dao=${collectionDao.collection.id}`)
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
            {token && token.source && (
              <Popover content="View source">
                <div className="toolbar-icon" onClick={handleToSource}>
                  <img src={IconSource} alt="" />
                </div>
              </Popover>
            )}
            {token && chainId == token.chainId && (
              <Popover
                placement="bottom"
                title={'Share'}
                content={shareContent}
                trigger="hover"
                overlayClassName="toolbar-share"
                className="toolbar-share">
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

            {token && chainId == token.chainId && address && !isInFav && (
              <Popover content="Add to fav">
                <div className="toolbar-icon" onClick={handleAddToFav}>
                  <img src={IconFav} alt="" />
                </div>
              </Popover>
            )}

            {token &&
              chainId == token.chainId &&
              !isOwner &&
              ownerAccount.length > 0 && (
                <Popover content="View owner">
                  <div className="toolbar-icon" onClick={handleToOwnerWeb2}>
                    <img src={IconOwner} alt="" />
                  </div>
                </Popover>
              )}
            {token &&
              chainId == token.chainId &&
              !isMinter &&
              minterAccount.length > 0 && (
                <Popover content="View minter">
                  <div className="toolbar-icon" onClick={handleToMinterWeb2}>
                    <img src={IconMinter} alt="" />
                  </div>
                </Popover>
              )}
            {token && chainId == token.chainId && collectionDao && (
              <Popover content="DAO">
                <div className="toolbar-icon" onClick={handleToDaoPage}>
                  <img src={IconDao} alt="" />
                </div>
              </Popover>
            )}
            {token && chainId == token.chainId && collectionDao && (
              <Popover content="Proposal">
                <div className="toolbar-icon" onClick={handleToProposal}>
                  <img src={IconProposal} alt="" />
                </div>
              </Popover>
            )}
          </div>
        )}
        {!isMinter && isOwner && (
          <Popover content="This is the owner">
            <div className="toolbar-icon" onClick={handleToOwnerWeb2}>
              <img src={IconOwnerRole} alt="" />
            </div>
          </Popover>
        )}
        {!isOwner && isMinter && (
          <Popover content="This is the minter">
            <div className="toolbar-icon" onClick={handleToMinterWeb2}>
              <img src={IconMinterRole} alt="" />
            </div>
          </Popover>
        )}
        {isOwner && isMinter && (
          <Popover content="This is the minter & owner">
            <div className="toolbar-icon" onClick={handleToMinterWeb2}>
              <img src={IconMinterOwner} />
            </div>
          </Popover>
        )}
      </div>
      <ProposalModal
        show={proposalModalShow}
        onClose={onCloseProposalModal}
        collectionDao={collectionDao}
      />
    </div>
  )
}

export default InlineTokenToolbar
