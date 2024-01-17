import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  const handleRequestIdentifier = () => {
    window.postMessage({ type: "select-identifier" }, "*");
  };

  const handleRequestCredential = () => {
    window.postMessage({ type: "select-credential" }, "*");
  };

  const handleRequestIdORCred = () => {
    window.postMessage({ type: "select-aid-or-credential" }, "*");
  };

  const handleSyncRequest = () => {
    // TODO extension Id harcoded just for testing, need to find a way to get it dynamically
    chrome.runtime.sendMessage(
      "fklmfbmpaimbgjplbambkdjphdadbmed",
      { data: "test" },
      function (response) {
        if (!response.success) console.log(response.data);
        alert(
          "Signed headers received\n" +
            JSON.stringify(response.data.headers, null, 2)
        );
      }
    );
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
