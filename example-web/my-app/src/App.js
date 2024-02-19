import { useEffect, useState } from "react";
import {
  subscribeToSignature,
  unsubscribeFromSignature,
  requestAutoSignin,
  requestAid,
  requestCredential,
  requestAidORCred,
} from "polaris-web";
import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  const [signifyData, setSignifyData] = useState();

  const fetchData = () => {
    const data = localStorage.getItem("signify-data");
    if (data) {
      setSignifyData(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignifyData = (data) => {
    localStorage.setItem("signify-data", JSON.stringify(data, null, 2));
    fetchData();
  };

  useEffect(() => {
    subscribeToSignature(handleSignifyData);
    return () => {
      unsubscribeFromSignature();
    };
  }, []);

  const removeData = () => {
    localStorage.removeItem("signify-data");
    setSignifyData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {signifyData ? (
          <div className="w-full p-4">
            <div>
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Signify Header Data
              </label>
              <textarea
                id="message"
                rows="16"
                defaultValue={signifyData}
                className="block p-2.5 w-full text-black text-sm rounded-lg border border-gray-300"
                placeholder="Write your thoughts here..."
              ></textarea>
            </div>
            <Button variant="contained" color="error" onClick={removeData}>
              Logout
            </Button>
          </div>
        ) : (
          <>
            <img src={logo} alt="logo" />
            <div className="flex flex-col gap-y-2 mt-2">
              <p className=" text-lg font-bold">Authenticate with</p>
              <Button variant="contained" color="success" onClick={requestAid}>
                AID
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={requestCredential}
              >
                Credential
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={requestAidORCred}
              >
                AID or CRED
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={requestAutoSignin}
              >
                Auto Sign in
              </Button>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
