import { appInvoke, decodeMask } from '@soda/soda-core'
import { message } from 'antd'
import { getLocal, removeLocal, StorageKeys } from './storage'
import { shareByToken } from './token'

export const pasteShareTextToEditor = async (app: string, str?: string) => {
  return appInvoke(app, 'pasteShareTextToEditor', { str })
}
export const newPostTrigger = async (app: string) => {
  return appInvoke(app, 'newPostTrigger')
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
    while (item.tagName !== 'DIV') {
      item = item.parentElement
    }
    item.innerText = item.innerText.replace(/\$\!.*\!\$/g, '')
  })
}

export const postShareHandler = async (app: string) => {
  try {
    const meta = await getLocal(StorageKeys.SHARING_NFT_META)
    if (!meta) return
    const token = await decodeMask(meta || '')
    if (token) {
      newPostTrigger(app)
      // 触发document focus
      document.body.click()

      await pasteShareTextToEditor(app)
      // clear clipboard
      navigator.clipboard.writeText('')
      shareByToken(token)

      message.success(
        'The resource has been saved to the clipboard. Paste to proceed share.'
      )

      await removeLocal(StorageKeys.SHARING_NFT_META)
    }
  } catch (err) {
    console.error('[core-ui] postShareHandler: ', err)
  }
}
