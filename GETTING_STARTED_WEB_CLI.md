## Web application integration guide

### Installation

1. Install [polaris-web-extension](FUTURE_DEPLOYED_EXTENSION_LINK) from [Chrome Web Store](https://chromewebstore.google.com/category/extensions)
2. Install [polaris-web](https://www.npmjs.com/package/polaris-web) from npm
`npm install polaris-web --save`

### Usage
import following methods from `polaris-web`

```
import {
  requestAid, // call to select aid for signing in
  requestCredential, // call to select credential for signing in
  requestAidORCred, // call to select either aid of credential
  attemptAutoSignin, // call for auto signin
} from "polaris-web";
```
### Usage requestAid
`requestAid` is called when authentication with AID is required, e.g:
```
<button onClick={requestAid}>Request AID</button>
```

### Usage requestCredential
`requestCredential` is called when authentication with Credential is required, e.g:
```
<button onClick={requestCredential}>Request CREDENTIAL</button>
```

### Usage requestAidORCred
`requestAidORCred` is called when authentication with either AID or Credential is required, e.g:
```
<button onClick={requestAidORCred}>Request AID or CREDENTIAL</button>
```

### Usage attemptAutoSignin
`attemptAutoSignin` is called to auto-signin with an already selected pair. The app asks to select one from the extension if there is no auto sign-in pair exists. 
```
const handleAutoSignin = async () => {
    const resp = await attemptAutoSignin();
    if (resp?.data) {
       alert(
          "Signed headers received\n" +
            JSON.stringify(resp?.data.headers, null, 2)
       );
     }
  };  
```

### Example Usage
Visit [example-web/my-app](./example-web/my-app/src/App.js) to see example.
