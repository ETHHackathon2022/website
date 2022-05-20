import React, { useEffect } from 'react'
import injectedModule from '@web3-onboard/injected-wallets'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import { init, useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { shortenAddress } from 'helpers'
import { RPC_PROVIDER } from 'contracts'

import { Button } from 'components/inputs'


const injected = injectedModule()
const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: false })

const web3Onboard = init({
  wallets: [
    injected,
    coinbaseWalletSdk,
  ],
  chains: [
    {
      id: '0x2a',
      token: 'ETH',
      label: 'Kovan Testnet',
      rpcUrl: RPC_PROVIDER,
    },
  ],
  appMetadata: {
    name: 'IndexClub',
    icon: '/images/logo.svg',
    logo: '/images/logo.svg',
    description: 'Create your own Indexes for most popular vaults',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' }
    ],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
  }
})

const ConnectButton: React.FC = () => {
  const [ { wallet, connecting }, connect, disconnect ] = useConnectWallet()
  const [ { chains, connectedChain, settingChain }, setChain ] = useSetChain()
  const connectedWallets = useWallets()

  useEffect(() => {
    const walletsSub = web3Onboard.state.select('wallets')

    const { unsubscribe } = walletsSub.subscribe((wallets) => {
      const connectedWallets = wallets.map(({ label }) => label)

      window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets))
    })

    return () => {
      // unsubscribe()
    }
  }, [])

  useEffect(() => {
    (async () => {
      const storageValue = window.localStorage.getItem('connectedWallets') || null
      const previouslyConnectedWallets = JSON.parse(storageValue)

      if (previouslyConnectedWallets?.length) {
        try {
          // Connect the most recently connected wallet (first in the array)
          // await onboard.connectWallet({ autoSelect: previouslyConnectedWallets[0] })

          // You can also auto connect "silently" and disable all onboard modals to avoid them flashing on page load
          await web3Onboard.connectWallet({
            autoSelect: {
              label: previouslyConnectedWallets[0],
              disableModals: true,
            }
          })

          // OR - loop through and initiate connection for all previously connected wallets
          // note: This UX might not be great as the user may need to login to each wallet one after the other
          // for (walletLabel in previouslyConnectedWallets) {
          //   await onboard.connectWallet({ autoSelect: walletLabel })
          // }
        }
        catch (err) {
          console.error(err)
        }
      }
    })()
  }, [])

  if (wallet) {
    return (
      <Button
        size={32}
        style="secondary"
        onClick={() => disconnect(wallet)}
      >
        {`${shortenAddress(wallet.accounts[0].address)} (Disconnect)`}
      </Button>
    )
  }

  return (
    <Button
      size={32}
      style="primary"
      disabled={connecting}
      onClick={() => connect({})}
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}

export default ConnectButton
