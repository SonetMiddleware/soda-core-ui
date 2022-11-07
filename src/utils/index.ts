import { message } from 'antd'
export function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    // success({ message: 'Copy Successfully' });
    message.success({ content: 'Copy Successfully' })
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    // message.error('Copy Failed');
    message.error({ content: 'Copy Failed' })
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}
