import { SignifyClient, Tier, ready } from 'signify-ts'

const makeScriptReady = async () => {
    await ready();
}
makeScriptReady();

export async function connectClient(url: string , passcode: string ) {
    const client = new SignifyClient(url, passcode, Tier.low);
    try {
        const resp = await client.connect();
        console.log("resp", resp);
        return true
    }
    catch (e) {
        console.log(e);
        return false
    }
}

export async function listIdentifiers(client: SignifyClient){
    let identifiers = await client.identifiers().list()
    return identifiers
}

export async function listCredentials(client: SignifyClient){
    let credentials = await client.credentials().list()
    return credentials
}
