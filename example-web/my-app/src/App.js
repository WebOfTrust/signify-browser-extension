import { useEffect, useState } from "react";
import {
  subscribeToSignature,
  unsubscribeFromSignature,
  requestAutoSignin,
  requestAid,
  requestCredential,
  requestAidORCred,
} from "signify-polaris-web";
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
            <div>
              <h3>Welcome!</h3>
              <label htmlFor="message">
                Signed in with{" "}
                {parsedSignifyData?.credential ? "Credential" : "AID"}
              </label>
              <textarea
                id="message"
                rows="16"
                defaultValue={signifyData}
                className="signify-data"
                placeholder="Write your thoughts here..."
              ></textarea>
            </div>
            <Button variant="contained" color="error" onClick={removeData}>
              Logout
            </Button>
          </div>
        ) : (
          <>
            {/* <img src={logo} alt="logo" /> */}
            <div className="auth-btn-container">
              <Button
                href="https://drive.google.com/drive/folders/1VmBAs3ba6qWT1I9y1Uk7hxvU_i-TKQTN?usp=sharing"
                target="_blank"
                size="md"
                variant="contained"
              >
                Download Extension
              </Button>
              <Button
                target="_blank"
                href="https://www.loom.com/share/2b4208bf57de4eb89b0950865497a817?sid=faa098d8-4e8a-4938-9ba5-6f3780983d09"
                size="md"
                variant="contained"
                onClick={requestAid}
              >
                See Video
              </Button>
            </div>
            <div className="auth-btn-container">
              <p className="auth-heading">Authenticate with</p>
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
