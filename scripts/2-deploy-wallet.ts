import { Address } from "locklift/.";
import {AccountsStorageContext, GenericAccount, PrepareMessageParams} from 'locklift/everscale-client';

const MSIG_ABI_V2_3 = locklift.giver.giverContract.abi;

export class MsigAccount_V2_3 extends GenericAccount {
  constructor(args: {
    address: string,
    publicKey?: string
  }) {
    super({
      abi: MSIG_ABI_V2_3,
      prepareMessage: async (args: PrepareMessageParams, ctx: AccountsStorageContext) => {
        const payload = args.payload
          ? ctx.encodeInternalInput(args.payload)
          : '';
        return {
          method: 'sendTransaction',
          params: {
            dest: args.recipient,
            value: args.amount,
            bounce: args.bounce,
            flags: 3,
            payload,
          },
        };
      },
      ...args
    });
  }
}

async function main() {
  // take it from 1st step
  const rootAddr = "0:cc55a48988a9dbab46134b927432a969c491ccca8d32cd692da558ba87bfbf0e";
  const ME = "0:d9d3e6f1871652f391ac7a883cf67856c8d3f78fd6723f85f9658fbff85fe994";
  const signer = (await locklift.keystore.getSigner("giver"))!;
  const everWallet = new MsigAccount_V2_3({
    address: ME,
    publicKey: signer.publicKey
  });
  locklift.factory.accounts.storage.addAccount(everWallet);

  /* 
    Get instance of already deployed contract
  */
  const tokenRoot = locklift.factory.getDeployedContract(
    "TokenRoot",
    new Address(rootAddr),
  );
  await locklift.transactions.waitFinalized(tokenRoot.methods.deployWallet({
      answerId: "0",
      walletOwner: ME,
      deployWalletValue: locklift.utils.toNano(1)
    }).send({
      from: everWallet.address,
      amount: locklift.utils.toNano(2)
    }));

  const twAddr = await tokenRoot.methods.walletOf({
    answerId: 0,
    walletOwner: ME
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
