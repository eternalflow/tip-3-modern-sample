import { Address, Contract, WalletTypes } from "locklift/.";
import { FactorySource } from "../build/factorySource";

async function main() {
  // put any address here
  const testOwner = new Address("0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994");
  // take it from step 0
  const testUserAddr = new Address("0:1fac4b3651a78d759956347d3383eba6377e0dc87d46b5ea68d5f103c5b9dfb7");
  // take it from step 1
  const tokenRootAddr = new Address("0:2edc90a1b1ef8628d771c6f1ed786810440364f42725578a331253673aebddca");

  const signer = (await locklift.keystore.getSigner("1"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  });
  // console.log(locklift.factory.accounts.storage.hasAccount(testUserAddr));

  /* 
    Get instance of already deployed contract
  */
  const tokenRoot = locklift.factory.getDeployedContract("TokenRoot", tokenRootAddr);
  await locklift.transactions.waitFinalized(
    tokenRoot.methods
      .deployWallet({
        answerId: "0",
        walletOwner: testOwner,
        deployWalletValue: locklift.utils.toNano(0.1),
      })
      .send({
        from: testUserAddr,
        amount: locklift.utils.toNano(1),
      }),
  );

  const {value0: twAddress} = await tokenRoot.methods
    .walletOf({
      answerId: 0,
      walletOwner: testOwner,
    })
    .call({ responsible: true });

  console.log(`TIP3 Wallet deployed at: ${twAddress.toString()}`);

  const tw = await locklift.factory.getDeployedContract("TokenWallet", twAddress);
  const {value0: rootActual} = await tw.methods
    .root({
      answerId: 0,
    })
    .call({ responsible: true });
  console.log("Root address in tw:", rootActual.toString());
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
