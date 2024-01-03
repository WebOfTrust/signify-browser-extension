import React, { useState, useEffect } from "react";
import { configService } from "@pages/background/services/config";
import { IMessage } from "@pages/background/types";
import { Signin } from "@src/components/signin";
import { Main } from "@components/main";

const url = "https://keria-dev.rootsid.cloud/admin";
const boot_url = "https://keria-dev.rootsid.cloud";
const password = "Cp6n5zxYRmnE4iTyCUM0gR";

interface IConnect {
  passcode?: string;
  vendorUrl?: string;
  bootUrl?: string;
}

export default function Popup(): JSX.Element {
  const [isConnected, setIsConnected] = useState(false);
  const [vendorUrl, setVendorUrl] = useState("");

  const getVendorUrl = async () => {
    const _vendorUrl = await configService.getUrl();
    console.log("_vendorUrl", _vendorUrl);
    setVendorUrl(_vendorUrl);
  };

  const checkConnection = async () => {
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "authentication",
      subtype: "check-agent-connection",
    });

    console.log("data", data);
    if (data.isConnected) {
      document.body.style.width = "768px";
    } else {
      document.body.style.width = "300px";
    }
    setIsConnected(!!data.isConnected);
  };

  useEffect(() => {
    checkConnection();
    getVendorUrl();
  }, []);

  const handleConnect = async (vendorUrl?: string, passcode?: string) => {
    const resp = await chrome.runtime.sendMessage<IMessage<IConnect>>({
      type: "authentication",
      subtype: "connect-agent",
      data: {
        passcode: password,
        vendorUrl: url,
        bootUrl: boot_url,
      },
    });
    await checkConnection();
    console.log("res in signin", resp);
  };

  const handleDisconnect = async () => {
    await chrome.runtime.sendMessage<IMessage<void>>({
      type: "authentication",
      subtype: "disconnect-agent",
    });
    checkConnection();
  };

  // const [client, setClient] = React.useState<SignifyClient | undefined>(undefined)

  // React.useEffect(() => {
  //   ready().then(() => {
  //     console.log("signify client is ready")
  //   })
  // }
  //   , [])

  // const generatePasscode = () => {
  //   let p = randomPasscode()
  //   setPasscode(p)
  // }

  // const newClient = (passcode: string) => {
  //   ready().then(() => {
  //     console.log("signify client is ready")
  //   }).catch((err) => {
  //     console.log("signify client is not ready")
  //   })
  //   const client = new SignifyClient(url, passcode, Tier.low, boot_url);
  //   console.log(client)
  //   setClient(client)
  // }

  const [bootedState, setBootedState] = useState<string>("");

  // const boot = async (client: SignifyClient) => {
  //   await client.boot()
  //   let resp = await client.state()
  //   console.log('booted client')
  //   setBootedState('booted')
  //   return JSON.stringify(resp)
  // }

  const [connectedState, setConnectedState] = React.useState<string>("");

  // const connect = async (client: SignifyClient) => {
  //   await client.connect()
  //   let resp = await client.state()
  //   console.log('connected client')
  //   setConnectedState('connected')
  //   return JSON.stringify(resp)
  // }

  return (
    <div>
      {/* <header className="flex flex-col items-center justify-center text-white"> */}
      {/* <img src={logo} className="w-32 h-32" alt="logo" /> */}
      {/* <button onClick={generatePasscode}> generate</button> */}
      {/* <p>p:{passcode}</p> */}
      {/* <button onClick={() => newClient(passcode)}>set client</button> */}
      {/* {client && <p>client:{client.agent?.pre}</p>}
        {client && <button onClick={() => boot(client!)}>boot</button>}
        <p>bootedState:{bootedState}</p>
        {client && <button onClick={() => connect(client!)}>connect</button>}
        <p>connectedState:{connectedState}</p> */}
      {/* </header> */}
      {isConnected ? (
        <Main handleDisconnect={handleDisconnect} />
      ) : (
        <Signin vendorUrl={vendorUrl} handleConnect={handleConnect} />
      )}
    </div>
  );
}
