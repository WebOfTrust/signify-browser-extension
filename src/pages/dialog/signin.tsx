import { APP_STATE } from "@pages/popup/constants";
import { sign } from "crypto";

// TODO do not pass the full signins stored object (only AID name, schema name, web url)
export const SigninItem = ({ signin }): JSX.Element => {
  const handleClick = async () => {
    const headers = await chrome.runtime.sendMessage({
      type: "authentication",
      subtype: "get-signed-headers",
      data: {
        signin: signin,
      },
    });
    alert("Signed headers received\n"+ JSON.stringify(headers.data.headers, null, 2));
    const element = document.getElementById("__root");
    if (element) element.remove();
  };

  return (
    <div className="flex m-2 flex-row justify-between p-2 items-start border border-black rounded">
      <div>
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
      <button
        type="button"
        onClick={handleClick}
        className="text-white self-end bg-green font-medium rounded-full text-sm px-2 py-1 text-center"
      >
        Sign in
      </button>
    </div>
  );
};
