import logo from './ACME_Corporation.png';
import Button from '@mui/material/Button';
import './App.css';

function App() {
    
  function clickMe() {
      window.postMessage(
          {type : "FROM_PAGE", text : "Hello from the webpage!"}, "*");
    
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo}  alt="logo" />
        <p>
        <Button variant="contained" onClick={clickMe}>
        Authenticate with AID
        </Button>
        </p>
      </header>
        
    </div>
  );
}

export default App;
