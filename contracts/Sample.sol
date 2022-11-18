pragma ever-solidity >=0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "@broxus/tip3/contracts/interfaces/ITokenRoot.sol";
import "@broxus/tip3/contracts/interfaces/IAcceptTokensTransferCallback.sol";

contract Sample {
  uint16 static _nonce;

  uint256 state;
  address root_;
  address public wallet_;
  event StateChange(uint256 _state);
  event WalletDeployed(address wallet);
  event TokensReceived(uint128 amount);

  constructor(uint256 _state, address root) public {
    tvm.accept();
    root_ = root;
    ITokenRoot(root).deployWallet{ value: 2 ever, callback: onWallet }(address(this), 0.1 ever);
    setState(_state);
  }

  function wallet() external view responsible returns (address) {
    return {flag: 64, value: 0, bounce: false} wallet_;
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
    tvm.accept();
    emit TokensReceived(amount);
  }

  function onWallet(address _wallet) public internalMsg {
    require(msg.sender == root_, 1001);
    tvm.accept();
    wallet_ = _wallet;
    emit WalletDeployed(_wallet);
  }

  function setState(uint256 _state) public {
    tvm.accept();

    state = _state;

    emit StateChange(_state);
  }

  function getDetails() external view returns (uint256 _state) {
    return state;
  }
}
