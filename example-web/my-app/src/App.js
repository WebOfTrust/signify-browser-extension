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
  const [parsedSignifyData, setParsedSignifyData] = useState();

  const fetchData = () => {
    const data = localStorage.getItem("signify-data");
    if (data) {
      setSignifyData(data);
      setParsedSignifyData(JSON.parse(data));
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
  });

  const removeData = () => {
    localStorage.removeItem("signify-data");
    setSignifyData(null);
    setParsedSignifyData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {signifyData ? (
          <div className="Welcome">
            <div className="">
              <h3>Welcome!</h3>
              <label htmlFor="message" className="">
                Signed in with{" "}
                {parsedSignifyData?.credential ? "Credential" : "AID"}
              </label>
              <textarea
                id="message"
                rows="16"
                defaultValue={signifyData}
                className="w-full block p-2.5 text-black text-sm rounded-lg border border-gray-300"
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
