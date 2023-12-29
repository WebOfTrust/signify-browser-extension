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

  const renderItems = () => {
    switch (activeSidebar) {
      case "credential":
        return <CredentialCard />;
      case "sign-in":
        return <SigninCard />;

      default:
        return <IdentifierCard />;
    }
  };

  return (
    <main>
      <Appbar />
      <Sidebar
        active={activeSidebar}
        onClickLink={setActiveSidebar}
        onSignout={props.handleSignout}
      />
      <div className="sm:ml-64 bg-gray-dark text-gray-light">
        <div className="">
          <p className="text-xl">{activeSidebar}</p>
          <div className="bg-black py-8 rounded-3xl m-5 max-h-[576px] overflow-auto">
            {Array(3)
              .fill(1)
              .map((ele, index) => (
                <div key={index} className="my-2">
                  {renderItems()}
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
