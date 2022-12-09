import * as fcl from '@onflow/fcl'

export const flowSign = async (
  data: string,
  network: 'mainnet' | 'testnet'
) => {
  const MSG = Buffer.from(data).toString('hex')
  try {
    fcl
      .config()
      .put('challenge.scope', 'email') // request for Email
      .put(
        'accessNode.api',
        network === 'mainnet'
          ? 'https://rest-mainnet.onflow.org'
          : 'https://rest-testnet.onflow.org'
      ) // Flow testnet
      .put(
        'discovery.wallet',

        network === 'mainnet'
          ? 'https://flow-wallet.blocto.app/authn'
          : 'https://flow-wallet-testnet.blocto.app/authn'
      ) // Blocto testnet wallet
      .put('service.OpenID.scopes', 'email!')
      .put('app.detail.icon', '')
      .put('app.detail.title', 'Soda')
      .put('app.detail.url', 'www.soda.com')
      .put('flow.network', network)
    const res = await fcl.currentUser.signUserMessage(MSG)
    console.log('flowSign: ', data, network, JSON.stringify(res))
    return res
  } catch (error) {
    console.log(error)
  }
}
