import React, { useState, useEffect } from "react";
import { userService } from "@pages/background/services/user";
import { IMessage } from "@pages/background/types";
import { Signin } from "@src/components/signin";
import { Main } from "@components/main";

// import { randomPasscode, SignifyClient, Tier, ready } from 'signify-ts'
const url = "https://keria-dev.rootsid.cloud/admin";
const boot_url = "https://keria-dev.rootsid.cloud";

interface IConnect {
  passcode?: string;
  vendorUrl?: string;
}

export default function Popup(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = async () => {
    const token = await userService.getToken();
    if (token) {
      document.body.style.width = "768px";
    } else {
      document.body.style.width = "300px";
    }
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleConnect = async (vendorUrl?: string, passcode?: string) => {
    const resp = await chrome.runtime.sendMessage<IMessage<IConnect>>({
      type: "authentication",
      subtype: "persist-token",
      data: {
        passcode,
        vendorUrl,
      },
    });
    checkAuthentication();
    console.log("res in signin", resp);
  };

  const handleSignout = async () => {
    await userService.removeToken();
    checkAuthentication();
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
      {isAuthenticated ? (
        <Main handleSignout={handleSignout} />
      ) : (
        <Signin handleConnect={handleConnect} />
      )}
    </div>
  );
}
