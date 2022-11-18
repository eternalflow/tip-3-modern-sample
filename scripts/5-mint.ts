import { Address, WalletTypes } from "locklift";

async function main() {
  const me = new Address("0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994");
  const testUserAddr = new Address("0:1fac4b3651a78d759956347d3383eba6377e0dc87d46b5ea68d5f103c5b9dfb7");
  // take it from step 1
  const tokenRootAddr = new Address("0:0e35665824afee3e6c2839efe481a673c1b6a0851e701af399014d6a2d56048a");
  const tokenWalletAddr = new Address("0:91563ac5482cf282ec64dcdaa54de492d8d0dcd26500796f56b48133e64792b8");
  const signer = (await locklift.keystore.getSigner("1"))!;

  await locklift.factory.accounts.addExistingAccount({
    type: WalletTypes.WalletV3,
    publicKey: signer.publicKey,
  });

  const tw = locklift.factory.getDeployedContract("TokenWallet", tokenWalletAddr);
  const owner = await tw.methods.owner({ answerId: 0 }).call({ responsible: true });
  console.log(owner.value0);

  const root = locklift.factory.getDeployedContract("TokenRoot", tokenRootAddr);
  await locklift.transactions.waitFinalized(
    root.methods
      .mint({
        amount: 1000000,
        recipient: me.toString(),
        deployWalletValue: 0,
        remainingGasTo: testUserAddr.toString(),
        notify: false,
        payload: "",
      })
      .send({
        from: testUserAddr.toString(),
        amount: locklift.utils.toNano(1),
        bounce: true,
      }),
  );
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
