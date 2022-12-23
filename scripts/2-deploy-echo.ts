import { Address } from "locklift";

async function main() {
  // take it from step 1
  const tokenRootAddr = new Address("0:4e13dbb1b50e081e79f98209596f828089049f42fc7b5c3ab60c7070fc89d067");
  
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { contract: echo, tx } = await locklift.factory.deployContract({
    contract: "Echo",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      root: tokenRootAddr
    },
    value: locklift.utils.toNano(2),
  });
  console.log(`Echo deployed at: ${echo.address.toString()}`);

  const {value0: twAddress} = await echo.methods.wallet({answerId: 0}).call({responsible: true});
  console.log("Echo wallet address is", twAddress.toString());

  const wallet = await locklift.factory.getDeployedContract("TokenWallet", twAddress);
  const {value0: balance} = await wallet.methods.balance({answerId: 0}).call({responsible: true});
  console.log("Echo wallet balance is", balance);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
