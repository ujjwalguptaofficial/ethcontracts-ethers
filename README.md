# ethcontracts-ethers
ethers.js wraper for ethcontracts.js

> It contains ethers.js client which can be used inside ethcontracts.js.

# install

```
npm i @ethcontracts/ethers
```

# Usage

```
import { ERC20 } from "@ethcontracts/core";
import { EthersClient } from "@ethcontracts/ethers";
import { providers } from "ethers"

// create token with token address
const token = new ERC20("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063");

// create provider
const provider = new providers.JsonRpcProvider('https://polygon-rpc.com');

// initiate token with provider
await token.init(
    new EthersClient(provider)
);

// call token balance api

const balance = await token.getBalance("0xd5D3F35Bdd08950CCFE0DeAb638F8B5498297076");
console.log("balance", balance);
```

For more documentation, please visit - [https://ujjwalguptaofficial.github.io/ethcontracts-doc/](https://ujjwalguptaofficial.github.io/ethcontracts-doc/)

