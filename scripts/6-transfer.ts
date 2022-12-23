import { Address, WalletTypes } from "locklift";

async function main() {
  // take it from step 0
  const testUserAddr = new Address("0:1fac4b3651a78d759956347d3383eba6377e0dc87d46b5ea68d5f103c5b9dfb7");
  // take it from step 1
  const tokenRootAddr = new Address("0:2edc90a1b1ef8628d771c6f1ed786810440364f42725578a331253673aebddca");
  // take it from step 2
  const sampleAddr = new Address("0:7a82ec4dcae96dd2b597fe40a162d494a14d9e2181784ec62bed2da99d493449");

  const signer = (await locklift.keystore.getSigner("1"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  });

  const tr = locklift.factory.getDeployedContract("TokenRoot", tokenRootAddr);
  const { value0: tokenWalletAddr } = await tr.methods.walletOf({ answerId: 0, walletOwner: testUserAddr }).call();
  const tw = locklift.factory.getDeployedContract("TokenWallet", tokenWalletAddr);
  const walletExists = Boolean((await tw.getFullState()).state);

  await tr.methods
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
    });
  

  const { value0: balanceBefore } = await tw.methods.balance({ answerId: 0 }).call();
  let { traceTree } = await locklift.tracing.trace(
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
  );
  await traceTree?.beautyPrint();
  
  const s = await locklift.factory.getDeployedContract('Echo', sampleAddr);
  const {events} = await s.getPastEvents({filter: 'EchoTokens'});
  console.log(events);
  // await traceTree?.beautyPrint();

  const { value0: balanceAfter } = await tw.methods.balance({ answerId: 0 }).call();
  console.log(`Token Wallet balance ${balanceBefore} -> ${balanceAfter}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
