import './index.less'
import React, { useState, useEffect } from 'react'
import { message as Notification } from 'antd'
import {
  getAddress,
  getWeb2Account,
  getBindResult,
  bind1WithWeb3Proof,
  BINDING_CONTENT_TITLE,
  BindInfo,
  sign
} from '@soda/soda-core'
import Logo from '../../assets/images/logo.png'
import IconClose from '../../assets/images/icon-close.png'
import Button from '../Button'
import { newPostTrigger } from '../../utils/handleShare'

interface IProps {
  app: string
}
export default function InlineApplicationBindBox(props: IProps) {
  const { app } = props
  const [show, setShow] = useState(false)
  const [binding, setBinding] = useState<BindInfo>()
  const [appid, setAppId] = useState('')
  const [showConnect, setShowConnect] = useState(false)

  const createBindingPost = async (account: string, appid: string) => {
    const content = `${BINDING_CONTENT_TITLE}. My address: ${account}, My id: ${appid}`
    document.body.click()
    //@ts-ignore
    await navigator.clipboard.writeText(content)
    newPostTrigger(app)
    Notification.success(
      // FIXME: hard code for now
      `Click into your ${
        app === 'Twitter' ? 'tweet box' : 'status bar'
      } and paste the binding message from your clipboard. Then post to finish the bind.`
    )
    setShow(false)
    // await pasteShareTextToEditor(app, content)
  }

  useEffect(() => {
    ;(async () => {
      const address = await getAddress()
      if (!address) {
        setShow(false)
        return
      }
      let appid = await getWeb2Account(app)
      setAppId(appid)

      const bindResult = await getBindResult({
        address,
        appid
      })
      const _binding = bindResult.find((item) => item.application === app)
      setBinding(_binding)
      if (_binding && _binding.contentId) {
        setShow(false)
      } else {
        setShow(true)
        // window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    })()
  }, [])

  /**
   * create binding post and send
   * @param address user's address
   * @param appid  id of platform
   */

  const handleBind = async () => {
    const address = await getAddress()
    //TODO: Web2 callback
    let appid = await getWeb2Account(app)

    const message = app + appid
    const res: any = await sign({
      message,
      address
    })
    if (res.error) {
      Notification.warning('Sign message failed, please retry later.')
      return
    }
    const bindRes = await bind1WithWeb3Proof({
      address,
      appid: appid,
      application: app,
      sig: res.result
    })
    if (bindRes) {
      // Notification.success('Bind succeed!');
      setShow(false)
    } else {
      Notification.warning('Bind failed. Please try agin later.')
      return
    }
    createBindingPost(address, appid)

    // //Fixme: bind directly with fake content_id
    // await bind2WithWeb2Proof({
    //   addr: account,
    //   tid,
    //   platform,
    //   content_id: platform + '-' + randomId(),
    // });
    // Notification.success('Bind success');
    // setShow(false);
  }

  return (
    <div
      className="bind-container"
      style={{ display: show ? 'block' : 'none' }}>
      <img
        src={IconClose}
        className="icon-close"
        alt=""
        onClick={() => setShow(false)}
      />
      <p className="logo">
        <img src={Logo} alt="logo" />
      </p>

      {!binding && !showConnect && (
        <div>
          <p className="title">Check your {app} username</p>
          <p className="user-id">
            <span>{appid}</span>
          </p>
          <div className="bind-btns">
            <Button
              type="primary"
              onClick={() => {
                setShowConnect(true)
              }}>
              Confirm
            </Button>
          </div>
          <p className="tips">
            Please confirm that this is the correct {app} account{' '}
          </p>
        </div>
      )}
      {!binding && showConnect && (
        <div>
          <p className="title">Bind your {app} account with your wallet.</p>
          <div className="bind-btns">
            <Button onClick={handleBind} type="primary">
              Connect
            </Button>
            <a
              className="btn-link"
              onClick={() => {
                setShow(false)
              }}>
              Not Now
            </a>
          </div>
        </div>
      )}
      {binding && !binding.contentId && (
        <div>
          <p className="title">You need to send post to finish the binding.</p>
          <div className="bind-btns">
            <button className="soda-btn-primary" onClick={handleBind}>
              Send Post
            </button>
            <a
              onClick={() => {
                setShow(false)
              }}>
              Not Now
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
