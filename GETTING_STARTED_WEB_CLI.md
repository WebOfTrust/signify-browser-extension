## Web application integration guide

### Installation

1. Install [polaris-web-extension](FUTURE_DEPLOYED_EXTENSION_LINK) from [Chrome Web Store](https://chromewebstore.google.com/category/extensions)
2. Install [signify-polaris-web](https://github.com/WebOfTrust/polaris-web) by listing it into `package.json` dependencies:
   
```  
"dependencies": {
  "signify-polaris-web": "https://github.com/WebOfTrust/polaris-web.git",
}
```

### Usage
import following methods from `polaris-web`

```
import {
  subscribeToSignature, // subscribe to receive signature
  unsubscribeFromSignature, // can be used to unsubscribe
  requestAid, // call to select aid for signing in
  requestCredential, // call to select credential for signing in
  requestAidORCred, // call to select either aid of credential
  requestAutoSignin, // call for auto signin
} from "polaris-web";
```

### Usage subscribeToSignature
`subscribeToSignature` is a mandatory subscription call that receives a function to return signature, e.g:
```

const handleSignifyData = (data) => {
    console.log("signature", data);
};

useEffect(() => {
    subscribeToSignature(handleSignifyData);
    return () => {
      unsubscribeFromSignature();
    };
  }, []);
```

### Usage unsubscribeFromSignature
`unsubscribeFromSignature` to unsubscription e.g:
```
useEffect(() => {
    subscribeToSignature(handleSignifyData);
    return () => {
      unsubscribeFromSignature();
    };
  }, []);
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

### Usage requestAutoSignin
`requestAutoSignin` is called to auto-signin with an already selected pair. The app asks to select one from the extension if there is no auto sign-in pair exists. 
```
<button onClick={requestAutoSignin}>Auto Sign in</button>  
```

### Example Usage
Visit [example-web/my-app](./example-web/my-app/src/App.js) to see example.

Visit [Live Demo](https://signify-browser-extension.vercel.app/) for production demo.
