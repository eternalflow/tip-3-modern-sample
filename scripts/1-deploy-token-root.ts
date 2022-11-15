import { Address, WalletTypes, zeroAddress } from "locklift/.";

import BigNumber from "bignumber.js";


async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  // take the address from step 0
  const testUser = new Address("0:fff74d396dc0c9836a3084dbb3b136c7c0988af06c0d4028237b228137ded889");

  const initialSupplyTo = zeroAddress;
  const rootOwner = testUser;
  const name = "Onboarding Token";
  const symbol = "ONT421";
  const decimals = 6;
  const disableMint = false;
  const disableBurnByRoot = false;
  const pauseBurn = false;

  let initialSupply = "0";
  
  /* 
    Returns compilation artifacts based on the .sol file name
      or name from value config.extarnalContracts[pathToLib].
  */
  const TokenWallet = locklift.factory.getContractArtifacts("TokenWallet");
  
  /* 
    Deploy the TIP-3 Token Root contract.
    @params deployWalletValue: Along with the deployment of the root token,
      the wallet will be automatically deployed to the owner. 
      This is the amount of EVERs that will be sent to the wallet.
  */
  const { contract: tokenRoot } = await locklift.factory.deployContract({
    contract: "TokenRoot",
    publicKey: signer.publicKey,
    initParams: {
      deployer_: zeroAddress.toString(),
      randomNonce_: locklift.utils.getRandomNonce(),
      rootOwner_: rootOwner.toString(),
      name_: name,
      symbol_: symbol,
      decimals_: decimals,
      walletCode_: TokenWallet.code,
    },
    constructorParams: {
      initialSupplyTo: initialSupplyTo.toString(),
      initialSupply: new BigNumber(initialSupply).shiftedBy(decimals).toFixed(),
      deployWalletValue: 0,
      mintDisabled: disableMint,
      burnByRootDisabled: disableBurnByRoot,
      burnPaused: pauseBurn,
      remainingGasTo: testUser.toString(),
    },
    value: locklift.utils.toNano(2),
  });

  console.log(`${name}: ${tokenRoot.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });