import { Address, WalletTypes } from "locklift";

async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { account } = await locklift.factory.accounts.addNewAccount({
    publicKey: signer.publicKey,
    type: WalletTypes.WalletV3,
    value: locklift.utils.toNano(1000)
  });
  console.log("Test User Account:", account.address.toString())
  console.log("Use it as an owner and send messages through it in further scripts") 
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
