import { Address, WalletTypes } from "locklift";

async function main() {
  const me = new Address("0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994");
  // take it from step 0
  const testUserAddr = new Address("0:1fac4b3651a78d759956347d3383eba6377e0dc87d46b5ea68d5f103c5b9dfb7");
  // take it from step 1
  const tokenRootAddr = new Address("0:4e13dbb1b50e081e79f98209596f828089049f42fc7b5c3ab60c7070fc89d067");
  // take it from step 3
  const tokenWalletAddr = new Address("0:5348263b32835decaa3b9403510552a503cba33516017e6deee4afb7795e8169");
  const signer = (await locklift.keystore.getSigner("1"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  });
  const root = locklift.factory.getDeployedContract("TokenRoot", tokenRootAddr);
  const tw = locklift.factory.getDeployedContract("TokenWallet", tokenWalletAddr);

  const { value0: owner } = await tw.methods.owner({ answerId: 0 }).call();
  const { traceTree } = await locklift.tracing.trace(
    root.methods
      .mint({
        amount: 1000000,
        recipient: me,
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

  console.log("Minted for token wallet of", owner.toString());
  console.log(`Supply is ${supply} now`);
  await traceTree?.beautyPrint();
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
