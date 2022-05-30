/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */

/* eslint-disable @typescript-eslint/no-use-before-define */
export const dispatchPasteImgEvent = async (img: File | Blob) => {
  const bytes = new Uint8Array(await img.arrayBuffer())
  const value = Array.from(bytes)
  const imgUrl =
    'https://d3vi7ke2kcvale.cloudfront.net/images/bsc/0xc014b45d680b5a4bf51ccda778a68d5251c14b5e/e4355d7856ab8b24b9cd80e6bc171500.png'
  // data.setData('image/png', `data:image/png;${img}`);
  // data.setData('image/png', imgUrl);
  const file = constructUnXrayedFilesFromUintLike(
    'image/png',
    'image.png',
    value
  )
  //   const dt = constructUnXrayedDataTransferProxy(file);
  const dt = new DataTransfer()
  dt.setData('text/plain', 'hello world')
  //@ts-ignore
  const data = [new ClipboardItem({ 'image/png': img })]
  //@ts-ignore
  await navigator.clipboard.write(data)
  // data.setData('text/plain', `data:image/png;${img}`);
  // native post dialog get focused
  const nativeEditor = document.querySelector<HTMLDivElement>(
    `[contenteditable][aria-label][spellcheck],textarea[aria-label][spellcheck]`
  )
  if (!nativeEditor) {
    throw new Error('Native post editor is not selected')
  }
  const e = new ClipboardEvent('paste')
  //   const e = new ClipboardEvent('paste', {
  //     clipboardData: dt,
  //     // @ts-ignore Firefox only API
  //     dataType: undefined,
  //     data: undefined,
  //     bubbles: true,
  //     cancelable: true,
  //   });

  nativeEditor.focus()
  nativeEditor.dispatchEvent(e)
}

const _XPCNativeWrapper =
  typeof XPCNativeWrapper === 'undefined' ? undefined : XPCNativeWrapper

/** get the un xrayed version of a _DOM_ object */
export function un_xray_DOM<T>(x: T) {
  if (_XPCNativeWrapper) return _XPCNativeWrapper.unwrap(x)
  return x
}

/** Clone a object into the page realm */
export function clone_into<T>(x: T) {
  if (_XPCNativeWrapper && typeof cloneInto === 'function')
    return cloneInto(x, window, { cloneFunctions: true })
  return x
}

const XRay_Uint8Array = globalThis.Uint8Array
  ? globalThis.Uint8Array
  : globalThis.window.Uint8Array

const unXrayed_Proxy = globalThis.window.Proxy
export function constructUnXrayedDataTransferProxy(unXrayed_file: File) {
  return new unXrayed_Proxy(
    un_xray_DOM(new DataTransfer()),
    clone_into({
      get(target, key: keyof DataTransfer) {
        if (key === 'files') return clone_into([unXrayed_file])
        if (key === 'types') return clone_into(['Files'])
        if (key === 'items')
          return clone_into([
            {
              kind: 'file',
              type: 'image/png',
              getAsFile() {
                return unXrayed_file
              }
            }
          ])
        if (key === 'getData') return clone_into(() => '')
        return un_xray_DOM(target[key])
      }
    })
  )
}
export function constructUnXrayedFilesFromUintLike(
  format: string,
  fileName: string,
  xray_fileContent: number[] | Uint8Array
) {
  const binary = clone_into(XRay_Uint8Array.from(xray_fileContent))
  const blob = un_xray_DOM(new Blob([binary], { type: format }))
  const file = un_xray_DOM(
    new File([blob], fileName, {
      lastModified: Date.now(),
      type: format
    })
  )
  return file
}
/** @see https://mdn.io/XPCNativeWrapper Firefox only */
declare namespace XPCNativeWrapper {
  function unwrap<T>(object: T): T
}
/** @see https://mdn.io/Component.utils.exportFunction Firefox only */
declare function exportFunction(
  f: Function,
  target: object,
  opts: { defineAs: string | number | symbol }
): void
/** @see https://mdn.io/Component.utils.cloneInto Firefox only */
declare function cloneInto<T>(
  f: T,
  target: object,
  opts: { cloneFunctions: boolean }
): T

export interface CustomEvents {
  paste: [text: string | { type: 'image'; value: number[] }]
  input: [text: string]
  instagramUpload: [url: string]
}

function dispatchEventRaw<T extends Event>(
  target: Node | Document | null,
  eventBase: T,
  overwrites: Partial<T> = {}
) {}

export function dispatchPaste(textOrImage: CustomEvents['paste'][0]) {
  console.debug('[core-ui] eventDispatch, dispatchPaste ........')
  const data = new DataTransfer()
  const e = new ClipboardEvent('paste', {
    clipboardData: data,
    // @ts-ignore Firefox only API
    dataType: typeof textOrImage === 'string' ? 'text/plain' : void 0,
    data: typeof textOrImage === 'string' ? textOrImage : void 0,
    bubbles: true,
    cancelable: true
  })
  if (typeof textOrImage === 'string') {
    data.setData('text/plain', textOrImage)
    document.activeElement!.dispatchEvent(e)
  } else if (textOrImage.type === 'image') {
    const file = constructUnXrayedFilesFromUintLike(
      'image/png',
      'image.png',
      textOrImage.value
    )
    const dt = constructUnXrayedDataTransferProxy(file)
    dispatchEventRaw(document.activeElement, e, { clipboardData: dt })
  } else {
    const error = new Error(
      `Unknown event, got ${textOrImage?.type ?? 'unknown'}`
    )
    // cause firefox will not display error from extension
    console.error(error)
    throw error
  }
}
