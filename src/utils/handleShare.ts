import { appInvoke, decodeMask } from '@soda/soda-core'
import { message } from 'antd'
import { getLocal, removeLocal, StorageKeys } from './storage'
import { getTokenCacheMedia } from './token'

export const shareToEditor = async (
  app: string,
  content?: Array<string | Uint8Array>
) => {
  return appInvoke(app, 'shareToEditor', content)
}
export const newPostTrigger = async (app: string, message?: string) => {
  await appInvoke(app, 'newPostTrigger')
  if (message) {
    await shareToEditor(app, [message])
  }
}

export const EXTENSION_LINK = 'https://s.plat.win?'

export const POST_SHARE_TEXT =
  '$!Please visit https://s.plat.win to download the latest Chrome extension!$'

export const removeTextInSharePost = (dom: HTMLElement) => {
  const text = 'https://s.plat.win'
  const elements = dom.querySelectorAll('a')
  const targetAs = Array.prototype.filter.call(elements, function (element) {
    return RegExp(text).test(element.innerText)
  })
  // text.replace(/\$\!.*\!\$/g, '');
  targetAs.forEach((item) => {
    while (item && item.tagName !== 'DIV') {
      item = item.parentElement
    }
    if (item && item.innerText) {
      item.innerText = item.innerText.replace(/\$\!.*\!\$/g, '')
    }
  })
}

export const postShareHandler = async (app: string) => {
  try {
    const meta = await getLocal(StorageKeys.SHARING_NFT_META)
    if (!meta) return
    const token = await decodeMask(meta || '')
    if (token) {
      message.info('Create new post ...')
      newPostTrigger(app)

      message.info('Loading token media ...')
      const img = await getTokenCacheMedia(token)

      await shareToEditor(app, [POST_SHARE_TEXT, img])
      message.success('Your is sharing NFT is ready to post.')
    } else {
      message.error('Share token failed, unable to parse token info.')
      console.error(`[core-ui] postShareHandler: ${meta}`)
    }
  } catch (err) {
    message.error(
      'Share token failed, please verify your chain settings and retry later.'
    )
    console.error('[core-ui] postShareHandler: ', err)
  }
  await removeLocal(StorageKeys.SHARING_NFT_META)
}
