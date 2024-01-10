import { useState, useEffect } from "react";
import { SigninCard } from "@components/signinCard";
import { Loader } from "@components/loader";
import { IMessage } from "@pages/background/types";

export function SigninList(): JSX.Element {
  const [signins, setSignins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchSignins = async () => {
    setIsLoading(true);
    const { data } = await chrome.runtime.sendMessage<IMessage<void>>({
      type: "fetch-resource",
      subtype: "signins",
    });
    console.log("signins", data?.signins);
    setSignins(data?.signins);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSignins();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-row justify-center items-center">
          <Loader size={6} />
        </div>
      ) : null}
      {signins.map((signin, index) => (
        <div key={index} className="my-2 mx-4">
          <SigninCard signin={signin} />
        </div>
      ))}
      {!isLoading && !signins?.length ? (
        <p className="">No items to show</p>
      ) : (
        <></>
      )}
    </>
  );
}
