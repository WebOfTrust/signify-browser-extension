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
        </div>
      </header>
    </div>
  );
}

export default App;
