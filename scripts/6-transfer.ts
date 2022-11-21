import { Address, WalletTypes } from "locklift";
import { text } from "stream/consumers";

async function main() {
  // take it from step 0
  const testUserAddr = new Address("0:1fac4b3651a78d759956347d3383eba6377e0dc87d46b5ea68d5f103c5b9dfb7");
  // take it from step 1
  const tokenRootAddr = new Address("0:0e35665824afee3e6c2839efe481a673c1b6a0851e701af399014d6a2d56048a");
  // take it from step 2
  const sampleAddr = new Address("0:aaa5d0e77b89430074fc1832bc066029bc0dc96a16df7bdd6a17a0e6317464a3");
  // take it from step 3
  const signer = (await locklift.keystore.getSigner("1"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  });

  const tr = locklift.factory.getDeployedContract("TokenRoot", tokenRootAddr);
  const { value0: tokenWalletAddr } = await tr.methods.walletOf({ answerId: 0, walletOwner: testUserAddr }).call();
  const tw = locklift.factory.getDeployedContract("TokenWallet", tokenWalletAddr);
  const walletExists = Boolean((await tw.getFullState()).state);

  let { traceTree } = await locklift.tracing.trace(
    tr.methods
      .mint({
        amount: 1000000,
        recipient: testUserAddr,
        deployWalletValue: walletExists ? 0 : locklift.utils.toNano(0.1),
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
  await traceTree?.beautyPrint();

  const { value0: balanceBefore } = await tw.methods.balance({ answerId: 0 }).call();
  ({ traceTree } = await locklift.tracing.trace(
    tw.methods
      .transfer({
        amount: 1000000,
        recipient: sampleAddr,
        deployWalletValue: 0,
        remainingGasTo: testUserAddr,
        notify: true,
        payload: "",
      })
      .send({
        from: testUserAddr,
        amount: locklift.utils.toNano(1),
        bounce: true,
      }),
  ));
  await traceTree?.beautyPrint();

  const { value0: balanceAfter } = await tw.methods.balance({ answerId: 0 }).call();
  console.log(`Token Wallet balance ${balanceBefore} -> ${balanceAfter}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
