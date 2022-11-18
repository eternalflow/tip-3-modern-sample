import { Address, WalletTypes } from "locklift";

async function main() {
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
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
