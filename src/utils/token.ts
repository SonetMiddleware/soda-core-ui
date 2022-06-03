import {
  TokenCache,
  getToken,
  getCacheMedia,
  getRole,
  mint as mintCore,
  NFT
} from '@soda/soda-core'
import { message } from 'antd'

export const shareByToken = async (token: NFT) => {
  // handle error outside this func
  const imgDataBlob = await getCacheMedia({
    token,
    storageConfig: {
      uri: true
    },
    withMask: true
  })
  const clipboardData = []
  //@ts-ignore
  clipboardData.push(new ClipboardItem({ 'image/png': imgDataBlob }))
  // trigger document focus
  // ref.current?.click();
  document.body.click()
  //@ts-ignore
  await navigator.clipboard.write(clipboardData)

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
    res.blob = await shareByToken(token)
    message.success(
      'Your NFT is minted and copied to the clipboard. Please paste into the new post dialog.',
      5
    )
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
    message.success(
      'Your NFT is minted successfully and copied to the clipboard. Feel free to paste into post dialog.',
      5
    ) // Now add your thoughts and share with the world!
    res.blob = await shareByToken(token)
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
