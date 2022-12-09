import Button from './components/Button'
import MediaCacheDisplay from './components/MediaCacheDisplay'
import MediaDisplay from './components/MediaDisplay'
import InlineTokenToolbar from './components/InlineTokenToolbar'
import InlineApplicationBindBox from './components/InlineApplicationBindBox'
import ListNoData from './components/ListNoData'
import ResourceDialog from './components/ResourceDialog'
import FavTokenList from './components/ResourceDialog/FavTokenList'
import OwnedTokenList from './components/ResourceDialog/OwnedTokenList'
import UploadToken from './components/ResourceDialog/UploadToken'
import { startWatch } from './utils/watcher'
import { saveLocal, getLocal, removeLocal, StorageKeys } from './utils/storage'
import {
  removeTextInSharePost,
  POST_SHARE_TEXT,
  postShareHandler
} from './utils/handleShare'
import { mint } from './utils/token'
import MyAccount from './components/ResourceDialog/MyAccount'
import MyAccountDisplay from './components/ResourceDialog/MyAccountDisplay'

export {
  startWatch,
  saveLocal,
  getLocal,
  removeLocal,
  StorageKeys,
  postShareHandler,
  removeTextInSharePost,
  Button,
  MediaCacheDisplay,
  MediaDisplay,
  InlineTokenToolbar,
  InlineApplicationBindBox,
  ListNoData,
  ResourceDialog,
  FavTokenList,
  OwnedTokenList,
  MyAccount,
  MyAccountDisplay,
  UploadToken,
  POST_SHARE_TEXT,
  mint
}

import { bgInit as chromeBgInit } from './utils/chrome'
export const bgInit = () => {
  chromeBgInit()
}
