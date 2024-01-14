import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

function App() {

  const handleRequestIdentifier = () => {
    window.postMessage({ type: "init-req-identifier" }, "*");
  };

  const handleRequestCredential = () => {
    window.postMessage({ type: "init-req-credential" }, "*");
  };

  const handleSyncRequest = () => {
    // TODO extension Id harcoded just for testing, need to find a way to get it dynamically
    chrome.runtime.sendMessage("fklmfbmpaimbgjplbambkdjphdadbmed", {data: "test"},
      function(response) {
        if (!response.success)
          console.log(response.data)
          alert("Signed headers received\n"+ JSON.stringify(response.data.headers, null, 2));
      });
  };



  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="logo" />
        <div className="flex flex-row gap-x-2 mt-2">
          <Button variant="contained" onClick={handleRequestIdentifier}>
            Authenticate with AID
          </Button>
          <Button variant="contained" onClick={handleRequestCredential}>
            Authenticate with Credential
          </Button>
          <Button variant="contained" onClick={handleSyncRequest}>
            Synchronous Authentication
          </Button>
        </div>
      </header>
    </div>
  );
}

export default App;
