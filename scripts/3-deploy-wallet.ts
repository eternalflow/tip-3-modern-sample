import { MsigAccount } from "everscale-standalone-client";
import { Address, WalletTypes } from "locklift/.";


async function main() {
  // take it from step 0
  const testUserAddr = new Address("0:fff74d396dc0c9836a3084dbb3b136c7c0988af06c0d4028237b228137ded889");
  // take it from step 1
  const tokenRootAddr = new Address("0:a6843d2039aab538fd264eaa346b687aef32318e2b837bf74b0c802229ab54e3");

  const signer = (await locklift.keystore.getSigner("0"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  
  })
  // console.log(locklift.factory.accounts.storage.hasAccount(testUserAddr));

  /* 
    Get instance of already deployed contract
  */
  const tokenRoot = locklift.factory.getDeployedContract(
    "TokenRoot",
    tokenRootAddr
  );
  await locklift.transactions.waitFinalized(tokenRoot.methods.deployWallet({
      answerId: "0",
      walletOwner: testUserAddr.toString(),
      deployWalletValue: locklift.utils.toNano(1)
    }).send({
      from: testUserAddr,
      amount: locklift.utils.toNano(2)
    }));

  const twAddr = await tokenRoot.methods.walletOf({
    answerId: 0,
    walletOwner: testUserAddr.toString(),
  }).call({ responsible: true });

  console.log(`TIP3 Wallet deployed at: ${twAddr.value0.toString()}`);
  
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
