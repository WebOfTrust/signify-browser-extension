import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

var extensionId = "";

function App() {

  window.addEventListener(
    "message",
    async (event) => {
      // Accept messages only from same window
      if (event.source !== window) {
        return;
      }
      
      if (event.data.type && event.data.type === "signify-extension") {
        console.log("Content scrip loaded");
        extensionId = event.data.data.extensionId;
      }
    },
    false
  );

  const handleRequestIdentifier = () => {
    window.postMessage({ type: "select-identifier" }, "*");
  };

  const handleRequestCredential = () => {
    window.postMessage({ type: "select-credential" }, "*");
  };

  const handleRequestIdORCred = () => {
    window.postMessage({ type: "select-aid-or-credential" }, "*");
  };

  const handleRequestAutoSignin = () => {
    window.postMessage({ type: "select-auto-signin" }, "*");
  };

  const handleSyncRequest = async () => {
    const { data, error } = await chrome.runtime.sendMessage(extensionId, {
      type: "fetch-resource",
      subtype: "auto-signin-signature",
    });

    if (error) {
      handleRequestAutoSignin();
    } else {
      alert(
        "Signed headers received\n" + JSON.stringify(data.headers, null, 2)
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="logo" />
        <div className="flex flex-col gap-y-2 mt-2">
          <p className=" text-lg font-bold">Authenticate with</p>
          <Button
            variant="contained"
            color="success"
            onClick={handleRequestIdentifier}
          >
            AID
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleRequestCredential}
          >
            Credential
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleRequestIdORCred}
          >
            AID or CRED
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSyncRequest}
          >
            Synchronous
          </Button>
        </div>
      </header>
    </div>
  );
}

export default App;
