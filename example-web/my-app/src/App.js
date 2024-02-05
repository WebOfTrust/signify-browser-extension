import {
  requestAid,
  requestCredential,
  requestAidORCred,
  attemptAutoSignin,
} from "polaris-web";
import logo from "./ACME_Corporation.png";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  const handleAutoSignin = async () => {
    try {
      const resp = await attemptAutoSignin();
      console.log("data", resp);
      if (resp?.data) {
        alert(
          "Signed headers received\n" +
            JSON.stringify(resp?.data.headers, null, 2)
        );
      }
    } catch (error) {}
  };

  return (
    <div className="App">
      <header className="App-header">
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
            onClick={handleAutoSignin}
          >
            Auto Sign in
          </Button>
        </div>
      </header>
    </div>
  );
}

export default App;
