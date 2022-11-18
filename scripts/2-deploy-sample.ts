import { Address } from "locklift";

async function main() {
  // take it from step 1
  const tokenRootAddr = new Address("0:0e35665824afee3e6c2839efe481a673c1b6a0851e701af399014d6a2d56048a");
  
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
 
  const wallet = await sample.methods.wallet({answerId: 0}).call({responsible: true});
  console.log("The gitcoin wallet address is", wallet.value0);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
