import { Address, zeroAddress } from "locklift/.";

import BigNumber from "bignumber.js";
const ME = new Address("0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994");

// TODO: modify following scripts for new locklift
// deploy tokenwallet: https://tip3-onboarding.gitbook.io/untitled/with-using-account/deploy-token-wallet
// transfer tokens: https://tip3-onboarding.gitbook.io/untitled/with-using-account/transfer-tip-3-tokens


async function main() {
  const signer = (await locklift.keystore.getSigner("giver"))!;

  const initialSupplyTo = zeroAddress;
  const rootOwner = ME;
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
      deployer_: zeroAddress,
      randomNonce_: locklift.utils.getRandomNonce(),
      rootOwner_: rootOwner,
      name_: name,
      symbol_: symbol,
      decimals_: decimals,
      walletCode_: TokenWallet.code,
    },
    constructorParams: {
      initialSupplyTo: initialSupplyTo,
      initialSupply: new BigNumber(initialSupply).shiftedBy(decimals).toFixed(),
      deployWalletValue: locklift.utils.toNano(1),
      mintDisabled: disableMint,
      burnByRootDisabled: disableBurnByRoot,
      burnPaused: pauseBurn,
      remainingGasTo: ME,
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