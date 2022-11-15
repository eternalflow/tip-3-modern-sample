import { Address } from "locklift";

async function main() {
  // take it from step 1
  const tokenRootAddr = new Address("0:a6843d2039aab538fd264eaa346b687aef32318e2b837bf74b0c802229ab54e3");
  
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { contract: sample, tx } = await locklift.factory.deployContract({
    contract: "Sample",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      _state: 0,
      root: tokenRootAddr.toString()
    },
    value: locklift.utils.toNano(3),
  });
  console.log(`Sample deployed at: ${sample.address.toString()}`);

  const tokenRoot = locklift.factory.getDeployedContract(
    "TokenRoot",
    tokenRootAddr
  );
  const twAddr = await tokenRoot.methods.walletOf({
    answerId: 0,
    walletOwner: sample.address
  }).call({ responsible: true });
  console.log(`Sample now has token wallet at: ${twAddr.value0.toString()}`);
  
  const tw = await locklift.factory.getDeployedContract("TokenWallet", twAddr.value0);
  const root = await tw.methods.root({
    answerId: 0
  }).call({ responsible: true });
  console.log('Root address in tw:', root.value0.toString());
 
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
