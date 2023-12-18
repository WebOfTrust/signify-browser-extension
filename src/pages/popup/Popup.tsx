import React from 'react';
import logo from '@assets/img/128_keri_logo.png';
import { randomPasscode, SignifyClient, Tier, ready } from 'signify-ts'
const url = "https://keria-dev.rootsid.cloud/admin"
const boot_url = "https://keria-dev.rootsid.cloud"

export default function Popup(): JSX.Element {

  const [passcode, setPasscode] = React.useState<string>('')
  const [client, setClient] = React.useState<SignifyClient | undefined>(undefined)

  React.useEffect(() => {
    ready().then(() => {
      console.log("signify client is ready")
    })
  }
    , [])

  const generatePasscode = () => {
    let p = randomPasscode()
    setPasscode(p)
  }

  const newClient = (passcode: string) => {
    ready().then(() => {
      console.log("signify client is ready")
    }).catch((err) => {
      console.log("signify client is not ready")
    })
    const client = new SignifyClient(url, passcode, Tier.low, boot_url);
    console.log(client)
    setClient(client)
  }

  const [bootedState, setBootedState] = React.useState<string>('')

  const boot = async (client: SignifyClient) => {
    await client.boot()
    let resp = await client.state()
    console.log('booted client')
    setBootedState('booted')
    return JSON.stringify(resp)
  }

  const [connectedState, setConnectedState] = React.useState<string>('')

  const connect = async (client: SignifyClient) => {
    await client.connect()
    let resp = await client.state()
    console.log('connected client')
    setConnectedState('connected')
    return JSON.stringify(resp)
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
      <img src={logo} className="w-32 h-32" alt="logo" />
        <button onClick={generatePasscode}> generate</button>
        <p>p:{passcode}</p>
        <button onClick={() => newClient(passcode)}>set client</button>
        {client && <p>client:{client.agent?.pre}</p>}
        {client && <button onClick={() => boot(client!)}>boot</button>}
        <p>bootedState:{bootedState}</p>
        {client && <button onClick={() => connect(client!)}>connect</button>}
        <p>connectedState:{connectedState}</p>
      </header>
    </div>
  );
}
