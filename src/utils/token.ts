import {
  TokenCache,
  getToken,
  getCacheMedia,
  getRole,
  mint as mintCore,
  NFT
} from '@soda/soda-core'
import { message } from 'antd'
import { shareToEditor } from './handleShare'

export const getTokenCacheMedia = async (token: NFT) => {
  // handle error outside this func
  const imgDataBlob = await getCacheMedia({
    token,
    storageConfig: {
      uri: true
    },
    withMask: true
  })
  return imgDataBlob
}

export const shareByCacheInfo = async (cache: TokenCache) => {
  const res: any = {}
  try {
    const { chainId, tokenId, contract } = cache
    const token = await getToken({
      cache: {
        chainId,
        tokenId,
        contract
      }
    })
    res.token = token
    res.blob = await getTokenCacheMedia(token)
  } catch (e) {
    console.error(e)
    res.error = e
  }
  return res
}
export const mint = async (content: any) => {
  const res: any = {}
  try {
    await mintCore({
      storage: 'ipfs',
      content: content,
      preCallback: () => {
        message.info('Uploading your resource to IPFS...', 5)
      },
      storeCallback: (hash: string) => {
        res.hash = hash
        message.info('Uploaded. Minting your NFT...')
      },
      mintCallback: (token: NFT) => {
        res.token = token
      }
    })
  } catch (e) {
    console.error(e)
    res.error = e
  }
  return res
}
export const mintAndShare = async (content: any) => {
  let res: any
  try {
    res = await mint(content)
    if (res.error) throw new Error(res.error)
    const token = res.token
    message.success('Your NFT is minted successfully.')
    res.blob = await getTokenCacheMedia(token)
  } catch (e) {
    console.error(e)
    res.error = e
  }
  return res
}
export const getRoleByToken = async (token: NFT) => {
  const res: any = {}
  try {
    res.token = await getRole({ token })
  } catch (e) {
    console.error(e)
    res.error = e
  }
  return res
}
export const getRoleByCacheInfo = async (cache: TokenCache) => {
  const res: any = {}
  try {
    const { chainId, contract, tokenId } = cache
    const token = await getToken({
      cache: {
        chainId,
        tokenId,
        contract
      }
    })
    res.token = await getRole({ token })
  } catch (e) {
    console.error(e)
    res.error = e
  }
  return res
}
