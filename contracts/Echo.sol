pragma ever-solidity >=0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "@broxus/tip3/contracts/interfaces/ITokenRoot.sol";
import "@broxus/tip3/contracts/interfaces/ITokenWallet.sol";
import "@broxus/tip3/contracts/interfaces/IAcceptTokensTransferCallback.sol";

contract Echo {
  uint16 static _nonce;

  address root_;
  address wallet_;

  event WalletDeployed(address wallet);
  event EchoTokens(uint128 amount);

  constructor(address root) public {
    tvm.accept();
    root_ = root;
    ITokenRoot(root_).deployWallet{ value: 1 ever, callback: onWallet }(address(this), 0.1 ever);
  }

  function onWallet(address tw) public internalMsg {
    require(msg.sender == root_, 1001);
  
    tvm.accept();
    wallet_ = tw;
    emit WalletDeployed(wallet_);
  }

  function onAcceptTokensTransfer(
        address tokenRoot,
        uint128 amount,
        address sender,
        address senderWallet,
        address remainingGasTo,
        TvmCell payload) external view {
    tokenRoot;
    sender;
    senderWallet;
    remainingGasTo;
    payload;
    require(msg.sender == wallet_);

    emit EchoTokens(amount);

    TvmCell emptyPayload;

    ITokenWallet(wallet_).transfer{value: 0, bounce: true, flag: 64}( // 64 - all remaining gas will be attached to this message
        amount / 2,
        sender, 
        0 ever,  // deployWalletValue should be > 0 only if you are not sure if recipient has a wallet.
        remainingGasTo,  // all remaining gas will be sent to this address
        false,  // we don't want to send an additional callback to owner
        emptyPayload  // and we don't want to send any additional data
    );
  }

  function wallet() external view responsible returns (address) {
    return {flag: 64, value: 0, bounce: false} wallet_;
  }
}
