import { Address, WalletTypes } from "locklift";

async function main() {
  // take it from step 3
  const tokenWalletAddr = new Address("0:5348263b32835decaa3b9403510552a503cba33516017e6deee4afb7795e8169");

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
