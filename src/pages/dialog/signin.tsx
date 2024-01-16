import { TAB_STATE } from "@pages/popup/constants";
import { setTabState } from "@pages/content/index";

// TODO do not pass the full signins stored object (only AID name, schema name, web url)
export const SigninItem = ({ signin }: { signin: any }): JSX.Element => {
  const handleClick = async () => {
    const headers = await chrome.runtime.sendMessage({
      type: "authentication",
      subtype: "get-signed-headers",
      data: {
        signin: signin,
      },
    });
    const element = document.getElementById("__root");
    if (element) element.remove();
    setTabState(TAB_STATE.NONE);
    // Communicate headers to web page
    window.postMessage({ type: "signify-signature", data: headers.data }, "*");
  };

  return (
    <div className="flex m-2 flex-row justify-between p-2 items-start border border-black rounded">
      <div className="max-w-[200px] break-words">
        <p className=" text-start text-sm font-bold">URL: {signin.domain}</p>
        {signin?.identifier ? (
          <p className=" text-start text-sm">
            <strong>AID: </strong> {signin?.identifier?.name}
          </p>
        ) : (
          <></>
        )}
        {signin?.credential ? (
          <p className=" text-sm text-start font-normal text-gray">
            <strong>Cred: </strong> {signin?.credential?.schema?.title}
          </p>
        ) : (
          <></>
        )}
        <p className=" text-start text-xs font-bold">
          Last used: {new Date(signin.updatedAt).toDateString()}
        </p>
      </div>
      <div className="flex flex-col gap-y-2">
        <div className={`${signin?.autoSignin ? "visible" : "invisible"}`}>
          <p className=" text-end text-[8px] font-bold">Auto Sign in</p>
          <div className="text-green float-right">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
              />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="text-white self-end bg-green font-medium rounded-full text-sm px-2 py-1 text-center"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
