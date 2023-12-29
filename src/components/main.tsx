import { useState } from "react";
import { Appbar } from "@components/appbar";
import { Sidebar } from "@components/sidebar";
import { IdentifierCard } from "@components/identifierCard";
import { CredentialCard } from "@components/credentialCard";
import { SigninCard } from "@components/signinCard";

interface IMain {
  handleSignout: () => void;
}

export function Main(props: IMain): JSX.Element {
  const [activeSidebar, setActiveSidebar] = useState("identifier");
  const renderItems = (index: number) => {
    switch (activeSidebar) {
      case "credential":
        return <CredentialCard isValid={Boolean(index % 2)} />;
      case "sign-in":
        return <SigninCard />;

      default:
        return <IdentifierCard />;
    }
  };

  return (
    <main className="">
      <Appbar />
      <Sidebar
        active={activeSidebar}
        onClickLink={setActiveSidebar}
        onSignout={props.handleSignout}
      />
      <div className="rounded p-2 sm:ml-64 sm:mt-4 bg-gray-dark text-gray-light">
        <div className="">
          <p className="text-xl uppercase font-bold">{activeSidebar}</p>
          <div className="bg-black py-8 rounded-3xl m-5 max-h-[576px] overflow-auto">
            {Array(3)
              .fill(1)
              .map((ele, index) => (
                <div key={index} className="my-2">
                  {renderItems(index)}
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
