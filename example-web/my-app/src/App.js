import { useState } from "react";
import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const handleAuth = () => {
    window.postMessage({ type: "initAuth" }, "*");
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
          onChange={(e) => {
            console.log(e);
            setPassword(e.target.value);
          }}
        />
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            id="loading"
            className="animate-spin h-3 w-3"
          >
            <g data-name="Loader">
              <path
                fill="currentColor"
                d="M29.89 15.81a2.51 2.51 0 1 0-5 .45 9.65 9.65 0 0 1-1.68 6.34 10.24 10.24 0 0 1-5.74 4 10.71 10.71 0 0 1-7.38-.7 11.44 11.44 0 0 1-5.48-5.62A12.07 12.07 0 0 0 9.46 27 12.58 12.58 0 0 0 17.9 29a13.31 13.31 0 0 0 8.18-4 14 14 0 0 0 3.81-8.75v-.08A2.29 2.29 0 0 0 29.89 15.81zM7.11 15.74A9.65 9.65 0 0 1 8.79 9.4a10.24 10.24 0 0 1 5.74-4 10.71 10.71 0 0 1 7.38.7 11.44 11.44 0 0 1 5.48 5.62A12.07 12.07 0 0 0 22.54 5 12.58 12.58 0 0 0 14.1 3 13.31 13.31 0 0 0 5.92 7a14 14 0 0 0-3.81 8.75v.08a2.29 2.29 0 0 0 0 .37 2.51 2.51 0 1 0 5-.45z"
              ></path>
            </g>
          </svg>
        </div>
        <p>
          {storageToken ? (
            <Button variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="contained" onClick={handleAuth}>
              Authenticate with AID
            </Button>
          )}
        </p>
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
