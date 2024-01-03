import { useState } from "react";
import { Appbar } from "@components/appbar";
import { Sidebar } from "@components/sidebar";
import { IdentifierList } from "@components/identifierList";
import { CredentialList } from "@components/credentialList";
import { SigninCard } from "@components/signinCard";

interface IMain {
  handleDisconnect: () => void;
}

export function Main(props: IMain): JSX.Element {
  const [activeSidebar, setActiveSidebar] = useState("identifier");
  const renderItems = () => {
    switch (activeSidebar) {
      case "credential":
        return <CredentialList />;
      case "sign-in":
        return <SigninCard />;

      default:
        return <IdentifierList />;
    }
  };

  return (
    <main className="">
      <Appbar />
      <Sidebar
        active={activeSidebar}
        onClickLink={setActiveSidebar}
        onSignout={props.handleDisconnect}
      />
      <div className="rounded p-2 sm:ml-64 sm:mt-4 bg-gray-dark text-gray-light">
        <div className="">
          <p className="text-xl uppercase font-bold">{activeSidebar}</p>
          <div className="bg-black py-8 rounded-3xl m-5 max-h-[576px] overflow-auto">
            {renderItems()}
          </div>
        </div>
      </div>
    </main>
  );
}
