import { Address } from "locklift";

async function main() {
  // take it from prev step
  const rootAddr = "0:cc55a48988a9dbab46134b927432a969c491ccca8d32cd692da558ba87bfbf0e";
  const ME = "0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994";
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { contract: sample, tx } = await locklift.factory.deployContract({
    contract: "Sample",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      _state: 0,
      root: rootAddr
    },
    value: locklift.utils.toNano(3),
  });
  console.log(`Sample deployed at: ${sample.address.toString()}`);

  const tokenRoot = locklift.factory.getDeployedContract(
    "TokenRoot",
    new Address(rootAddr),
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
