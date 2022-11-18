import { Address, WalletTypes } from "locklift";

async function main() {
  // take it from step 3
  const tokenWalletAddr = new Address("0:91563ac5482cf282ec64dcdaa54de492d8d0dcd26500796f56b48133e64792b8");

  const tw = locklift.factory.getDeployedContract("TokenWallet", tokenWalletAddr);
  const {value0: ownerAddr} = await tw.methods.owner({ answerId: 0 }).call({ responsible: true });
  console.log("Owner of tw is", ownerAddr.toString());

  const {value0: balance} = await tw.methods.balance({ answerId: 0 }).call({ responsible: true });
  console.log("Balance:", balance);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
