import {
  sendMessage,
  registerMessage,
  isMetamaskConnected
} from '@soda/soda-util'

const MessageTypes = {
  Open_OptionPage: 'Open_OptionPage'
}

export const openExtensionPage = (uri: string) => {
  const req = {
    type: MessageTypes.Open_OptionPage,
    request: {
      uri
    }
  }
  sendMessage(req)
}

async function openExtensionPageMessageHandler(request: any) {
  const { uri } = request.request
  const response: any = {}
  try {
    chrome.tabs.query({}, function (tabs: any) {
      const urlPrefix = `chrome-extension://${chrome.runtime.id}/options.html#/`
      const url = `${urlPrefix}${uri}`
      let found = false
      let tabId = -1
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.search(urlPrefix) > -1) {
          found = true
          tabId = tabs[i].id
          break
        }
      }
      if (found == false) {
        chrome.tabs.create({
          url
        })
      } else {
        chrome.tabs.update(tabId, { selected: true, url })
      }
    })
    response.result = true
  } catch (e) {
    console.error(e)
    response.error = e
  }
  return response
}

export const bgInit = () => {
  registerMessage({
    message: MessageTypes.Open_OptionPage,
    handleFunc: openExtensionPageMessageHandler
  })
}
