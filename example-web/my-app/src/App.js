import { useState } from "react";
import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");

  const handleRequestIdentifier = () => {
    window.postMessage({ type: "init-req-identifier" }, "*");
  };

  const handleRequestCredential = () => {
    window.postMessage({ type: "init-req-credential" }, "*");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  const handleAutoAuth = () => {
    localStorage.setItem("token", password);
  };

  const storageToken = localStorage.getItem("token");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="logo" />
        <input
          id="aid-input"
          type="password"
          style={{ visibility: "hidden" }}
          onChange={(e) => {
            console.log(e);
            setPassword(e.target.value);
          }}
        />
        <div className="flex flex-row gap-x-2 mt-2">
          <Button variant="contained" onClick={handleRequestIdentifier}>
            Authenticate with AID
          </Button>
          <Button variant="contained" onClick={handleRequestCredential}>
            Authenticate with Credential
          </Button>
        </div>
        {storageToken ? null : (
          <Button
            id="login-btn"
            style={{ visibility: "hidden" }}
            variant="contained"
            onClick={handleAutoAuth}
          >
            Auth with AID
          </Button>
        )}
      </header>
    </div>
  );
}

export default App;
