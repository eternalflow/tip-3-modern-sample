import { Address, WalletTypes } from "locklift";

async function main() {
  // take it from step 3
  const tokenWalletAddr = new Address("0:6cada0a45654699f4305ae0c73cba5280e097ca06eb1cb4d034542a8240607ce");

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
