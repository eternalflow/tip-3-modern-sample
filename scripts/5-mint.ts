import { Address, WalletTypes } from "locklift";

async function main() {
  // the same as testOwner in step 3
  const testOwner = new Address("0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994");
  // take it from step 0
  const testUserAddr = new Address("0:1fac4b3651a78d759956347d3383eba6377e0dc87d46b5ea68d5f103c5b9dfb7");
  // take it from step 1
  const tokenRootAddr = new Address("0:2edc90a1b1ef8628d771c6f1ed786810440364f42725578a331253673aebddca");
  // take it from step 3
  const tokenWalletAddr = new Address("0:6cada0a45654699f4305ae0c73cba5280e097ca06eb1cb4d034542a8240607ce");
  const signer = (await locklift.keystore.getSigner("1"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  });
  const root = locklift.factory.getDeployedContract("TokenRoot", tokenRootAddr);
  const tw = locklift.factory.getDeployedContract("TokenWallet", tokenWalletAddr);

  const { traceTree } = await locklift.tracing.trace(
    root.methods
      .mint({
        amount: 1000000,
        recipient: testOwner,
        deployWalletValue: 0,
        remainingGasTo: testUserAddr,
        notify: false,
        payload: "",
      })
      .send({
        from: testUserAddr,
        amount: locklift.utils.toNano(1),
        bounce: true,
      }),
  );
  const { value0: supply } = await root.methods.totalSupply({ answerId: 0 }).call();
  
  console.log("Minted for token wallet of", testOwner.toString());
  console.log(`Supply is ${supply} now`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
