import { useEffect, useState } from "react";
import {
  isExtensionInstalled,
  subscribeToSignature,
  unsubscribeFromSignature,
  requestAutoSignin,
  requestAid,
  requestCredential,
  requestAidORCred,
  trySettingVendorUrl,
  canCallAsync,
} from "signify-polaris-web";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "./App.css";

function CircularIndeterminate() {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
}

const PROVENANT_URL = "https://api.npoint.io/d59bd3ab0b31de863a20";
const FACEBOOK_URL = "https://api.npoint.io/1d388b8942c4ec3ed763";
const GITHUB_URL = "https://api.npoint.io/a75a0383d2820a2153c1";

function App() {
  const [signifyData, setSignifyData] = useState();
  const [extensionInstalled, setExtensionInstalled] = useState(null);
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
    isExtensionInstalled((extensionId) => {
      setExtensionInstalled(extensionId);
    });
    return () => {
      unsubscribeFromSignature();
    };
  }, []);

  const removeData = () => {
    localStorage.removeItem("signify-data");
    setSignifyData(null);
    setParsedSignifyData(null);
  };

  const handleSettingVendorUrl = async (url) => {
    trySettingVendorUrl(url);
  };

  const handleRequestAutoSignin = async () => {
    console.log("canCallAsync()", canCallAsync());
    if (canCallAsync()) {
      const resp = await requestAutoSignin();
      if (resp) {
        handleSignifyData(resp);
      }
    } else {
      requestAutoSignin();
    }
  };

  const renderData = () => {
    if (extensionInstalled === null) return <CircularIndeterminate />;

    if (extensionInstalled)
      return (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSettingVendorUrl(PROVENANT_URL)}
            >
              Provenant Theme (has Agent)
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSettingVendorUrl(FACEBOOK_URL)}
            >
              Facebook Theme
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSettingVendorUrl(GITHUB_URL)}
            >
              Github Theme (has Agent)
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
              onClick={handleRequestAutoSignin}
            >
              Auto Sign in
            </Button>
          </div>
        </>
      );

    return (
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
        >
          See Video
        </Button>
        <Alert severity="warning">Reload tab after installation</Alert>
      </div>
    );
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
          renderData()
        )}
      </header>
    </div>
  );
}

export default App;
