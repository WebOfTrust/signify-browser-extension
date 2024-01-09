import React, { useState } from "react";
import { APP_STATE } from "@pages/popup/constants";

export default function Dialog({ isConnected, tab, signins }): JSX.Element {
  // const logo = chrome.runtime.getURL("src/assets/img/128_keri_logo.png");
  const [createClicked, setCreateClicked] = useState(false);

  const handleCreate = async () => {
    await chrome.runtime.sendMessage({
      type: "tab",
      subtype: "set-tab-state",
      data: {
        appState: APP_STATE.SELECT_IDENTIFIER,
      },
    });
    setCreateClicked(true);
  };

  return (
    <div className="absolute top-10 right-10 min-w-[300px] rounded text-center p-3 bg-white">
      <header className="items-center justify-center">
        {/* <img src={logo} className="w-32 h-32" alt="logo" /> */}
        {signins?.length ? null : (
          <div className="flex flex-row border  p-2 bg-gray-dark rounded">
            <p className="  text-white">
              Select the KERI icon in your browser to proceed
            </p>
            <svg
              className="ml-2 h-6 w-6 rounded border-green animate-bounce"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 197.091 197.091"
            >
              <g>
                <g>
                  <g>
                    <path
                      fill="white"
                      d="M32.131,184.928L32.131,184.928c-18.388,0-31.573-2.505-32.131-2.616l0.734-7.648
				c32.349,0,55.555-8.45,68.964-25.098c15.174-18.835,13.532-43.34,12.394-51.811H25.918l85.588-85.592l85.585,85.592h-53.976
				C136.315,173.487,70.922,184.928,32.131,184.928z M44.564,90.028h43.912l0.673,3.028c0.311,1.432,7.476,35.341-13.381,61.302
				c-8.425,10.475-20.113,18.041-34.94,22.651c42.867-1.882,90.753-18.714,94.861-83.362l0.229-3.618h42.527l-66.939-66.946
				L44.564,90.028z"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        )}
        <p className="text-2xl font-bold text-green">Signin with KERI</p>
        {signins?.length ? (
          signins?.map((signin) => (
            <div className="flex m-2 flex-row justify-between p-2 items-start border border-black rounded">
              <div>
                <p className=" text-start text-sm font-bold">{signin.domain}</p>
                <p className=" text-start text-xs font-bold">
                  {new Date(signin.updatedAt).toDateString()}
                </p>
              </div>
              <button
                type="button"
                // onClick={handleCreate}
                className="text-white bg-green font-medium rounded-full text-sm px-2 py-1 text-center me-2 mb-2"
              >
                Signin
              </button>
            </div>
          ))
        ) : !createClicked && isConnected ? (
          <div className="flex m-2 flex-row justify-between p-2 items-start border border-black rounded">
            <p className=" text-sm font-bold">{tab?.url} is requesting an ID</p>
            <button
              type="button"
              onClick={handleCreate}
              className="text-white bg-green font-medium rounded-full ml-1 text-sm px-2 py-1 text-center me-2 mb-2"
            >
              Create
            </button>
          </div>
        ) : null}
      </header>
    </div>
  );
}
